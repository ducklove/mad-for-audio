/* Server broadcasts stay separate from local tapes and the record catalogue. */
(function(root){
    'use strict';
    let items=[],options={},epoch=0,pending=null,current=null;
    const el=id=>document.getElementById(id);
    const player=document.createElement('section');player.className='archive-original-player';player.hidden=true;
    const title=document.createElement('strong');
    const message=document.createElement('p');message.setAttribute('role','status');
    const audio=document.createElement('audio');audio.controls=true;audio.crossOrigin='anonymous';audio.preload='metadata';audio.setAttribute('aria-label','방송 원본 재생');
    const stopButton=document.createElement('button');stopButton.type='button';stopButton.textContent='재생 중지';
    player.append(title,audio,stopButton,message);
    function stop(){epoch++;pending?.abort();pending=null;audio.pause();audio.removeAttribute('src');audio.load();current=null;player.hidden=true;}
    stopButton.onclick=stop;
    function mount(where){el(where)?.append(player);}
    const day=item=>item.startedAt.slice(0,10);
    const duration=seconds=>`${Math.floor(seconds/60)}분 ${Math.floor(seconds%60)}초`;
    async function play(item,where){
        mount(where);player.hidden=false;title.textContent=item.title;message.textContent='방송 원본을 준비합니다…';
        if(!options.canPlay()){message.textContent='진행 중인 녹음을 마친 뒤 재생해 주세요.';return;}
        options.stopRack();const generation=options.rackGeneration();
        const token=++epoch;pending?.abort();pending=new AbortController();audio.pause();current=item;
        try{
            const url=await root.RadioArchiveClient.audioUrl(item.original,pending.signal);
            if(token!==epoch || generation!==options.rackGeneration())return;
            audio.src=url;message.textContent='멘트와 음악을 포함한 방송 원본';
            await audio.play();
        }catch(error){if(token===epoch)message.textContent=error.name==='NotAllowedError'?'재생 버튼을 눌러 주세요.':error.message;}
    }
    audio.addEventListener('play',()=>{
        if(!options.canPlay()){audio.pause();message.textContent='진행 중인 녹음을 마친 뒤 재생해 주세요.';return;}
        options.stopRack();
    });
    audio.addEventListener('error',()=>{if(current){root.RadioArchiveClient.invalidateAudioUrl(current.original);message.textContent='방송을 불러오지 못했습니다. 원본 듣기를 다시 눌러 주세요.';}});
    function button(item,where){const b=document.createElement('button');b.type='button';b.className='rec-btn';b.textContent='▶ 방송 원본 듣기';b.setAttribute('aria-label',item.title+' 방송 원본 듣기');b.onclick=()=>void play(item,where);return b;}
    function list(target,rows,where){
        target.replaceChildren();
        if(!rows.length){const p=document.createElement('p');p.className='archive-note';p.textContent='이 조건에 맞는 완료된 방송 녹음이 없습니다.';target.append(p);return;}
        for(const item of rows){
            const row=document.createElement('div');row.className='archive-broadcast-row';row.setAttribute('role','listitem');
            const info=document.createElement('div');const name=document.createElement('strong');name.textContent=item.title;
            const detail=document.createElement('p');detail.textContent=`${day(item)} ${item.startedAt.slice(11,16)} · ${duration(item.durationSeconds)} · ${item.musicAlbumId?'음악 '+item.musicTrackCount+'곡':'곡 분리 준비 중'}`;
            info.append(name,detail);row.append(info,button(item,where));target.append(row);
        }
    }
    function renderTapes(){const q=el('archiveTapeSearch').value.trim().toLowerCase();list(el('archiveTapeList'),items.filter(i=>(i.title+' '+i.startedAt).toLowerCase().includes(q)),'archiveTapePlayer');}
    function renderSchedule(){
        if(!el('schedArchivePane').hidden)mount('archiveSchedulePlayer');const date=el('archiveDate').value,station=el('archiveStation').value;
        list(el('archiveScheduleList'),items.filter(i=>(!date||day(i)===date)&&(!station||i.stationId===station)),'archiveSchedulePlayer');
    }
    function renderPending(show){
        const target=el('archiveMusicPending');if(!target)return;target.hidden=!show;target.replaceChildren();if(!show)return;
        const pending=items.filter(i=>!i.musicAlbumId);if(!pending.length)return;
        const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent=`곡 분리 준비 중인 방송 ${pending.length}건`;details.append(summary);
        for(const item of pending){const p=document.createElement('p');p.textContent=day(item)+' '+item.title+' · 원본은 테이프 보관함에서 들을 수 있습니다.';details.append(p);}target.append(details);
    }
    function receive(rows){
        items=rows.slice().sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
        if(current&&!items.some(i=>i.id===current.id&&i.original.id===current.original.id))stop();
        const select=el('archiveStation'),selected=select.value;select.replaceChildren(new Option('모든 채널',''));
        for(const station of [...new Set(items.map(i=>i.stationId))].filter(Boolean)){select.add(new Option(station==='kbs1fm'?'KBS 1FM':station==='kbs2fm'?'KBS 2FM':station,station));}select.value=selected;
        renderTapes();renderSchedule();renderPending(!el('broadcastAlbumNote').hidden);
    }
    function appendSchedulePlayback(target,station,date,program){
        for(const item of items){
            const minute=Number(item.startedAt.slice(11,13))*60+Number(item.startedAt.slice(14,16));
            if(item.stationId===station&&day(item)===date&&minute>=program.startMin&&minute<program.endMin){
                const b=button(item,'archiveSchedulePlayer');b.onclick=()=>{root.schedSetView('archive');el('archiveDate').value=date;el('archiveStation').value=station;renderSchedule();void play(item,'archiveSchedulePlayer');};target.append(b);
            }
        }
    }
    function init(config){
        options=config;options.rackAudio.addEventListener('play',()=>{if(current)stop();});
        const choose=server=>{
            el('broadcastTapePane').hidden=!server;el('tapeCaseList').hidden=server;el('tapeCaseEmpty').hidden=server || el('tapeCaseList').children.length>0;
            el('localTapesTab').setAttribute('aria-pressed',String(!server));el('broadcastTapesTab').setAttribute('aria-pressed',String(server));
            if(server){mount('archiveTapePlayer');renderTapes();}
        };
        el('localTapesTab').onclick=()=>choose(false);el('broadcastTapesTab').onclick=()=>choose(true);
        el('archiveTapeSearch').oninput=renderTapes;el('archiveDate').onchange=renderSchedule;el('archiveStation').onchange=renderSchedule;
        el('archiveDateClear').onclick=()=>{el('archiveDate').value='';renderSchedule();};
    }
    function openTapes(){if(!el('broadcastTapePane').hidden){mount('archiveTapePlayer');el('tapeCaseEmpty').hidden=true;renderTapes();}}
    root.BroadcastBrowser={init,receive,stop,renderSchedule,renderPending,appendSchedulePlayback,openTapes};
})(window);
