const {test,expect}=require('@playwright/test');
const {mockExternal}=require('./fixtures');
const client=require('../radio-archive-client');
const albumId='11111111-1111-4111-8111-111111111111';
const ids=['22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
const fixture={version:1,albums:[{id:albumId,title:'내 사티 음반 <img src=x onerror=alert(1)>',medium:'lp',gapSeconds:0.3,
    tracks:ids.map((id,i)=>({versionId:id,position:i,side:i===2?'B':'A',title:'개인 곡 '+i,composer:'사티',performer:'개인 연주자',durationSeconds:180,sizeBytes:4000000,review:i===0}))}]};
const BASE='http://127.0.0.1:8766';
function wav(){const rate=8000,n=rate*30,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);return b;}
async function setup(context,page){
    await mockExternal(context);const seen=[],pending=[];let hold=false;
    await context.route(BASE+'/**',async route=>{
        const req=route.request(),url=new URL(req.url());seen.push({path:url.pathname,auth:req.headers().authorization});
        const headers={'Access-Control-Allow-Origin':'http://127.0.0.1:8123','Access-Control-Allow-Headers':'Authorization,Range','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
        if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
        if(url.pathname==='/player/pair')return route.fulfill({json:{clientId:albumId,token:'t'.repeat(54),expiresAt:Date.now()/1000+3600,scope:'albums:read audio:read'},headers});
        if(url.pathname==='/player/albums')return route.fulfill({json:fixture,headers});
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
async function ready(page,pair=true){await page.goto('/'+(pair?'#radio-archive-pair='+'p'.repeat(43):''));await page.evaluate(()=>window.MFA_READY);await page.waitForSelector('#tunerStage svg');if(pair)await expect(page.locator('#archiveStatus')).toContainText('1장 연결됨');}

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
