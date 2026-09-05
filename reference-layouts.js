/* 실물의 전면 구획을 기준으로 다시 구성한 렌더러.
 * 좌표는 각 모델이 소유한다. 앱 전용 보관함과 마스터 볼륨은 기기 바깥 보조 띠에 둔다.
 * 출처와 변형 이유: docs/REFERENCE_REDESIGN.md
 */
function refText(x, y, value, size = 17, fill = '#b8c1c1', anchor = 'start', extra = '') {
    const family = extra.includes('font-family=') ? '' : 'font-family="Arial, sans-serif"';
    return `<text x="${x}" y="${y}" ${family} font-size="${size}" fill="${fill}" text-anchor="${anchor}" xml:space="preserve" ${extra}>${value}</text>`;
}
function refMetalDefs(prefix) {
    return `<defs>
    <linearGradient id="${prefix}silver" x2="0" y2="1"><stop stop-color="#e4e6e3"/><stop offset=".12" stop-color="#c7ccca"/><stop offset=".55" stop-color="#b4bab8"/><stop offset=".94" stop-color="#d5d8d4"/><stop offset="1" stop-color="#7b8381"/></linearGradient>
    <linearGradient id="${prefix}rim"><stop stop-color="#343b3a"/><stop offset=".18" stop-color="#f4f5ed"/><stop offset=".42" stop-color="#969e9c"/><stop offset=".75" stop-color="#d8ddda"/><stop offset="1" stop-color="#3c4443"/></linearGradient>
    <linearGradient id="${prefix}knob" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f1f3e9"/><stop offset=".28" stop-color="#adb6ad"/><stop offset=".49" stop-color="#59665f"/><stop offset=".51" stop-color="#e4e9dd"/><stop offset=".74" stop-color="#abb5ab"/><stop offset="1" stop-color="#6f7c74"/></linearGradient>
    <linearGradient id="${prefix}black" x2="0" y2="1"><stop stop-color="#303735"/><stop offset=".09" stop-color="#202625"/><stop offset="1" stop-color="#101413"/></linearGradient>
    <pattern id="${prefix}brush" width="7" height="5" patternUnits="userSpaceOnUse"><path d="M0 .5H7" stroke="#fff" stroke-width=".5" opacity=".15"/><path d="M0 3H7" stroke="#000" stroke-width=".4" opacity=".08"/></pattern>
    <linearGradient id="${prefix}meter" x2="0" y2="1"><stop stop-color="#427c8d"/><stop offset=".2" stop-color="#a0d8df"/><stop offset=".7" stop-color="#83c7d1"/><stop offset="1" stop-color="#568e9f"/></linearGradient>
    </defs>`;
}
function refKnob(prefix, cx, cy, r, id = '', mark = '') {
    const ridges = Array.from({length: 48}, (_, i) => {
        const a = i * Math.PI / 24;
        return `<path d="M${cx+Math.sin(a)*(r-2)} ${cy+Math.cos(a)*(r-2)}L${cx+Math.sin(a)*(r+4)} ${cy+Math.cos(a)*(r+4)}"/>`;
    }).join('');
    return `<g ${id ? `id="${id}"` : ''} class="reference-knob">
    <ellipse cx="${cx+3}" cy="${cy+r*.5}" rx="${r+5}" ry="${r*.72}" fill="#000" opacity=".36" filter="url(#lzSoft)"/>
    <circle cx="${cx}" cy="${cy+7}" r="${r+5}" fill="#101514"/>
    <circle cx="${cx}" cy="${cy}" r="${r+4}" fill="url(#${prefix}rim)"/>
    <g stroke="#626c67" stroke-width="1.5" opacity=".8">${ridges}</g>
    <circle cx="${cx}" cy="${cy}" r="${r-4}" fill="url(#${prefix}knob)" stroke="#d5ded7" stroke-width="1.3"/>
    <g fill="none" stroke="#b4c0b6" stroke-width=".55" opacity=".28">${Array.from({length:Math.floor(r/3)},(_,i)=>`<circle cx="${cx}" cy="${cy}" r="${3+i*3}"/>`).join('')}</g>
    <path d="M${cx-r*.7} ${cy-r*.45}Q${cx-r*.18} ${cy-r*.98} ${cx+r*.48} ${cy-r*.7}" fill="none" stroke="#fff" opacity=".48" stroke-width="2"/>
    ${mark ? `<path id="${mark}" d="M${cx} ${cy-r+10}v${r*.35}" stroke="#343e38" stroke-width="4"/>` : ''}</g>`;
}
function refKey(prefix, x, y, w, h, id, label, red = false) {
    return `<g><rect x="${x}" y="${y+3}" width="${w}" height="${h}" rx="2" fill="#070a09"/>
    <rect id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="url(#${prefix}silver)" stroke="#454e49" stroke-width="2" style="cursor:pointer"><title>${label}</title></rect>
    <path d="M${x+3} ${y+3}h${w-6}" stroke="#f5f7ee" opacity=".8" pointer-events="none"/>
    ${refText(x+w/2,y-11,label,16,red?'#af3e31':'#3b4640','middle')}
    ${red ? `<path d="M${x+8} ${y+9}h${w-16}" stroke="#a23d32" stroke-width="4" pointer-events="none"/>` : ''}</g>`;
}
function refCassette(cx, y, prefix) {
    return `<g class="reference-cassette"><rect x="${cx-282}" y="${y-17}" width="564" height="310" rx="8" fill="#080c0b" stroke="#4e5854" stroke-width="3"/>
    <path d="M${cx-248} ${y}h496l12 14v249l-19 15h-482l-19-15V${y+14}z" fill="#d0d0bf" stroke="#7c8579" stroke-width="2"/>
    <path d="M${cx-232} ${y+10}h464" stroke="#f2f1df" stroke-width="3"/>
    <rect x="${cx-225}" y="${y+23}" width="450" height="67" rx="2" fill="#e8e5d1"/>
    ${refText(cx,y+50,'C-30 · TAPE 1',18,'#414536','middle','id="deckLabel" font-weight="600"')}
    ${refText(cx,y+75,'A면 00:00 / 30:00',13,'#6c6b57','middle','id="deckLabelSub"')}
    <rect x="${cx-178}" y="${y+108}" width="356" height="87" rx="42" fill="#131a15" stroke="#9b9f8b" stroke-width="2"/>
    <circle id="deckPackL" cx="${cx-106}" cy="${y+151}" r="40" fill="#382f22"/><circle id="deckPackR" cx="${cx+106}" cy="${y+151}" r="24" fill="#382f22"/>
    ${[-1,1].map((side,i)=>`<g id="deckReel${i?'R':'L'}" data-cx="${cx+side*106}" data-cy="${y+151}"><circle cx="${cx+side*106}" cy="${y+151}" r="21" fill="#bdbfaf" stroke="#505b50" stroke-width="2"/>${Array.from({length:6},(_,j)=>`<path d="M${cx+side*106} ${y+151}l0 -17" transform="rotate(${j*60} ${cx+side*106} ${y+151})" stroke="#3d493f" stroke-width="5"/>`).join('')}<circle cx="${cx+side*106}" cy="${y+151}" r="6" fill="#101710"/></g>`).join('')}
    <path d="M${cx-180} ${y+269}l30-55h300l30 55" fill="#b0b7a5" stroke="#a1a990" stroke-width="2"/>
    <rect x="${cx-75}" y="${y+245}" width="150" height="19" rx="3" fill="#253229"/>
    ${[-218,218].map(dx=>`<circle cx="${cx+dx}" cy="${y+251}" r="8" fill="#7c8271"/><path d="M${cx+dx-4} ${y+251}h8" stroke="#31392e" stroke-width="2"/>`).join('')}
    <path d="M${cx-273} ${y+295}h546" stroke="#59605b" stroke-width="4"/></g>`;
}
function refMC2105() {
    const p='refMc';
    const meter=(x,id)=>{
        const cx=x+198,cy=406,r=225;
        const pt=(a,rr)=>[cx+Math.sin(a*Math.PI/180)*rr,cy-Math.cos(a*Math.PI/180)*rr];
        let ticks='';
        for(let i=0;i<=24;i++){const a=-48+i*4;const [x1,y1]=pt(a,r);const [x2,y2]=pt(a,r-(i%3?9:17));ticks+=`<path d="M${x1} ${y1}L${x2} ${y2}"/>`;}
        const labels=['−20','−10','−7','−5','−3','−1','0','+1','+2','+3'];
        return `<g class="reference-meter" data-panel-region="meter"><rect x="${x-3}" y="133" width="402" height="238" rx="2" fill="#263b3b"/>
        <rect class="ampLamp" data-lamp-max=".88" x="${x}" y="136" width="396" height="232" fill="url(#${p}meter)"/>
        <path d="M${pt(-48,r).join(' ')} A${r} ${r} 0 0 1 ${pt(48,r).join(' ')}" fill="none" stroke="#173b47" stroke-width="2"/>
        <g stroke="#214d59" stroke-width="1.5">${ticks}</g>
        ${labels.map((v,i)=>{const [tx,ty]=pt(-47+i*10.4,r+17);return refText(tx,ty,v,18,'#244550','middle');}).join('')}
        ${refText(cx,296,'POWER LEVEL',17,'#284852','middle','letter-spacing="4"')}${refText(cx,324,'DECIBELS',12,'#284852','middle','letter-spacing="3"')}
        <defs><clipPath id="${id}Window"><rect x="${x}" y="136" width="396" height="232"/></clipPath></defs><g clip-path="url(#${id}Window)"><line id="${id}" x1="${cx}" y1="${cy}" x2="${cx}" y2="172" stroke="#183644" stroke-width="2.5" data-cx="${cx}" data-cy="${cy}"/></g>
        <rect class="meterDark" x="${x}" y="136" width="396" height="232" fill="#031012" opacity=".55" pointer-events="none"/>
        <path d="M${x+2} 138h392" stroke="#d8eff1" opacity=".5" pointer-events="none"/></g>`;
    };
    return `<svg class="amp-svg reference-mc2105" viewBox="0 0 2000 980" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="McIntosh MC 2105 솔리드스테이트 앰프">
    ${refMetalDefs(p)}<rect data-panel-region="chassis" x="22" y="18" width="1956" height="828" rx="3" fill="#030807" stroke="#323f3a" stroke-width="3"/>
    <path d="M46 28H1954M46 832H1954" stroke="url(#${p}rim)" stroke-width="7"/><path d="M40 32H1960" stroke="#b5c4b9" stroke-width="1"/>
    <rect x="13" y="13" width="30" height="838" fill="url(#${p}rim)"/><rect x="1957" y="13" width="30" height="838" fill="url(#${p}rim)"/>
    ${meter(176,'ampVuL')}${meter(696,'ampVuR')}
    <g class="ampLegend" data-panel-region="brand">${refText(1530,265,'McIntosh',64,'#7cd38e','middle','font-style="italic" font-weight="700"')}${refText(1530,308,'MC 2105 SOLID STATE',23,'#75c58d','middle','letter-spacing="5"')}${refText(1530,341,'POWER AMPLIFIER',23,'#75c58d','middle','letter-spacing="7"')}</g>
    <rect x="1490" y="190" width="80" height="12" fill="#5f1e16"/><rect class="ampLamp" x="1490" y="190" width="80" height="10" fill="#f87350"/>
    <g transform="translate(0 100)">
    ${[[320,'LEFT GAIN'],[630,'METER RANGE'],[940,'RIGHT GAIN'],[1380,'SPEAKER'],[1700,'POWER']].map(([x,label])=>refText(x,479,label,19,'#9dd3ae','middle','letter-spacing="2.5"')+refKnob(p,x,609,62,'',x===630?'mcRangeMark':x===1380?'mcSpeakerMark':x===1700?'mcPowerMark':'')).join('')}
    <g fill="none" stroke="#9dc6a7" stroke-width="1.3"><path d="M530 521h65l18 38M536 548h47l10 22M727 521h-64l-18 38M733 548h-48l-10 22"/></g>
    ${refText(517,525,'−10',15,'#9dc6a7','end')}${refText(524,553,'−20',15,'#9dc6a7','end')}${refText(738,525,'0',15,'#9dc6a7')}${refText(742,553,'OFF',15,'#9dc6a7')}
    ${[1380,1700].map(x=>refText(x-56,530,'OFF',14,'#9dc6a7','end')+refText(x+56,530,'ON',14,'#9dc6a7')+`<path d="M${x-50} 525h30l14 40m12 0 14-40h30" fill="none" stroke="#9dc6a7" stroke-width="1.5"/>`).join('')}
    ${refText(1140,556,'HEADPHONES',13,'#82a78d','middle','letter-spacing="1.5"')}<circle cx="1140" cy="612" r="22" fill="url(#${p}rim)"/><circle cx="1140" cy="612" r="14" fill="#010403"/>
    ${[130,1870].map(x=>`<circle cx="${x}" cy="694" r="11" fill="url(#${p}rim)"/>`+refText(x,667,'PANLOC',11,'#718d77','middle','letter-spacing="2"')).join('')}
    <path d="M130 750v16h135v-16m1470 0v16h135v-16" fill="#0d1310"/>
    </g><g data-app-controls="true"><rect x="80" y="888" width="1840" height="74" rx="6" fill="#141b18" stroke="#37483e"/>${refText(115,932,'시스템 음량',22,'#d2ded5')}${refText(390,932,'두 채널 공통',16,'#8d9f91')} ${refKnob(p,710,923,24,'','ampVolMark')}${refText(780,931,'VOLUME',16,'#b5c7ba')} ${refText(1860,931,'MC2105 · 좌우 게인은 전면 노브로 조절',16,'#92a397','end')}</g>
    </svg>`;
}
function refB215() {
    const p='refB';
    const cell=(x,y,id,label,red=false)=>`<g>${refText(x+45,y-12,label,15,'#acb9b2','middle')}<rect id="deckKeyR${id}" x="${x}" y="${y}" width="90" height="44" rx="8" fill="${red?'#733531':'#414b46'}" stroke="#101b15" stroke-width="3" style="cursor:pointer"><title>${label}</title></rect><path d="M${x+10} ${y+4}h70" stroke="#88998d" opacity=".35" pointer-events="none"/></g>`;
    const bars=(id,y)=>`<g id="${id}" data-meter-style="segments" data-meter-glow="none">${Array.from({length:24},(_,i)=>`<rect data-meter-segment="${i}" data-on="#244139" data-off="#8da196" x="${356+i*13}" y="${y}" width="7" height="10" fill="#8da196"/>`).join('')}</g>`;
    return `<svg class="deck-svg reference-b215" viewBox="0 0 2000 840" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="REVOX B215 카세트 데크">
    ${refMetalDefs(p)}<rect x="10" y="14" width="1980" height="692" rx="4" fill="url(#${p}silver)" stroke="#3c4840" stroke-width="3"/><rect x="12" y="16" width="1976" height="688" fill="url(#${p}brush)"/>
    <rect x="46" y="270" width="1908" height="400" fill="url(#${p}black)"/><path d="M50 268H1950" stroke="#f3f3e7" stroke-width="4"/>
    ${refText(65,59,'B 215 · CASSETTE TAPE DECK',22,'#34433a')}${refText(1000,67,'REVOX',47,'#26372c','middle','font-weight="800"')}${refText(1940,59,'INFRARED REMOTE CONTROLLED SYSTEM',16,'#415248','end')}
    <path d="M65 82H1940" stroke="#748578" stroke-width="1.3"/>
    ${refText(93,112,'REAL TIME COUNTER',16,'#425348')}${refText(352,112,'PEAK PROGRAM INDICATOR',16,'#425348')}
    <rect x="78" y="129" width="642" height="113" fill="#6b7f70" stroke="#59665a" stroke-width="3"/><rect x="87" y="138" width="624" height="97" fill="#afc5b3"/>
    <rect x="95" y="145" width="222" height="80" rx="5" fill="#9fb9a6"/>
    ${refText(290,194,'00:00',47,'#244139','end','id="deckCounter" font-family="monospace"')}${refText(297,219,'/ 30:00',12,'#3d5b4b','end','id="deckCounterMax"')}
    ${refText(340,159,'TAPE · DOLBY',12,'#3d5b4b')}${bars('deckVuL',173)}${bars('deckVuR',193)}
    ${refText(354,224,'−30   −20   −10    0    +2    +4    +8',12,'#3d5b4b')}
    ${refKey(p,784,136,162,104,'deckKeyR9','ALIGN',false)}${refKey(p,1000,136,145,104,'deckBtnEject','RELEASE')}
    <g id="deckTransport">${[[1190,83,'deckBtnRew','◀◀'],[1275,83,'deckBtnFf','▶▶'],[1360,100,'deckBtnPlay','PLAY'],[1462,100,'deckBtnStop','STOP'],[1564,100,'deckBtnRec','REC']].map(([x,w,id,l])=>refKey(p,x,136,w,104,id,l,id==='deckBtnRec')).join('')}</g>
    ${refKey(p,1740,136,184,104,'deckPowerBtn','POWER')}
    <g stroke="#4b5b50" stroke-width="1" opacity=".8">${[85,192,300,408,516,624,1375,1483,1591,1699,1807,1915].map(x=>`<path d="M${x} 285v366"/>`).join('')}${[309,418,528,638].map(y=>`<path d="M60 ${y}h564M1375 ${y}h540"/>`).join('')}</g>
    ${cell(205,346,0,'BIAS')}${cell(313,346,1,'EQ')}${cell(421,346,2,'CAL')}${cell(313,456,5,'NR SYSTEM')}${cell(421,456,4,'MPX')}${cell(529,566,3,'MONITOR')}
    ${refText(147,453,'DOLBY B/C',15,'#9eafa4','middle')}${refText(147,475,'NOISE REDUCTION',10,'#9eafa4','middle')}${refText(147,549,'PHONES',14,'#9eafa4','middle')}<circle cx="147" cy="585" r="22" fill="#090e0a" stroke="#5f7062" stroke-width="3"/>
    ${refText(164,342,'IR SENSOR',13,'#9eafa4','middle')}<rect x="124" y="355" width="80" height="31" rx="12" fill="#422526"/>
    ${cell(1388,346,8,'LOOP')}${cell(1496,346,7,'RECALL')}${cell(1604,346,11,'ZERO LOC')}${cell(1712,456,6,'STORE',true)}${cell(1604,566,10,'PLAY TIME')}
    ${refCassette(1000,306,p)}
    <circle id="deckRecLed" cx="1080" cy="584" r="5" fill="#361c16"/><circle id="deckTimerLed" cx="1110" cy="584" r="4" fill="#252b1c"/>
    <rect x="80" y="746" width="1840" height="80" rx="6" fill="#141b18" stroke="#37483e"/>
    <g id="deckShelf" transform="translate(0 320)"></g></svg>`;
}
function refTandberg() {
    const p = 'refT';
    const roundKey = (cx, cy, id, label) => `<g>${refText(cx,cy-39,label,14,'#bfc3bc','middle')}<circle cx="${cx}" cy="${cy+4}" r="26" fill="#050807"/><circle id="${id}" cx="${cx}" cy="${cy}" r="24" fill="url(#${p}knob)" stroke="#959d93" stroke-width="2" style="cursor:pointer"><title>${label}</title></circle><path d="M${cx-16} ${cy-16}q16-13 32 0" fill="none" stroke="#fff" opacity=".4"/></g>`;
    const key = (x,y,i,label) => `<g><rect id="deckKeyR${i}" x="${x}" y="${y}" width="76" height="25" rx="2" fill="#81877c" stroke="#050907" stroke-width="2" style="cursor:pointer"><title>${label}</title></rect>${refText(x+38,y-11,label,13,'#b3baad','middle')}</g>`;
    const bars = (id,y) => `<g id="${id}" data-meter-style="segments">${Array.from({length:32},(_,i)=>`<rect data-meter-segment="${i}" data-on="${i>24?'#fb8064':'#e5b058'}" data-off="${i>24?'#45251e':'#3c3421'}" x="${1120+i*19}" y="${y}" width="11" height="17" fill="#3c3421"/>`).join('')}</g>`;
    return `<svg class="deck-svg reference-tandberg" viewBox="0 0 2000 910" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Tandberg TCD 3014A 카세트 데크">
    ${refMetalDefs(p)}<defs><linearGradient id="${p}wood"><stop stop-color="#311e16"/><stop offset=".2" stop-color="#6c442b"/><stop offset=".6" stop-color="#4a2d1e"/><stop offset="1" stop-color="#25170f"/></linearGradient><pattern id="${p}grain" width="16" height="400" patternUnits="userSpaceOnUse"><path d="M3 0Q-6 120 5 200T4 400M12 0Q22 100 10 205T12 400" stroke="#bb8851" stroke-width="1" fill="none" opacity=".25"/></pattern></defs>
    <rect x="12" y="18" width="1976" height="752" rx="4" fill="url(#${p}wood)" stroke="#21170f" stroke-width="3"/><rect x="12" y="18" width="1976" height="752" fill="url(#${p}grain)"/>
    <rect x="57" y="31" width="1886" height="714" fill="url(#${p}black)" stroke="#050907" stroke-width="3"/><rect x="60" y="33" width="1880" height="710" fill="url(#${p}brush)" opacity=".5"/><path d="M60 33H1940" stroke="#7e8378" stroke-width="2"/>
    ${refText(100,90,'TANDBERG',35,'#d5d7c9','start','letter-spacing="3" font-weight="600"')}${refText(100,120,'TCD 3014 A',18,'#bec4b8','start','letter-spacing="3"')}${refText(1900,93,'THREE HEAD · DUAL CAPSTAN',18,'#a1aa9c','end','letter-spacing="2"')}
    <rect x="115" y="192" width="170" height="66" rx="2" fill="#0b110d" stroke="#51594d" stroke-width="2"/>${refText(266,235,'00:00',31,'#df9858','end','id="deckCounter" font-family="monospace"')}${refText(266,278,'/ 30:00',13,'#9ba48f','end','id="deckCounterMax"')}
    ${roundKey(185,353,'deckPowerBtn','POWER')}${roundKey(185,488,'deckBtnEject','EJECT')}
    <rect x="338" y="176" width="676" height="474" rx="3" fill="#111914" stroke="#070b08" stroke-width="7"/><rect x="351" y="189" width="650" height="448" rx="2" fill="#202820" stroke="#677160" stroke-width="2"/>
    ${refCassette(676,252,p)}<path d="M366 205H982L933 627H366Z" fill="#d6e1be" opacity=".035" pointer-events="none"/>
    ${refText(676,609,'DUAL CAPSTAN · FOUR MOTOR TRANSPORT',14,'#aab5a0','middle','letter-spacing="1"')}
    <g data-panel-region="meter"><rect x="1075" y="165" width="772" height="162" rx="2" fill="#080e0a" stroke="#4b5748" stroke-width="2"/>
    ${refText(1100,202,'L',13,'#a2ac95')}${refText(1100,235,'R',13,'#a2ac95')}${bars('deckVuL',188)}${bars('deckVuR',221)}
    ${refText(1120,266,'−30       −20       −10       −5         0        +3    +6',15,'#beb397')}${refText(1820,306,'PEAK PROGRAM LEVEL · dB',13,'#8d9984','end')}
    <circle id="deckRecLed" cx="1110" cy="298" r="6" fill="#471f18"/>${refText(1126,303,'REC',12,'#99795c')}<circle id="deckTimerLed" cx="1210" cy="298" r="5" fill="#2e3321"/></g>
    <g id="deckTransport">${[[1120,'deckBtnRec','RECORD'],[1280,'deckBtnRew','REWIND'],[1440,'deckBtnPlay','PLAY'],[1600,'deckBtnFf','FORWARD'],[1760,'deckBtnStop','STOP']].map(([x,id,label])=>roundKey(x,412,id,label)).join('')}</g>
    ${[[1100,'BIAS'],[1280,'LEVEL L'],[1460,'LEVEL R'],[1740,'OUTPUT']].map(([x,l])=>refText(x,503,l,17,'#c0c7b8','middle','letter-spacing="2"')+refKnob(p,x,584,x===1740?68:39)).join('')}
    ${refText(1740,681,'MASTER',13,'#adb6a3','middle','letter-spacing="3"')}
    ${key(366,696,5,'DOLBY NR')}${key(474,696,4,'MPX')}${key(582,696,3,'MONITOR')}${key(690,696,9,'AUTO CAL')}${key(798,696,8,'LOOP')}${key(906,696,11,'ZERO LOC')}
    <path d="M170 770v16h160v-16m1340 0v16h160v-16" fill="#0b100c"/>
    <rect x="80" y="816" width="1840" height="80" rx="6" fill="#141b18" stroke="#37483e"/>
    <g id="deckShelf" transform="translate(0 390)"></g></svg>`;
}
AMP_MODELS.mc2105.svg = refMC2105();
AMP_MODELS.mc2105.vol = { cx: 710, cy: 923, r: 30 };
AMP_MODELS.mc2105.desc = '매킨토시 솔리드스테이트 — 좌측 듀얼 dB 미터와 독립 좌우 게인, 오토포머';
DECK_MODELS.b215.svg = refB215();
DECK_MODELS.b215.micOffsetY = 320;
DECK_MODELS.tcd3014.svg = refTandberg();
DECK_MODELS.tcd3014.micOffsetY = 390;

function refSyncMCControls() {
    const range = fpGet('mc2105.meterRange', 0);
    for (const [id, cx, angle] of [['mcRangeMark',630,range==='off'?65:range===-20?-65:range===-10?-35:35],['mcSpeakerMark',1380,speakersOff?-35:35],['mcPowerMark',1700,unitOn('amp')?35:-35]]) {
        document.getElementById(id)?.setAttribute('transform', `rotate(${angle} ${cx} 609)`);
    }
    const hit = document.querySelector('#ampStage [aria-label="미터 범위"]');
    hit?.setAttribute('aria-description', range === 'off' ? '미터 꺼짐' : `${range} dB`);
}

function refSL1200Details(spec) {
    spec.brand = '<circle cx="128" cy="90" r="35" fill="url(#ttChrome)" stroke="#565c60" stroke-width="2"/><circle cx="128" cy="90" r="6" fill="#30373a"/>' + refText(872,588,'Technics Quartz',19,'#3b4243') + refText(872,608,'SL-1200MK2',10,'#59605f');
    spec.detail = `<g pointer-events="none"><circle cx="161" cy="467" r="37" fill="#242a2d" stroke="#565d5f" stroke-width="3"/><circle cx="161" cy="462" r="28" fill="#151b1d" stroke="#a5a9a6" stroke-width="2"/><path d="M189 446l29-9 9 21-29 8" fill="#b82118"/><path d="M159 440v13" stroke="#eee" stroke-width="3"/>
    ${refText(128,519,'POWER',13,'#414949')}
    <rect x="930" y="281" width="78" height="247" fill="#adb3b1" stroke="#777f7d" stroke-width="2"/><rect x="961" y="308" width="8" height="181" fill="#171e1d"/>
    ${[-8,-4,0,4,8].map((n,i)=>`<path d="M940 ${334.5+i*30.75}h13" stroke="#495350"/>`+refText(935,338+i*30.75,n>0?'+'+n:String(n),10,'#414b47','end')).join('')}
    <rect id="ttPitchKnob" x="946" y="363.5" width="39" height="65" rx="2" fill="url(#ttChrome)" stroke="#424a48"/><path d="M948 395h35" stroke="#414b48" stroke-width="3"/>
    <circle id="ttQuartzLamp" cx="938" cy="396" r="4" fill="#e94e35"/>
    ${refText(969,555,'PITCH ADJ.',12,'#424d48','middle')}
    <circle cx="810" cy="581" r="18" fill="url(#ttChrome)" stroke="#707874"/><circle cx="846" cy="581" r="11" fill="url(#ttChrome)" stroke="#707874"/>
    </g>
    <g id="ttHardwareStart" style="cursor:pointer"><rect x="91" y="551" width="145" height="59" rx="1" fill="#1d2423"/><rect x="97" y="555" width="133" height="49" fill="url(#ttCastSilver)" stroke="#edf0e9" stroke-width="2"/>${refText(163,585,'START · STOP',12,'#3f4945','middle','pointer-events="none"')}</g>
    <circle id="ttHardwarePower" cx="161" cy="467" r="43" fill="transparent" style="cursor:pointer"/>
    <rect id="ttPitchHit" x="913" y="274" width="100" height="260" fill="transparent" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="피치 조정 ±8%"><title>PITCH ADJ. — 위아래로 끌어 ±8%</title></rect>`;
    return spec;
}

// 음반 정보는 기기의 일부가 아니다. 본체 SVG와 정보·조작 영역을 서로 독립된 열로 구성한다.
function refTurntableLayout(stage, record, index, count) {
    const svg = stage.querySelector('svg');
    const front = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    front.setAttribute('class','tt-front-depth');
    front.innerHTML = `<path d="M24 640H1196V700L1176 722H45L24 700Z" fill="${record.__plinth || '#302a22'}" stroke="#111714" stroke-width="3"/><path d="M25 644H1194" stroke="#c8bca5" stroke-opacity=".35" stroke-width="2"/><path d="M60 701H1158" stroke="#070b09" stroke-opacity=".5" stroke-width="8"/><path d="M122 721v23h140v-23m676 0v23h140v-23" fill="#101511"/>`;
    svg.append(front);
    const workspace = document.createElement('div'); workspace.className='tt-workstation';
    const machine = document.createElement('div'); machine.className='tt-machine';
    machine.append(svg);
    const controls = document.createElement('div'); controls.className='tt-operating-strip';
    controls.innerHTML='<button id="ttPowerBtn" type="button"><span id="ttPwrLed" class="tt-status-dot"></span>전원</button><button id="ttStartBtn" class="tt-start" type="button"><span id="ttStartLabel">START</span></button><div class="tt-speed" role="group" aria-label="회전 속도"><button id="tt33" type="button">33⅓</button><button id="tt45" type="button">45</button></div><button id="ttCleanBtn" type="button">브러시 청소</button><span class="tt-dust-track" title="레코드 먼지"><span id="ttDustBar"></span></span>';
    if (ttModelId === 'sl1200') {
        const reset = document.createElement('button'); reset.id='ttQuartzHit'; reset.type='button'; reset.textContent='피치 0'; reset.setAttribute('aria-label','쿼츠 록 — 피치 0으로 복귀'); controls.append(reset);
    }
    machine.append(controls);
    const credit=document.createElement('p');credit.className='tt-credit';credit.textContent=record.credit;machine.append(credit);
    const info=document.createElement('section');info.className='tt-record-panel';info.setAttribute('aria-label','음반 정보와 수록곡');
    info.innerHTML='<div class="tt-record-heading"><span>지금 올려놓은 음반</span><button id="ttCrateBtn" type="button">음반 수납장</button></div><div class="tt-record-summary"><button id="ttJacketHit" class="tt-paper-jacket" type="button" aria-label="재킷 크게 보기"><span class="tt-cover-art"><span class="tt-cover-fallback" aria-hidden="true"></span></span><span class="tt-paper-title"></span></button><div class="tt-record-meta"><p class="tt-record-composer"></p><h3></h3><p class="tt-record-performer"></p><p class="tt-record-count"></p></div></div><ol class="tt-track-list"></ol><div class="tt-record-paging"><button id="ttPrevRec" type="button">← 이전 음반</button><button id="ttNextRec" type="button">다음 음반 →</button></div>';
    info.querySelector('.tt-paper-jacket').style.backgroundColor=record.jacketBg;
    info.querySelector('.tt-paper-title').style.color=jacketInk(record.jacketBg).title;
    info.querySelector('.tt-paper-title').textContent=record.jTitle;
    info.querySelector('.tt-record-composer').textContent=record.composer;
    info.querySelector('h3').textContent=record.title;
    info.querySelector('.tt-record-performer').textContent=record.performer;
    info.querySelector('.tt-record-count').textContent=`${index+1} / ${count} · ${record.tracks.length}곡`;
    if(record.cover){ const img=document.createElement('img');img.id='ttCoverImage';img.alt='';img.setAttribute('opacity','0');img.src=PHONO_BASE+record.cover;info.querySelector('.tt-cover-art').append(img); }
    record.tracks.forEach((track,i)=>{const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.id='ttTrackHit'+i;const num=document.createElement('span');num.className='tt-track-number';num.textContent=String(i+1).padStart(2,'0');const label=document.createElement('span');label.textContent=track.t;b.append(num,label);li.append(b);info.querySelector('ol').append(li);});
    workspace.append(machine,info);stage.replaceChildren(workspace);
}
