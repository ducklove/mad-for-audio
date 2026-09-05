from copy import deepcopy
import json
from pathlib import Path
import tempfile
import time
import unittest
from unittest.mock import patch
from uuid import uuid4

import httpx
from fastapi.testclient import TestClient
from album_quality import AlbumQuality, apply_boundaries, episode_key, validate_tracks, apply_reference, share_verified_composers
from metadata_review import apply_review
from pipeline import export_track, ffmpeg, run
from server import create_app


class AlbumQualityTests(unittest.TestCase):
    def test_foreign_name_uses_explicit_heard_evidence(self):
        track={'source':'local','title':'소나타','composer':'','performer':''}
        quote='베토벤의 소나타, 알프레드 브랜델의 피아노 연주입니다.'
        apply_review(track,{'composer':{'value':'Ludwig van Beethoven','heard':'베토벤','evidence':quote},
                            'performer':{'value':'Alfred Brendel (피아노)','heard':'알프레드 브랜델','evidence':quote}},[{'text':quote}])
        self.assertEqual(track['composer'],'Ludwig van Beethoven')
        self.assertIn('Brendel',track['performer'])
        manual=dict(track,source='user')
        self.assertFalse(apply_review(manual,{},[]))

    def test_episode_ignores_midnight_and_segment_end_with_schedule_anchor(self):
        job={'source':'server-recorder','stationId':'test','startedAt':'2026-09-05T23:00:00+09:00',
             'program':{'title':'방송','scheduleKnown':True,'broadcastStart':123,'end':130,'rerun':False}}
        other=deepcopy(job); other['startedAt']='2026-09-06T00:01:00+09:00'; other['program']['end']=200
        self.assertEqual(episode_key(job),episode_key(other))
        other['program']['broadcastStart']=300
        self.assertNotEqual(episode_key(job),episode_key(other))

    def test_proposed_tracks_cannot_overlap_or_exceed_recording(self):
        row={'start':10,'end':30,'title':'소나타','composer':'작곡가','performer':'연주자','evidence':'소개 멘트','uncertain':False}
        self.assertFalse(validate_tracks({'tracks':[row]},100)[0]['review'])
        for rows in ([dict(row,end=101)],[dict(row,start=float('nan'))],[row,dict(row,start=20,end=40)]):
            with self.assertRaises(ValueError): validate_tracks({'tracks':rows},100)

    def test_boundary_crossing_is_rejected_and_uncertainty_is_visible(self):
        tracks=[{'start':10,'end':30,'review':False},{'start':35,'end':60,'review':False}]
        probes=[{'key':'1:end','index':0,'edge':'end','start':20,'end':45}]
        result=apply_boundaries(tracks,{'boundaries':[{'key':'1:end','offset':20,'confident':True}]},probes)
        self.assertEqual(result[0]['end'],30)
        self.assertTrue(result[0]['review'])
        result=apply_boundaries(tracks,{'boundaries':[]},probes)
        self.assertTrue(result[0]['review'])

    def test_paid_request_cache_and_failure_do_not_recharge(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp); audio=folder/'audio.mp3'; audio.write_bytes(b'audio')
            job={'cloudCalls':0,'cloudSeconds':0}
            engine=AlbumQuality(folder,{'openrouterApiKey':'test','albumMaxCloudSeconds':100})
            response=httpx.Response(200,json={'choices':[{'finish_reason':'stop','message':{'content':'{"tracks":[]}'}}], 'usage':{'cost':.01}})
            with patch('album_quality.httpx.post',return_value=response) as post:
                engine.request(folder,job,lambda _:None,'plan','test',[(audio,0,10)])
                engine.request(folder,job,lambda _:None,'plan','test',[(audio,0,10)])
                self.assertEqual(post.call_count,1)
                self.assertEqual(job['cloudCalls'],1)
                self.assertEqual(job['cloudSeconds'],10)
            with patch('album_quality.httpx.post',return_value=httpx.Response(429)) as post:
                for _ in range(2):
                    with self.assertRaises(ValueError): engine.request(folder,job,lambda _:None,'plan','new',[(audio,0,10)])
                self.assertEqual(post.call_count,1)
            job['retryRequests']=[p.name for p in folder.glob('plan-*.json') if json.loads(p.read_text())['state']=='failed']
            with patch('album_quality.httpx.post',return_value=response) as post:
                engine.request(folder,job,lambda _:None,'plan','new',[(audio,0,10)])
                self.assertEqual(post.call_count,1)
                self.assertEqual(job['cloudCalls'],3)
                self.assertEqual(job['cloudSeconds'],30)
                self.assertFalse(job['retryRequests'])
                self.assertEqual(len(list(folder.glob('*.previous-*.json'))),1)

    def test_album_api_is_idempotent_and_originals_remain_accessible(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            app=create_app(root,{'token':'test'*10,'openrouterApiKey':'test','modelPython':'none','mossSource':'none'},start_worker=False)
            jobs=app.state.jobs
            originals=[]
            for i in range(2):
                ident=str(uuid4()); originals.append(ident)
                job={'id':ident,'name':'KBS 1FM · 방송','stationId':'kbs1fm','source':'server-recorder',
                    'program':{'title':'방송','scheduleKnown':True,'rerun':False},
                    'startedAt':f'2026-09-05T14:0{i}:00+09:00','duration':10,'createdAt':i+1,'status':'review',
                    'options':{'cloudFallback':True},'tracks':[]}
                jobs.save(job); (jobs.folder(ident)/'original.bin').write_bytes(b'audio')
            client=TestClient(app,base_url='http://127.0.0.1'); headers={'Authorization':'Bearer '+'test'*10}
            self.assertEqual(client.post(f'/jobs/{originals[0]}/album').status_code,401)
            first=client.post(f'/jobs/{originals[0]}/album',headers=headers).json()
            second=client.post(f'/jobs/{originals[1]}/album',headers=headers).json()
            self.assertEqual(first['id'],second['id']); self.assertEqual(jobs.queue.qsize(),1)
            self.assertEqual(len(jobs.library()),3)
            first.update(status='review'); jobs.save(first)
            self.assertEqual(len(jobs.library()),1)
            for ident in originals:
                self.assertEqual(client.get(f'/jobs/{ident}/files/original',headers=headers).content,b'audio')

    def test_provider_error_inside_http_200_is_saved_without_secret(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp); job={}
            engine=AlbumQuality(folder,{'openrouterApiKey':'private-key'})
            response=httpx.Response(200,json={'error':{'message':'provider rejected private-key','code':413}})
            with patch('album_quality.httpx.post',return_value=response):
                with self.assertRaisesRegex(ValueError,'provider rejected'):
                    engine.request(folder,job,lambda _:None,'error','test',[])
            saved=next(folder.glob('error-*.json')).read_text(encoding='utf-8')
            self.assertNotIn('private-key',saved)
            self.assertIn('413',saved)

    def test_real_flac_has_album_and_continuous_track_tags(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            ffmpeg('-f','lavfi','-i','sine=duration=3',folder/'source.wav')
            track={'id':2,'start':.5,'end':2,'title':'곡','composer':'작곡가','performer':'연주자','album':'방송 · 날짜',
                   'album_artist':'방송','date':'2026-09-05','tracktotal':3,'disc':1,'disctotal':1}
            export_track(folder,track)
            data=json.loads(run(['ffprobe','-v','error','-show_format','-of','json',folder/'track-2.flac']))
            tags={k.lower():v for k,v in data['format']['tags'].items()}
            self.assertEqual(tags['album'],'방송 · 날짜'); self.assertEqual(tags['track'],'2'); self.assertEqual(tags['tracktotal'],'3')

    def test_reference_needs_actual_official_citation_and_matching_recording(self):
        url='https://www.deutschegrammophon.com/example'
        answer={'sameWork':True,'sameRecording':True,'changes':{'performer':{'value':'알리스 사라 오트 (Alice Sara Ott)','original':'엘리사 라우투',
            'sourceUrl':url,'quote':'Performed by Alice Sara Ott'}},
            '_sources':[{'url':url,'content':'World premiere. Performed by Alice Sara Ott.','title':'공식 음반'}]}
        track={'performer':'엘리사 라우투'}
        self.assertTrue(apply_reference(track,answer)); self.assertIn('Alice Sara Ott',track['performer'])
        for bad in (dict(answer,_sources=[]),dict(answer,sameRecording=False),dict(answer,sameWork=False)):
            self.assertFalse(apply_reference({'performer':'오자'},bad))
        foreign=deepcopy(answer); foreign['_sources'][0]['url']='https://example.com/fake'
        self.assertFalse(apply_reference({'performer':'오자'},foreign))
        invented=deepcopy(answer); invented['changes']['performer']['quote']='이 문장은 검색 결과에 없습니다.'
        self.assertFalse(apply_reference({'performer':'오자'},invented))
        self.assertFalse(apply_reference({'source':'user','performer':'사용자 확정'},answer))
        other_recording=deepcopy(answer)
        other_recording['changes']['performer'].update(original='BBC 스코티시 심포니 오케스트라',value='BBC 교향악단')
        self.assertFalse(apply_reference({'performer':'BBC 스코티시 심포니 오케스트라'},other_recording))

    def test_lookup_keeps_separate_movement_titles(self):
        url='https://www.deutschegrammophon.com/example'
        result={'corrections':[{'id':i,'sameWork':True,'sameRecording':True,'changes':{'title':{
            'value':f'정확한 {i}악장','sourceUrl':url,'quote':f'Movement {i} title'}}} for i in (1,2)],
            '_sources':[{'url':url,'content':'Movement 1 title. Movement 2 title.'}]}
        tracks=[{'id':i,'title':'원래 제목','review':False} for i in (1,2)]
        engine=AlbumQuality(Path('.'),{})
        with patch.object(engine,'request',side_effect=[{'checks':[{'ids':[1,2],'query':'작품'}]},result]):
            engine.verify_metadata(Path('.'),{},lambda _:None,tracks,[])
        self.assertEqual([t['title'] for t in tracks],['정확한 1악장','정확한 2악장'])

    def test_same_work_shares_only_verified_composer(self):
        rows=[{'title':'사랑의 찬가','composer':'모노','references':[{'field':'composer','url':'공식'}]},
              {'title':'사랑의 찬가','composer':''},{'title':'다른 곡','composer':''}]
        share_verified_composers(rows)
        self.assertEqual(rows[1]['composer'],'모노'); self.assertEqual(rows[2]['composer'],'')


if __name__=='__main__': unittest.main()
