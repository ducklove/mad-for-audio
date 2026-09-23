const {test,expect}=require('@playwright/test');
const {mockExternal}=require('./fixtures');
const client=require('../radio-archive-client');
const albumId='11111111-1111-4111-8111-111111111111';
const ids=['22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
const fixture={version:1,albums:[{id:albumId,title:'내 사티 음반 <img src=x onerror=alert(1)>',medium:'lp',gapSeconds:0.3,
    tracks:ids.map((id,i)=>({versionId:id,position:i,side:i===2?'B':'A',title:'개인 곡 '+i,composer:'사티',performer:'개인 연주자',durationSeconds:180,sizeBytes:4000000,review:i===0}))}]};
const BASE='http://127.0.0.1:8766';
function wav(){const rate=8000,n=rate*30,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);return b;}
async function setup(context,page,base=BASE,content={}){
    await mockExternal(context);const seen=[],pending=[];let hold=false;
    await context.route(base+'/**',async route=>{
        const req=route.request(),url=new URL(req.url());url.pathname=url.pathname.replace(new URL(base).pathname.replace(/\/$/,''),'');seen.push({path:url.pathname,auth:req.headers().authorization});
        const headers={'Access-Control-Allow-Origin':'http://127.0.0.1:8123','Access-Control-Allow-Headers':'Authorization,Range','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
        if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
        if(url.pathname==='/player/pair')return route.fulfill({json:{clientId:albumId,token:'t'.repeat(54),expiresAt:Date.now()/1000+3600,scope:'albums:read audio:read'},headers});
        if(url.pathname==='/player/broadcasts')return route.fulfill({json:{version:1,broadcasts:content.broadcasts||[]},headers});
        if(url.pathname==='/player/albums')return route.fulfill({json:content.albums||fixture,headers});
        if(url.pathname.includes('/tickets/')){
            if(hold)await new Promise(resolve=>pending.push(resolve));
            return route.fulfill({json:{path:'/player/audio/'+'a'.repeat(43),expiresIn:2400},headers});
        }
        if(url.pathname.startsWith('/player/audio/'))return route.fulfill({body:wav(),contentType:'audio/wav',headers});
        return route.fulfill({status:404,headers});
    });
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    return {seen,errors,hold(){hold=true;},release(){hold=false;pending.splice(0).forEach(resolve=>resolve());},pending(){return pending.length>0;}};
}
async function ready(page,pair=true){await page.goto('/'+(pair?'#radio-archive-pair='+'p'.repeat(43):''));await page.evaluate(()=>window.MFA_READY);await page.waitForSelector('#tunerStage svg');if(pair)await expect(page.locator('#archiveStatus')).toContainText('서버 연결됨');}

test('방송 음반 데이터는 하나의 음반과 A/B면을 유지하고 잘못된 연결을 거부',()=>{
    const records=client.recordsFromAlbums(fixture);expect(records).toHaveLength(1);expect(records[0].tracks).toHaveLength(2);expect(records[0].archiveAllTracks).toHaveLength(3);
    expect(records[0].archiveSides).toEqual(['A','B']);expect(records[0].tracks[0].review).toBe(true);
    for(const change of [x=>x.albums[0].id='https://other.example',x=>x.albums[0].tracks[1].position=0,x=>x.albums[0].tracks[0].durationSeconds=NaN]){
        const broken=structuredClone(fixture);change(broken);expect(()=>client.recordsFromAlbums(broken)).toThrow();
    }
});

test('방송 음반 연결 전에는 로컬 서버에 요청하지 않음',async({context,page})=>{
    const state=await setup(context,page);await ready(page,false);expect(state.seen).toEqual([]);expect(state.errors).toEqual([]);
});

test('방송 음반 새로고침의 늦은 응답은 연결 해제 뒤 목록과 캐시를 되살리지 않는다',async({context,page})=>{
    await setup(context,page);await ready(page);
    let release,requested=false;
    const pending=new Promise(resolve=>{release=resolve;});
    await page.route(BASE+'/player/albums',async route=>{
        requested=true;await pending;
        await route.fulfill({json:fixture,headers:{'Access-Control-Allow-Origin':'http://127.0.0.1:8123'}});
    });
    await page.evaluate(()=>{window.pendingRefresh=RadioArchiveClient.refresh();});
    await expect.poll(()=>requested).toBe(true);
    await page.evaluate(()=>RadioArchiveClient.disconnect());release();
    await page.evaluate(()=>window.pendingRefresh);
    expect(await page.evaluate(()=>({records:RECORDS.filter(r=>r.archive).length,cache:localStorage.getItem('fmRadio.archiveAlbums.v2')})))
        .toEqual({records:0,cache:null});
    await expect(page.locator('#archiveStatus')).toContainText('연결을 지웠습니다');
});

test('방송 음반 연결·A/B면·검토 표시·재생·연결 해제',async({context,page})=>{
    const state=await setup(context,page);await ready(page);
    expect(new URL(page.url()).hash).toBe('');await expect(page.locator('#archivePanel')).toHaveAttribute('open','');
    await page.evaluate(()=>setRecord(RECORDS.findIndex(r=>r.archive),{silent:true}));
    await expect(page.locator('#ttTrackHit0')).toContainText('검토 필요');await expect(page.locator('#ttTrackHit0')).toContainText('3:00');
    await page.evaluate(()=>selectArchiveSide('B'));
    expect(await page.evaluate(()=>({count:RECORDS.filter(r=>r.archive).length,side:RECORD.side,title:RECORD.tracks[0].t}))).toEqual({count:1,side:'B',title:'개인 곡 2'});
    await page.evaluate(()=>{closeCrate();playPhonoTrack(0);});await page.waitForFunction(()=>isPlaying && audio.currentTime>0);
    expect(await page.evaluate(()=>audio.currentSrc)).toContain('/player/audio/');
    await page.evaluate(()=>audio.dispatchEvent(new Event('error')));
    expect(await page.evaluate(()=>RadioArchiveClient.cachedAudioUrl(RECORD.tracks[phonoTrack]))).toBe('');
    await page.evaluate(()=>playPhonoTrack(0));await page.waitForFunction(()=>isPlaying && audio.currentTime>0);
    expect(await page.evaluate(()=>JSON.stringify(window.dataLayer||[]))).not.toContain('개인 곡');
    expect(await page.locator('img[onerror]').count()).toBe(0);
    await page.evaluate(()=>RadioArchiveClient.disconnect());expect(await page.evaluate(()=>({records:RECORDS.filter(r=>r.archive).length,active:phonoActive,stored:localStorage.getItem('fmRadio.archiveClient')}))).toEqual({records:0,active:false,stored:null});
    expect(state.errors).toEqual([]);
});

test('방송 음반의 늦은 재생 주소가 정지 후 재생을 되살리지 않음',async({context,page})=>{
    const state=await setup(context,page);await ready(page);state.hold();
    await page.evaluate(()=>{setRecord(RECORDS.findIndex(r=>r.archive),{silent:true});playPhonoTrack(1);});
    await expect.poll(()=>state.pending()).toBe(true);await page.evaluate(()=>stopPlay());state.release();
    await expect.poll(()=>page.evaluate(()=>audio.getAttribute('src'))).toBe(null);
    expect(await page.evaluate(()=>phonoActive)).toBe(false);expect(state.errors).toEqual([]);
});

test('방송 음반은 곡 간격을 지키고 정지하면 다음 곡 예약을 취소',async({context,page})=>{
    await setup(context,page);await ready(page);await page.evaluate(()=>{closeCrate();setRecord(RECORDS.findIndex(r=>r.archive),{silent:true});playPhonoTrack(0);});
    await page.waitForFunction(()=>isPlaying && audio.currentTime>0);
    await page.evaluate(()=>audio.dispatchEvent(new Event('ended')));expect(await page.evaluate(()=>phonoTrack)).toBe(0);
    await page.waitForFunction(()=>phonoTrack===1);
    await page.evaluate(()=>{playPhonoTrack(0);});await page.waitForFunction(()=>isPlaying && audio.currentTime>0);
    await page.evaluate(()=>{audio.dispatchEvent(new Event('ended'));stopPlay();});
    await page.waitForTimeout(400);expect(await page.evaluate(()=>phonoActive)).toBe(false);
});


test('공개 방송 보관함은 새 기기에서도 고정 HTTPS 주소로 자동 연결',async({context,page})=>{
    const state=await setup(context,page,'https://ducklove.duckdns.org/radio-archive');
    await ready(page,false);
    await expect(page.locator('#archiveStatus')).toContainText('서버 연결됨');
    expect(state.seen.some(r=>r.path.endsWith('/pair'))).toBe(false);
    expect(state.seen.every(r=>!r.auth)).toBe(true);
    await expect(page.locator('#archiveDisconnect')).toBeHidden();
    await expect(page.locator('#archiveLocalLink')).toBeHidden();
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('fmRadio.archiveClient')).public)).toBe(true);
    expect(state.errors).toEqual([]);
});

const publicBase='https://ducklove.duckdns.org/radio-archive';
const musicId='55555555-5555-4555-8555-555555555555';
const rawId='66666666-6666-4666-8666-666666666666';
const broadcastFixture={id:'77777777-7777-4777-8777-777777777777',stationId:'kbs1fm',title:'시험 방송',program:'시험 방송',startedAt:'2026-09-24T09:00:00+09:00',durationSeconds:3600,musicAlbumId:musicId,musicTrackCount:3,
    original:{...fixture.albums[0],id:rawId,title:'시험 방송 원본',tracks:[{...fixture.albums[0].tracks[0],title:'멘트 포함 방송 원본',durationSeconds:3600}]}};
const musicFixture={...fixture.albums[0],id:musicId,title:'2026-09-24 시험 방송',category:'broadcast-music',tracks:fixture.albums[0].tracks.map(t=>({...t,side:'A'}))};

test('방송 원본은 테이프·편성표, 방송별 곡은 별도 음반에만 표시하고 기존 보관함을 유지',async({context,page})=>{
    await setup(context,page,publicBase,{albums:{version:1,albums:[fixture.albums[0],musicFixture]},broadcasts:[broadcastFixture,{...broadcastFixture,id:ids[0],title:'분리 대기 방송',musicAlbumId:null,musicTrackCount:0}]});
    await ready(page,false);await expect(page.locator('#archiveStatus')).toContainText('방송 원본 2건');
    const localBefore=await page.evaluate(()=>JSON.stringify(tapes));
    await page.click('#headerCrateBtn');
    await expect(page.locator('#crateGrid')).not.toContainText('2026-09-24 시험 방송');
    await expect(page.locator('#crateGrid')).toContainText('내 사티 음반');
    await page.click('#broadcastAlbumsTab');
    await expect(page.locator('#crateGrid [role="listitem"]')).toHaveCount(1);
    await expect(page.locator('#crateGrid')).toContainText('2026-09-24 시험 방송');
    await expect(page.locator('#crateGrid')).not.toContainText('멘트 포함 방송 원본');
    await expect(page.locator('#archiveMusicPending')).toContainText('분리 대기 방송');
    await expect(page.locator('#crateMixBtn')).toBeHidden();
    await page.locator('#crateGrid [role="listitem"]').click();
    expect(await page.evaluate(()=>RECORD.tracks.map(t=>t.archivePosition))).toEqual([0,1,2]);
    await page.evaluate(()=>openTapeCase());await page.click('#broadcastTapesTab');
    await expect(page.locator('#tapeCaseList')).toBeHidden();await expect(page.locator('#archiveTapeList [role="listitem"]')).toHaveCount(2);
    await page.getByRole('button',{name:'시험 방송 방송 원본 듣기',exact:true}).click();
    await expect.poll(()=>page.locator('audio[aria-label="방송 원본 재생"]').evaluate(a=>a.currentTime)).toBeGreaterThan(0);
    expect(await page.evaluate(()=>audio.paused)).toBe(true);
    await page.getByRole('button',{name:'재생 중지',exact:true}).click();
    await page.evaluate(()=>{closeTapeCase();openSchedule();schedSetView('archive');});
    await page.locator('#archiveDate').fill('2026-09-24');await page.locator('#archiveStation').selectOption('kbs1fm');
    await expect(page.locator('#archiveScheduleList [role="listitem"]')).toHaveCount(2);
    await page.locator('#archiveDate').fill('2026-09-25');await expect(page.locator('#archiveScheduleList [role="listitem"]')).toHaveCount(0);
    expect(await page.evaluate(()=>JSON.stringify(tapes))).toEqual(localBefore);
});

test('방송 원본 준비 중 중지하면 늦은 응답이 재생을 시작하지 않는다',async({context,page})=>{
    const state=await setup(context,page,publicBase,{broadcasts:[broadcastFixture]});await ready(page,false);
    await expect(page.locator('#archiveStatus')).toContainText('방송 원본 1건');state.hold();
    await page.evaluate(()=>openTapeCase());await page.click('#broadcastTapesTab');
    await page.getByRole('button',{name:'시험 방송 방송 원본 듣기',exact:true}).click();
    await expect.poll(()=>state.pending()).toBe(true);await page.getByRole('button',{name:'재생 중지',exact:true}).click();state.release();
    await expect(page.locator('.archive-original-player')).toBeHidden();
    expect(await page.locator('.archive-original-player audio').getAttribute('src')).toBe(null);
});
