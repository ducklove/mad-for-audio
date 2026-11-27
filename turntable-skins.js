// Turntable SVGs. Playback, interaction and animation live in app.js.

function recordSvgText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
}

function ttSL1200Details() {
    const brand = '<circle cx="128" cy="90" r="35" fill="url(#ttChrome)" stroke="#565c60" stroke-width="2"/><circle cx="128" cy="90" r="6" fill="#30373a"/>' + refText(872,588,'Technics Quartz',19,'#3b4243') + refText(872,608,'SL-1200MK2',10,'#59605f');
    const detail = `<g pointer-events="none"><circle cx="161" cy="467" r="37" fill="#242a2d" stroke="#565d5f" stroke-width="3"/><circle cx="161" cy="462" r="28" fill="#151b1d" stroke="#a5a9a6" stroke-width="2"/><path d="M189 446l29-9 9 21-29 8" fill="#b82118"/><path d="M159 440v13" stroke="#eee" stroke-width="3"/>
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
    return { brand, detail };
}

function ttStrobeDots() {
    return [0, 1, 2].map((row) => Array.from({ length: 54 }, (_, i) => {
        const a = i / 54 * Math.PI * 2;
        const r = 264 + row * 5.5;
        const x = (560 + Math.cos(a) * r).toFixed(1);
        const y = (330 + Math.sin(a) * r).toFixed(1);
        return '<circle cx="' + x + '" cy="' + y + '" r="' + (row === 1 ? 2.4 : 1.7) + '" fill="#e4e5e2" opacity="' + (row === 1 ? '.9' : '.65') + '"/>';
    }).join("")).join("");
}

// 레코드/재킷 기능은 공통으로 유지하되, 본체 하드웨어는 모델마다 별도 조형한다.
// 회전과 톤암 드래그 계산이 의존하는 중심(560,330), 피벗(1065,120), 바늘(768,428)은 고정한다.
function ttVisualSpec(id) {
    const modelScrew = (x, y, light) => '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none"><circle r="9" fill="' + (light ? 'url(#ttChrome)' : '#202126') + '" stroke="' + (light ? '#4e5054' : '#666970') + '" stroke-width="1.5"/><path d="M-4 -1 L4 1" stroke="' + (light ? '#323438' : '#c8c9cc') + '" stroke-width="1.5"/></g>';
    const hit = '<circle id="ttArmHit" cx="768" cy="428" r="58" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>톤암 — 잡아서 원하는 트랙 위에 내려놓으세요</title></circle>';
    const specs = {
        sl1200: () => ({
            body: ttSilverDeck(),
            platterBase: '<ellipse cx="570" cy="343" rx="309" ry="303" fill="url(#ttContact)" opacity=".84"/><circle cx="560" cy="330" r="288" fill="url(#ttChrome)" stroke="#33353a" stroke-width="3"/><circle cx="560" cy="330" r="278" fill="#1c1e21"/><circle cx="560" cy="330" r="273" fill="url(#ttRubber)"/>',
            spinTrim: '<g id="ttStrobeRing">' + ttStrobeDots() + '</g><circle cx="560" cy="330" r="257" fill="none" stroke="#090a0c" stroke-width="6"/>',
            armBase: '<ellipse cx="1071" cy="128" rx="72" ry="69" fill="url(#ttContact)" opacity=".79"/><circle cx="1065" cy="120" r="55" fill="url(#ttChrome)" stroke="#42454a" stroke-width="3"/><circle cx="1065" cy="120" r="40" fill="#303338" stroke="#f2f2ee" stroke-width="2"/><path d="M1027 120 H1103 M1065 82 V158" stroke="#9ea1a5" stroke-width="4"/><circle cx="1065" cy="120" r="19" fill="url(#ttDarkMetal)"/><rect x="916" y="476" width="30" height="51" rx="7" fill="#292c30" stroke="#6f7277"/><rect x="908" y="474" width="46" height="13" rx="5" fill="url(#ttChrome)"/>',
            arm: '<g id="ttArmG"><rect x="1118" y="59" width="72" height="36" rx="16" fill="url(#ttDarkMetal)" stroke="#777a80" stroke-width="2"/><circle cx="1127" cy="77" r="18" fill="#15171a"/><path d="M1125 88 L1070 115" stroke="#4b4e53" stroke-width="13" stroke-linecap="round"/><path d="M1065 120 C1018 145 1020 204 966 240 S850 337 768 428" fill="none" stroke="#3d4045" stroke-width="13" stroke-linecap="round"/><path d="M1065 120 C1018 145 1020 204 966 240 S850 337 768 428" fill="none" stroke="url(#ttArmSilver)" stroke-width="7" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><rect x="730" y="416" width="66" height="30" rx="4" fill="#292b30" stroke="#e1e2e0"/><rect x="740" y="444" width="17" height="9" rx="2" fill="#d4402f"/></g>' + hit + '</g>',
            ...ttSL1200Details(),
        }),
        td124: () => ({
            body: ttWoodDeck('ttWalnutDark', .59, 'M58 20 H1110 Q1138 20 1138 48 V574 Q1138 614 1098 614 H58 Z',
                'ttIvoryCast', '<path d="M63 590V25H1107Q1125 25 1131 39" fill="none" stroke="url(#ttEdgeLight)" stroke-width="3"/>', .13),
            brand: '<rect x="66" y="43" width="234" height="59" rx="4" fill="#e7e1d3" stroke="#5e594f"/><text x="183" y="72" font-family="Arial" font-size="24" font-weight="800" letter-spacing="3" fill="#3f3b34" text-anchor="middle">THORENS</text><text x="183" y="92" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2.2" fill="#625c52" text-anchor="middle">TD 124 · SWISS MADE</text>',
            platterBase: '<ellipse cx="570" cy="345" rx="312" ry="306" fill="url(#ttContact)" opacity=".84"/><circle cx="560" cy="330" r="291" fill="url(#ttChrome)" stroke="#4b4d50" stroke-width="3"/><circle cx="560" cy="330" r="282" fill="#7d7b74"/><circle cx="560" cy="330" r="275" fill="#242529"/><circle cx="560" cy="330" r="268" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#c9c5ba" stroke-width="5" stroke-dasharray="1 7"/><circle cx="560" cy="330" r="259" fill="none" stroke="#4c4b47" stroke-width="3"/>',
            armBase: '<ellipse cx="1071" cy="128" rx="66" ry="67" fill="url(#ttContact)" opacity=".79"/><circle cx="1065" cy="120" r="52" fill="#d7d1c3" stroke="#58544c" stroke-width="3"/><circle cx="1065" cy="120" r="34" fill="url(#ttChrome)"/><circle cx="1065" cy="120" r="14" fill="#2b2c30"/><rect x="916" y="480" width="28" height="46" rx="4" fill="#393a3d" stroke="#77756f"/><path d="M910 481 H950" stroke="#d8d2c5" stroke-width="12" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><circle cx="1134" cy="77" r="27" fill="#25262a" stroke="#aba79d" stroke-width="3"/><rect x="1126" y="62" width="54" height="30" rx="13" fill="url(#ttDarkMetal)"/><line x1="1122" y1="89" x2="1065" y2="120" stroke="#4d4f52" stroke-width="12" stroke-linecap="round"/><path d="M1065 120 C1000 166 938 252 880 324 S808 400 768 428" fill="none" stroke="#494b50" stroke-width="12" stroke-linecap="round"/><path d="M1065 120 C1000 166 938 252 880 324 S808 400 768 428" fill="none" stroke="url(#ttArmSilver)" stroke-width="6.5" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><path d="M731 418 H793 L788 447 H736 Z" fill="#3a3b3e" stroke="#d5d0c4"/><rect x="741" y="444" width="16" height="9" rx="2" fill="#7f2d24"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><path d="M67 292 A73 73 0 0 1 213 292" fill="none" stroke="#5d584e" stroke-width="4"/><path d="M91 287 L75 266 M113 268 L105 240 M140 260 V228 M167 268 L177 240 M190 287 L207 266" stroke="#5d584e" stroke-width="3"/><circle cx="140" cy="292" r="43" fill="#e2dccf" stroke="#58544c" stroke-width="3"/><circle cx="140" cy="292" r="28" fill="url(#ttDarkMetal)"/><path id="ttSpeedPtr" d="M140 292 L118 276" stroke="#eee9de" stroke-width="5" stroke-linecap="round"/><text x="140" y="354" font-family="Arial" font-size="12" font-weight="700" fill="#4f4a42" text-anchor="middle">16 · 33 · 45 · 78</text><rect x="66" y="392" width="205" height="78" rx="8" fill="#c8c1b3" stroke="#5b564d" stroke-width="2"/><circle cx="108" cy="431" r="22" fill="#3a3938"/><path d="M108 431 L123 418" stroke="#f2ede3" stroke-width="4"/><text x="178" y="424" font-family="Arial" font-size="10" font-weight="700" letter-spacing="1.3" fill="#4e4941" text-anchor="middle">FINE SPEED</text><text x="178" y="445" font-family="Arial" font-size="9" fill="#665f55" text-anchor="middle">IDLER ENGAGED</text></g>' +
                '<circle id="ttSpeedHit" cx="140" cy="292" r="52" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="회전 속도 전환 16·33·45·78"><title>SPEED — 누를 때마다 16&#8532; · 33&#8531; · 45 · 78</title></circle>' + modelScrew(76, 560, true) + modelScrew(1092, 560, true)
        }),
        g301: () => ({
            body: ttWoodDeck('ttGarrardWalnut', .67, 'M58 20 H812 Q854 20 884 50 L920 86 H1128 V594 H58 Z',
                'ttHammerCream', '<path d="M63 570V25H811Q851 25 881 54L915 90H1123" fill="none" stroke="url(#ttEdgeLight)" stroke-width="3"/>', .22),
            brand: '<path d="M65 40 H288 Q305 40 305 57 V102 H65 Z" fill="#c7c0ae" stroke="#5c574d" stroke-width="2"/><text x="185" y="77" font-family="Georgia, serif" font-size="31" font-style="italic" font-weight="700" fill="#3c3933" text-anchor="middle">Garrard</text><text x="185" y="96" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2" fill="#5b564d" text-anchor="middle">MODEL 301 · TRANSCRIPTION</text>',
            platterBase: '<ellipse cx="570" cy="345" rx="313" ry="308" fill="url(#ttContact)" opacity=".84"/><circle cx="560" cy="330" r="292" fill="#8d8b84" stroke="#37383a" stroke-width="4"/><circle cx="560" cy="330" r="284" fill="url(#ttChrome)"/><circle cx="560" cy="330" r="274" fill="#1c1d20"/><circle cx="560" cy="330" r="268" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#dedbd2" stroke-width="4" stroke-dasharray="3 5"/><circle cx="560" cy="330" r="260" fill="none" stroke="#4a4a47" stroke-width="4"/>',
            armBase: '<ellipse cx="1071" cy="130" rx="69" ry="71" fill="url(#ttContact)" opacity=".79"/><rect x="1018" y="69" width="94" height="104" rx="36" fill="#28292d" stroke="#77756e" stroke-width="3"/><circle cx="1065" cy="120" r="38" fill="#17181b" stroke="#b7b2a7" stroke-width="2"/><circle cx="1065" cy="120" r="17" fill="url(#ttGoldMetal)"/><rect x="916" y="479" width="28" height="49" rx="4" fill="#28292c" stroke="#807b70"/><path d="M910 481 H950" stroke="#b5aa92" stroke-width="11" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><rect x="1118" y="59" width="76" height="38" rx="15" fill="#1d1e21" stroke="#9b9485" stroke-width="2"/><circle cx="1127" cy="78" r="18" fill="url(#ttGoldMetal)"/><line x1="1122" y1="90" x2="1065" y2="120" stroke="#2b2d31" stroke-width="14" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#1e2024" stroke-width="13" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#8b806d" stroke-width="7" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#d7ceb9" stroke-width="2" stroke-linecap="round" opacity=".7"/><g transform="rotate(-46 762 434)"><rect x="728" y="416" width="69" height="31" rx="3" fill="#242529" stroke="#b3aa98"/><rect x="740" y="444" width="18" height="10" rx="2" fill="#8e2e21"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><rect x="62" y="278" width="214" height="218" rx="16" fill="#bcb5a4" stroke="#555047" stroke-width="3"/><rect x="78" y="295" width="182" height="184" rx="11" fill="url(#ttHammerCream)" stroke="#eae5da"/><text x="169" y="320" font-family="Arial" font-size="11" font-weight="700" letter-spacing="2" fill="#4a463f" text-anchor="middle">SPEED CONTROL</text><circle cx="122" cy="370" r="33" fill="#2b2d30" stroke="#77756e" stroke-width="2"/><path id="ttTrimPtr" d="M122 370 L106 345" stroke="#e6e0d5" stroke-width="5" stroke-linecap="round"/><text x="122" y="421" font-family="Arial" font-size="10" fill="#514d45" text-anchor="middle">33 · 45 · 78</text><path id="ttBrakeLever" d="M198 348 L226 410" stroke="#303236" stroke-width="15" stroke-linecap="round"/><circle cx="198" cy="348" r="15" fill="#25272a" stroke="#8c887f"/><text x="211" y="438" font-family="Arial" font-size="10" font-weight="700" fill="#514d45" text-anchor="middle">BRAKE</text></g>' +
                '<circle id="ttTrimHit" cx="122" cy="370" r="42" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="와전류 속도 미세 조정 ±3%"><title>SPEED CONTROL — 위아래로 끌어 ±3%</title></circle>' +
                '<rect id="ttBrakeHit" x="176" y="330" width="72" height="102" fill="#000" fill-opacity="0" style="cursor:pointer;touch-action:none" tabindex="0" role="button" aria-label="브레이크 — 누르는 동안 플래터 정지"><title>BRAKE — 누르는 동안 플래터를 즉시 세웁니다</title></rect>' + modelScrew(84, 562, true) + modelScrew(1094, 562, true)
        }),
        lp12: () => ({
            body: ttWoodDeck('ttRosewood', .61, 'M61 18H1135Q1138 18 1138 21V613Q1138 616 1135 616H61Q58 616 58 613V21Q58 18 61 18Z',
                'ttBlackPlate', '<path d="M61 599V21H1135" fill="none" stroke="#d3cfc0" stroke-width="1" opacity=".2"/>', 0),
            brand: '<text x="72" y="75" font-family="Arial" font-size="31" font-weight="300" letter-spacing="7" fill="#efede6">LINN</text><text x="74" y="103" font-family="Arial" font-size="12" font-weight="700" letter-spacing="3.2" fill="#9b9c9c">SONDEK LP12</text>',
            platterBase: '<ellipse cx="570" cy="343" rx="301" ry="297" fill="url(#ttContact)" opacity=".84"/><circle cx="560" cy="330" r="279" fill="#08090b" stroke="#5c5e62" stroke-width="2"/><circle cx="560" cy="330" r="273" fill="#202125"/><circle cx="560" cy="330" r="266" fill="url(#ttRubber)"/>',
            spinTrim: '<circle cx="560" cy="330" r="263" fill="none" stroke="#55575c" stroke-width="2"/><circle cx="560" cy="330" r="258" fill="none" stroke="#0a0b0d" stroke-width="5"/>',
            armBase: '<ellipse cx="1071" cy="126" rx="60" ry="60" fill="url(#ttContact)" opacity=".79"/><circle cx="1065" cy="120" r="45" fill="#111216" stroke="#666970" stroke-width="2"/><circle cx="1065" cy="120" r="28" fill="#25272c"/><circle cx="1065" cy="120" r="11" fill="url(#ttChrome)"/><rect x="919" y="480" width="24" height="46" rx="4" fill="#111216" stroke="#55585d"/><path d="M913 482 H949" stroke="#383a3f" stroke-width="10" stroke-linecap="round"/>',
            arm: '<g id="ttArmG"><rect x="1121" y="61" width="66" height="32" rx="14" fill="#101115" stroke="#5d6066" stroke-width="2"/><circle cx="1128" cy="77" r="15" fill="#25272c"/><line x1="1122" y1="89" x2="1065" y2="120" stroke="#18191d" stroke-width="12" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#08090b" stroke-width="11" stroke-linecap="round"/><line x1="1065" y1="120" x2="768" y2="428" stroke="#a8aaad" stroke-width="4.5" stroke-linecap="round"/><g transform="rotate(-46 762 434)"><path d="M733 419 H794 L787 446 H738 Z" fill="#0c0d0f" stroke="#74777d"/><rect x="742" y="444" width="15" height="8" rx="2" fill="#c53a2b"/></g>' + hit + '</g>',
            detail: '<g pointer-events="none"><circle cx="196" cy="550" r="24" fill="url(#ttChrome)" stroke="#282a2e" stroke-width="2"/><circle cx="196" cy="550" r="8" fill="#111216"/><text x="240" y="556" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2.4" fill="#c8c5bc">33 / 45</text><path d="M71 282 H239" stroke="#47494e" stroke-width="1"/><text x="72" y="310" font-family="Arial" font-size="11" letter-spacing="2" fill="#787a7e">SINGLE POINT BEARING</text><text x="72" y="334" font-family="Arial" font-size="10" letter-spacing="1.6" fill="#65676b">LOW NOISE · HIGH TORQUE</text></g>' + modelScrew(78, 572, false) + modelScrew(1104, 572, false)
        })
    };
    return (specs[id] || specs.sl1200)();
}

function ttSilverDeck() {
    const caseShape = 'M24 640V4Q24 -18 49 -18H1171Q1196 -18 1196 5V640Z';
    const plate = 'M44 609V17Q44 0 65 0H1154Q1176 0 1176 23V608Q1176 627 1155 627H65Q44 627 44 609Z';
    return `<path d="${caseShape}" fill="url(#ttChamfer)" stroke="#212528" stroke-width="2"/>
        ${mfaTexPath('brushFine', caseShape, .38)}
        <path d="${plate}" fill="url(#ttCastSilver)" stroke="#454b4c" stroke-width="2"/>
        ${mfaTexPath('brushFine', plate, .28)}
        ${mfaTexPath('grainFine', plate, .20)}
        <path d="M27 638V6Q27 -15 50 -15H1171Q1185 -15 1191 -7" fill="none" stroke="url(#ttEdgeLight)" stroke-width="2.3"/>
        <path d="M47 605V19Q47 3 66 3H1152Q1171 3 1173 21" fill="none" stroke="url(#ttEdgeLight)" stroke-width="2.6"/>
        <path d="M43 628H1175" stroke="#080b0d" opacity=".3"/>`;
}

function ttWoodDeck(wood, woodOpacity, plate, plateFinish, bevel, hammerOpacity) {
    const caseShape = 'M24 640V1Q24 -18 45 -18H1174Q1196 -18 1196 3V640Z';
    const endGrain = 'M26 2L60 24V608L26 639ZM1194 2L1157 24V608L1194 639Z';
    return `<path d="${caseShape}" fill="url(#${wood})" stroke="#21150e" stroke-width="2"/>
        ${mfaTexPath('wood', caseShape, woodOpacity)}
        <path d="${endGrain}" fill="url(#${wood})"/>
        ${mfaTexPath('woodV', endGrain, woodOpacity * .76)}
        <path d="M28 3L62 26M1192 2L1156 25M27 637L61 607M1193 637L1157 607" fill="none" stroke="#1a0e09" opacity=".4"/>
        <path d="${caseShape}" fill="url(#ttWoodSheen)"/>
        <path d="M27 638V2Q27 -15 46 -15H1173Q1190 -15 1193 1" fill="none" stroke="url(#ttWoodEdge)" stroke-width="2.5"/>
        <path d="${plate}" transform="translate(3 6)" fill="#180f09" opacity=".68"/>
        <path d="${plate}" fill="url(#${plateFinish})" stroke="#332d25" stroke-width="1.6"/>
        ${hammerOpacity ? mfaTexPath('hammer', plate, hammerOpacity) : ''}
        ${mfaTexPath('grainFine', plate, hammerOpacity ? .18 : .22)}
        ${bevel}`;
}

function ttHinges() {
    return [122, 1034].map(x => `
        <g transform="translate(${x} -26)" pointer-events="none">
            <rect x="-32" y="5" width="64" height="9" rx="3" fill="#0e1010" stroke="#383936"/>
            <rect x="-24" width="48" height="14" rx="4" fill="url(#ttHinge)"/>
            <path d="M-19 2H14" stroke="#d1d1cb" stroke-opacity=".32" stroke-linecap="round"/>
            <path d="M-19 10H19" stroke="#050606" stroke-opacity=".8"/>
        </g>`).join('');
}

function ttFrontDepth(modelId) {
    const metal = modelId === 'sl1200';
    const face = 'M24 640H1196V702Q1196 710 1187 714L1174 721H46L32 714Q24 709 24 702Z';
    const aluminium = 'M25 640H1195V660Q1195 665 1190 665H30Q25 665 25 660Z';
    const paint = { sl1200: 'ttRubberFront', td124: 'ttWalnutFront', g301: 'ttGarrardFront', lp12: 'ttRosewoodFront' }[modelId];
    const feet = [192, 1008].map(x => `
        <g transform="translate(${x} 0)">
            <ellipse cy="746" rx="86" ry="9" fill="url(#ttFootShadow)"/>
            <path d="M-70 714H70L65 738Q64 744 52 744H-52Q-64 744 -65 738Z" fill="url(#ttFoot)" stroke="#08090a" stroke-width="1.4"/>
            <ellipse cy="737" rx="63" ry="5.5" fill="#101211"/>
            <path d="M-61 733Q0 742 61 733" fill="none" stroke="#71736e" stroke-opacity=".26"/>
        </g>`).join('');
    return `<g class="tt-front-depth" pointer-events="none">
        ${feet}
        <path d="${face}" fill="url(#${paint})" stroke="#161411" stroke-width="2"/>
        ${mfaTexPath(metal ? 'grainFine' : 'wood', face, metal ? .23 : .54)}
        ${metal ? `<path d="${aluminium}" fill="url(#ttChamfer)"/>${mfaTexPath('brushFine', aluminium, .36)}` : ''}
        <path d="M26 640H1194" stroke="#080807" stroke-opacity=".76" stroke-width="2"/>
        <path d="M28 643H1192" stroke="${metal ? 'url(#ttEdgeLight)' : 'url(#ttWoodEdge)'}" stroke-width="2.6"/>
        <path d="M39 712Q41 715 53 715H1168Q1178 715 1183 712" fill="none" stroke="#060505" stroke-opacity=".56" stroke-width="2.5"/>
    </g>`;
}

function ttSkinMarkup(modelId, { record, dustSpecks }) {
    const ttSkin = TT_MODELS[modelId] || TT_MODELS.sl1200;
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
        `<linearGradient id="ttWalnutDark" x2=".75" y2="1"><stop stop-color="#8c5b3a"/><stop offset=".29" stop-color="#66402a"/><stop offset=".72" stop-color="#4b2c1c"/><stop offset="1" stop-color="#352319"/></linearGradient>
        <linearGradient id="ttGarrardWalnut" x2=".78" y2="1"><stop stop-color="#976b48"/><stop offset=".44" stop-color="#72472e"/><stop offset="1" stop-color="#47301f"/></linearGradient>
        <linearGradient id="ttRosewood" x2=".9" y2="1"><stop stop-color="#ad6c47"/><stop offset=".28" stop-color="#885134"/><stop offset=".65" stop-color="#67391f"/><stop offset="1" stop-color="#452719"/></linearGradient>
        <linearGradient id="ttWoodSheen" x2=".55" y2="1"><stop stop-color="#ffdfae" stop-opacity=".24"/><stop offset=".22" stop-color="#ffd6a2" stop-opacity=".07"/><stop offset=".6" stop-color="#e9bb8b" stop-opacity="0"/><stop offset="1" stop-color="#130904" stop-opacity=".18"/></linearGradient>
        <linearGradient id="ttWoodEdge"><stop stop-color="#f8cba0" stop-opacity=".73"/><stop offset=".58" stop-color="#bd8c62" stop-opacity=".53"/><stop offset="1" stop-color="#996846" stop-opacity=".15"/></linearGradient>
        <linearGradient id="ttWalnutFront" x2=".12" y2="1"><stop stop-color="#835335"/><stop offset=".13" stop-color="#664027"/><stop offset=".64" stop-color="#4d2f1e"/><stop offset="1" stop-color="#372317"/></linearGradient>
        <linearGradient id="ttGarrardFront" x2=".2" y2="1"><stop stop-color="#95633f"/><stop offset=".13" stop-color="#784b32"/><stop offset=".63" stop-color="#614029"/><stop offset="1" stop-color="#42291b"/></linearGradient>
        <linearGradient id="ttRosewoodFront" x2=".32" y2="1"><stop stop-color="#a2643f"/><stop offset=".15" stop-color="#865032"/><stop offset=".55" stop-color="#663b29"/><stop offset="1" stop-color="#472b20"/></linearGradient>
        <linearGradient id="ttBlackPlate" x2=".85" y2="1"><stop stop-color="#33363a"/><stop offset=".36" stop-color="#24272a"/><stop offset=".77" stop-color="#1b1e20"/><stop offset="1" stop-color="#111315"/></linearGradient>
        <linearGradient id="ttCastSilver" x2=".72" y2="1"><stop stop-color="#e3e5e3"/><stop offset=".17" stop-color="#d0d3d2"/><stop offset=".64" stop-color="#acb0b1"/><stop offset="1" stop-color="#898f91"/></linearGradient>
        <linearGradient id="ttChamfer" x2=".75" y2="1"><stop stop-color="#f0efea"/><stop offset=".16" stop-color="#c4c7c5"/><stop offset=".6" stop-color="#919799"/><stop offset=".91" stop-color="#687073"/><stop offset="1" stop-color="#3e454a"/></linearGradient>
        <linearGradient id="ttEdgeLight" x2="1" y2=".4"><stop stop-color="#fffefa" stop-opacity=".92"/><stop offset=".66" stop-color="#f8faf6" stop-opacity=".58"/><stop offset="1" stop-color="#faf9f3" stop-opacity=".06"/></linearGradient>
        <linearGradient id="ttIvoryCast" x2=".8" y2="1"><stop stop-color="#f0eadb"/><stop offset=".32" stop-color="#dfd8c9"/><stop offset=".75" stop-color="#c4bdab"/><stop offset="1" stop-color="#ada595"/></linearGradient>
        <linearGradient id="ttHammerCream" x2=".83" y2="1"><stop stop-color="#eee7d4"/><stop offset=".24" stop-color="#ddd5be"/><stop offset=".68" stop-color="#c5baa0"/><stop offset="1" stop-color="#a69a82"/></linearGradient>
        <linearGradient id="ttRubberFront" x2="0" y2="1"><stop stop-color="#42474a"/><stop offset=".39" stop-color="#26282a"/><stop offset=".84" stop-color="#17191a"/><stop offset="1" stop-color="#0b0d0d"/></linearGradient>
        <linearGradient id="ttHinge" x2="0" y2="1"><stop stop-color="#4e504d"/><stop offset=".23" stop-color="#323531"/><stop offset=".74" stop-color="#171919"/><stop offset="1" stop-color="#242625"/></linearGradient>
        <linearGradient id="ttFoot"><stop stop-color="#090a0a"/><stop offset=".18" stop-color="#343736"/><stop offset=".47" stop-color="#202221"/><stop offset=".84" stop-color="#121414"/><stop offset="1" stop-color="#080909"/></linearGradient>
        <radialGradient id="ttFloorShadow"><stop offset=".47" stop-opacity=".57"/><stop offset=".79" stop-opacity=".31"/><stop offset="1" stop-opacity="0"/></radialGradient>
        <radialGradient id="ttFootShadow"><stop offset=".53" stop-opacity=".8"/><stop offset="1" stop-opacity="0"/></radialGradient>
        <radialGradient id="ttContact"><stop offset=".86" stop-opacity=".68"/><stop offset=".94" stop-opacity=".38"/><stop offset="1" stop-opacity="0"/></radialGradient>` +
        '<radialGradient id="ttVinyl" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#1c1c1f"/><stop offset="0.35" stop-color="#141416"/><stop offset="0.85" stop-color="#0d0d0f"/><stop offset="1" stop-color="#131316"/></radialGradient>' +
        '<radialGradient id="ttRubber" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#303237"/><stop offset=".62" stop-color="#17181b"/><stop offset="1" stop-color="#07080a"/></radialGradient>' +
        '<linearGradient id="ttSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="ttMetal" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stop-color="#d8d8dc"/><stop offset="0.6" stop-color="#9a9aa2"/><stop offset="1" stop-color="#5c5c64"/></radialGradient>' +
        '<linearGradient id="ttChrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f5257"/><stop offset=".16" stop-color="#f4f4f0"/><stop offset=".36" stop-color="#8d9094"/><stop offset=".58" stop-color="#e9e9e5"/><stop offset=".82" stop-color="#62656a"/><stop offset="1" stop-color="#25272b"/></linearGradient>' +
        '<linearGradient id="ttDarkMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#74777e"/><stop offset=".25" stop-color="#303238"/><stop offset=".68" stop-color="#121318"/><stop offset="1" stop-color="#4e5157"/></linearGradient>' +
        '<linearGradient id="ttGoldMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#54452b"/><stop offset=".22" stop-color="#ead8a5"/><stop offset=".48" stop-color="#90784a"/><stop offset=".72" stop-color="#d7c28c"/><stop offset="1" stop-color="#453820"/></linearGradient>' +
        '<linearGradient id="ttArmSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d5055"/><stop offset=".24" stop-color="#f5f5f1"/><stop offset=".5" stop-color="#92959a"/><stop offset=".72" stop-color="#dededb"/><stop offset="1" stop-color="#55585e"/></linearGradient>' +
        '<clipPath id="ttLabelClip"><circle cx="560" cy="330" r="83"/></clipPath>' +
        '<path id="ttLabelArc" d="M 488 330 A 72 72 0 0 1 632 330" fill="none"/>' +
        '</defs>' +
        '<ellipse cx="618" cy="729" rx="602" ry="40" fill="url(#ttFloorShadow)" pointer-events="none"/>' +
        ttHinges() + ttVisual.body + ttVisual.brand +
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
        ttFrontDepth(modelId) + '</svg>';
}
