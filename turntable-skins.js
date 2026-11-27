// Turntable SVGs. Playback, interaction and animation live in app.js.

function recordSvgText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
}

function ttSL1200Details(spec) {
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

// 레코드/재킷 기능은 공통으로 유지하되, 본체 하드웨어는 모델마다 별도 조형한다.
// 회전과 톤암 드래그 계산이 의존하는 중심(560,330), 피벗(1065,120), 바늘(768,428)은 고정한다.
function ttVisualSpec(id) {
    const strobe = [0, 1, 2].map((row) => Array.from({ length: 54 }, (_, i) => {
        const a = i / 54 * Math.PI * 2;
        const r = 264 + row * 5.5;
        const x = (560 + Math.cos(a) * r).toFixed(1);
        const y = (330 + Math.sin(a) * r).toFixed(1);
        return '<circle cx="' + x + '" cy="' + y + '" r="' + (row === 1 ? 2.4 : 1.7) + '" fill="#e4e5e2" opacity="' + (row === 1 ? '.9' : '.65') + '"/>';
    }).join("")).join("");
    const modelScrew = (x, y, light) => '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none"><circle r="9" fill="' + (light ? 'url(#ttChrome)' : '#202126') + '" stroke="' + (light ? '#4e5054' : '#666970') + '" stroke-width="1.5"/><path d="M-4 -1 L4 1" stroke="' + (light ? '#323438' : '#c8c9cc') + '" stroke-width="1.5"/></g>';
    const hit = '<circle id="ttArmHit" cx="768" cy="428" r="58" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>톤암 — 잡아서 원하는 트랙 위에 내려놓으세요</title></circle>';
    const specs = {
        sl1200: {
            body: '<path d="M48 18 Q48 0 68 0 H1118 Q1144 0 1144 28 V596 Q1144 622 1118 622 H68 Q44 622 44 596 Z" fill="url(#ttCastSilver)" stroke="#5a5d61" stroke-width="4"/><path d="M68 28 H1118 V590 H68 Z" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/><path d="M84 44 H1098" stroke="#fff" stroke-width="4" opacity=".28"/><rect x="48" y="2" width="1094" height="618" rx="18" fill="url(#ttMetalGrain)" opacity=".46" pointer-events="none"/>',
            brand: '<text x="70" y="68" font-family="Arial" font-size="28" font-style="italic" font-weight="800" letter-spacing="-1" fill="#25272a">Technics</text><text x="72" y="98" font-family="Arial" font-size="13" font-weight="700" letter-spacing="2.3" fill="#45484c">SL-1200MK2</text>',
            platterBase: '<ellipse cx="570" cy="348" rx="294" ry="286" fill="#000" opacity=".42" filter="url(#ttShadow)"/><circle cx="560" cy="330" r="288" fill="url(#ttChrome)" stroke="#33353a" stroke-width="3"/><circle cx="560" cy="330" r="278" fill="#1c1e21"/><circle cx="560" cy="330" r="273" fill="url(#ttRubber)"/>',
            spinTrim: '<g id="ttStrobeRing">' + strobe + '</g><circle cx="560" cy="330" r="257" fill="none" stroke="#090a0c" stroke-width="6"/>',
            armBase: '<ellipse cx="1070" cy="132" rx="64" ry="60" fill="#000" opacity=".4" filter="url(#ttShadow)"/><circle cx="1065" cy="120" r="55" fill="url(#ttChrome)" stroke="#42454a" stroke-width="3"/><circle cx="1065" cy="120" r="40" fill="#303338" stroke="#f2f2ee" stroke-width="2"/><path d="M1027 120 H1103 M1065 82 V158" stroke="#9ea1a5" stroke-width="4"/><circle cx="1065" cy="120" r="19" fill="url(#ttDarkMetal)"/><rect x="916" y="476" width="30" height="51" rx="7" fill="#292c30" stroke="#6f7277"/><rect x="908" y="474" width="46" height="13" rx="5" fill="url(#ttChrome)"/>',
            arm: '<g id="ttArmG"><rect x="1118" y="59" width="72" height="36" rx="16" fill="url(#ttDarkMetal)" stroke="#777a80" stroke-width="2"/><circle cx="1127" cy="77" r="18" fill="#15171a"/><path d="M1125 88 L1070 115" stroke="#4b4e53" stroke-width="13" stroke-linecap="round"/><path d="M1065 120 C1018 145 1020 204 966 240 S850 337 768 428" fill="none" stroke="#3d4045" stroke-width="13" stroke-linecap="round"/><path d="M1065 120 C1018 145 1020 204 966 240 S850 337 768 428" fill="none" stroke="url(#ttArmSilver)" stroke-width="7" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><rect x="730" y="416" width="66" height="30" rx="4" fill="#292b30" stroke="#e1e2e0"/><rect x="740" y="444" width="17" height="9" rx="2" fill="#d4402f"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><circle cx="190" cy="330" r="45" fill="#24262a" stroke="#63666b" stroke-width="3"/><circle cx="190" cy="330" r="32" fill="#111214"/><path d="M190 330 L190 303" stroke="#f1f1ed" stroke-width="5" stroke-linecap="round"/><text x="190" y="394" font-family="Arial" font-size="12" font-weight="700" fill="#35383c" text-anchor="middle">START · STOP</text><rect x="936" y="272" width="62" height="252" rx="9" fill="#27292d" stroke="#74777b" stroke-width="2"/><rect x="946" y="300" width="42" height="192" rx="7" fill="#151619"/><rect id="ttPitchKnob" x="950" y="332" width="34" height="65" rx="6" fill="url(#ttChrome)" stroke="#34363a"/><text x="967" y="545" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.4" fill="#383b3f" text-anchor="middle">PITCH ADJ.</text><circle cx="1028" cy="544" r="18" fill="#17191c" stroke="#6f7277"/><circle id="ttQuartzLamp" cx="1028" cy="544" r="7" fill="#e94e35"/><path d="M1018 516 Q1028 500 1038 516" fill="none" stroke="#313439" stroke-width="5"/></g>' +
                '<rect id="ttPitchHit" x="930" y="266" width="74" height="264" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="피치 조정 ±8%"><title>PITCH ADJ. — 위아래로 끌어 ±8%</title></rect>' +
                '<circle id="ttQuartzHit" cx="1028" cy="544" r="24" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="쿼츠 록 — 피치 0으로 복귀"><title>QUARTZ LOCK — 피치를 0으로 되돌립니다</title></circle>' + modelScrew(86, 566, true) + modelScrew(1100, 566, true)
        },
        td124: {
            body: '<rect x="30" y="-12" width="1136" height="658" rx="12" fill="url(#ttWalnutDark)" stroke="#27160d" stroke-width="5"/><path d="M58 20 H1110 Q1138 20 1138 48 V574 Q1138 614 1098 614 H58 Z" fill="url(#ttIvoryCast)" stroke="#6b665b" stroke-width="3"/><path d="M76 40 H1096 M76 594 H1082" stroke="#fffdf4" stroke-width="3" opacity=".65"/>',
            brand: '<rect x="66" y="43" width="234" height="59" rx="4" fill="#e7e1d3" stroke="#5e594f"/><text x="183" y="72" font-family="Arial" font-size="24" font-weight="800" letter-spacing="3" fill="#3f3b34" text-anchor="middle">THORENS</text><text x="183" y="92" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2.2" fill="#625c52" text-anchor="middle">TD 124 · SWISS MADE</text>',
            platterBase: '<ellipse cx="570" cy="350" rx="297" ry="289" fill="#000" opacity=".48" filter="url(#ttShadow)"/><circle cx="560" cy="330" r="291" fill="url(#ttChrome)" stroke="#4b4d50" stroke-width="3"/><circle cx="560" cy="330" r="282" fill="#7d7b74"/><circle cx="560" cy="330" r="275" fill="#242529"/><circle cx="560" cy="330" r="268" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#c9c5ba" stroke-width="5" stroke-dasharray="1 7"/><circle cx="560" cy="330" r="259" fill="none" stroke="#4c4b47" stroke-width="3"/>',
            armBase: '<ellipse cx="1070" cy="132" rx="58" ry="58" fill="#000" opacity=".42" filter="url(#ttShadow)"/><circle cx="1065" cy="120" r="52" fill="#d7d1c3" stroke="#58544c" stroke-width="3"/><circle cx="1065" cy="120" r="34" fill="url(#ttChrome)"/><circle cx="1065" cy="120" r="14" fill="#2b2c30"/><rect x="916" y="480" width="28" height="46" rx="4" fill="#393a3d" stroke="#77756f"/><path d="M910 481 H950" stroke="#d8d2c5" stroke-width="12" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><circle cx="1134" cy="77" r="27" fill="#25262a" stroke="#aba79d" stroke-width="3"/><rect x="1126" y="62" width="54" height="30" rx="13" fill="url(#ttDarkMetal)"/><line x1="1122" y1="89" x2="1065" y2="120" stroke="#4d4f52" stroke-width="12" stroke-linecap="round"/><path d="M1065 120 C1000 166 938 252 880 324 S808 400 768 428" fill="none" stroke="#494b50" stroke-width="12" stroke-linecap="round"/><path d="M1065 120 C1000 166 938 252 880 324 S808 400 768 428" fill="none" stroke="url(#ttArmSilver)" stroke-width="6.5" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><path d="M731 418 H793 L788 447 H736 Z" fill="#3a3b3e" stroke="#d5d0c4"/><rect x="741" y="444" width="16" height="9" rx="2" fill="#7f2d24"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><path d="M67 292 A73 73 0 0 1 213 292" fill="none" stroke="#5d584e" stroke-width="4"/><path d="M91 287 L75 266 M113 268 L105 240 M140 260 V228 M167 268 L177 240 M190 287 L207 266" stroke="#5d584e" stroke-width="3"/><circle cx="140" cy="292" r="43" fill="#e2dccf" stroke="#58544c" stroke-width="3"/><circle cx="140" cy="292" r="28" fill="url(#ttDarkMetal)"/><path id="ttSpeedPtr" d="M140 292 L118 276" stroke="#eee9de" stroke-width="5" stroke-linecap="round"/><text x="140" y="354" font-family="Arial" font-size="12" font-weight="700" fill="#4f4a42" text-anchor="middle">16 · 33 · 45 · 78</text><rect x="66" y="392" width="205" height="78" rx="8" fill="#c8c1b3" stroke="#5b564d" stroke-width="2"/><circle cx="108" cy="431" r="22" fill="#3a3938"/><path d="M108 431 L123 418" stroke="#f2ede3" stroke-width="4"/><text x="178" y="424" font-family="Arial" font-size="10" font-weight="700" letter-spacing="1.3" fill="#4e4941" text-anchor="middle">FINE SPEED</text><text x="178" y="445" font-family="Arial" font-size="9" fill="#665f55" text-anchor="middle">IDLER ENGAGED</text></g>' +
                '<circle id="ttSpeedHit" cx="140" cy="292" r="52" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="회전 속도 전환 16·33·45·78"><title>SPEED — 누를 때마다 16&#8532; · 33&#8531; · 45 · 78</title></circle>' + modelScrew(76, 560, true) + modelScrew(1092, 560, true)
        },
        g301: {
            body: '<rect x="28" y="-14" width="1140" height="660" rx="9" fill="url(#ttWalnutDark)" stroke="#24140c" stroke-width="6"/><path d="M58 20 H812 Q854 20 884 50 L920 86 H1128 V594 H58 Z" fill="url(#ttHammerCream)" stroke="#5d584e" stroke-width="3"/><path d="M78 42 H804 Q842 42 870 70" fill="none" stroke="#fffdf3" stroke-width="3" opacity=".55"/>',
            brand: '<path d="M65 40 H288 Q305 40 305 57 V102 H65 Z" fill="#c7c0ae" stroke="#5c574d" stroke-width="2"/><text x="185" y="77" font-family="Georgia, serif" font-size="31" font-style="italic" font-weight="700" fill="#3c3933" text-anchor="middle">Garrard</text><text x="185" y="96" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2" fill="#5b564d" text-anchor="middle">MODEL 301 · TRANSCRIPTION</text>',
            platterBase: '<ellipse cx="570" cy="350" rx="298" ry="291" fill="#000" opacity=".5" filter="url(#ttShadow)"/><circle cx="560" cy="330" r="292" fill="#8d8b84" stroke="#37383a" stroke-width="4"/><circle cx="560" cy="330" r="284" fill="url(#ttChrome)"/><circle cx="560" cy="330" r="274" fill="#1c1d20"/><circle cx="560" cy="330" r="268" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#dedbd2" stroke-width="4" stroke-dasharray="3 5"/><circle cx="560" cy="330" r="260" fill="none" stroke="#4a4a47" stroke-width="4"/>',
            armBase: '<ellipse cx="1070" cy="134" rx="61" ry="62" fill="#000" opacity=".48" filter="url(#ttShadow)"/><rect x="1018" y="69" width="94" height="104" rx="36" fill="#28292d" stroke="#77756e" stroke-width="3"/><circle cx="1065" cy="120" r="38" fill="#17181b" stroke="#b7b2a7" stroke-width="2"/><circle cx="1065" cy="120" r="17" fill="url(#ttGoldMetal)"/><rect x="916" y="479" width="28" height="49" rx="4" fill="#28292c" stroke="#807b70"/><path d="M910 481 H950" stroke="#b5aa92" stroke-width="11" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><rect x="1118" y="59" width="76" height="38" rx="15" fill="#1d1e21" stroke="#9b9485" stroke-width="2"/><circle cx="1127" cy="78" r="18" fill="url(#ttGoldMetal)"/><line x1="1122" y1="90" x2="1065" y2="120" stroke="#2b2d31" stroke-width="14" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#1e2024" stroke-width="13" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#8b806d" stroke-width="7" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#d7ceb9" stroke-width="2" stroke-linecap="round" opacity=".7"/><g transform="rotate(-46 762 434)"><rect x="728" y="416" width="69" height="31" rx="3" fill="#242529" stroke="#b3aa98"/><rect x="740" y="444" width="18" height="10" rx="2" fill="#8e2e21"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><rect x="62" y="278" width="214" height="218" rx="16" fill="#bcb5a4" stroke="#555047" stroke-width="3"/><rect x="78" y="295" width="182" height="184" rx="11" fill="url(#ttHammerCream)" stroke="#eae5da"/><text x="169" y="320" font-family="Arial" font-size="11" font-weight="700" letter-spacing="2" fill="#4a463f" text-anchor="middle">SPEED CONTROL</text><circle cx="122" cy="370" r="33" fill="#2b2d30" stroke="#77756e" stroke-width="2"/><path id="ttTrimPtr" d="M122 370 L106 345" stroke="#e6e0d5" stroke-width="5" stroke-linecap="round"/><text x="122" y="421" font-family="Arial" font-size="10" fill="#514d45" text-anchor="middle">33 · 45 · 78</text><path id="ttBrakeLever" d="M198 348 L226 410" stroke="#303236" stroke-width="15" stroke-linecap="round"/><circle cx="198" cy="348" r="15" fill="#25272a" stroke="#8c887f"/><text x="211" y="438" font-family="Arial" font-size="10" font-weight="700" fill="#514d45" text-anchor="middle">BRAKE</text></g>' +
                '<circle id="ttTrimHit" cx="122" cy="370" r="42" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="와전류 속도 미세 조정 ±3%"><title>SPEED CONTROL — 위아래로 끌어 ±3%</title></circle>' +
                '<rect id="ttBrakeHit" x="176" y="330" width="72" height="102" fill="#000" fill-opacity="0" style="cursor:pointer;touch-action:none" tabindex="0" role="button" aria-label="브레이크 — 누르는 동안 플래터 정지"><title>BRAKE — 누르는 동안 플래터를 즉시 세웁니다</title></rect>' + modelScrew(84, 562, true) + modelScrew(1094, 562, true)
        },
        lp12: {
            body: '<rect x="30" y="-14" width="1138" height="662" rx="8" fill="url(#ttRosewood)" stroke="#21120b" stroke-width="6"/><rect x="42" y="-2" width="1112" height="638" rx="6" fill="url(#ttWoodLines)" opacity=".24" pointer-events="none"/><rect x="58" y="18" width="1080" height="598" rx="3" fill="#121316" stroke="#666970" stroke-width="2"/><path d="M44 4 H1152 M44 630 H1152" stroke="#df9561" stroke-width="3" opacity=".38"/>',
            brand: '<text x="72" y="75" font-family="Arial" font-size="31" font-weight="300" letter-spacing="7" fill="#efede6">LINN</text><text x="74" y="103" font-family="Arial" font-size="12" font-weight="700" letter-spacing="3.2" fill="#9b9c9c">SONDEK LP12</text>',
            platterBase: '<ellipse cx="570" cy="348" rx="286" ry="280" fill="#000" opacity=".62" filter="url(#ttShadow)"/><circle cx="560" cy="330" r="279" fill="#08090b" stroke="#5c5e62" stroke-width="2"/><circle cx="560" cy="330" r="273" fill="#202125"/><circle cx="560" cy="330" r="266" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="263" fill="none" stroke="#55575c" stroke-width="2"/><circle cx="560" cy="330" r="258" fill="none" stroke="#0a0b0d" stroke-width="5"/>',
            armBase: '<ellipse cx="1070" cy="130" rx="52" ry="51" fill="#000" opacity=".6" filter="url(#ttShadow)"/><circle cx="1065" cy="120" r="45" fill="#111216" stroke="#666970" stroke-width="2"/><circle cx="1065" cy="120" r="28" fill="#25272c"/><circle cx="1065" cy="120" r="11" fill="url(#ttChrome)"/><rect x="919" y="480" width="24" height="46" rx="4" fill="#111216" stroke="#55585d"/><path d="M913 482 H949" stroke="#383a3f" stroke-width="10" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><rect x="1121" y="61" width="66" height="32" rx="14" fill="#101115" stroke="#5d6066" stroke-width="2"/><circle cx="1128" cy="77" r="15" fill="#25272c"/><line x1="1122" y1="89" x2="1065" y2="120" stroke="#18191d" stroke-width="12" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#08090b" stroke-width="11" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#a8aaad" stroke-width="4.5" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><path d="M733 419 H794 L787 446 H738 Z" fill="#0c0d0f" stroke="#74777d"/><rect x="742" y="444" width="15" height="8" rx="2" fill="#c53a2b"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><circle cx="196" cy="550" r="24" fill="url(#ttChrome)" stroke="#282a2e" stroke-width="2"/><circle cx="196" cy="550" r="8" fill="#111216"/><text x="240" y="556" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2.4" fill="#c8c5bc">33 / 45</text><path d="M71 282 H239" stroke="#47494e" stroke-width="1"/><text x="72" y="310" font-family="Arial" font-size="11" letter-spacing="2" fill="#787a7e">SINGLE POINT BEARING</text><text x="72" y="334" font-family="Arial" font-size="10" letter-spacing="1.6" fill="#65676b">LOW NOISE · HIGH TORQUE</text></g>' + modelScrew(78, 572, false) + modelScrew(1104, 572, false)
        }
    };
    return id === 'sl1200' ? ttSL1200Details(specs.sl1200) : (specs[id] || ttSL1200Details(specs.sl1200));
}

function ttSkinMarkup(modelId, { record, dustSpecks }) {
    const ttSkin = TT_MODELS[modelId];
    const ttVisual = ttVisualSpec(modelId);
    let grooves = "";
    for (let r = 108; r <= 246; r += 2.5) {
        grooves += '<circle cx="560" cy="330" r="' + r + '" fill="none" stroke="#000" stroke-width="0.8" opacity="0.5"/>';
    }
    for (let i = 0; i < 6; i++) {
        grooves += '<circle cx="560" cy="330" r="' + (116 + i * 22) + '" fill="none" stroke="#2e2e33" stroke-width="1.4" opacity="0.32"/>';
    }
    // ttFrame fades in the specks as dust accumulates.
    const dustMarkup = '<g id="ttDustG" opacity="0" pointer-events="none">' +
        dustSpecks.map(({ x, y, radius, opacity }) =>
            '<circle cx="' + x + '" cy="' + y + '" r="' + radius + '" fill="#c9c2b4" opacity="' + opacity + '"/>'
        ).join("") + '</g>';
    // 트랙 수에 따라 행 간격을 조인다 (최대 13트랙 — 슈만 어린이 정경까지 수용)
    const nTracks = record.tracks.length;
    // 라벨 인쇄 — 실물 LP처럼 스핀들 홀 아래에 곡 리스트를 인쇄한다.
    // 8곡까지는 한 컬럼, 그 이상은 두 컬럼. 원 밖으로 나가는 긴 제목은 ttLabelClip이 자른다.
    const labelTracks = (() => {
        if (nTracks <= 8) {
            const f = nTracks <= 4 ? 8.5 : nTracks <= 6 ? 7.5 : 6.8;
            const step = nTracks <= 4 ? 13.5 : nTracks <= 6 ? 11 : 9.2;
            return record.tracks.map((tr, i) =>
                '<text x="560" y="' + (344 + i * step) + '" font-family="Arial" font-size="' + f + '" fill="#3a2b1e" text-anchor="middle">' + (i + 1) + '. ' + recordSvgText(tr.t) + '</text>'
            ).join("");
        }
        const rowsN = Math.ceil(nTracks / 2);
        const step = rowsN > 6 ? 8.6 : 9.5;
        return record.tracks.map((tr, i) => {
            const x = i < rowsN ? 516 : 604;
            const row = i < rowsN ? i : i - rowsN;
            return '<text x="' + x + '" y="' + (342 + row * step) + '" font-family="Arial" font-size="5.8" fill="#3a2b1e" text-anchor="middle">' + (i + 1) + '. ' + recordSvgText(tr.t) + '</text>';
        }).join("");
    })();
    // 기기 전용 캔버스. 음반 정보와 재생 버튼은 refTurntableLayout이 HTML로 배치한다.
    return '<svg class="tt-svg" data-reference-layout="independent-turntable" viewBox="0 -40 1220 810" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="' + ttSkin.label + ' 턴테이블">' +
        '<defs>' +
        '<linearGradient id="ttWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d4430"/><stop offset="0.5" stop-color="#4a3524"/><stop offset="1" stop-color="#33241a"/></linearGradient>' +
        '<linearGradient id="ttWalnut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5b38"/><stop offset=".18" stop-color="#5b3822"/><stop offset=".55" stop-color="#75482b"/><stop offset="1" stop-color="#2b190f"/></linearGradient>' +
        '<linearGradient id="ttWalnutDark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#724326"/><stop offset=".32" stop-color="#3e2416"/><stop offset=".67" stop-color="#5a321c"/><stop offset="1" stop-color="#211109"/></linearGradient>' +
        '<linearGradient id="ttRosewood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d482e"/><stop offset=".22" stop-color="#3e2018"/><stop offset=".48" stop-color="#773a28"/><stop offset=".76" stop-color="#291513"/><stop offset="1" stop-color="#6b321f"/></linearGradient>' +
        '<linearGradient id="ttBlackPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2e34"/><stop offset=".2" stop-color="#17181d"/><stop offset=".78" stop-color="#111216"/><stop offset="1" stop-color="#050608"/></linearGradient>' +
        '<linearGradient id="ttCastSilver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f2ef"/><stop offset=".12" stop-color="#c8cac9"/><stop offset=".55" stop-color="#a5a8aa"/><stop offset="1" stop-color="#686b6f"/></linearGradient>' +
        '<linearGradient id="ttIvoryCast" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3eee2"/><stop offset=".2" stop-color="#d8d1c3"/><stop offset=".75" stop-color="#bbb4a7"/><stop offset="1" stop-color="#817b70"/></linearGradient>' +
        '<linearGradient id="ttHammerCream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4decf"/><stop offset=".18" stop-color="#c9c2b2"/><stop offset=".7" stop-color="#aaa493"/><stop offset="1" stop-color="#777166"/></linearGradient>' +
        '<radialGradient id="ttVinyl" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1c1c1f"/><stop offset="0.35" stop-color="#141416"/><stop offset="0.85" stop-color="#0d0d0f"/><stop offset="1" stop-color="#131316"/></radialGradient>' +
        '<radialGradient id="ttRubber" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#303237"/><stop offset=".62" stop-color="#17181b"/><stop offset="1" stop-color="#07080a"/></radialGradient>' +
        '<linearGradient id="ttSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="ttMetal" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stop-color="#d8d8dc"/><stop offset="0.6" stop-color="#9a9aa2"/><stop offset="1" stop-color="#5c5c64"/></radialGradient>' +
        '<linearGradient id="ttChrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f5257"/><stop offset=".16" stop-color="#f4f4f0"/><stop offset=".36" stop-color="#8d9094"/><stop offset=".58" stop-color="#e9e9e5"/><stop offset=".82" stop-color="#62656a"/><stop offset="1" stop-color="#25272b"/></linearGradient>' +
        '<linearGradient id="ttDarkMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#74777e"/><stop offset=".25" stop-color="#303238"/><stop offset=".68" stop-color="#121318"/><stop offset="1" stop-color="#4e5157"/></linearGradient>' +
        '<linearGradient id="ttGoldMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#54452b"/><stop offset=".22" stop-color="#ead8a5"/><stop offset=".48" stop-color="#90784a"/><stop offset=".72" stop-color="#d7c28c"/><stop offset="1" stop-color="#453820"/></linearGradient>' +
        '<linearGradient id="ttArmSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d5055"/><stop offset=".24" stop-color="#f5f5f1"/><stop offset=".5" stop-color="#92959a"/><stop offset=".72" stop-color="#dededb"/><stop offset="1" stop-color="#55585e"/></linearGradient>' +
        '<pattern id="ttWoodLines" width="180" height="22" patternUnits="userSpaceOnUse"><path d="M0 4 C34 0 68 10 112 4 S158 1 180 7 M0 16 C42 10 76 22 130 15 S164 13 180 18" fill="none" stroke="#f2b879" stroke-width="1.2" opacity=".22"/><path d="M0 9 C38 14 72 3 122 10 S164 14 180 10" fill="none" stroke="#170b07" stroke-width="1" opacity=".35"/></pattern>' +
        '<pattern id="ttMetalGrain" width="16" height="7" patternUnits="userSpaceOnUse"><path d="M0 1 H16 M0 3.5 H16 M0 6 H16" stroke="#fff" stroke-width=".5" opacity=".22"/><path d="M0 2.2 H16 M0 5 H16" stroke="#202226" stroke-width=".35" opacity=".16"/></pattern>' +
        '<filter id="ttShadow" x="-35%" y="-35%" width="190%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
        '<clipPath id="ttLabelClip"><circle cx="560" cy="330" r="83"/></clipPath>' +
        '<path id="ttLabelArc" d="M 488 330 A 72 72 0 0 1 632 330" fill="none"/>' +
        '</defs>' +
        '<rect x="0" y="-40" width="1220" height="720" rx="10" fill="' + ttSkin.plinth + '"/>' +
        '<rect x="24" y="-16" width="1172" height="672" rx="8" fill="' + ttSkin.deck + '" stroke="#0a0a0c" stroke-width="2"/>' +
        ttVisual.body +
        '<path d="M30 638 H1168 V652 H30 Z" fill="#08090b" opacity=".42" pointer-events="none"/><path d="M46 639 H1140" stroke="#fff" stroke-width="1.4" opacity=".2" pointer-events="none"/>' + ttVisual.brand +
        // 플래터
        ttVisual.platterBase +
        '<g id="ttSpinG">' +
        ttVisual.spinTrim +
        '<circle cx="560" cy="330" r="252" fill="url(#ttVinyl)"/>' +
        grooves +
        '<path d="M 560 330 L 560 78 A 252 252 0 0 1 738 156 Z" fill="url(#ttSheen)" opacity=".48"/>' +
        '<path d="M 560 330 L 560 582 A 252 252 0 0 1 382 504 Z" fill="url(#ttSheen)" opacity=".22"/>' +
        '<circle cx="560" cy="330" r="86" fill="' + record.labelBg + '"/>' +
        '<circle cx="560" cy="330" r="86" fill="none" stroke="' + record.accent + '" stroke-width="3"/>' +
        '<circle cx="560" cy="330" r="79" fill="none" stroke="' + record.accent + '" stroke-width="0.6" opacity="0.5"/>' +
        // 브랜드는 실물처럼 라벨 상단 원호를 따라 인쇄한다
        '<text font-family="Arial" font-size="7" letter-spacing="1.5" fill="' + record.accent + '"><textPath href="#ttLabelArc" startOffset="50%" text-anchor="middle">MAD FOR AUDIO RECORDS · STEREO · 33&#8531; RPM</textPath></text>' +
        '<text x="560" y="281" font-family="Georgia, serif" font-size="' + (record.labelBig.length > 9 ? 14 : record.labelBig.length > 6 ? 17 : 20) + '" font-weight="700" fill="' + record.accent + '" text-anchor="middle">' + record.labelBig + '</text>' +
        '<text x="560" y="295" font-family="Arial" font-size="9.5" fill="#3a2b1e" text-anchor="middle">' + record.labelTitle + '</text>' +
        '<text x="560" y="307" font-family="Arial" font-size="7.5" fill="#6b5d4a" text-anchor="middle">' + record.labelArtist + '</text>' +
        '<text x="560" y="319" font-family="Arial" font-size="7.5" font-weight="700" fill="' + record.accent + '" text-anchor="middle">' + record.bwv + ' · SIDE ' + (record.side || 'A') + '</text>' +
        '<g clip-path="url(#ttLabelClip)">' + labelTracks + '</g>' +
        '<circle cx="560" cy="330" r="7" fill="#c9c2ae" stroke="#55504a"/><circle cx="560" cy="330" r="2.5" fill="#111"/>' +
        dustMarkup +
        '</g>' +
        // 바이닐 문지름 히트존 — 회전 중 드래그하면 마찰 스크래치가 난다 (스핀 그룹 밖, 정지 좌표)
        '<circle id="ttVinylHit" cx="560" cy="330" r="252" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>회전 중인 판을 문지르면 치직거립니다</title></circle>' +
        // 클리닝 브러시 패드 — 클리닝하는 동안만 판 위에 얹힌다
        '<g id="ttBrushPad" opacity="0" pointer-events="none" transform="rotate(-24 560 330)">' +
        '<rect x="380" y="140" width="120" height="26" rx="8" fill="#4a3524" stroke="#2c1f14" stroke-width="2"/>' +
        '<rect x="380" y="132" width="120" height="10" rx="4" fill="#6b5138"/>' +
        '<rect x="418" y="108" width="44" height="26" rx="6" fill="#26262b" stroke="#0a0a0c"/>' +
        '</g>' +
        // 모델별 조작부는 플래터 위 레이어에서, 플래터 바깥쪽에 배치한다.
        ttVisual.detail +
        // 톤암
        ttVisual.armBase + ttVisual.arm +
        `<g class="tt-front-depth"><path d="M24 640H1196V700L1176 722H45L24 700Z" fill="${ttSkin.plinth || '#302a22'}" stroke="#111714" stroke-width="3"/><path d="M25 644H1194" stroke="#c8bca5" stroke-opacity=".35" stroke-width="2"/><path d="M60 701H1158" stroke="#070b09" stroke-opacity=".5" stroke-width="8"/><path d="M122 721v23h140v-23m676 0v23h140v-23" fill="#101511"/></g></svg>`;
}
