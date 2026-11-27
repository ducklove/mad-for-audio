// 그래픽 이퀄라이저 SVG 마크업 — GE-5(10밴드)·SE-9(쌍 슬라이더 + 메모리 키 뱅크) 공용 렌더러.
// 클래식 스크립트. app.js의 mountEq()가 호출하고, 이벤트 연결·상태 동기화는 app.js에 남는다.
// SH-8065는 33밴드 2단 슬라이더 월이라 전용 렌더러(eqSh8065Markup)를 쓴다.
// 공유 전역: EQ_THEMES, EQ_PRESETS, EQ_FREQS, EQ_LABELS, EQ_X, EQ_CAPW, EQ_TOP, EQ_BOT, eqGainToY (app.js).

function eqSkinMarkup(model) {
    const theme = EQ_THEMES[model.theme] || EQ_THEMES.black;
    const chrome = model.theme === "chrome";
    const silver = model.theme === "silver";
    const isFive = model.architecture === "wide";
    const dualChannel = !!model.dualChannel;
    const range = model.range || 12;
    const halfRange = range / 2;
    const fieldX = isFive ? 620 : 650;
    const fieldW = isFive ? 1320 : 1290;
    const fieldR = fieldX + fieldW;
    const screw = (x, y) => '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none"><circle r="8" fill="url(#eqScrew)" stroke="#111319" stroke-width="1.4"/><path d="M-4 -1 L4 1" stroke="#1b1d21" stroke-width="1.4"/></g>';

    // 눈금은 실제 랙 폭에서도 읽히도록 주요 값의 대비와 굵기를 높인다.
    let grid = "";
    Array.from({ length: 9 }, (_, i) => -range + i * range / 4).forEach((g) => {
        const y = eqGainToY(g);
        grid += '<line x1="' + (fieldX + 58) + '" y1="' + y + '" x2="' + (fieldR - 24) + '" y2="' + y + '" stroke="' + (g === 0 ? theme.fieldInk : theme.grid) + '" stroke-width="' + (g === 0 ? 2.4 : 1) + '" opacity="' + (g === 0 ? 0.78 : 0.34) + '"/>';
    });
    const bandW = isFive ? 170 : dualChannel ? 132 : 92;
    const wideBandNames = ["SUB BASS", "LOW", "MID", "PRESENCE", "AIR"];
    const wideBandRanges = ["20–120", "120–500", "0.5–2k", "2–8k", "8–20k"];
    const bandFrames = EQ_X.map((x, i) => {
        const frame = '<rect x="' + (x - bandW / 2) + '" y="88" width="' + bandW + '" height="248" rx="8" fill="#000" opacity="' + (isFive ? '.2' : '.08') + '" stroke="' + theme.edge + '" stroke-opacity="' + (isFive ? '.46' : '.14') + '"/>';
        if (!isFive) return frame;
        return frame +
            '<path d="M' + (x - 77) + ' 98 H' + (x + 77) + '" stroke="#fff" stroke-width="1.4" opacity=".12"/>' +
            '<rect x="' + (x - 72) + '" y="101" width="144" height="24" rx="5" fill="#141820" stroke="' + theme.edge + '" stroke-opacity=".52"/>' +
            '<text x="' + (x - 68) + '" y="117" font-family="Arial" font-size="10.5" font-weight="700" letter-spacing="1" fill="' + theme.fieldInk + '">' + wideBandNames[i] + '</text>' +
            '<circle cx="' + (x + 59) + '" cy="113" r="3.8" fill="#54d18a" opacity=".82"/><circle cx="' + (x + 59) + '" cy="113" r="7" fill="#54d18a" opacity=".08"/>' +
            '<path d="M' + (x - 68) + ' 143 h18 M' + (x - 68) + ' 171 h12 M' + (x - 68) + ' 199 h18 M' + (x - 68) + ' 227 h12 M' + (x - 68) + ' 255 h18 M' + (x - 68) + ' 283 h12" stroke="' + theme.grid + '" stroke-width="1.2" opacity=".42"/>' +
            '<text x="' + (x - 68) + '" y="324" font-family="Arial" font-size="12" font-weight="700" letter-spacing=".8" fill="' + theme.muted + '">' + wideBandRanges[i] + ' Hz</text>';
    }).join("");
    const hw = EQ_CAPW / 2;
    const hitHw = Math.min(58, Math.floor((EQ_X[1] - EQ_X[0]) / 2) - 3);
    const sliders = EQ_FREQS.map((f, i) => {
        const x = EQ_X[i];
        const ledW = isFive ? 11 : 8;
        const spectrum = Array.from({ length: 8 }, (_, j) => {
            const on = j >= 6 ? "#f05a3a" : j >= 4 ? "#e4b33f" : "#54d18a";
            return '<rect id="eqBandLvl' + i + '_' + j + '" data-on="' + on + '" data-off="' + theme.ledOff + '" x="' + (x + (dualChannel ? 49 : hw + 10)) + '" y="' + (292 - j * 23) + '" width="' + ledW + '" height="15" rx="2.5" fill="' + theme.ledOff + '" stroke="#000" stroke-opacity=".38"/>';
        }).join("");
        const slotXs = dualChannel ? [x - 20, x + 20] : [x];
        const slots = slotXs.map((sx) => '<rect x="' + (sx - 10) + '" y="' + (EQ_TOP - 11) + '" width="20" height="' + (EQ_BOT - EQ_TOP + 22) + '" rx="10" fill="#000" opacity=".46" filter="url(#eqSlotShadow)"/>' +
            '<rect x="' + (sx - 5) + '" y="' + (EQ_TOP - 8) + '" width="10" height="' + (EQ_BOT - EQ_TOP + 16) + '" rx="5" fill="url(#eqSlot)" stroke="' + theme.edge + '" stroke-width="1.1"/>' +
            '<line x1="' + sx + '" y1="' + (EQ_TOP - 2) + '" x2="' + sx + '" y2="' + (EQ_BOT + 2) + '" stroke="#000" stroke-width="1.6" opacity=".78"/>').join("");
        const capAt = (cx, channel) => '<rect x="' + (cx - hw) + '" y="-19" width="' + EQ_CAPW + '" height="38" rx="5" fill="' + theme.cap + '" stroke="#08090b" stroke-width="1.6"/>' +
            '<rect x="' + (cx - hw + 3) + '" y="-16" width="' + (EQ_CAPW - 6) + '" height="9" rx="3" fill="' + theme.capTop + '" opacity=".72"/>' +
            '<path d="M' + (cx - hw + 4) + ' -12 H' + (cx + hw - 4) + '" stroke="#fff" stroke-width="1.2" opacity=".35"/>' +
            '<rect x="' + (cx - hw + 3) + '" y="-3" width="' + (EQ_CAPW - 6) + '" height="6" rx="2" fill="' + theme.mark + '"/>' +
            (dualChannel ? '<text x="' + cx + '" y="14" font-family="Arial" font-size="9" font-weight="700" fill="' + theme.fieldInk + '" text-anchor="middle">' + channel + '</text>' : '');
        const caps = dualChannel ? capAt(x - 20, 'L') + capAt(x + 20, 'R') : capAt(x, '');
        return slots +
            spectrum +
            '<g id="eqH' + i + '" filter="url(#eqHandleShadow)">' +
            caps +
            '</g>' +
            '<text id="eqV' + i + '" x="' + x + '" y="80" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="' + theme.fieldInk + '" text-anchor="middle">0</text>' +
            '<text x="' + x + '" y="358" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing=".4" fill="' + theme.fieldInk + '" text-anchor="middle">' + EQ_LABELS[i] + '</text>' +
            '<rect id="eqHit' + i + '" x="' + (x - hitHw) + '" y="66" width="' + (hitHw * 2) + '" height="300" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="' + EQ_LABELS[i] + 'Hz 게인" aria-valuemin="-' + range + '" aria-valuemax="' + range + '"><title>' + EQ_LABELS[i] + 'Hz &#177;' + range + 'dB</title></rect>';
    }).join("");
    let lvl = "";
    for (let i = 0; i < 12; i++) {
        lvl += '<rect id="eqLvl' + i + '" x="518" y="' + (300 - i * 19) + '" width="54" height="12" rx="2.5" fill="#1e1610" stroke="#050607" stroke-width="1"/>';
    }
    const isMemory = model.architecture === "memory";
    // SE-9: 레벨 LED 컬럼 자리에 프리셋 키 뱅크 — 팩토리 10 + 슬롯 A–D + MEMORY + A/B
    let keyBank = "";
    if (isMemory) {
        const keyDefs = EQ_PRESETS.map((preset) => ({ id: preset.id, key: preset.key, title: preset.label }))
            .concat([
                { id: "slotA", key: "A", title: "유저 슬롯 A" }, { id: "slotB", key: "B", title: "유저 슬롯 B" },
                { id: "slotC", key: "C", title: "유저 슬롯 C" }, { id: "slotD", key: "D", title: "유저 슬롯 D" },
                { id: "mem", key: "MEMORY", title: "MEMORY — 누른 뒤 A–D에 현재 커브 저장" },
                { id: "ab", key: "A / B", title: "A/B — 직전 커브와 비교" }
            ]);
        keyBank = '<rect x="392" y="70" width="202" height="276" rx="10" fill="#07090b" stroke="' + theme.edge + '" stroke-width="2"/>' +
            '<rect x="400" y="78" width="186" height="260" rx="6" fill="url(#eqField)" stroke="#000"/>' +
            '<text x="493" y="96" font-family="Arial" font-size="11.5" font-weight="700" letter-spacing="1.6" fill="#d4d7da" text-anchor="middle">PRESET MEMORY</text>' +
            keyDefs.map((keyDef, i) => {
                const col = Math.floor(i / 8), row = i % 8;
                const x = 405 + col * 94, y = 103 + row * 29;
                return '<g id="eqKey_' + keyDef.id + '" role="button" tabindex="0" aria-label="EQ 프리셋 ' + keyDef.title + '" style="cursor:pointer">' +
                    '<title>' + keyDef.title + '</title>' +
                    '<rect x="' + x + '" y="' + y + '" width="88" height="25" rx="4" fill="#191b21" stroke="#3a3e46" stroke-width="1.2"/>' +
                    '<path d="M' + (x + 4) + ' ' + (y + 3.5) + ' H' + (x + 84) + '" stroke="#fff" stroke-width="1.2" opacity=".16" pointer-events="none"/>' +
                    '<circle id="eqKeyLed_' + keyDef.id + '" cx="' + (x + 9) + '" cy="' + (y + 12.5) + '" r="2.8" fill="#1c3527" pointer-events="none"/>' +
                    '<text x="' + (x + 48) + '" y="' + (y + 17) + '" font-family="Arial" font-size="11.5" font-weight="600" letter-spacing=".3" fill="#e0e2e4" text-anchor="middle" pointer-events="none">' + keyDef.key + '</text></g>';
            }).join("");
    }
    let modelTrim = "";
    if (model.architecture === "yamaha") {
        modelTrim = '<rect x="336" y="70" width="46" height="258" rx="7" fill="#090a0d" stroke="#434750"/><path d="M359 94 V286" stroke="#c6c9cf" stroke-width="2" opacity=".5"/><rect x="345" y="190" width="28" height="42" rx="4" fill="url(#eqCapBlack)" stroke="#08090b"/><text x="359" y="349" font-family="Arial" font-size="9.5" font-weight="700" letter-spacing="1.5" fill="' + theme.muted + '" text-anchor="middle">SPATIAL</text>';
    } else if (model.architecture === "wide") {
        modelTrim = '<rect x="336" y="78" width="44" height="244" rx="8" fill="#090a0d" stroke="#434750"/><path d="M358 98 V302" stroke="#b9bdc5" stroke-width="2" opacity=".45"/><text x="358" y="344" font-family="Arial" font-size="11" font-weight="700" letter-spacing="2" fill="' + theme.muted + '" text-anchor="middle">WIDE</text>';
    } else if (model.architecture === "precision") {
        modelTrim = '<path d="M62 34 H1938 M62 374 H1938" stroke="#fff" stroke-width="2" opacity=".5"/><rect x="344" y="38" width="250" height="25" rx="3" fill="#9b9d9e" stroke="#f7f7f3"/><text x="469" y="55" font-family="Arial" font-size="11" font-weight="700" letter-spacing="2.4" fill="#282b2e" text-anchor="middle">LABORATORY CALIBRATED</text>';
    } else if (model.architecture === "signature") {
        modelTrim = '<rect x="344" y="36" width="250" height="28" rx="14" fill="#4f422b" stroke="#f1deb0"/><text x="469" y="55" font-family="Georgia, serif" font-style="italic" font-size="13" fill="#fff0c5" text-anchor="middle">Signature Reference</text><path d="M62 29 H330 M608 29 H1938" stroke="#fff6db" stroke-width="2" opacity=".42"/>';
    } else if (model.architecture === "memory") {
        modelTrim = '<rect x="344" y="38" width="250" height="24" rx="3" fill="#0a1410" stroke="#2f5a44"/><text x="469" y="55" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2.2" fill="#6fe0a4" text-anchor="middle">COMPUTER MEMORY · MOTOR DRIVE</text>';
    } else {
        modelTrim = '<rect x="344" y="38" width="250" height="24" rx="3" fill="#0a0b0e" stroke="#494d55"/><text x="469" y="55" font-family="Arial" font-size="10" font-weight="700" letter-spacing="2.2" fill="#bfc2c8" text-anchor="middle">DISCRETE ANALOG FILTERS</text>';
    }
    // 10밴드는 마지막 두 슬라이더의 수치가 우상단 안내문과 같은 행에 놓인다.
    // 안내문을 상단 페이스의 독립 명판으로 올려 값 표시와 시각적 위계를 분리한다.
    const spectrumLabel = isFive
        ? '<text x="' + (fieldR - 20) + '" y="79" font-family="Arial" font-size="12" font-weight="700" letter-spacing="1.8" fill="' + theme.fieldInk + '" text-anchor="end">REAL-TIME SPECTRUM</text>'
        : '<g pointer-events="none"><rect x="' + (fieldR - 246) + '" y="23" width="226" height="26" rx="4" fill="' + theme.fieldA + '" fill-opacity=".82" stroke="' + theme.edge + '" stroke-width="1.2"/><path d="M' + (fieldR - 238) + ' 28H' + (fieldR - 28) + '" stroke="#fff" stroke-width="1" opacity=".13"/><text x="' + (fieldR - 33) + '" y="41" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.65" fill="' + theme.fieldInk + '" text-anchor="end">REAL-TIME SPECTRUM</text></g>';
    return (
        '<svg class="eq-svg" viewBox="0 0 2000 400" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="' + (model.brand || "YAMAHA") + ' ' + model.name + ' 스테레오 그래픽 이퀄라이저">' +
        '<defs>' +
        '<linearGradient id="eqFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + theme.top + '"/><stop offset=".18" stop-color="' + theme.mid + '"/><stop offset=".68" stop-color="' + theme.mid + '"/><stop offset="1" stop-color="' + theme.bot + '"/></linearGradient>' +
        '<linearGradient id="eqField" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + theme.fieldA + '"/><stop offset=".12" stop-color="' + theme.fieldB + '"/><stop offset=".82" stop-color="' + theme.fieldA + '"/><stop offset="1" stop-color="#050608"/></linearGradient>' +
        '<linearGradient id="eqSlot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="' + theme.slot + '"/><stop offset=".62" stop-color="#252830"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<linearGradient id="eqCapBlack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#777b84"/><stop offset=".18" stop-color="#383b42"/><stop offset=".62" stop-color="#17191e"/><stop offset="1" stop-color="#050608"/></linearGradient>' +
        '<linearGradient id="eqCapSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="#b6b9bb"/><stop offset=".52" stop-color="#f0f0ed"/><stop offset=".78" stop-color="#8d9093"/><stop offset="1" stop-color="#55585c"/></linearGradient>' +
        '<linearGradient id="eqCapGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#705d37"/><stop offset=".18" stop-color="#fff1c3"/><stop offset=".42" stop-color="#b69c63"/><stop offset=".68" stop-color="#f7e7b9"/><stop offset="1" stop-color="#5c4a2a"/></linearGradient>' +
        '<linearGradient id="eqScrew" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f4f0"/><stop offset=".45" stop-color="#8b8e92"/><stop offset="1" stop-color="#34363a"/></linearGradient>' +
        '<pattern id="eqBrush" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 1 H10 M0 4 H10" stroke="#fff" stroke-width=".45" opacity=".16"/><path d="M0 2.5 H10" stroke="#000" stroke-width=".4" opacity=".12"/></pattern>' +
        '<filter id="eqSlotShadow" x="-80%" y="-10%" width="260%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>' +
        '<filter id="eqHandleShadow" x="-45%" y="-60%" width="200%" height="230%"><feDropShadow dx="2.5" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".72"/></filter>' +
        '</defs>' +
        '<rect width="2000" height="400" rx="9" fill="url(#eqFace)"/>' +
        '<rect x="44" y="7" width="1912" height="380" rx="7" fill="url(#eqBrush)" opacity="' + (silver || chrome ? '.72' : '.22') + '"/>' +
        (chrome ? '<path d="M58 22 H1942 M58 377 H1942" stroke="#fff5d4" stroke-width="3" opacity=".55"/><path d="M120 0 L720 0 L430 400 H0 Z" fill="#fff" opacity=".07"/>' : '') +
        '<rect x="48" y="10" width="1904" height="378" rx="7" fill="none" stroke="' + (silver ? '#fdfdf9' : chrome ? '#f3dfad' : '#42454d') + '" stroke-width="2.5" opacity=".8"/>' +
        '<rect y="390" width="2000" height="10" fill="#000" opacity=".55"/>' +
        // 랙 이어
        '<rect x="0" y="0" width="44" height="400" rx="8" fill="' + theme.ear + '"/><rect x="1956" y="0" width="44" height="400" rx="8" fill="' + theme.ear + '"/>' +
        screw(22, 52) + screw(22, 348) + screw(1978, 52) + screw(1978, 348) + modelTrim +
        // 좌측 컨트롤 블록
        '<text x="78" y="82" font-family="Arial, sans-serif" font-size="32" font-weight="800" letter-spacing="2" fill="' + theme.ink + '">' + (model.brand || "YAMAHA") + '</text>' +
        '<text x="80" y="111" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2.1" fill="' + theme.sub + '">' + model.name + ' · ' + model.series + '</text>' +
        '<text x="80" y="137" font-family="Arial, sans-serif" font-size="11" letter-spacing="1.7" fill="' + theme.muted + '">NATURAL SOUND GRAPHIC EQUALIZER</text>' +
        '<text x="82" y="183" font-family="Arial" font-size="13" font-weight="700" letter-spacing="1.5" fill="' + theme.sub + '">POWER</text>' +
        '<rect x="80" y="194" width="50" height="74" rx="5" fill="#07080a" stroke="' + theme.edge + '" stroke-width="1.7"/>' +
        '<rect x="87" y="201" width="36" height="54" rx="4" fill="url(#eqCapSilver)" stroke="#111319"/><path d="M91 207 H119" stroke="#fff" stroke-width="3" opacity=".6"/>' +
        '<circle id="eqLed" cx="177" cy="210" r="8" fill="#3a2012" stroke="#160c08" stroke-width="2"/>' +
        '<text x="196" y="215" font-family="Arial" font-size="13" font-weight="700" letter-spacing="1.2" fill="' + theme.sub + '">EQ ACTIVE</text>' +
        '<text x="80" y="305" font-family="Arial" font-size="12" font-weight="700" letter-spacing="1.3" fill="' + theme.sub + '">SIGNAL PATH</text>' +
        '<rect id="eqDefeatBtn" x="80" y="316" width="218" height="50" rx="6" fill="#202229" stroke="' + theme.edge + '" stroke-width="1.7" style="cursor:pointer" tabindex="0" role="button" aria-label="EQ 켜기/끄기"><title>EQ 켜기/끄기 (DEFEAT)</title></rect>' +
        '<rect x="87" y="322" width="204" height="11" rx="3" fill="#555962" opacity=".7" pointer-events="none"/>' +
        '<text x="189" y="354" font-family="Arial" font-size="15" font-weight="800" letter-spacing="2.2" fill="#f2f2ee" text-anchor="middle" pointer-events="none">DEFEAT / ACTIVE</text>' +
        // 레벨 LED 컬럼 (SE-9는 같은 자리에 프리셋 키 뱅크)
        (isMemory ? keyBank :
            '<rect x="392" y="70" width="202" height="276" rx="10" fill="#07090b" stroke="' + theme.edge + '" stroke-width="2"/>' +
            '<rect x="402" y="80" width="182" height="256" rx="6" fill="url(#eqField)" stroke="#000"/>' +
            '<text x="545" y="84" font-family="Arial" font-size="12" font-weight="600" letter-spacing="1" fill="#d4d7da" text-anchor="middle">LEVEL</text>' +
            '<text x="503" y="113" font-family="Arial" font-size="11" fill="#9ca0a5" text-anchor="end">+12</text>' +
            '<text x="503" y="310" font-family="Arial" font-size="11" fill="#9ca0a5" text-anchor="end">-12</text>' +
            lvl) +
        // 슬라이더 필드
        '<rect x="' + (fieldX + 5) + '" y="58" width="' + fieldW + '" height="320" rx="10" fill="#000" opacity=".55" filter="url(#eqSlotShadow)"/>' +
        '<rect x="' + fieldX + '" y="52" width="' + fieldW + '" height="320" rx="9" fill="url(#eqField)" stroke="' + theme.edge + '" stroke-width="2.4"/>' +
        '<path d="M' + (fieldX + 10) + ' 64 H' + (fieldR - 10) + '" stroke="#fff" stroke-width="2" opacity=".15"/>' +
        bandFrames +
        grid +
        '<text x="' + (fieldX + 15) + '" y="' + (EQ_TOP + 6) + '" font-family="Arial" font-size="15" font-weight="700" fill="' + theme.fieldInk + '">+' + range + '</text>' +
        '<text x="' + (fieldX + 24) + '" y="' + (eqGainToY(halfRange) + 5) + '" font-family="Arial" font-size="12" fill="' + theme.fieldMuted + '">+' + halfRange + '</text>' +
        '<text x="' + (fieldX + 30) + '" y="' + (eqGainToY(0) + 5) + '" font-family="Arial" font-size="15" font-weight="700" fill="' + theme.fieldInk + '">0</text>' +
        '<text x="' + (fieldX + 28) + '" y="' + (eqGainToY(-halfRange) + 5) + '" font-family="Arial" font-size="12" fill="' + theme.fieldMuted + '">-' + halfRange + '</text>' +
        '<text x="' + (fieldX + 14) + '" y="' + (EQ_BOT + 6) + '" font-family="Arial" font-size="15" font-weight="700" fill="' + theme.fieldInk + '">-' + range + '</text>' +
        sliders + spectrumLabel +
        '<text x="' + (fieldR - 20) + '" y="359" font-family="Arial" font-size="14" font-weight="700" letter-spacing="1.5" fill="' + theme.fieldInk + '" text-anchor="end">Hz</text>' +
        '</svg>');
}

// TECHNICS SH-8065 — 채널당 33밴드 ⅓옥타브 2단 슬라이더 월, 레인지·특성·EQ·입력 토글 존.
// 현재 게인(eqState.gains.sh8065)과 프런트 패널 스위치 상태를 그대로 그린 마크업을 돌려준다.
// 공유 전역: EQ8_FX, EQ8_FW, EQ8_L, EQ8_R, SH8065_OCTAVE, eq8YFor, fpGet, eqState (app.js).
function eqSh8065Markup(model, range) {
    const xs = model.xs, freqs = model.freqs, labels = model.labels;
    const g = eqState.gains.sh8065;
    const fieldR = EQ8_FX + EQ8_FW;
    const Lm = (EQ8_L.t + EQ8_L.b) / 2, Rm = (EQ8_R.t + EQ8_R.b) / 2;
    const hw = 8, hitHw = 20;
    const screw = (x, y) => '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none"><circle r="8" fill="url(#eq8Screw)" stroke="#5c5f63" stroke-width="1.2"/><path d="M-4 -1 L4 1" stroke="#2c2e31" stroke-width="1.3"/></g>';
    const cap = (x) =>
        '<rect x="' + (x - hw) + '" y="-11" width="' + (hw * 2) + '" height="22" rx="3" fill="url(#eq8Cap)" stroke="#2f3236" stroke-width="1"/>' +
        '<rect x="' + (x - hw + 2) + '" y="-9" width="' + (hw * 2 - 4) + '" height="4" rx="1.5" fill="#ffffff" opacity=".55"/>' +
        '<path d="M' + (x - hw + 2) + ' -3.5 H' + (x + hw - 2) + ' M' + (x - hw + 2) + ' -0.5 H' + (x + hw - 2) + ' M' + (x - hw + 2) + ' 2.5 H' + (x + hw - 2) + '" stroke="#2a2c2f" stroke-width=".7" opacity=".5"/>' +
        '<rect x="' + (x - hw + 1) + '" y="6" width="' + (hw * 2 - 2) + '" height="1.8" fill="#d23a1c"/>';

    let slots = "", caps = "", hits = "", labelStrip = "";
    freqs.forEach((f, i) => {
        const x = xs[i];
        const oct = SH8065_OCTAVE.has(f);
        slots += '<rect x="' + (x - 2.4) + '" y="66" width="4.8" height="106" rx="2.4" fill="url(#eq8Slot)" stroke="#08090b" stroke-width=".8"/>' +
                 '<rect x="' + (x - 2.4) + '" y="200" width="4.8" height="106" rx="2.4" fill="url(#eq8Slot)" stroke="#08090b" stroke-width=".8"/>';
        labelStrip += '<text x="' + x + '" y="190" font-family="Arial" font-size="' + (oct ? 12 : 10) + '" font-weight="' + (oct ? 700 : 600) + '" fill="' + (oct ? "#eff1ed" : "#a2a6a0") + '" text-anchor="middle">' + labels[i] + '</text>';
        caps += '<g id="eq8capL' + i + '" transform="translate(0,' + eq8YFor(g[i] || 0, EQ8_L, range).toFixed(1) + ')" filter="url(#eq8HandleShadow)">' + cap(x) + '</g>' +
                '<g id="eq8capR' + i + '" transform="translate(0,' + eq8YFor(g[i] || 0, EQ8_R, range).toFixed(1) + ')" filter="url(#eq8HandleShadow)">' + cap(x) + '</g>';
        hits += '<rect id="eq8HitL' + i + '" x="' + (x - hitHw) + '" y="68" width="' + (hitHw * 2) + '" height="110" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="좌 ' + labels[i] + 'Hz" aria-valuemin="-' + range + '" aria-valuemax="' + range + '"><title>L · ' + labels[i] + 'Hz</title></rect>' +
                '<rect id="eq8HitR' + i + '" x="' + (x - hitHw) + '" y="202" width="' + (hitHw * 2) + '" height="110" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="우 ' + labels[i] + 'Hz" aria-valuemin="-' + range + '" aria-valuemax="' + range + '"><title>R · ' + labels[i] + 'Hz</title></rect>';
    });
    const curveD = (row) => "M " + xs.map((x, i) => x.toFixed(1) + "," + eq8YFor(g[i] || 0, row, range).toFixed(1)).join(" L ");
    // 행별 눈금(0dB 하이라이트 + 사분 그리드)
    let rowGrid = "";
    [EQ8_L, EQ8_R].forEach((row) => {
        const rm = (row.t + row.b) / 2;
        [-1, -0.5, 0.5, 1].forEach((k) => {
            const y = rm + k * (row.b - row.t) / 2;
            rowGrid += '<path d="M' + (EQ8_FX + 40) + ' ' + y.toFixed(1) + ' H' + (fieldR - 14) + '" stroke="#79b6d8" stroke-width=".8" opacity=".14"/>';
        });
        rowGrid += '<path d="M' + (EQ8_FX + 40) + ' ' + rm + ' H' + (fieldR - 14) + '" stroke="#eaf3f8" stroke-width="1.3" opacity=".5"/>';
    });
    // 행별 축 레이블 + 채널 태그
    const axis = (row, tag) =>
        '<text x="' + (EQ8_FX + 25) + '" y="' + (row.t + 5) + '" font-family="Arial" font-size="11" font-weight="700" fill="#cfe6f1" text-anchor="end">+' + range + '</text>' +
        '<text x="' + (EQ8_FX + 25) + '" y="' + ((row.t + row.b) / 2 + 4) + '" font-family="Arial" font-size="11" font-weight="700" fill="#eef4f7" text-anchor="end">0</text>' +
        '<text x="' + (EQ8_FX + 25) + '" y="' + (row.b + 5) + '" font-family="Arial" font-size="11" font-weight="700" fill="#cfe6f1" text-anchor="end">−' + range + '</text>' +
        '<text x="' + (fieldR - 12) + '" y="' + ((row.t + row.b) / 2 - 8) + '" font-family="Arial" font-size="15" font-weight="800" fill="#8fd0ec" text-anchor="end" opacity=".82">' + tag + '</text>';

    // 좌측 컨트롤 존 — 2단 토글 스위치 헬퍼
    const swi = (x, y, id, up, down, title, isUp) =>
        '<text x="' + (x + 20) + '" y="' + (y - 7) + '" font-family="Arial" font-size="12" font-weight="600" letter-spacing=".3" fill="#292c29" text-anchor="middle">' + up + '</text>' +
        '<rect x="' + x + '" y="' + y + '" width="40" height="60" rx="6" fill="#111310" stroke="#7f827b" stroke-width="1.4"/>' +
        '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="34" height="54" rx="4" fill="#08090a"/>' +
        '<g id="' + id + '_lev" data-up="' + (y + 4) + '" data-down="' + (y + 30) + '" transform="translate(0,' + (isUp ? 0 : 26) + ')">' +
        '<rect x="' + (x + 5) + '" y="' + (y + 4) + '" width="30" height="26" rx="4" fill="url(#eq8Cap)" stroke="#2f3236" stroke-width="1"/>' +
        '<path d="M' + (x + 8) + ' ' + (y + 9) + ' H' + (x + 32) + '" stroke="#fff" stroke-width="1.5" opacity=".5"/></g>' +
        '<text x="' + (x + 20) + '" y="' + (y + 75) + '" font-family="Arial" font-size="12" font-weight="600" letter-spacing=".3" fill="#292c29" text-anchor="middle">' + down + '</text>' +
        '<rect id="' + id + '_hit" x="' + (x - 6) + '" y="' + (y - 18) + '" width="52" height="98" fill-opacity="0" style="cursor:pointer"><title>' + title + '</title></rect>';

    const rangeUp = range === 12, invOn = fpGet("eq8065.inv", false), inputHi = fpGet("eq8065.input", false);
    const leftZone =
        '<text x="70" y="86" font-family="Arial, sans-serif" font-size="33" font-weight="800" letter-spacing="1.5" fill="#22241f">Technics</text>' +
        '<text x="72" y="110" font-family="Arial" font-size="12.5" font-weight="700" letter-spacing="2" fill="#3a3c36">STEREO GRAPHIC EQUALIZER</text>' +
        '<text x="72" y="130" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.4" fill="#5a5c55">SH-8065 · 1/3 OCTAVE 33 BAND</text>' +
        // POWER
        '<text x="96" y="238" font-family="Arial" font-size="12" font-weight="700" letter-spacing="1.4" fill="#33352f" text-anchor="middle">POWER</text>' +
        '<rect x="72" y="156" width="48" height="66" rx="6" fill="#0e100c" stroke="#7f827b" stroke-width="1.6"/>' +
        '<rect x="78" y="162" width="36" height="54" rx="4" fill="url(#eq8Cap)" stroke="#26282b"/><path d="M82 168 H110" stroke="#fff" stroke-width="3" opacity=".55"/>' +
        '<circle cx="150" cy="176" r="7" fill="#3a2012" stroke="#160c08" stroke-width="1.6"/><circle id="eq8pwrLed" cx="150" cy="176" r="6" fill="#3a2012"/>' +
        '<text x="150" y="200" font-family="Arial" font-size="10" font-weight="700" letter-spacing="1" fill="#4a4c45" text-anchor="middle">ON</text>' +
        '<rect id="eq8pwrHit" x="66" y="150" width="60" height="78" fill-opacity="0" style="cursor:pointer"><title>POWER — EQ 회로 전원 (끄면 평탄 통과·패널 소등)</title></rect>' +
        // 스위치 4종
        swi(190, 160, "eq8sw_range", "±12dB", "±3dB", "RANGE — 조정 폭 ±12dB / ±3dB (정밀)", rangeUp) +
        swi(310, 160, "eq8sw_char", "NORMAL", "INVERSE", "CHARACTERISTIC — INVERSE는 설정 커브의 역응답을 겁니다", !invOn) +
        swi(190, 272, "eq8sw_eq", "EQ", "THROUGH", "EQ / THROUGH — EQ 회로 바이패스(디피트)", eqState.on) +
        swi(310, 272, "eq8sw_input", "150mV", "1V", "INPUT — 입력 감도 선택(하드웨어 라인 감도)", !inputHi);

    return (
        '<svg class="eq-svg" viewBox="0 0 2000 400" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Technics SH-8065 33밴드 스테레오 그래픽 이퀄라이저">' +
        '<defs>' +
        '<linearGradient id="eq8Face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f3ee"/><stop offset=".16" stop-color="#d5d6d3"/><stop offset=".7" stop-color="#c4c6c4"/><stop offset="1" stop-color="#8f9295"/></linearGradient>' +
        '<linearGradient id="eq8Field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d10"/><stop offset=".1" stop-color="#12161b"/><stop offset=".9" stop-color="#0b0e12"/><stop offset="1" stop-color="#04060a"/></linearGradient>' +
        '<linearGradient id="eq8Slot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".4" stop-color="#040507"/><stop offset=".6" stop-color="#20242b"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<linearGradient id="eq8Cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#c0c3c5"/><stop offset=".5" stop-color="#eef0ee"/><stop offset=".76" stop-color="#8f9295"/><stop offset="1" stop-color="#54585c"/></linearGradient>' +
        '<linearGradient id="eq8Screw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f6f2"/><stop offset=".45" stop-color="#9a9d9f"/><stop offset="1" stop-color="#4a4c4f"/></linearGradient>' +
        '<pattern id="eq8Brush" width="9" height="6" patternUnits="userSpaceOnUse"><path d="M0 1 H9 M0 4 H9" stroke="#fff" stroke-width=".5" opacity=".24"/><path d="M0 2.6 H9" stroke="#000" stroke-width=".4" opacity=".1"/></pattern>' +
        '<filter id="eq8SlotShadow" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>' +
        '<filter id="eq8HandleShadow" x="-60%" y="-70%" width="220%" height="240%"><feDropShadow dx="2" dy="4" stdDeviation="2.6" flood-color="#000" flood-opacity=".7"/></filter>' +
        '</defs>' +
        '<rect width="2000" height="400" rx="9" fill="url(#eq8Face)"/>' +
        '<rect x="44" y="7" width="1912" height="386" fill="url(#eq8Brush)"/>' +
        '<rect x="48" y="10" width="1904" height="380" rx="7" fill="none" stroke="#fdfdf9" stroke-width="2.5" opacity=".7"/>' +
        '<rect y="390" width="2000" height="10" fill="#000" opacity=".5"/>' +
        '<rect x="0" y="0" width="44" height="400" rx="8" fill="#aeb1b2"/><rect x="1956" y="0" width="44" height="400" rx="8" fill="#aeb1b2"/>' +
        screw(22, 52) + screw(22, 348) + screw(1978, 52) + screw(1978, 348) +
        '<line x1="452" y1="70" x2="452" y2="330" stroke="#6f726c" stroke-width="1.4" opacity=".5"/>' +
        leftZone +
        // 슬라이더 필드
        '<rect x="' + (EQ8_FX + 4) + '" y="64" width="' + EQ8_FW + '" height="256" rx="9" fill="#000" opacity=".5" filter="url(#eq8SlotShadow)"/>' +
        '<rect x="' + EQ8_FX + '" y="60" width="' + EQ8_FW + '" height="256" rx="8" fill="url(#eq8Field)" stroke="#5c6066" stroke-width="2.2"/>' +
        '<path d="M' + (EQ8_FX + 10) + ' 70 H' + (fieldR - 10) + '" stroke="#fff" stroke-width="1.6" opacity=".12"/>' +
        '<rect x="' + (EQ8_FX + 25) + '" y="176" width="' + (EQ8_FW - 48) + '" height="26" fill="#0a0d11" opacity=".55"/>' +
        rowGrid + slots +
        '<path id="eq8curveL" d="' + curveD(EQ8_L) + '" fill="none" stroke="#efc169" stroke-width="1.6" stroke-linejoin="round" opacity=".55" pointer-events="none"/>' +
        '<path id="eq8curveR" d="' + curveD(EQ8_R) + '" fill="none" stroke="#efc169" stroke-width="1.6" stroke-linejoin="round" opacity=".55" pointer-events="none"/>' +
        axis(EQ8_L, "L") + axis(EQ8_R, "R") +
        labelStrip +
        '<text x="' + (fieldR - 12) + '" y="316" font-family="Arial" font-size="12" font-weight="700" letter-spacing="1.2" fill="#8fd0ec" text-anchor="end" opacity=".7">Hz</text>' +
        caps + hits +
        '</svg>');
}
