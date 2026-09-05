import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from metadata_review import apply_review, canonical_title, context_for, select_audio, supported_person, split_people
from pipeline import Pipeline, ground_metadata, merge_music


class MetadataReviewTests(unittest.TestCase):
    def test_catalogue_correction_is_composer_scoped(self):
        self.assertIn("D. 850", canonical_title("소나타 도시 번호 850", "프란츠 슈베르트"))
        self.assertEqual(canonical_title("도시 번호 850", "다른 작곡가"), "도시 번호 850")

    def test_lyrics_and_station_ident_are_not_credits(self):
        for text in ("KBS 클래식 FM입니다.", "Les ombres noires, elles m'ont tout enlevé"):
            result = ground_metadata(dict(title=text, composer=text, performer=text, evidence=text), text)
            self.assertFalse(any(result[k] for k in ("title", "composer", "performer")))

    def test_existing_typo_can_be_corrected_but_unrelated_or_user_fields_cannot(self):
        quote = "아르카디 모로도스의 피아노 연주였습니다."
        track = dict(title="소나타", composer="슈베르트", performer="모로도스", evidence=quote, source="local")
        extra = {"performer": {"value": "아르카디 볼로도스 (Arcadi Volodos), 피아노", "evidence": quote}}
        self.assertTrue(apply_review(track, extra, [{"text": quote}]))
        self.assertIn("Volodos", track["performer"])
        self.assertEqual(track["metadataHistory"][0]["performer"], "모로도스")
        self.assertTrue(track["review"])
        apply_review(track, extra, [{"text": "다른 사람의 연주입니다"}])
        self.assertEqual(track["performer"], "")
        track["source"] = "user"
        self.assertFalse(apply_review(track, extra, [{"text": quote}]))

    def test_unrelated_orchestra_is_rejected_while_phonetic_typos_are_allowed(self):
        self.assertTrue(supported_person("아르카디 볼로도스(피아노)", "아르카디 모로도스의 피아노 연주였습니다"))
        self.assertFalse(supported_person("바흐 콘소트 라이프치히", "바치도르프 호프카펠레의 연주입니다"))
        self.assertTrue(supported_person("폴 콜레티(비올라)", "볼 콜레트의 비올라"))
        self.assertTrue(supported_person("랠프 본 윌리엄스", "본 윌리엄스의"))
        self.assertEqual(split_people("세니아 뢰플러 (Xenia Löffler, 오보에), 바츠도르프 호프카펠레"),
                         ["세니아 뢰플러 (Xenia Löffler, 오보에)", "바츠도르프 호프카펠레"])

    def test_context_uses_nearby_announcements_and_audio_deduplicates(self):
        tracks = [{"start": 100, "end": 200}, {"start": 202, "end": 300}]
        manifest = [{"index": 0, "start": 80, "end": 100}, {"index": 1, "start": 1000, "end": 1100}]
        contexts = context_for(tracks, manifest, {0: "가수의 노래를 감상하셨습니다", 1: "다른 곡 연주"})
        self.assertEqual(len(contexts), 1)
        spans = select_audio(tracks, [(195, 205)], 500, 60)
        self.assertEqual(spans, [(193, 207)])
        self.assertLessEqual(sum(b-a for a,b in select_audio(tracks, [(90,100),(195,205)],500,10)),10)

    def test_name_variants_do_not_split_continuous_music(self):
        base = dict(kind="music", composer="슈베르트", evidence="소개 멘트", uncertain=False)
        tracks = merge_music([dict(base,start=10,end=100,title="소나타 17번 D장조 D. 850",performer="볼로도스"),
                              dict(base,start=100,end=110,title="소나타 17번 D장조",performer="모로도스")],120)
        self.assertEqual(len(tracks),1)

    def test_spent_audio_budget_allows_one_batched_text_review_without_reset(self):
        with tempfile.TemporaryDirectory() as temp:
            folder = Path(temp)
            quote = "슈베르트 소나타를 아르카디 모로도스의 피아노 연주로 감상했습니다."
            (folder / "asr-input.json").write_text(json.dumps([dict(index=0,start=0,end=60)]),encoding="utf-8")
            for name, text in (("asr-output.jsonl",quote),("moss-output.jsonl",'{"segments":[]}')):
                (folder / name).write_text(json.dumps(dict(index=0,text=text)),encoding="utf-8")
            tracks=[dict(id=i,start=10,end=50,title="소나타",composer="슈베르트",performer="모로도스",evidence=quote,source="local",review=True) for i in (1,2)]
            job=dict(tracks=tracks,duration=60,cloudCalls=5,cloudSeconds=600,options=dict(cloudFallback=True,maxCloudSeconds=600))
            pipe=Pipeline(dict(maxCloudSeconds=600,geminiApiKey="test"))
            rows=[dict(id=i,performer=dict(value="아르카디 볼로도스",evidence=quote)) for i in (1,2)]
            with patch.object(pipe,"gemini",return_value=json.dumps(dict(tracks=rows))) as cloud, patch("pipeline.export_track"):
                pipe.review_metadata(folder,job,lambda _:None)
            self.assertEqual(cloud.call_count,1)
            self.assertEqual(cloud.call_args.args[0],[])
            self.assertEqual(job["cloudSeconds"],600)
            self.assertEqual(job["tracks"][0]["performer"],"아르카디 볼로도스")

    def test_complete_local_checkpoint_is_reused_without_model_launch(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            manifest=[dict(index=0,start=0,end=60,coreStart=0,coreEnd=60)]
            (folder/'asr-input.json').write_text(json.dumps(manifest),encoding='utf-8')
            (folder/'asr-output.jsonl').write_text(json.dumps(dict(index=0,text='보존한 전사')),encoding='utf-8')
            pipe=Pipeline({})
            pipe.reuse_local=True
            with patch('pipeline.subprocess.run') as run:
                self.assertEqual(pipe.model('asr',manifest,folder),{0:'보존한 전사'})
                run.assert_not_called()


if __name__ == "__main__":
    unittest.main()
