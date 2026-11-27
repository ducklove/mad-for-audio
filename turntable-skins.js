// Turntable SVGs. Playback, interaction and animation live in app.js.

function recordSvgText(value) {
    return String(value || '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]));
}

function ttSL1200Details() {
    const brand = `<g pointer-events="none">
        <ellipse cx="130" cy="94" rx="39" ry="37" fill="url(#ttContact)"/>
        <circle cx="128" cy="90" r="35" fill="url(#ttRimSilver)" stroke="#565c60" stroke-width="1.5"/>
        ${mfaTexCircle('spun', 128, 90, 34, .68)}
        <circle cx="128" cy="90" r="33.5" fill="none" stroke="url(#ttRimSpecular)" stroke-width="1.3"/>
        <circle cx="128" cy="90" r="6" fill="#30373a" stroke="#a9aead" stroke-width="1"/>
    </g>` + refText(872, 588, 'Technics Quartz', 19, '#343a3b') + refText(872, 608, 'SL-1200MK2', 10, '#4d5353');
    const scale = [-8, -4, 0, 4, 8].map((n, i) => (
        `<path d="M940 ${334.5 + i * 30.75}h13" stroke="#495350"/>` +
        refText(935, 338 + i * 30.75, n > 0 ? '+' + n : String(n), 10, '#414b47', 'end')
    )).join('');
    const detail = `<g pointer-events="none">
        ${ttDial(161, 464, 36, 'ttDarkMetal')}
        <path d="M189 446l29-9 9 21-29 8Z" fill="url(#ttStrobeLens)" stroke="#751f19" stroke-width="1"/>
        <path d="M192 447l25-7" stroke="#ff9a7c" stroke-opacity=".6" stroke-width="1.3"/>
        <path d="M158 439v11" stroke="#e6e7de" stroke-width="2.5" stroke-linecap="round"/>
        ${refText(128, 519, 'POWER', 13, '#414949')}
        <rect x="932" y="285" width="78" height="247" rx="4" fill="#171818" opacity=".33"/>
        <rect x="930" y="281" width="78" height="247" rx="4" fill="url(#ttRimSilver)" stroke="#5d6564" stroke-width="1.7"/>
        ${mfaTexRect('brushV', 931, 282, 76, 245, 3, .28)}
        <path d="M933 523V284H1005" fill="none" stroke="#eee" stroke-opacity=".55" stroke-width="1.3"/>
        <rect x="958" y="305" width="14" height="187" rx="3" fill="#a9b0ad" stroke="#6d7370" stroke-width="1.5"/>
        <rect x="961" y="308" width="8" height="181" rx="2" fill="#161919"/>
        ${scale}
        <rect id="ttPitchKnob" x="946" y="363.5" width="39" height="65" rx="2" fill="url(#ttPitchCap)" stroke="#424a48"/>
        <circle cx="938" cy="396" r="6" fill="#262b29" stroke="#bfc7c5"/>
        <circle id="ttQuartzLamp" cx="938" cy="396" r="4" fill="#e94e35"/>
        ${refText(969, 555, 'PITCH ADJ.', 12, '#424d48', 'middle')}
        <circle cx="810" cy="581" r="18" fill="url(#ttChrome)" stroke="#707874"/>
        <circle cx="846" cy="581" r="11" fill="url(#ttChrome)" stroke="#707874"/>
    </g>
    <g id="ttHardwareStart" style="cursor:pointer">
        <rect x="91" y="551" width="145" height="59" rx="1" fill="#1d2423"/>
        <rect x="97" y="555" width="133" height="49" fill="url(#ttCastSilver)" stroke="#b7bdbb" stroke-width="1.7"/>
        ${mfaTexRect('brushFine', 98, 556, 131, 47, 1, .44)}
        <path d="M99 602V557H228" fill="none" stroke="#f6f7f0" stroke-opacity=".83" pointer-events="none"/>
        ${refText(163, 585, 'START · STOP', 12, '#3f4945', 'middle', 'pointer-events="none"')}
    </g>
    <circle id="ttHardwarePower" cx="161" cy="467" r="43" fill="transparent" style="cursor:pointer"/>
    <rect id="ttPitchHit" x="913" y="274" width="100" height="260" fill="transparent" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="피치 조정 ±8%"><title>PITCH ADJ. — 위아래로 끌어 ±8%</title></rect>`;
    return { brand, detail };
}

function ttDial(x, y, r, finish) {
    return `<g transform="translate(${x} ${y})" pointer-events="none">
        <ellipse cx="2.5" cy="4" rx="${r + 5}" ry="${r + 5}" fill="url(#ttContact)" opacity=".76"/>
        <circle r="${r}" fill="url(#ttWeightBlack)" stroke="#2a2e2c" stroke-width="1.4"/>
        <circle r="${r - 2.2}" fill="none" stroke="#d5d7ce" stroke-opacity=".57" stroke-width="2.2" stroke-dasharray=".9 2.2"/>
        <circle r="${r - 4.5}" fill="url(#${finish})" stroke="url(#ttRimSpecular)" stroke-opacity=".7" stroke-width="1.2"/>
    </g>`;
}

function ttStrobeDots() {
    return [0, 1, 2].map((row) => Array.from({ length: 54 }, (_, i) => {
        const a = i / 54 * Math.PI * 2;
        const r = 264 + row * 5.5;
        const x = (560 + Math.cos(a) * r).toFixed(1);
        const y = (330 + Math.sin(a) * r).toFixed(1);
        return '<circle cx="' + x + '" cy="' + y + '" r="' + (row === 1 ? 2.4 : 1.7) + '" fill="url(#ttStrobeStud)" stroke="#151819" stroke-width=".7" opacity="' + (row === 1 ? '1' : '.84') + '"/>';
    }).join("")).join("");
}

// 레코드/재킷 기능은 공통으로 유지하되, 본체 하드웨어는 모델마다 별도 조형한다.
// 회전과 톤암 드래그 계산이 의존하는 중심(560,330), 피벗(1065,120), 바늘(768,428)은 고정한다.
function ttVisualSpec(id) {
    const modelScrew = (x, y, light) => '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none"><circle r="9" fill="' + (light ? 'url(#ttChrome)' : '#202126') + '" stroke="' + (light ? '#4e5054' : '#666970') + '" stroke-width="1.5"/><path d="M-4 -1 L4 1" stroke="' + (light ? '#323438' : '#c8c9cc') + '" stroke-width="1.5"/></g>';
    const specs = {
        sl1200: () => ({
            body: ttSilverDeck(),
            platterBase: ttPlatter(288, 279, 260, 'ttRimSilver'),
            spinTrim: '<g id="ttStrobeRing">' + ttStrobeDots() + '</g><circle cx="560" cy="330" r="257" fill="none" stroke="#060809" stroke-width="4"/>',
            armPath: 'M1065 120 C1018 145 1020 204 966 240 S850 337 768 428',
            armBase: ttArmBase(55, 'ttDarkMetal', 'ttChrome', 1120, 151, '#343939'),
            armTube: ttArmTube('#8c989e', '#e1e7e6', 13),
            arm: ttArmFittings(72, 'ttWeightBlack', 'ttShellBlack', '#af3e2e'),
            ...ttSL1200Details(),
        }),
        td124: () => ({
            body: ttWoodDeck('ttWalnutDark', .59, 'M58 20 H1110 Q1138 20 1138 48 V574 Q1138 614 1098 614 H58 Z',
                'ttIvoryCast', '<path d="M63 590V25H1107Q1125 25 1131 39" fill="none" stroke="url(#ttEdgeLight)" stroke-width="3"/>', .19),
            brand: '<rect x="66" y="43" width="234" height="59" rx="4" fill="#e7e1d3" stroke="#5e594f"/><text x="183" y="72" font-family="Arial" font-size="24" font-weight="800" letter-spacing="3" fill="#3f3b34" text-anchor="middle">THORENS</text><text x="183" y="92" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2.2" fill="#625c52" text-anchor="middle">TD 124 · SWISS MADE</text>',
            platterBase: ttPlatter(291, 278, 269, 'ttRimNickel'),
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#c9c5ba" stroke-opacity=".68" stroke-width="3" stroke-dasharray="1 7"/><circle cx="560" cy="330" r="259" fill="none" stroke="#4c4b47" stroke-width="3"/>',
            armPath: 'M1065 120 C1000 166 938 252 880 324 S808 400 768 428',
            armBase: ttArmBase(52, 'ttRimNickel', 'ttChrome', 1112, 163, '#51514c'),
            armTube: ttArmTube('#969898', '#eee9dc', 12),
            arm: ttArmFittings(67, 'ttWeightSilver', 'ttShellNickel', '#6e4034'),
            detail: '<g pointer-events="none"><path d="M67 292 A73 73 0 0 1 213 292" fill="none" stroke="#5d584e" stroke-width="4"/><path d="M91 287 L75 266 M113 268 L105 240 M140 260 V228 M167 268 L177 240 M190 287 L207 266" stroke="#5d584e" stroke-width="3"/><circle cx="140" cy="292" r="43" fill="#e2dccf" stroke="#58544c" stroke-width="3"/>' + ttDial(140, 292, 31, 'ttDarkMetal') + '<path id="ttSpeedPtr" d="M140 292 L118 276" stroke="#eee9de" stroke-width="5" stroke-linecap="round"/><text x="140" y="354" font-family="Arial" font-size="12" font-weight="700" fill="#4f4a42" text-anchor="middle">16 · 33 · 45 · 78</text><rect x="66" y="392" width="205" height="78" rx="8" fill="url(#ttIvoryCast)" stroke="#8d8879" stroke-width="1.45"/><path d="M68 459v-59q0-6 6-6h188" fill="none" stroke="#f9f4e3" opacity=".64"/>' + ttDial(108, 431, 24, 'ttDarkMetal') + '<path d="M108 431 L123 418" stroke="#f2ede3" stroke-width="4"/><text x="178" y="424" font-family="Arial" font-size="10" font-weight="700" letter-spacing="1.3" fill="#4e4941" text-anchor="middle">FINE SPEED</text><text x="178" y="445" font-family="Arial" font-size="9" fill="#665f55" text-anchor="middle">IDLER ENGAGED</text></g>' +
                '<circle id="ttSpeedHit" cx="140" cy="292" r="52" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="회전 속도 전환 16·33·45·78"><title>SPEED — 누를 때마다 16&#8532; · 33&#8531; · 45 · 78</title></circle>' + modelScrew(76, 560, true) + modelScrew(1092, 560, true)
        }),
        g301: () => ({
            body: ttWoodDeck('ttGarrardWalnut', .67, 'M58 20 H812 Q854 20 884 50 L920 86 H1128 V594 H58 Z',
                'ttHammerCream', '<path d="M63 570V25H811Q851 25 881 54L915 90H1123" fill="none" stroke="url(#ttEdgeLight)" stroke-width="3"/>', .29),
            brand: '<path d="M65 40 H288 Q305 40 305 57 V102 H65 Z" fill="#c7c0ae" stroke="#5c574d" stroke-width="2"/><text x="185" y="77" font-family="Georgia, serif" font-size="31" font-style="italic" font-weight="700" fill="#3c3933" text-anchor="middle">Garrard</text><text x="185" y="96" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2" fill="#5b564d" text-anchor="middle">MODEL 301 · TRANSCRIPTION</text>',
            platterBase: ttPlatter(292, 278, 269, 'ttRimNickel'),
            spinTrim: '<circle cx="560" cy="330" r="267" fill="none" stroke="#dedbd2" stroke-opacity=".8" stroke-width="3" stroke-dasharray="3 5"/><circle cx="560" cy="330" r="260" fill="none" stroke="#4a4a47" stroke-width="4"/>',
            armPath: 'M1065 120 L768 428',
            armBase: ttArmBase(48, 'ttDarkMetal', 'ttGoldMetal', 1124, 156, '#393936', true),
            armTube: ttArmTube('#6b6253', '#dfd1b6', 12.5),
            arm: ttArmFittings(76, 'ttWeightBlack', 'ttShellNickel', '#8d3929'),
            detail: '<g pointer-events="none"><rect x="62" y="278" width="214" height="218" rx="13" fill="url(#ttIvoryCast)" stroke="#817a6c" stroke-width="1.6"/><rect x="78" y="295" width="182" height="184" rx="11" fill="url(#ttHammerCream)" stroke="#eae5da"/><text x="169" y="320" font-family="Arial" font-size="11" font-weight="700" letter-spacing="2" fill="#4a463f" text-anchor="middle">SPEED CONTROL</text>' + ttDial(122, 370, 33, 'ttDarkMetal') + '<path id="ttTrimPtr" d="M122 370 L106 345" stroke="#e6e0d5" stroke-width="5" stroke-linecap="round"/><text x="122" y="421" font-family="Arial" font-size="10" fill="#514d45" text-anchor="middle">33 · 45 · 78</text><circle cx="198" cy="348" r="18" fill="#242523" stroke="#a49d88" stroke-width="1.5"/><path id="ttBrakeLever" d="M198 348 L226 410" stroke="url(#ttWeightBlack)" stroke-width="15" stroke-linecap="round"/><circle cx="198" cy="348" r="6" fill="url(#ttChrome)" stroke="#4c4d47"/><text x="211" y="438" font-family="Arial" font-size="10" font-weight="700" fill="#514d45" text-anchor="middle">BRAKE</text></g>' +
                '<circle id="ttTrimHit" cx="122" cy="370" r="42" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="와전류 속도 미세 조정 ±3%"><title>SPEED CONTROL — 위아래로 끌어 ±3%</title></circle>' +
                '<rect id="ttBrakeHit" x="176" y="330" width="72" height="102" fill="#000" fill-opacity="0" style="cursor:pointer;touch-action:none" tabindex="0" role="button" aria-label="브레이크 — 누르는 동안 플래터 정지"><title>BRAKE — 누르는 동안 플래터를 즉시 세웁니다</title></rect>' + modelScrew(84, 562, true) + modelScrew(1094, 562, true)
        }),
        lp12: () => ({
            body: ttWoodDeck('ttRosewood', .61, 'M61 18H1135Q1138 18 1138 21V613Q1138 616 1135 616H61Q58 616 58 613V21Q58 18 61 18Z',
                'ttBlackPlate', '<path d="M61 599V21H1135" fill="none" stroke="#d3cfc0" stroke-width="1" opacity=".2"/>', 0),
            brand: '<text x="72" y="75" font-family="Arial" font-size="31" font-weight="300" letter-spacing="7" fill="#efede6">LINN</text><text x="74" y="103" font-family="Arial" font-size="12" font-weight="700" letter-spacing="3.2" fill="#9b9c9c">SONDEK LP12</text>',
            platterBase: ttPlatter(279, 271, 266, 'ttRimSatin'),
            spinTrim: '<circle cx="560" cy="330" r="263" fill="none" stroke="#55575c" stroke-width="2"/><circle cx="560" cy="330" r="258" fill="none" stroke="#0a0b0d" stroke-width="5"/>',
            armPath: 'M1065 120 L768 428',
            armBase: ttArmBase(45, 'ttDarkMetal', 'ttChrome', 1105, 159, '#2b2e30'),
            armTube: ttArmTube('#41484e', '#b6c1c5', 11),
            arm: ttArmFittings(66, 'ttWeightBlack', 'ttShellBlack', '#823d35'),
            detail: '<g pointer-events="none"><ellipse cx="198" cy="554" rx="27" ry="26" fill="url(#ttContact)"/><circle cx="196" cy="550" r="24" fill="url(#ttRimSatin)" stroke="#282a2e" stroke-width="2"/>' + mfaTexCircle('spun', 196, 550, 23, .56) + '<circle cx="196" cy="550" r="7" fill="#111216" stroke="#454e50"/><text x="240" y="556" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2.4" fill="#c8c5bc">33 / 45</text><path d="M71 282 H239" stroke="#47494e" stroke-width="1"/><text x="72" y="310" font-family="Arial" font-size="11" letter-spacing="2" fill="#787a7e">SINGLE POINT BEARING</text><text x="72" y="334" font-family="Arial" font-size="10" letter-spacing="1.6" fill="#65676b">LOW NOISE · HIGH TORQUE</text></g>' + modelScrew(78, 572, false) + modelScrew(1104, 572, false)
        })
    };
    return specs[id]();
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
        ${hammerOpacity ? `<path d="${plate}" fill="url(#ttFineHammer)" opacity="${hammerOpacity}" pointer-events="none"/>` : ''}
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

function ttPlatter(radius, bandRadius, matRadius, finish) {
    return `<g class="tt-platter-rim" pointer-events="none">
        <ellipse cx="570" cy="344" rx="${radius + 18}" ry="${radius + 12}" fill="url(#ttContact)" opacity=".83"/>
        <ellipse cx="562" cy="335" rx="${radius}" ry="${radius + 2}" fill="url(#ttPlatterEdge)"/>
        <circle cx="560" cy="330" r="${radius}" fill="url(#${finish})" stroke="#282c2e" stroke-width="1.8"/>
        ${mfaTexCircle('spun', 560, 330, radius, .59, 'transform="rotate(80 560 330)"')}
        <circle cx="560" cy="330" r="${radius - 1.6}" fill="none" stroke="url(#ttRimSpecular)" stroke-width="2.4"/>
        <circle cx="560" cy="330" r="${bandRadius}" fill="url(#ttRimBand)" stroke="#151718" stroke-width="1.7"/>
        <circle cx="560" cy="330" r="${matRadius}" fill="url(#ttRubber)" stroke="url(#ttRimSpecular)" stroke-opacity=".36" stroke-width="1.2"/>
    </g>`;
}

function ttRecordGrooves() {
    const ring = r => `M${560 + r} 330a${r} ${r} 0 0 0 ${-2 * r} 0a${r} ${r} 0 0 0 ${2 * r} 0`;
    const bands = [109, 133, 159, 179, 201, 226, 247];
    const fineGrooves = [];
    for (let i = 1; i < bands.length; i++) {
        for (let r = bands[i - 1] + 2.6; r < bands[i] - .7; r += 1.8) {
            fineGrooves.push(ring(Number(r.toFixed(1))));
        }
    }
    return `<g fill="none" pointer-events="none">
        <path d="${fineGrooves.join(' ')}" stroke="#9b9d9e" stroke-opacity=".29" stroke-width=".58"/>
        <path d="${bands.map(ring).join(' ')}" stroke="#626466" stroke-opacity=".37" stroke-width="1.15"/>
        <circle cx="560" cy="330" r="95" stroke="#929394" stroke-opacity=".22" stroke-width=".9"/>
    </g>`;
}

function ttVinylReflections() {
    // Nested annular sectors approximate a soft angular falloff without filtering the turning record.
    const widths = [34, 29, 25, 22, 19, 16, 13, 10, 7, 4];
    const opacity = [.016, .018, .022, .027, .034, .039, .039, .030, .020, .012];
    const point = (radius, degrees) => {
        const a = degrees * Math.PI / 180;
        return (560 + radius * Math.cos(a)).toFixed(2) + ' ' + (330 + radius * Math.sin(a)).toFixed(2);
    };
    const wedge = angle => widths.map((width, i) => {
        const lo = angle - width;
        const hi = angle + width;
        return `<path d="M${point(88, lo)}L${point(252, lo)}A252 252 0 0 1 ${point(252, hi)}
            L${point(88, hi)}A88 88 0 0 0 ${point(88, lo)}Z" opacity="${opacity[i]}"/>`;
    }).join('');
    return `<g class="tt-vinyl-reflections" fill="url(#ttVinylLight)" pointer-events="none">
        ${wedge(229)}<g opacity=".62">${wedge(49)}</g>
        <circle cx="560" cy="330" r="250.5" fill="none" stroke="url(#ttRimSpecular)" stroke-opacity=".32" stroke-width="1.2"/>
    </g>`;
}

function ttSpindle() {
    return `<g pointer-events="none">
        <ellipse cx="562.5" cy="333" rx="11" ry="7" fill="url(#ttFootShadow)" opacity=".68"/>
        <circle cx="560" cy="330" r="6.9" fill="#3c3f3e" stroke="#211e17" stroke-width=".8"/>
        <path d="M555 330v-6.8a5 3.5 0 0 1 10 0v6.8a5 3.1 0 0 1-10 0Z" fill="url(#ttSpindleChrome)"/>
        <ellipse cx="560" cy="323.2" rx="5" ry="3.5" fill="url(#ttChrome)"/>
        <path d="M556.7 324.6v5.6" stroke="#fffef3" stroke-opacity=".9" stroke-width="1"/>
    </g>`;
}

function ttArmBase(radius, plate, hub, dialX, dialY, rest, oblong = false) {
    const mount = oblong
        ? '<rect x="1018" y="69" width="94" height="104" rx="30" fill="url(#ttDarkMetal)" stroke="#88837a" stroke-width="1.8"/>'
        : `<circle cx="1065" cy="120" r="${radius}" fill="url(#${plate})" stroke="#353736" stroke-width="2"/>`;
    return `<g pointer-events="none">
        <ellipse cx="1072" cy="128" rx="${radius + 13}" ry="${radius + 15}" fill="url(#ttContact)" opacity=".78"/>
        ${mount}
        <circle cx="1065" cy="120" r="${radius - 6}" fill="none" stroke="url(#ttRimSpecular)" stroke-opacity=".66" stroke-width="1.6"/>
        <circle cx="1065" cy="120" r="${radius - 13}" fill="#1a1d1f" stroke="#727575" stroke-width="1.2"/>
        <circle cx="1065" cy="120" r="${radius - 8}" fill="none" stroke="#d8d7ca" stroke-opacity=".41" stroke-width="1.8" stroke-dasharray="1.2 4"/>
        <path d="M1036 130V110Q1036 101 1046 99H1085Q1094 101 1094 110V130L1083 140H1047Z"
            fill="url(#${hub})" stroke="#353736" stroke-width="1.7"/>
        <circle cx="1044" cy="117" r="4" fill="url(#ttChrome)" stroke="#343839"/>
        <circle cx="1086" cy="117" r="4" fill="url(#ttChrome)" stroke="#343839"/>
        <circle cx="1065" cy="120" r="19" fill="url(#ttDarkMetal)" stroke="#646b6c" stroke-width="1.4"/>
        <g class="tt-antiskate" transform="translate(${dialX} ${dialY})">
            <ellipse cx="2" cy="5" rx="22" ry="18" fill="url(#ttContact)" opacity=".82"/>
            <circle r="18" fill="url(#ttDarkMetal)" stroke="#151717" stroke-width="1.5"/>
            <circle r="15" fill="none" stroke="#929895" stroke-opacity=".75" stroke-width="2.3" stroke-dasharray="1.15 2.3"/>
            <circle r="11.7" fill="url(#ttWeightBlack)" stroke="#767c7b" stroke-width=".7"/>
            <path d="M-4 -7L-1 -2" stroke="#dedfd6" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <ellipse cx="934" cy="519" rx="25" ry="15" fill="url(#ttContact)" opacity=".71"/>
        <rect x="919" y="480" width="24" height="47" rx="7" fill="${rest}" stroke="#252827" stroke-width="1.3"/>
        <rect x="925" y="486" width="12" height="34" rx="4" fill="url(#ttDarkMetal)" stroke="#707674" stroke-width=".9"/>
        <path d="M913 475V484Q913 490 919 490H943Q949 490 949 484V475"
            fill="none" stroke="#2b2d2d" stroke-width="7" stroke-linecap="round"/>
        <path d="M913 474V482Q913 487 920 487H941Q948 487 948 482V474"
            fill="none" stroke="url(#ttChrome)" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M943 513L961 505" stroke="#131716" stroke-width="7" stroke-linecap="round"/>
        <path d="M944 511L959 504" stroke="url(#ttChrome)" stroke-width="3.2" stroke-linecap="round"/>
        <rect x="957" y="501" width="11" height="6" rx="3" fill="url(#ttWeightBlack)" transform="rotate(-19 962 504)"/>
    </g>`;
}

function ttArmTube(metal, streak, width) {
    // Offset these copies in deck coordinates so the light and shadow keep their direction as the tube pivots.
    return `<g pointer-events="none">
        <use href="#ttArmTrace" x="9" y="12" stroke="#090a09" stroke-opacity=".09" stroke-width="${width + 13}"/>
        <use href="#ttArmTrace" x="8" y="11" stroke="#080908" stroke-opacity=".18" stroke-width="${width + 6}"/>
        <use href="#ttArmTrace" x="7" y="10" stroke="#080908" stroke-opacity=".24" stroke-width="${width}"/>
        <use href="#ttArmTrace" stroke="#1c2021" stroke-width="${width + 1}"/>
        <use href="#ttArmTrace" x="-.45" y="-.6" stroke="${metal}" stroke-width="${width - 2}"/>
        <use href="#ttArmTrace" x="-1.35" y="-2.2" stroke="${streak}" stroke-width="${width * .31}"/>
        <use href="#ttArmTrace" x="-1.6" y="-2.8" stroke="#fafffb" stroke-opacity=".58" stroke-width="1.05"/>
    </g>`;
}

function ttArmFittings(weightWidth, weight, shell, cartridge) {
    return `<g id="ttArmG">
        <g pointer-events="none">
            <path d="M1129 87L1065 120" stroke="#191c1c" stroke-width="15" stroke-linecap="round"/>
            <path d="M1129 85L1064 119" stroke="url(#ttChrome)" stroke-width="8" stroke-linecap="round"/>
            <g transform="rotate(-26 1126 79)">
                <rect x="1114" y="62" width="${weightWidth}" height="34" rx="13" fill="url(#${weight})" stroke="#343736" stroke-width="1.6"/>
                <path d="M1120 64H${1114 + weightWidth - 9}Q${1114 + weightWidth} 64 ${1114 + weightWidth} 77
                    V81Q${1114 + weightWidth} 94 ${1114 + weightWidth - 9} 94H1120Z" fill="url(#ttKnurl)" opacity=".75"/>
                <path d="M1128 65H${1114 + weightWidth - 10}" stroke="#e7e8e1" stroke-opacity=".42" stroke-linecap="round"/>
                <ellipse cx="1117" cy="79" rx="8" ry="16" fill="url(#ttWeightBlack)" stroke="#959893" stroke-opacity=".72" stroke-width="1.3"/>
                <ellipse cx="1116" cy="79" rx="3.3" ry="7" fill="#242727" stroke="#737a79" stroke-width=".8"/>
                <path d="M1126 65V92M1132 64V94" stroke="#141616" stroke-opacity=".72" stroke-width="1.3"/>
            </g>
            <ellipse cx="1065" cy="120" rx="13" ry="15.5" fill="url(#ttChrome)" stroke="#333738" stroke-width="1.4"/>
            <circle cx="1065" cy="120" r="7.5" fill="url(#ttDarkMetal)" stroke="#636a69" stroke-width=".8"/>
            <g transform="rotate(-46 762 434)">
                <rect x="785" y="425" width="17" height="13" rx="3" fill="url(#ttChrome)" stroke="#252827"/>
                <path d="M790 423v17M794 423v17M798 424v15" stroke="#252828" stroke-width="1.1"/>
                <path d="M739 441H768V451H738L734 447Z" fill="${cartridge}" stroke="#231c19" stroke-width="1.1"/>
                <path d="M741 449l-5 7h-3" fill="none" stroke="#b4aa91" stroke-linecap="round" stroke-width="1.7"/>
                <path d="M733 455l-1.6 3-1.2-2.3Z" fill="#ece5ce"/>
                <path d="M733 416H782L793 422V441L783 447H735L728 440V424Z" fill="url(#${shell})" stroke="#1d2020" stroke-width="1.5"/>
                <path d="M733 419H780L787 423" fill="none" stroke="#e1e3de" stroke-opacity=".57" stroke-width="1.4" stroke-linecap="round"/>
                <g fill="#111515" stroke="#939895" stroke-opacity=".58" stroke-width=".75">
                    <rect x="738" y="423" width="25" height="4.8" rx="2.2"/>
                    <rect x="738" y="436" width="25" height="4.8" rx="2.2"/>
                    <rect x="773" y="424" width="10" height="14" rx="3"/>
                </g>
                <circle cx="748" cy="431.5" r="2.8" fill="url(#ttChrome)" stroke="#262a29" stroke-width=".7"/>
                <circle cx="764" cy="431.5" r="2.8" fill="url(#ttChrome)" stroke="#262a29" stroke-width=".7"/>
                <path d="M777 442l10 13 12 2" fill="none" stroke="#141717" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M777 441l10 13 12 2" fill="none" stroke="url(#ttChrome)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
        </g>
        <circle id="ttArmHit" cx="768" cy="428" r="58" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>톤암 — 잡아서 원하는 트랙 위에 내려놓으세요</title></circle>
    </g>`;
}

function ttMaterialDefs(armPath) {
    return `<defs>
        <linearGradient id="ttWalnutDark" x2=".75" y2="1"><stop stop-color="#8c5b3a"/><stop offset=".29" stop-color="#66402a"/><stop offset=".72" stop-color="#4b2c1c"/><stop offset="1" stop-color="#352319"/></linearGradient>
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
        <pattern id="ttFineHammer" href="#lzTexHammer" patternTransform="scale(.36)"/>
        <linearGradient id="ttPitchCap" x2="0" y2="1"><stop stop-color="#dadfdb"/><stop offset=".12" stop-color="#929b9c"/><stop offset=".44" stop-color="#d7dedc"/><stop offset=".47" stop-color="#e6e9e1"/><stop offset=".48" stop-color="#4c5350"/><stop offset=".53" stop-color="#333a39"/><stop offset=".55" stop-color="#b4bcb9"/><stop offset=".72" stop-color="#888f90"/><stop offset="1" stop-color="#555d5d"/></linearGradient>
        <linearGradient id="ttStrobeLens" x2=".8" y2="1"><stop stop-color="#e46748"/><stop offset=".27" stop-color="#b63e26"/><stop offset="1" stop-color="#82251c"/></linearGradient>
        <linearGradient id="ttRubberFront" x2="0" y2="1"><stop stop-color="#42474a"/><stop offset=".39" stop-color="#26282a"/><stop offset=".84" stop-color="#17191a"/><stop offset="1" stop-color="#0b0d0d"/></linearGradient>
        <linearGradient id="ttHinge" x2="0" y2="1"><stop stop-color="#4e504d"/><stop offset=".23" stop-color="#323531"/><stop offset=".74" stop-color="#171919"/><stop offset="1" stop-color="#242625"/></linearGradient>
        <linearGradient id="ttFoot"><stop stop-color="#090a0a"/><stop offset=".18" stop-color="#343736"/><stop offset=".47" stop-color="#202221"/><stop offset=".84" stop-color="#121414"/><stop offset="1" stop-color="#080909"/></linearGradient>
        <radialGradient id="ttFloorShadow"><stop offset=".47" stop-opacity=".57"/><stop offset=".79" stop-opacity=".31"/><stop offset="1" stop-opacity="0"/></radialGradient>
        <radialGradient id="ttFootShadow"><stop offset=".53" stop-opacity=".8"/><stop offset="1" stop-opacity="0"/></radialGradient>
        <radialGradient id="ttContact"><stop offset=".86" stop-opacity=".68"/><stop offset=".94" stop-opacity=".38"/><stop offset="1" stop-opacity="0"/></radialGradient>
        <linearGradient id="ttRimSilver" x2=".87" y2="1"><stop stop-color="#909595"/><stop offset=".16" stop-color="#e1e1da"/><stop offset=".42" stop-color="#aab0b1"/><stop offset=".72" stop-color="#6c7376"/><stop offset="1" stop-color="#41484b"/></linearGradient>
        <linearGradient id="ttRimNickel" x2=".77" y2="1"><stop stop-color="#a8a798"/><stop offset=".17" stop-color="#e5e0d1"/><stop offset=".45" stop-color="#b6b2a6"/><stop offset=".76" stop-color="#75746c"/><stop offset="1" stop-color="#494a46"/></linearGradient>
        <linearGradient id="ttRimSatin" x2=".83" y2="1"><stop stop-color="#7b8283"/><stop offset=".18" stop-color="#d4d5ce"/><stop offset=".46" stop-color="#909a9c"/><stop offset=".71" stop-color="#626a6c"/><stop offset="1" stop-color="#373d41"/></linearGradient>
        <linearGradient id="ttRimSpecular" x1=".06" y1=".04" x2=".91" y2=".93"><stop stop-color="#fffef1" stop-opacity=".96"/><stop offset=".28" stop-color="#ebece8" stop-opacity=".72"/><stop offset=".55" stop-color="#e3ebe8" stop-opacity=".18"/><stop offset=".82" stop-color="#e0e5e4" stop-opacity=".48"/><stop offset="1" stop-color="#4f5758" stop-opacity=".29"/></linearGradient>
        <linearGradient id="ttPlatterEdge" x2=".8" y2="1"><stop stop-color="#485054"/><stop offset=".42" stop-color="#3a4143"/><stop offset=".87" stop-color="#1f2223"/><stop offset="1" stop-color="#151617"/></linearGradient>
        <linearGradient id="ttRimBand" x2=".8" y2="1"><stop stop-color="#3d4243"/><stop offset=".4" stop-color="#24282b"/><stop offset=".77" stop-color="#171b1c"/><stop offset="1" stop-color="#242828"/></linearGradient>
        <linearGradient id="ttStrobeStud" x2="0" y2="1"><stop stop-color="#f7f6e9"/><stop offset=".37" stop-color="#d7d8cb"/><stop offset=".78" stop-color="#777d7b"/><stop offset="1" stop-color="#41474a"/></linearGradient>
        <radialGradient id="ttVinyl"><stop stop-color="#202224"/><stop offset=".37" stop-color="#17191a"/><stop offset=".59" stop-color="#141617"/><stop offset=".88" stop-color="#111213"/><stop offset=".985" stop-color="#192022"/><stop offset="1" stop-color="#0b0d0e"/></radialGradient>
        <radialGradient id="ttVinylLight" gradientUnits="userSpaceOnUse" cx="560" cy="330" r="252"><stop offset=".345" stop-color="#d1d6d8" stop-opacity="0"/><stop offset=".48" stop-color="#d5dbdc" stop-opacity=".80"/><stop offset=".71" stop-color="#e2e7e7" stop-opacity=".89"/><stop offset=".968" stop-color="#bbc4c9" stop-opacity=".74"/><stop offset="1" stop-color="#e4eaeb" stop-opacity=".31"/></radialGradient>
        <radialGradient id="ttRubber" cx=".42" cy=".36" r=".75"><stop stop-color="#303237"/><stop offset=".62" stop-color="#17181b"/><stop offset="1" stop-color="#07080a"/></radialGradient>
        <linearGradient id="ttSpindleChrome"><stop stop-color="#626866"/><stop offset=".26" stop-color="#f7f7ec"/><stop offset=".55" stop-color="#9b9d99"/><stop offset=".83" stop-color="#424747"/><stop offset="1" stop-color="#858987"/></linearGradient>
        <radialGradient id="ttMetal" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stop-color="#d8d8dc"/><stop offset="0.6" stop-color="#9a9aa2"/><stop offset="1" stop-color="#5c5c64"/></radialGradient>
        <linearGradient id="ttChrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f5257"/><stop offset=".16" stop-color="#f4f4f0"/><stop offset=".36" stop-color="#8d9094"/><stop offset=".58" stop-color="#e9e9e5"/><stop offset=".82" stop-color="#62656a"/><stop offset="1" stop-color="#25272b"/></linearGradient>
        <linearGradient id="ttDarkMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#74777e"/><stop offset=".25" stop-color="#303238"/><stop offset=".68" stop-color="#121318"/><stop offset="1" stop-color="#4e5157"/></linearGradient>
        <linearGradient id="ttGoldMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#54452b"/><stop offset=".22" stop-color="#ead8a5"/><stop offset=".48" stop-color="#90784a"/><stop offset=".72" stop-color="#d7c28c"/><stop offset="1" stop-color="#453820"/></linearGradient>
        <linearGradient id="ttWeightBlack" x2="0" y2="1"><stop stop-color="#232728"/><stop offset=".14" stop-color="#575d5d"/><stop offset=".26" stop-color="#777d7b"/><stop offset=".49" stop-color="#353a3a"/><stop offset=".8" stop-color="#171a1a"/><stop offset="1" stop-color="#333838"/></linearGradient>
        <linearGradient id="ttWeightSilver" x2="0" y2="1"><stop stop-color="#717571"/><stop offset=".13" stop-color="#b7b8af"/><stop offset=".28" stop-color="#efede1"/><stop offset=".52" stop-color="#979d98"/><stop offset=".81" stop-color="#4c5352"/><stop offset="1" stop-color="#8b918a"/></linearGradient>
        <linearGradient id="ttShellBlack" x2=".38" y2="1"><stop stop-color="#626967"/><stop offset=".24" stop-color="#414746"/><stop offset=".8" stop-color="#202323"/><stop offset="1" stop-color="#141616"/></linearGradient>
        <linearGradient id="ttShellNickel" x2=".38" y2="1"><stop stop-color="#aca99c"/><stop offset=".22" stop-color="#7b7b71"/><stop offset=".85" stop-color="#444843"/><stop offset="1" stop-color="#2b302d"/></linearGradient>
        <pattern id="ttKnurl" width="4.5" height="5" patternUnits="userSpaceOnUse">
            <path d="M-1 1L4 6M3 -1L8 4" stroke="#080a0a" stroke-opacity=".69" stroke-width=".85"/>
            <path d="M-1 4L4 -1M2 6L7 1" stroke="#d8dcd5" stroke-opacity=".34" stroke-width=".61"/>
        </pattern>
        <g id="ttArmTrace"><path d="${armPath}" fill="none" stroke-linecap="round"/></g>
        <clipPath id="ttLabelClip"><circle cx="560" cy="330" r="83"/></clipPath>
        <path id="ttLabelArc" d="M 488 330 A 72 72 0 0 1 632 330" fill="none"/>
        </defs>`;
}

function ttSkinMarkup(modelId, { record, dustSpecks }) {
    if (!TT_ORDER.includes(modelId)) modelId = "sl1200";
    const ttSkin = TT_MODELS[modelId];
    const ttVisual = ttVisualSpec(modelId);
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
        ttMaterialDefs(ttVisual.armPath) +
        '<ellipse cx="618" cy="729" rx="602" ry="40" fill="url(#ttFloorShadow)" pointer-events="none"/>' +
        ttHinges() + ttVisual.body + ttVisual.brand +
        // 플래터
        ttVisual.platterBase +
        // The circular groove profile is rotationally symmetric. Only the trim, paper and dust need to move.
        '<circle cx="560" cy="330" r="252" fill="url(#ttVinyl)"/>' +
        ttRecordGrooves() +
        '<g id="ttSpinG">' +
        ttVisual.spinTrim +
        '<circle cx="560" cy="330" r="86" fill="' + record.labelBg + '"/>' +
        mfaTexCircle('grainFine', 560, 330, 85, .21) +
        '<circle cx="560" cy="330" r="86" fill="none" stroke="' + record.accent + '" stroke-width="3"/>' +
        '<circle cx="560" cy="330" r="79" fill="none" stroke="' + record.accent + '" stroke-width="0.6" opacity="0.5"/>' +
        // 브랜드는 실물처럼 라벨 상단 원호를 따라 인쇄한다
        '<text font-family="Arial" font-size="7" letter-spacing="1.5" fill="' + record.accent + '"><textPath href="#ttLabelArc" startOffset="50%" text-anchor="middle">MAD FOR AUDIO RECORDS · STEREO · 33&#8531; RPM</textPath></text>' +
        '<text x="560" y="281" font-family="Georgia, serif" font-size="' + (record.labelBig.length > 9 ? 14 : record.labelBig.length > 6 ? 17 : 20) + '" font-weight="700" fill="' + record.accent + '" text-anchor="middle">' + record.labelBig + '</text>' +
        '<text x="560" y="295" font-family="Arial" font-size="9.5" fill="#3a2b1e" text-anchor="middle">' + record.labelTitle + '</text>' +
        '<text x="560" y="307" font-family="Arial" font-size="7.5" fill="#6b5d4a" text-anchor="middle">' + record.labelArtist + '</text>' +
        '<text x="560" y="319" font-family="Arial" font-size="7.5" font-weight="700" fill="' + record.accent + '" text-anchor="middle">' + record.bwv + ' · SIDE ' + (record.side || 'A') + '</text>' +
        '<g clip-path="url(#ttLabelClip)">' + labelTracks + '</g>' +
        dustMarkup +
        '</g>' +
        ttVinylReflections() + ttSpindle() +
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
        ttVisual.armBase + ttVisual.armTube + ttVisual.arm +
        ttFrontDepth(modelId) + '</svg>';
}
