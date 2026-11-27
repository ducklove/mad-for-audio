/*
 * Mad for Audio — 단독 기기(SOLO) 카탈로그
 *
 * 랙에 물려 쓰는 컴포넌트가 아니라, 그 자체로 완결된 기기 두 종의 SVG다.
 * 앰프도 EQ도 없이 혼자 소리를 내던 시대의 물건이라 랙 문법(유닛 전원 위계·
 * 소스 셀렉터)을 따르지 않는다. 단독 기기를 고르면 랙은 통째로 내려가고
 * 화면에는 이 기기 하나만 남는다.
 *
 *  · VICTOR V (Victor Talking Machine Co., 1905–1921) — 음반 전용
 *      강철 바늘이 셸락 판의 홈을 긁으면 운모 진동판이 떨고, 그 떨림이
 *      놋쇠 나팔관을 지나며 증폭된다. 방송은 받지 못한다.
 *  · 금성 A-501 (금성사, 1959) — 방송 전용
 *      국산 1호 라디오. 5구 진공관·5인치 스피커·2밴드 슈퍼헤테로다인.
 *      40×17×17cm 플라스틱 캐비닛(락희화학)과 상아색 전면이 정면 구조다.
 *  · Lasonic TRC-931 (1985) — 방송·음반 겸용
 *      1980년대 붐박스. AM/FM/SW 3밴드 튜너·카세트 2조·5밴드 그래픽
 *      EQ를 FUNCTION 스위치로 갈라 쓴다. 대형 우퍼 두 발이 저음을 책임진다.
 *
 * ── 재질 원칙 (MR-78 패널과 같은 기준) ────────────────────────────────
 * 금속은 매끈한 그라데이션이 아니라 **명암이 교차하는 띠**로 읽힌다. 크롬·니켈·
 * 놋쇠는 어두운 값과 거의 흰 값을 번갈아 배치하고, 그 위에 하드 스펙큘러를 얹는다.
 * 모든 면은 (1) 접지 그림자 (2) 형태 그라데이션 (3) 상단 에지 라이트 (4) 하단
 * 폐색 그림자 네 겹으로 세운다. 광원은 좌상단 하나로 통일한다.
 *
 * 외형 근거와 앱에서 허용한 변형은 docs/EQUIPMENT_REFERENCES.md에 정리했다.
 * 동적 id는 축음기 gv*, 라디오 a5*, 붐박스 bb* 접두사를 쓴다 (문서 전역 id 충돌 회피).
 */

// ===================================================================
// 공통 재질 헬퍼
// ===================================================================

// 실물 노브의 다층 구성: 방향성 접지 그림자 → 크롬 베젤 링 → 널링 스커트 → 스핀 가공 캡 → 좌상단 스펙큘러.
// ptrId가 붙은 그룹만 회전시키면 인디케이터가 돈다.
function soloKnob(cx, cy, r, id, o) {
    const opt = o || {};
    const ring = opt.ring || "url(#soChrome)";
    const cap = opt.cap || "url(#soCapDark)";
    const capR = r * (opt.capRatio || 0.78);
    const ptr = opt.pointer !== false;
    const innerR = capR * 0.64;
    return '<g class="solo-knob">' +
        // 좌상단 광원에 맞춘 우하단 접지 그림자
        '<ellipse cx="' + (cx + r * 0.1) + '" cy="' + (cy + r * 0.22) + '" rx="' + (r * 1.05) + '" ry="' + (r * 1.0) + '" fill="#000" opacity=".56" filter="url(#soSoft)"/>' +
        '<circle cx="' + cx + '" cy="' + (cy + 1.5) + '" r="' + (r + 1.2) + '" fill="#000" opacity=".45"/>' +
        // 외곽 크롬 베젤 링
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + ring + '" stroke="#101216" stroke-width="1.5"/>' +
        '<path d="M' + (cx - r * 0.74).toFixed(1) + ' ' + (cy - r * 0.56).toFixed(1) + ' A' + (r - 1.5).toFixed(1) + ' ' + (r - 1.5).toFixed(1) + ' 0 0 1 ' + (cx + r * 0.45).toFixed(1) + ' ' + (cy - r * 0.84).toFixed(1) + '" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".55" stroke-linecap="round"/>' +
        '<path d="M' + (cx + r * 0.68).toFixed(1) + ' ' + (cy + r * 0.56).toFixed(1) + ' A' + (r - 1.5).toFixed(1) + ' ' + (r - 1.5).toFixed(1) + ' 0 0 1 ' + (cx - r * 0.32).toFixed(1) + ' ' + (cy + r * 0.88).toFixed(1) + '" fill="none" stroke="#040507" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>' +
        // 베젤-캡 사이 좁은 폐색 홈
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (capR + 2.2) + '" fill="#07080a"/>' +
        // 널링 바디
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + capR + '" fill="' + cap + '" stroke="#08090c" stroke-width="1.6"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (capR - 1.5) + '" fill="url(#soKnurl)" opacity=".5"/>' +
        mfaTexCircle("grainFine", cx, cy, capR - 1, .2) +
        // 선반 가공 내면 캡 (고정 광원 스핀 반사)
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR + '" fill="' + cap + '" stroke="#2c3037" stroke-width="1.1"/>' +
        mfaTexCircle("spun", cx, cy, innerR, .42) +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR - 0.8) + '" fill="none" stroke="#ffffff" stroke-width=".9" opacity=".16"/>' +
        // 좌상단 챔퍼 하이라이트 + 우하단 미세 바운스
        '<path d="M' + (cx - capR * 0.72).toFixed(1) + ' ' + (cy - capR * 0.42).toFixed(1) + ' A' + (capR * 0.85).toFixed(1) + ' ' + (capR * 0.85).toFixed(1) + ' 0 0 1 ' + (cx + capR * 0.16).toFixed(1) + ' ' + (cy - capR * 0.84).toFixed(1) + '" fill="none" stroke="#ffffff" stroke-width="' + (r * 0.065).toFixed(1) + '" opacity=".32" stroke-linecap="round"/>' +
        '<ellipse cx="' + (cx - r * 0.3) + '" cy="' + (cy - r * 0.34) + '" rx="' + (r * 0.28) + '" ry="' + (r * 0.18) + '" fill="#ffffff" opacity=".1"/>' +
        (ptr ? '<g id="' + id + 'Ptr" transform="rotate(0 ' + cx + ' ' + cy + ')">' +
            '<rect x="' + (cx - r * 0.08) + '" y="' + (cy - capR + r * 0.02) + '" width="' + (r * 0.16) + '" height="' + (capR * 0.88) + '" rx="' + (r * 0.08) + '" fill="#040508" opacity=".68"/>' +
            '<rect x="' + (cx - r * 0.06) + '" y="' + (cy - capR + r * 0.04) + '" width="' + (r * 0.12) + '" height="' + (capR * 0.82) + '" rx="' + (r * 0.06) + '" fill="#e5e0d4"/>' +
            '<rect x="' + (cx - r * 0.022) + '" y="' + (cy - capR + r * 0.07) + '" width="' + (r * 0.044) + '" height="' + (capR * 0.76) + '" fill="#ffffff" opacity=".72"/>' +
            '</g>' : "") +
        '</g>';
}

// 체결 나사 — 카운터싱크 홈 + 금속 헤드 + 슬롯 그림자와 하이라이트
function soloScrew(x, y, r, dark) {
    return '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none">' +
        '<circle r="' + (r + 1.4).toFixed(1) + '" fill="#040507" opacity=".6"/>' +
        '<circle cy="1.8" r="' + r + '" fill="#000" opacity=".45"/>' +
        '<circle r="' + r + '" fill="' + (dark ? "url(#soCapDark)" : "url(#soChrome)") + '" stroke="#0b0d10" stroke-width="1"/>' +
        '<circle r="' + (r - 1.1).toFixed(1) + '" fill="none" stroke="#ffffff" stroke-width=".85" opacity=".4"/>' +
        '<path d="M' + (-r * 0.62).toFixed(1) + ' ' + (-r * 0.2).toFixed(1) + ' L' + (r * 0.62).toFixed(1) + ' ' + (r * 0.2).toFixed(1) + '" stroke="#05060a" stroke-width="' + (r * 0.3).toFixed(1) + '" stroke-linecap="round"/>' +
        '<path d="M' + (-r * 0.62).toFixed(1) + ' ' + (-r * 0.36).toFixed(1) + ' L' + (r * 0.62).toFixed(1) + ' ' + (r * 0.04).toFixed(1) + '" stroke="#ffffff" stroke-width=".95" opacity=".36" stroke-linecap="round"/>' +
        '</g>';
}

// ── 프랙탈 노이즈 필터 헬퍼 (호환용 유지 — 기본 렌더 경로에서는 래스터 패턴 우선) ──
function soloGrime(id, rgb, aR, aG, off, freq, octaves, seed) {
    return '<filter id="' + id + '" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + octaves + '" seed="' + seed + '" result="t"/>' +
        '<feColorMatrix in="t" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="' +
        '0 0 0 0 ' + rgb[0] + ' 0 0 0 0 ' + rgb[1] + ' 0 0 0 0 ' + rgb[2] + ' ' +
        aR + ' ' + aG + ' 0 0 ' + off + '"/>' +
        '</filter>';
}

// ── 제품 사진 톤과 비네팅 (정적 래스터 패턴 사용 — WebKit 프레임 비용 없음) ──
function soloFilmGrade(x, y, w, h) {
    return '<g class="solo-grade" pointer-events="none">' +
        // 미세한 웜 앰비언트 리프트 — 암부가 뭉개지지 않게 공기감만 준다
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#6b4f2e" opacity=".035"/>' +
        // 소프트 렌즈 비네팅
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#soVignette)"/>' +
        // 아주 고운 필름 그레인 (feTurbulence 대신 materials.js 래스터 타일)
        mfaTexRect("grainFine", x, y, w, h, 0, .09) +
        '</g>';
}

// 문서 전역에서 한 번만 정의하면 되는 공통 재질 defs (기기별 SVG 안에 삽입)
function soloMaterialDefs(prefix) {
    return '<linearGradient id="soChrome" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#22262d"/><stop offset=".1" stop-color="#eef2f6"/><stop offset=".24" stop-color="#6c737d"/>' +
        '<stop offset=".42" stop-color="#ffffff"/><stop offset=".58" stop-color="#7c848f"/><stop offset=".76" stop-color="#e3e8ec"/>' +
        '<stop offset=".9" stop-color="#4e555e"/><stop offset="1" stop-color="#1b1e24"/></linearGradient>' +
        '<linearGradient id="soChromeV" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset=".16" stop-color="#aeb6bf"/><stop offset=".36" stop-color="#f6f8fa"/>' +
        '<stop offset=".58" stop-color="#6c737d"/><stop offset=".82" stop-color="#d2d8de"/><stop offset="1" stop-color="#2d323a"/></linearGradient>' +
        // 브러시드 빈티지 크롬 — 과장 없는 따뜻한 금속 대비
        '<linearGradient id="soChromeAged" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#eef0ec"/><stop offset=".18" stop-color="#9ca09e"/><stop offset=".38" stop-color="#e4e6e2"/>' +
        '<stop offset=".6" stop-color="#6b706f"/><stop offset=".84" stop-color="#b8bdbb"/><stop offset="1" stop-color="#313538"/></linearGradient>' +
        '<radialGradient id="soCapDark" cx=".32" cy=".26" r=".92">' +
        '<stop offset="0" stop-color="#4c515a"/><stop offset=".36" stop-color="#272b31"/><stop offset=".74" stop-color="#14161a"/><stop offset="1" stop-color="#07080a"/></radialGradient>' +
        '<pattern id="soKnurl" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">' +
        '<path d="M1 0V7 M4.5 0V7" stroke="#cfd4dc" stroke-width=".95" opacity=".32"/>' +
        '<path d="M2.5 0V7 M6 0V7" stroke="#040507" stroke-width="1.25" opacity=".74"/></pattern>' +
        '<filter id="soSoft" x="-45%" y="-45%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>' +
        '<filter id="soWide" x="-60%" y="-60%" width="240%" height="240%"><feGaussianBlur stdDeviation="26"/></filter>' +
        '<filter id="soTight" x="-30%" y="-30%" width="170%" height="170%"><feGaussianBlur stdDeviation="2.6"/></filter>' +
        '<radialGradient id="soVignette" cx=".46" cy=".42" r=".82">' +
        '<stop offset=".54" stop-color="#000000" stop-opacity="0"/><stop offset=".84" stop-color="#0a0603" stop-opacity=".14"/>' +
        '<stop offset="1" stop-color="#060402" stop-opacity=".36"/></radialGradient>';
}

// ===================================================================
// VICTOR V — 어쿠스틱 축음기
// ===================================================================
// 원근: 케이스 앞면 → 뒷면 오프셋 (160, -190). 상판·우측면·굽도리 모두 같은 벡터.
// 고정 좌표(런타임이 의존): 플래터 중심 (680,835) rx300 ry82,
// 톤암 브래킷 (352,766), 거치 반경비 1.28.
const GV_PC = { x: 680, y: 835, rx: 300, ry: 82 };
const GV_K = GV_PC.ry / GV_PC.rx;          // 원근 압축비 — 원판을 눕혀 보는 각도
// 실물 배치: 톤암 뒷마운트는 상판 뒤 '오른쪽' 기둥 위에 서 있고, 거기서 나팔 목이
// 왼쪽 위로 뻗어 벨이 캐비닛 왼편 공중에 걸린다. 팔과 나팔은 같은 관절에서 갈라진다.
const GV_ARM = { x: 1062, y: 754 };        // 톤암 피벗(볼 조인트) — 기둥 위, 상판보다 높다
const GV_ARM_POST = { x: 1032, y: 846 };   // 그 기둥이 상판에 박힌 자리
const GV_DISC = 285;                       // 12인치 셸락판 반지름 — 판이 융을 거의 덮는다
const GV_ARM_REST = 1.15;                  // 톤암 거치 반경비 (판 바깥의 크러치)
const GV_BELL = { cx: 505, cy: 372, rx: 420, ry: 356 };
const GV_THROAT = { x: 762, y: 566 };      // 벨 안쪽 소실점 — 목이 붙은 오른쪽 아래

// 벨 타원 위의 정확한 호 — 반지름과 끝점이 어긋나면 SVG가 반지름을 늘려 엉뚱한 곳에 그린다.
// deg는 시계방향(화면 좌표계), 0°는 오른쪽.
function gvBellArc(rx, ry, deg0, deg1) {
    const pt = (d) => {
        const r = d * Math.PI / 180;
        return (GV_BELL.cx + rx * Math.cos(r)).toFixed(1) + " " + (GV_BELL.cy + ry * Math.sin(r)).toFixed(1);
    };
    const large = Math.abs(deg1 - deg0) > 180 ? 1 : 0;
    return "M" + pt(deg0) + " A" + rx + " " + ry + " 0 " + large + " " + (deg1 > deg0 ? 1 : 0) + " " + pt(deg1);
}

// 나팔 안쪽 이음매 — 목(소실점)에서 벨 가장자리로 방사하되, 원뿔면을 따라 휜다.
// 이음매의 밝기는 그 지점이 받는 빛을 따른다: 왼쪽 위 벽은 그늘, 오른쪽 아래는 반사.
function gvHornSeams() {
    let out = "";
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const ex = GV_BELL.cx + Math.cos(a) * (GV_BELL.rx - 14);
        const ey = GV_BELL.cy + Math.sin(a) * (GV_BELL.ry - 13);
        // 제어점을 바깥으로 밀어 원뿔면의 볼록함을 만든다
        const mx = GV_THROAT.x + (ex - GV_THROAT.x) * 0.54 + Math.cos(a + 0.32) * 40;
        const my = GV_THROAT.y + (ey - GV_THROAT.y) * 0.54 + Math.sin(a + 0.32) * 34;
        // 빛은 좌상단에서 들어와 오른쪽 아래 벽을 때린다 (a ≈ +0.7rad 부근이 가장 밝다)
        const lit = Math.max(0, Math.cos(a - 0.72));
        out += '<path d="M' + GV_THROAT.x + ' ' + GV_THROAT.y + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' +
            ex.toFixed(1) + ' ' + ey.toFixed(1) + '" fill="none" stroke="#281603" stroke-width="1.9" opacity="' + (0.24 - lit * 0.1).toFixed(2) + '"/>' +
            '<path d="M' + (GV_THROAT.x + 2.4) + ' ' + (GV_THROAT.y + 1.2) + ' Q' + (mx + 2.4).toFixed(1) + ' ' + (my + 1.2).toFixed(1) + ' ' +
            (ex + 2.4).toFixed(1) + ' ' + (ey + 1.2).toFixed(1) + '" fill="none" stroke="#fff4cf" stroke-width="1.2" opacity="' + (0.05 + lit * 0.24).toFixed(2) + '"/>';
    }
    return out;
}

// 원뿔면의 등고선 — 벨 입구에서 목까지 줄어들며 목 쪽으로 밀려나는 타원 고리.
// 이것이 있어야 평평한 금색 원반이 아니라 '안으로 파인 관'으로 읽힌다.
function gvHornContours() {
    let out = "";
    for (let i = 1; i <= 14; i++) {
        const t = i / 15;
        const e = Math.pow(t, 1.35);                       // 목 쪽으로 갈수록 촘촘하게
        const cx = GV_BELL.cx + (GV_THROAT.x - GV_BELL.cx) * e * 0.94;
        const cy = GV_BELL.cy + (GV_THROAT.y - GV_BELL.cy) * e * 0.94;
        const rx = (GV_BELL.rx - 20) * (1 - e) + 33 * e;
        const ry = (GV_BELL.ry - 19) * (1 - e) + 29 * e;
        out += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
            '" fill="none" stroke="#1a0f02" stroke-width="2" opacity="' + (0.02 + e * 0.048).toFixed(3) + '"/>' +
            '<ellipse cx="' + (cx + 2).toFixed(1) + '" cy="' + (cy - 2).toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
            '" fill="none" stroke="#fff0c6" stroke-width="1.5" opacity="' + (0.035 - e * 0.022).toFixed(3) + '"/>';
    }
    return out;
}

// 셸락판의 굵은 홈 — 78회전은 홈 간격이 넓어 육안으로 보인다 (원형 좌표계)
function gvGrooves() {
    let out = "";
    for (let r = 104; r <= GV_DISC - 6; r += 5.5) {
        const band = r % 22 < 6;
        out += '<circle r="' + r + '" fill="none" stroke="#000" stroke-width="' + (band ? 1.5 : 1) + '" opacity="' + (band ? ".58" : ".3") + '"/>';
    }
    return out;
}

// 사분할 오크의 세로 홈 기둥 — 면마다 광량이 다르다
function gvFlutes(x, y, w, h) {
    let out = "";
    for (let i = 1; i <= 3; i++) {
        const fx = x + (w / 4) * i;
        out += '<path d="M' + (fx - 2.8).toFixed(1) + ' ' + (y + 18) + ' V' + (y + h - 18) + '" stroke="#f0be7a" stroke-width="2" opacity=".3"/>' +
            '<path d="M' + fx.toFixed(1) + ' ' + (y + 18) + ' V' + (y + h - 18) + '" stroke="#1e0e04" stroke-width="3.6" opacity=".68"/>' +
            '<path d="M' + (fx + 3.0).toFixed(1) + ' ' + (y + 18) + ' V' + (y + h - 18) + '" stroke="#c78e4e" stroke-width="1.7" opacity=".36"/>';
    }
    return out;
}

function mfaVictorVSvg() {
    const DX = 160, DY = -190;
    const off = (x, y) => (x + DX).toFixed(0) + " " + (y + DY).toFixed(0);
    // 굽도리 몰딩 한 단 — 앞면 + 우측면, 원목 결 + 바니시 + 선명한 상단 에지 라이트와 하단 폐색
    const molding = (x1, x2, y1, y2) =>
        '<polygon points="' + x2 + ',' + y1 + ' ' + off(x2, y1) + ' ' + off(x2, y2) + ' ' + x2 + ',' + y2 +
        '" fill="url(#gvOakSide)" stroke="#1a0d04" stroke-width="2"/>' +
        '<polygon points="' + x2 + ',' + y1 + ' ' + off(x2, y1) + ' ' + off(x2, y2) + ' ' + x2 + ',' + y2 +
        '" fill="' + mfaTexFill("wood") + '" opacity=".34" pointer-events="none"/>' +
        '<polygon points="' + x2 + ',' + y1 + ' ' + off(x2, y1) + ' ' + off(x2, y2) + ' ' + x2 + ',' + y2 +
        '" fill="url(#gvAmberGlaze)" opacity=".8" pointer-events="none"/>' +
        '<path d="M' + (x2 + 1) + ' ' + (y1 + 2.5) + ' L' + off(x2 + 1, y1 + 2.5) + '" stroke="#eab472" stroke-width="2.6" opacity=".46"/>' +
        '<path d="M' + (x2 + 1) + ' ' + (y2 - 1) + ' L' + off(x2 + 1, y2 - 1) + '" stroke="#0b0502" stroke-width="3.2" opacity=".68"/>' +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="url(#gvOakFace)" stroke="#1a0d04" stroke-width="2"/>' +
        mfaTexRect("wood", x1, y1, x2 - x1, y2 - y1, 0, .54) +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="url(#gvAmberGlaze)" pointer-events="none"/>' +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="url(#gvVarnish)" opacity=".65" pointer-events="none"/>' +
        '<path d="M' + (x1 + 3) + ' ' + (y1 + 2.5) + ' H' + (x2 - 3) + '" stroke="#f7cb88" stroke-width="2.8" opacity=".58"/>' +
        '<path d="M' + (x1 + 3) + ' ' + (y1 + 5.5) + ' H' + (x2 - 3) + '" stroke="#4a260d" stroke-width="1.2" opacity=".4"/>' +
        '<path d="M' + (x1 + 3) + ' ' + (y2 - 2) + ' H' + (x2 - 3) + '" stroke="#0f0702" stroke-width="3.4" opacity=".68"/>';

    return '<svg class="solo-svg gv-svg" viewBox="0 0 2000 1240" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Victor V 축음기 — 나팔관 어쿠스틱 재생">' +
        '<defs>' + soloMaterialDefs("gv") +
        // ── 사분할 오크(Quarter-Sawn Oak): 따뜻한 허니-앰버 셸락 바니시 톤과 풍부한 명암
        '<linearGradient id="gvOakFace" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#8c5728"/><stop offset=".07" stop-color="#74431e"/><stop offset=".36" stop-color="#5c3517"/>' +
        '<stop offset=".72" stop-color="#432410"/><stop offset=".92" stop-color="#291509"/><stop offset="1" stop-color="#170b04"/></linearGradient>' +
        '<linearGradient id="gvOakTopFace" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#9b6530"/><stop offset=".26" stop-color="#7a4a22"/><stop offset=".56" stop-color="#845228"/>' +
        '<stop offset=".82" stop-color="#542f14"/><stop offset="1" stop-color="#351c0b"/></linearGradient>' +
        '<linearGradient id="gvOakSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#452710"/><stop offset=".38" stop-color="#532f14"/><stop offset=".78" stop-color="#2c1708"/><stop offset="1" stop-color="#140903"/></linearGradient>' +
        // 셸락 앰버 스테인 글레이즈 — 중성 wood 패턴의 밝은 결을 은빛이 아닌 따뜻한 꿀빛 오크로 착색
        '<linearGradient id="gvAmberGlaze" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#9e5a1b" stop-opacity=".26"/><stop offset=".5" stop-color="#763d10" stop-opacity=".22"/>' +
        '<stop offset="1" stop-color="#3c1b06" stop-opacity=".28"/></linearGradient>' +
        // 사분할 참나무 특유의 은은한 레이 플렉(medullary ray fleck) 보조 패턴 — materials.js wood 위에 겹쳐 오크 결 완성
        '<pattern id="gvGrain" width="420" height="58" patternUnits="userSpaceOnUse">' +
        '<path d="M52 7 L64 49 M188 5 L178 51 M316 9 L328 47" stroke="#c89454" stroke-width="5.5" opacity=".07"/>' +
        '<path d="M114 11 L106 44 M258 13 L266 46 M384 7 L376 48" stroke="#160a03" stroke-width="4" opacity=".12"/>' +
        '<path d="M0 16 C110 21 200 10 308 18 S396 22 420 17" fill="none" stroke="#120702" stroke-width="1.6" opacity=".2" stroke-dasharray="48 16 26 12 62"/>' +
        '<path d="M0 40 C98 35 186 46 294 39 S390 36 420 42" fill="none" stroke="#120702" stroke-width="1.4" opacity=".18" stroke-dasharray="36 14 54 10 42"/>' +
        '</pattern>' +
        '<radialGradient id="gvWoodBlotch" cx=".3" cy=".3" r=".8">' +
        '<stop offset="0" stop-color="#e2ac65" stop-opacity=".16"/><stop offset=".58" stop-color="#603614" stop-opacity=".06"/>' +
        '<stop offset="1" stop-color="#1a0d04" stop-opacity=".22"/></radialGradient>' +
        '<linearGradient id="gvVarnish" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffebd0" stop-opacity=".34"/><stop offset=".16" stop-color="#ffe0b4" stop-opacity=".12"/>' +
        '<stop offset=".42" stop-color="#ffffff" stop-opacity="0"/><stop offset=".76" stop-color="#000000" stop-opacity=".12"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity=".3"/></linearGradient>' +
        // ── 놋쇠 원뿔: 좌상단 키 라이트를 받아 밝은 림·풍부한 골드 곡면·깊은 어두운 목
        '<linearGradient id="gvConeKey" x1=".12" y1="0" x2=".88" y2="1">' +
        '<stop offset="0" stop-color="#2c1b07"/><stop offset=".14" stop-color="#583c12"/><stop offset=".32" stop-color="#8b661f"/>' +
        '<stop offset=".5" stop-color="#ba8d36"/><stop offset=".68" stop-color="#deb65c"/><stop offset=".84" stop-color="#ebd18a"/>' +
        '<stop offset="1" stop-color="#f6e3ad"/></linearGradient>' +
        '<radialGradient id="gvConeThroat" cx=".78" cy=".76" r=".82" fx=".78" fy=".76">' +
        '<stop offset="0" stop-color="#090501" stop-opacity=".96"/><stop offset=".14" stop-color="#140c03" stop-opacity=".86"/>' +
        '<stop offset=".34" stop-color="#1d1204" stop-opacity=".55"/><stop offset=".58" stop-color="#281805" stop-opacity=".22"/>' +
        '<stop offset=".82" stop-color="#000000" stop-opacity=".04"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="gvConeAmbient" cx=".2" cy=".24" r=".72">' +
        '<stop offset="0" stop-color="#120a02" stop-opacity=".68"/><stop offset=".45" stop-color="#1c1104" stop-opacity=".26"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="gvBrassPatina" cx=".66" cy=".62" r=".55">' +
        '<stop offset="0" stop-color="#3c2a0d" stop-opacity=".34"/><stop offset=".5" stop-color="#4e3812" stop-opacity=".14"/>' +
        '<stop offset="1" stop-color="#241908" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="gvVerdigrisSoft" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#273628" stop-opacity=".32"/><stop offset=".55" stop-color="#2c3a2a" stop-opacity=".14"/>' +
        '<stop offset="1" stop-color="#1d281c" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="gvBrassRing" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#261705"/><stop offset=".08" stop-color="#f2dda6"/><stop offset=".22" stop-color="#765619"/>' +
        '<stop offset=".4" stop-color="#fff0c0"/><stop offset=".56" stop-color="#876321"/><stop offset=".74" stop-color="#dec384"/>' +
        '<stop offset=".9" stop-color="#563d0f"/><stop offset="1" stop-color="#1a0f03"/></linearGradient>' +
        '<linearGradient id="gvBrassTube" x1="0" y1="1" x2=".72" y2="0">' +
        '<stop offset="0" stop-color="#1e1104"/><stop offset=".16" stop-color="#6b4914"/><stop offset=".38" stop-color="#e5ca8b"/>' +
        '<stop offset=".52" stop-color="#faebbc"/><stop offset=".68" stop-color="#966e26"/><stop offset=".88" stop-color="#3d280b"/>' +
        '<stop offset="1" stop-color="#1e1204"/></linearGradient>' +
        // ── 니켈 도금(톤암·플래터 림·사운드박스) — 따뜻한 실버 스펙큘러 띠
        '<linearGradient id="gvNickel" x1="0" y1="0" x2=".4" y2="1">' +
        '<stop offset="0" stop-color="#201e1a"/><stop offset=".12" stop-color="#e9e2d5"/><stop offset=".28" stop-color="#726c66"/>' +
        '<stop offset=".46" stop-color="#faf5ea"/><stop offset=".64" stop-color="#7e7770"/><stop offset=".84" stop-color="#d5cec0"/>' +
        '<stop offset="1" stop-color="#1a1714"/></linearGradient>' +
        '<radialGradient id="gvNickelBall" cx=".3" cy=".24" r=".92">' +
        '<stop offset="0" stop-color="#fbf7ec"/><stop offset=".18" stop-color="#d8d1c2"/><stop offset=".5" stop-color="#89837a"/>' +
        '<stop offset=".78" stop-color="#45413d"/><stop offset="1" stop-color="#181613"/></radialGradient>' +
        '<radialGradient id="gvMica" cx=".36" cy=".32" r=".78">' +
        '<stop offset="0" stop-color="#f5ecd6" stop-opacity=".62"/><stop offset=".45" stop-color="#c6b796" stop-opacity=".38"/>' +
        '<stop offset=".82" stop-color="#766a54" stop-opacity=".46"/><stop offset="1" stop-color="#2e2920" stop-opacity=".7"/></radialGradient>' +
        // ── 셸락판·융 (고정 광원 반사는 회전 그룹 바깥에 둔다)
        '<radialGradient id="gvShellac" cx=".4" cy=".36" r=".76">' +
        '<stop offset="0" stop-color="#292521"/><stop offset=".48" stop-color="#171412"/><stop offset=".86" stop-color="#0e0c0c"/><stop offset="1" stop-color="#221e1b"/></radialGradient>' +
        '<linearGradient id="gvDiscSheenA" x1=".1" y1="0" x2=".9" y2="1">' +
        '<stop offset="0" stop-color="#fff6e0" stop-opacity=".36"/><stop offset=".38" stop-color="#efd7ad" stop-opacity=".14"/>' +
        '<stop offset=".75" stop-color="#ffffff" stop-opacity=".02"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="gvDiscSheenB" x1=".9" y1="1" x2=".1" y2="0">' +
        '<stop offset="0" stop-color="#ffecc4" stop-opacity=".24"/><stop offset=".42" stop-color="#d9be92" stop-opacity=".07"/>' +
        '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="gvFelt" cx=".36" cy=".28" r=".86">' +
        '<stop offset="0" stop-color="#53795c"/><stop offset=".5" stop-color="#35523c"/><stop offset="1" stop-color="#192a1e"/></radialGradient>' +
        // ── 종이 봉투·명판
        '<linearGradient id="gvPaper" x1="0" y1="0" x2=".3" y2="1">' +
        '<stop offset="0" stop-color="#eee2c6"/><stop offset=".38" stop-color="#dccaa5"/><stop offset=".78" stop-color="#c6b189"/><stop offset="1" stop-color="#aa946c"/></linearGradient>' +
        '<linearGradient id="gvPlate" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#31261a"/><stop offset=".08" stop-color="#1e170f"/><stop offset=".7" stop-color="#141009"/><stop offset="1" stop-color="#0b0805"/></linearGradient>' +
        '<linearGradient id="gvBrassText" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fae2a4"/><stop offset=".48" stop-color="#deb160"/><stop offset="1" stop-color="#9e7330"/></linearGradient>' +
        '<linearGradient id="gvTinBody" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#4e1810"/><stop offset=".24" stop-color="#963324"/><stop offset=".52" stop-color="#75261b"/>' +
        '<stop offset=".84" stop-color="#581b12"/><stop offset="1" stop-color="#360f09"/></linearGradient>' +
        '<radialGradient id="gvTinLid" cx=".34" cy=".28" r=".84">' +
        '<stop offset="0" stop-color="#cb5a42"/><stop offset=".45" stop-color="#9f3928"/><stop offset="1" stop-color="#5d1d13"/></radialGradient>' +
        // ── 방
        '<radialGradient id="gvRoom" cx=".42" cy=".34" r=".8">' +
        '<stop offset="0" stop-color="#423324"/><stop offset=".46" stop-color="#251c14"/><stop offset="1" stop-color="#0e0b09"/></radialGradient>' +
        '<linearGradient id="gvFloor" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset=".55" stop-color="#120b06" stop-opacity=".5"/><stop offset="1" stop-color="#080505" stop-opacity=".86"/></linearGradient>' +
        '<radialGradient id="gvPaperEdge" cx=".5" cy=".48" r=".72">' +
        '<stop offset=".44" stop-color="#8a6428" stop-opacity="0"/><stop offset=".78" stop-color="#8a6428" stop-opacity=".11"/>' +
        '<stop offset="1" stop-color="#6b4a1a" stop-opacity=".3"/></radialGradient>' +
        '<clipPath id="gvBellClip"><ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '"/></clipPath>' +
        '<clipPath id="gvFrontClip"><rect x="190" y="930" width="820" height="220"/></clipPath>' +
        '<clipPath id="gvGrooveClip"><path fill-rule="evenodd" d="M-' + GV_DISC + ' 0 A' + GV_DISC + ' ' + GV_DISC + ' 0 1 0 ' + GV_DISC + ' 0 A' + GV_DISC + ' ' + GV_DISC + ' 0 1 0 -' + GV_DISC + ' 0 Z M-101 0 A101 101 0 1 0 101 0 A101 101 0 1 0 -101 0 Z"/></clipPath>' +
        '<clipPath id="gvSleeveClip"><rect x="1470" y="112" width="462" height="462" rx="5"/></clipPath>' +
        '<clipPath id="gvListClip"><rect x="1462" y="600" width="480" height="430"/></clipPath>' +
        '<path id="gvLabelArc" d="M -60 0 A 60 60 0 0 1 60 0" fill="none"/>' +
        '</defs>' +

        // ── 방: 키 라이트가 좌상단에서 들어오는 스튜디오 조명
        '<rect width="2000" height="1240" rx="10" fill="url(#gvRoom)"/>' +
        '<ellipse cx="660" cy="300" rx="740" ry="520" fill="#785e3c" opacity=".24" filter="url(#soWide)"/>' +
        '<rect x="0" y="900" width="2000" height="340" fill="url(#gvFloor)"/>' +
        '<rect x="1432" y="52" width="536" height="1136" rx="10" fill="#100d0c" stroke="#30261a" stroke-width="2"/>' +
        '<rect x="1432" y="52" width="536" height="3" fill="#6b5638" opacity=".55"/>' +

        // ── 캐비닛 상판 (원근 평행사변형) — wood 패턴 + 따뜻한 앰버 글레이즈 + 바니시 광택
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvOakTopFace)" stroke="#201206" stroke-width="3"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="' + mfaTexFill("wood") + '" opacity=".54" pointer-events="none"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvAmberGlaze)" pointer-events="none"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvGrain)" opacity=".38" pointer-events="none"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvVarnish)" opacity=".92" pointer-events="none"/>' +
        // 나팔이 상판에 떨구는 그림자와, 바니시 먹은 상판에 비친 놋쇠의 따뜻한 반사
        '<ellipse cx="560" cy="808" rx="330" ry="90" fill="#090502" opacity=".48" filter="url(#soWide)"/>' +
        '<ellipse cx="475" cy="792" rx="220" ry="48" fill="#eab35a" opacity=".2" filter="url(#soWide)"/>' +
        '<polygon points="208,922 ' + off(208, 922) + ' ' + off(992, 922) + ' 992,922" fill="none" stroke="#e4b06b" stroke-width="2" opacity=".32"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="#6b5334" opacity=".06" pointer-events="none"/>' +

        // ── 플래터: 니켈 림 + 질감 있는 녹색 펠트 매트
        '<ellipse cx="688" cy="854" rx="310" ry="87" fill="#000" opacity=".64" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + (GV_PC.y + 8) + '" rx="' + GV_PC.rx + '" ry="' + GV_PC.ry + '" fill="#15171a"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_PC.rx + '" ry="' + GV_PC.ry + '" fill="url(#gvNickel)" stroke="#181b1f" stroke-width="2.5"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + (GV_PC.y - 2) + '" rx="' + (GV_PC.rx - 2.5) + '" ry="' + (GV_PC.ry - 2.5) + '" fill="none" stroke="#fffdf6" stroke-width="1.8" opacity=".52"/>' +
        // 펠트 턴테이블 매트 — 판 바깥으로 드러나는 짙은 녹색 융과 섬유 질감
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 5) + '" ry="' + (GV_PC.ry - 1.5) + '" fill="url(#gvFelt)"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 5) + '" ry="' + (GV_PC.ry - 1.5) + '" fill="' + mfaTexFill("grain") + '" opacity=".48" pointer-events="none"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 5) + '" ry="' + (GV_PC.ry - 1.5) + '" fill="' + mfaTexFill("leather") + '" opacity=".24" pointer-events="none"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 5) + '" ry="' + (GV_PC.ry - 1.5) + '" fill="none" stroke="#76a280" stroke-width="1.2" opacity=".35"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 5) + '" ry="' + (GV_PC.ry - 1.5) + '" fill="none" stroke="#0c1b11" stroke-width="2" opacity=".75"/>' +

        // ── 셸락 판 — 원형 좌표계에서 그리고 원근으로 눕힌다 (회전하는 요소만 포함)
        '<ellipse cx="' + (GV_PC.x + 2) + '" cy="' + (GV_PC.y + 4) + '" rx="' + GV_DISC + '" ry="' + (GV_DISC * GV_K).toFixed(1) + '" fill="#000" opacity=".55" filter="url(#soTight)"/>' +
        '<g id="gvSpinG" transform="translate(' + GV_PC.x + ' ' + GV_PC.y + ') scale(1 ' + GV_K.toFixed(4) + ')">' +
        '<circle r="' + GV_DISC + '" fill="url(#gvShellac)"/>' +
        gvGrooves() +
        '<circle r="' + GV_DISC + '" fill="none" stroke="#463e36" stroke-width="2.6" opacity=".78"/>' +
        '<circle r="100" fill="#b7472f" id="gvLabelDisc"/>' +
        mfaTexCircle("grainFine", 0, 0, 100, .14) +
        '<circle r="100" fill="none" stroke="#000" stroke-width="2.2" opacity=".38"/>' +
        '<circle r="94" fill="none" stroke="#eadfc4" stroke-width="2.4" opacity=".6"/>' +
        '<circle r="86" fill="none" stroke="#eadfc4" stroke-width="1" opacity=".38"/>' +
        '<text class="gv-label-ink" font-family="Georgia, serif" font-size="16" letter-spacing="2.2" fill="#f6ead0"><textPath href="#gvLabelArc" startOffset="50%" text-anchor="middle">MAD FOR AUDIO RECORDS</textPath></text>' +
        '<text id="gvLabelBig" x="0" y="-24" font-family="Georgia, serif" font-size="27" font-weight="700" fill="#f8f0da" text-anchor="middle">78</text>' +
        '<text id="gvLabelTitle" x="0" y="22" font-family="Arial" font-size="14" fill="#f2e6c8" text-anchor="middle"></text>' +
        '<text id="gvLabelArtist" x="0" y="44" font-family="Arial" font-size="12" fill="#e6d5ae" text-anchor="middle"></text>' +
        '<text class="gv-label-ink" x="0" y="70" font-family="Arial" font-size="12.5" font-weight="700" letter-spacing="1.6" fill="#f8f0da" text-anchor="middle">78 R.P.M.</text>' +
        '<circle r="14" fill="none" stroke="#3a2c1c" stroke-width="3" opacity=".28"/>' +
        '<circle r="7.5" fill="#090706"/>' +
        '</g>' +
        // ── 고정 광원 셸락 홈 반사 (회전 그룹 바깥 — 판이 돌아도 빛 쐐기는 제자리에 남는다)
        '<g transform="translate(' + GV_PC.x + ' ' + GV_PC.y + ') scale(1 ' + GV_K.toFixed(4) + ')" pointer-events="none">' +
        '<g clip-path="url(#gvGrooveClip)">' +
        mfaTexCircle("spun", 0, 0, GV_DISC, .36) +
        '<path d="M0 0 L-' + (GV_DISC * 0.42).toFixed(0) + ' -' + (GV_DISC * 0.91).toFixed(0) + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 ' + (GV_DISC * 0.62).toFixed(0) + ' -' + (GV_DISC * 0.78).toFixed(0) + ' Z" fill="url(#gvDiscSheenA)"/>' +
        '<path d="M0 0 L' + (GV_DISC * 0.42).toFixed(0) + ' ' + (GV_DISC * 0.91).toFixed(0) + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 -' + (GV_DISC * 0.62).toFixed(0) + ' ' + (GV_DISC * 0.78).toFixed(0) + ' Z" fill="url(#gvDiscSheenB)"/>' +
        '<path d="M-' + (GV_DISC * 0.92).toFixed(0) + ' -' + (GV_DISC * 0.36).toFixed(0) + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 ' + (GV_DISC * 0.35).toFixed(0) + ' -' + (GV_DISC * 0.94).toFixed(0) + '" fill="none" stroke="#fff3d8" stroke-width="2.6" opacity=".32" stroke-linecap="round"/>' +
        '</g>' +
        // 니켈 스핀들 팁 + 짧은 투영 그림자 (회전하지 않는 고정 반사)
        '<ellipse cx="5" cy="4" rx="8" ry="12" fill="#000" opacity=".4"/>' +
        '<ellipse cx="0" cy="-3" rx="6.5" ry="18" fill="url(#gvNickel)" stroke="#14161a" stroke-width="1.2"/>' +
        '<ellipse cx="-1.8" cy="-12" rx="2.4" ry="6" fill="#ffffff" opacity=".65"/>' +
        '</g>' +
        '<ellipse id="gvDiscHit" cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_DISC + '" ry="' + (GV_DISC * GV_K).toFixed(0) + '" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>도는 판을 문지르면 바늘이 긁힙니다</title></ellipse>' +

        // ── 나팔 목 — 상판 뒤 오른쪽 관절에서 왼쪽 위로 뻗어 벨 뒤로 들어간다.
        '<path d="M790 528 C898 546 1014 606 1084 742 L1040 774 C984 664 894 620 784 612 Z" fill="url(#gvBrassTube)" stroke="#201304" stroke-width="2.5"/>' +
        mfaTexPath("grainFine", "M790 528 C898 546 1014 606 1084 742 L1040 774 C984 664 894 620 784 612 Z", .12) +
        '<path d="M802 550 C906 570 1008 626 1070 742" fill="none" stroke="#f7e3b0" stroke-width="8" opacity=".44" filter="url(#soTight)" stroke-linecap="round"/>' +
        '<path d="M806 556 C908 576 1010 632 1068 744" fill="none" stroke="#fff6d8" stroke-width="2.4" opacity=".7" stroke-linecap="round"/>' +
        '<path d="M792 600 C894 626 978 676 1036 768" fill="none" stroke="#241403" stroke-width="7" opacity=".52" stroke-linecap="round"/>' +
        // 나팔 목과 뒷기둥 이음 칼라 (부드러운 라운드 플랜지)
        '<path d="M1022 726 Q1046 704 1072 700 L1082 722 Q1058 728 1035 748 Z" fill="url(#gvBrassRing)" stroke="#1d1103" stroke-width="1.8"/>' +
        '<path d="M1027 725 Q1048 708 1069 704" fill="none" stroke="#fff2c8" stroke-width="2" opacity=".62" stroke-linecap="round"/>' +

        // ── 벨: 접지 그림자 → 바깥 테 → 안쪽 원뿔 → 이음매 → 방향광 → 파티나 → 스펙큘러 → 롤드 림
        '<ellipse cx="' + (GV_BELL.cx + 18) + '" cy="' + (GV_BELL.cy + 30) + '" rx="' + (GV_BELL.rx + 8) + '" ry="' + (GV_BELL.ry + 8) + '" fill="#000" opacity=".58" filter="url(#soWide)"/>' +
        // 나팔 바깥면 — 왼쪽 위로 살짝 보이는 초승달 (관의 두께)
        '<ellipse cx="' + (GV_BELL.cx - 9) + '" cy="' + (GV_BELL.cy - 9) + '" rx="' + (GV_BELL.rx + 3) + '" ry="' + (GV_BELL.ry + 3) + '" fill="url(#gvBrassTube)"/>' +
        // 안쪽 원뿔
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="url(#gvConeKey)"/>' +
        '<g clip-path="url(#gvBellClip)">' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="url(#gvConeAmbient)"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="url(#gvConeThroat)"/>' +
        // 미세 금속 표면 결 (수평 브러시는 아주 은은하게, 주로 고운 금속 그레인)
        mfaTexRect("grainFine", GV_BELL.cx - GV_BELL.rx, GV_BELL.cy - GV_BELL.ry, GV_BELL.rx * 2, GV_BELL.ry * 2, 0, .14) +
        mfaTexRect("brush", GV_BELL.cx - GV_BELL.rx, GV_BELL.cy - GV_BELL.ry, GV_BELL.rx * 2, GV_BELL.ry * 2, 0, .06) +
        gvHornContours() +
        gvHornSeams() +
        // 은은한 놋쇠 파티나 변화 (과한 노이즈 대신 부드러운 반사·산화 톤 차이)
        '<ellipse cx="' + (GV_BELL.cx + 60) + '" cy="' + (GV_BELL.cy + 40) + '" rx="340" ry="270" fill="url(#gvBrassPatina)"/>' +
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="135" ry="112" fill="url(#gvVerdigrisSoft)"/>' +
        // 원뿔 안쪽 벽에 고인 부드러운 키 라이트 반사띠 + 우하단 2차 황동 반사
        '<path d="' + gvBellArc(334, 282, 134, 284) + '" fill="none" stroke="#ffefc4" stroke-width="118" opacity=".18" filter="url(#soWide)"/>' +
        '<path d="' + gvBellArc(318, 268, 152, 266) + '" fill="none" stroke="#fff7df" stroke-width="48" opacity=".16" filter="url(#soWide)"/>' +
        '<path d="' + gvBellArc(338, 286, -48, 66) + '" fill="none" stroke="#ffe5a0" stroke-width="76" opacity=".22" filter="url(#soWide)"/>' +
        '<path d="' + gvBellArc(350, 296, -24, 38) + '" fill="none" stroke="#fff5d2" stroke-width="22" opacity=".22" filter="url(#soSoft)" stroke-linecap="round"/>' +
        // 림 바로 안쪽의 따뜻한 황동 스펙큘러 아크
        '<path d="' + gvBellArc(358, 302, 154, 256) + '" fill="none" stroke="#f7e4b2" stroke-width="16" opacity=".46" filter="url(#soSoft)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(358, 302, 188, 242) + '" fill="none" stroke="#fff5d2" stroke-width="8" opacity=".54" filter="url(#soTight)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(302, 254, 206, 260) + '" fill="none" stroke="#f0dba2" stroke-width="7" opacity=".22" filter="url(#soSoft)" stroke-linecap="round"/>' +
        // 목 최심부 폐색
        '<ellipse cx="' + (GV_THROAT.x + 4) + '" cy="' + (GV_THROAT.y - 2) + '" rx="98" ry="84" fill="#100902" opacity=".54" filter="url(#soWide)"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 2) + '" cy="' + GV_THROAT.y + '" rx="60" ry="52" fill="#0b0602" opacity=".62" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="38" ry="33" fill="none" stroke="#76581b" stroke-width="7" opacity=".85"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 2) + '" cy="' + (GV_THROAT.y + 3) + '" rx="35" ry="30" fill="none" stroke="#e2c37c" stroke-width="2" opacity=".32"/>' +
        '<ellipse id="gvHornMouth" cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="31" ry="26" fill="#040200"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 5) + '" cy="' + (GV_THROAT.y - 8) + '" rx="17" ry="11" fill="#1c1103"/>' +
        '</g>' +
        // 벨 입구 테 — 두께가 있는 롤드 브라스. 좌상단은 선명한 황금빛 하이라이트, 우하단은 그늘.
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 9) + '" ry="' + (GV_BELL.ry - 8.5) + '" fill="none" stroke="url(#gvBrassRing)" stroke-width="20"/>' +
        '<path d="' + gvBellArc(GV_BELL.rx - 9, GV_BELL.ry - 8.5, 186, 304) + '" fill="none" stroke="#f9e6b4" stroke-width="8.5" opacity=".76" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(GV_BELL.rx - 9, GV_BELL.ry - 8.5, 206, 276) + '" fill="none" stroke="#fff9e2" stroke-width="3.6" opacity=".88" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(GV_BELL.rx - 9, GV_BELL.ry - 8.5, 24, 120) + '" fill="none" stroke="#180d02" stroke-width="7.5" opacity=".54" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(GV_BELL.rx - 9, GV_BELL.ry - 8.5, 122, 168) + '" fill="none" stroke="#ead092" stroke-width="5" opacity=".46" stroke-linecap="round"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="none" stroke="#160c02" stroke-width="3.6" opacity=".62"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + GV_BELL.rx + '" ry="' + GV_BELL.ry + '" fill="none" stroke="#100801" stroke-width="3" opacity=".94"/>' +

        // ── 톤암 크러치 — 판 오른쪽 바깥, 상판 위의 낮은 니켈 받침
        '<ellipse cx="874" cy="913" rx="29" ry="10" fill="#000" opacity=".56" filter="url(#soTight)"/>' +
        '<ellipse cx="871" cy="908" rx="26" ry="9" fill="url(#gvNickel)" stroke="#191c20" stroke-width="1.5"/>' +
        '<ellipse cx="871" cy="905" rx="19" ry="6" fill="#0f1114"/>' +
        '<path d="M850 902 Q871 886 892 902" fill="none" stroke="url(#gvNickel)" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M854 898 Q871 886 888 898" fill="none" stroke="#ffffff" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>' +

        // ── 톤암 (프레임마다 다시 그린다) + 판에 지는 그림자
        '<path id="gvArmShadow" d="M1062 754 L871 852" transform="translate(12 30)" stroke="#000" stroke-width="16" stroke-linecap="round" fill="none" opacity=".38" filter="url(#soSoft)"/>' +
        '<path id="gvArm" d="M1062 754 L871 852" stroke="url(#gvNickel)" stroke-width="14.5" stroke-linecap="round" fill="none"/>' +
        '<path id="gvArmLo" d="M1062 754 L871 852" transform="translate(0 3.8)" stroke="#16191d" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".6"/>' +
        '<path id="gvArmHi" d="M1062 754 L871 852" transform="translate(0 -3.0)" stroke="#fffdf8" stroke-width="3.0" stroke-linecap="round" fill="none" opacity=".78"/>' +
        // 뒷마운트 기둥 — 볼 조인트가 상판보다 높이 서 있어야 팔이 판 위를 넘어간다.
        '<ellipse cx="' + (GV_ARM_POST.x + 5) + '" cy="' + (GV_ARM_POST.y + 7) + '" rx="44" ry="16" fill="#000" opacity=".58" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_ARM_POST.x + '" cy="' + GV_ARM_POST.y + '" rx="40" ry="14" fill="url(#gvNickel)" stroke="#191c20" stroke-width="2"/>' +
        '<ellipse cx="' + GV_ARM_POST.x + '" cy="' + (GV_ARM_POST.y - 3) + '" rx="32" ry="10" fill="url(#gvNickelBall)"/>' +
        '<path d="M' + (GV_ARM_POST.x - 15) + ' ' + (GV_ARM_POST.y - 4) + ' L' + (GV_ARM.x - 19) + ' ' + (GV_ARM.y + 6) +
        ' L' + (GV_ARM.x + 19) + ' ' + (GV_ARM.y + 6) + ' L' + (GV_ARM_POST.x + 15) + ' ' + (GV_ARM_POST.y - 4) + ' Z" fill="url(#gvNickel)" stroke="#181b1f" stroke-width="2"/>' +
        '<path d="M' + (GV_ARM_POST.x - 9) + ' ' + (GV_ARM_POST.y - 6) + ' L' + (GV_ARM.x - 13) + ' ' + (GV_ARM.y + 6) + '" stroke="#ffffff" stroke-width="3.2" opacity=".62" stroke-linecap="round"/>' +
        '<path d="M' + (GV_ARM_POST.x + 10) + ' ' + (GV_ARM_POST.y - 4) + ' L' + (GV_ARM.x + 13) + ' ' + (GV_ARM.y + 6) + '" stroke="#101215" stroke-width="2.6" opacity=".48" stroke-linecap="round"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="37" ry="34" fill="url(#gvNickelBall)" stroke="#14171b" stroke-width="2.5"/>' +
        '<ellipse cx="' + (GV_ARM.x - 12) + '" cy="' + (GV_ARM.y - 12) + '" rx="14" ry="10" fill="#ffffff" opacity=".64"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="15" ry="13" fill="url(#soCapDark)" stroke="#3b3832" stroke-width="1"/>' +
        // 사운드박스(Exhibition reproducer) — 니켈 외곽 + 스핀 하이라이트 + 반투명 운모 진동판 + 니들 척
        '<g id="gvBoxG" transform="translate(871 852)">' +
        '<ellipse cx="4" cy="16" rx="48" ry="24" fill="#000" opacity=".55" filter="url(#soSoft)"/>' +
        '<circle cx="0" cy="0" r="45" fill="url(#gvNickel)" stroke="#14171b" stroke-width="3"/>' +
        '<path d="M-34 -24 A42 42 0 0 1 20 -37" fill="none" stroke="#ffffff" stroke-width="3" opacity=".68" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="38" fill="url(#gvNickelBall)"/>' +
        mfaTexCircle("spun", 0, 0, 38, .34) +
        '<circle cx="0" cy="0" r="31" fill="#131417" stroke="#5b6067" stroke-width="1.6"/>' +
        // 운모(mica) 진동판과 가스켓 링
        '<circle cx="0" cy="0" r="28" fill="url(#gvMica)"/>' +
        '<circle cx="0" cy="0" r="27" fill="none" stroke="#d8cdb4" stroke-width="1.2" opacity=".32"/>' +
        '<path d="M0 0 L0 28" stroke="url(#gvNickel)" stroke-width="3.2" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="4" fill="#d8c698" stroke="#3a2f1d" stroke-width="1"/>' +
        '<ellipse cx="-11" cy="-12" rx="11" ry="6.5" fill="#fffdf6" opacity=".32" transform="rotate(-24 -11 -12)"/>' +
        '<text x="0" y="-9" font-family="Georgia, serif" font-size="10.2" font-style="italic" fill="#f6efe0" text-anchor="middle" opacity=".95">Exhibition</text>' +
        '<path d="M0 29 L0 47" stroke="url(#gvNickel)" stroke-width="8.5" stroke-linecap="round"/>' +
        '<path d="M-2 31 L-2 45" stroke="#ffffff" stroke-width="1.8" opacity=".65" stroke-linecap="round"/>' +
        '<path id="gvNeedle" d="M0 45 L0 59" stroke="#eef1f5" stroke-width="3.6" stroke-linecap="round"/>' +
        // 바늘 고정 나비나사
        '<circle cx="27" cy="25" r="7" fill="url(#gvNickel)" stroke="#181b20" stroke-width="1.4"/>' +
        '<circle cx="27" cy="25" r="4.5" fill="url(#soCapDark)"/>' +
        '</g>' +
        '<ellipse id="gvArmHit" cx="871" cy="852" rx="66" ry="52" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none"><title>톤암 — 잡아서 원하는 곡 위에 바늘을 내려놓으세요</title></ellipse>' +

        // ── 캐비닛 우측면 + 앞면 (사분할 오크 원목 결 + 따뜻한 앰버 글레이즈 + 바니시 광택 + 오목 패널 프레임)
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvOakSide)" stroke="#1b0e05" stroke-width="3"/>' +
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="' + mfaTexFill("wood") + '" opacity=".38" pointer-events="none"/>' +
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvAmberGlaze)" opacity=".85" pointer-events="none"/>' +
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvVarnish)" opacity=".5" pointer-events="none"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvOakFace)" stroke="#1b0e05" stroke-width="3"/>' +
        mfaTexRect("wood", 190, 930, 820, 220, 0, .58) +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvAmberGlaze)" pointer-events="none"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvGrain)" opacity=".38" pointer-events="none"/>' +
        '<g clip-path="url(#gvFrontClip)" pointer-events="none">' +
        '<ellipse cx="430" cy="1010" rx="280" ry="120" fill="url(#gvWoodBlotch)"/>' +
        '<ellipse cx="860" cy="1080" rx="220" ry="100" fill="url(#gvWoodBlotch)"/>' +
        // 전면 오목 프레임 몰딩 (좌우 코너 기둥 사이)
        '<rect x="282" y="948" width="636" height="184" rx="4" fill="none" stroke="#180b03" stroke-width="3.5" opacity=".55"/>' +
        '<rect x="285" y="951" width="630" height="178" rx="3" fill="none" stroke="#eab570" stroke-width="1.6" opacity=".28"/>' +
        '<rect x="282" y="948" width="636" height="10" fill="#0d0602" opacity=".25"/>' +
        '</g>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvVarnish)" pointer-events="none"/>' +
        // 전면 상단 아리스(모서리) 하이라이트와 하단 폐색
        '<path d="M194 933.5 H1006" stroke="#f6c782" stroke-width="3.2" opacity=".52"/>' +
        '<path d="M194 937 H1006" stroke="#2c1607" stroke-width="1.8" opacity=".4"/>' +
        '<path d="M194 1147 H1006" stroke="#0d0603" stroke-width="4.5" opacity=".7"/>' +
        // 코너 기둥 (세로 결 woodV + 앰버 글레이즈 + 홈)
        '<rect x="190" y="930" width="74" height="220" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("woodV", 190, 930, 74, 220, 0, .52) +
        '<rect x="190" y="930" width="74" height="220" fill="url(#gvAmberGlaze)" pointer-events="none"/>' + gvFlutes(190, 930, 74, 220) +
        '<rect x="190" y="930" width="74" height="220" fill="url(#gvVarnish)" opacity=".55" pointer-events="none"/>' +
        '<rect x="936" y="930" width="74" height="220" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("woodV", 936, 930, 74, 220, 0, .52) +
        '<rect x="936" y="930" width="74" height="220" fill="url(#gvAmberGlaze)" pointer-events="none"/>' + gvFlutes(936, 930, 74, 220) +
        '<rect x="936" y="930" width="74" height="220" fill="url(#gvVarnish)" opacity=".45" pointer-events="none"/>' +
        // 기둥 주두·주초 칼라 + 하이라이트 & 그림자
        '<rect x="184" y="922" width="86" height="22" rx="4" fill="url(#gvOakTopFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("wood", 184, 922, 86, 22, 4, .5) +
        '<path d="M188 924.5 H266" stroke="#f7cb88" stroke-width="2.2" opacity=".55"/>' +
        '<path d="M188 945 H266" stroke="#0e0602" stroke-width="3" opacity=".55"/>' +
        '<rect x="930" y="922" width="86" height="22" rx="4" fill="url(#gvOakTopFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("wood", 930, 922, 86, 22, 4, .5) +
        '<path d="M934 924.5 H1012" stroke="#f7cb88" stroke-width="2.2" opacity=".5"/>' +
        '<path d="M934 945 H1012" stroke="#0e0602" stroke-width="3" opacity=".55"/>' +
        '<rect x="184" y="1128" width="86" height="24" rx="4" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("wood", 184, 1128, 86, 24, 4, .5) +
        '<path d="M188 1130.5 H266" stroke="#f2c07a" stroke-width="2" opacity=".48"/>' +
        '<rect x="930" y="1128" width="86" height="24" rx="4" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        mfaTexRect("wood", 930, 1128, 86, 24, 4, .5) +
        '<path d="M934 1130.5 H1012" stroke="#f2c07a" stroke-width="2" opacity=".44"/>' +
        // 명판 — 에나멜 블랙 + 금빛 Victor 스크립트
        '<rect x="514" y="1002" width="176" height="60" rx="4" fill="#000" opacity=".5" transform="translate(3 5)" filter="url(#soTight)"/>' +
        '<rect x="514" y="1002" width="176" height="60" rx="4" fill="#14100c" stroke="#5b4b32" stroke-width="2"/>' +
        mfaTexRect("brushFine", 514, 1002, 176, 60, 4, .18) +
        '<rect x="518" y="1006" width="168" height="52" rx="3" fill="none" stroke="#a68850" stroke-width="1.4" opacity=".68"/>' +
        '<rect x="514" y="1002" width="176" height="3.5" fill="#9a7f4c" opacity=".45"/>' +
        '<text x="601" y="1033" font-family="Georgia, serif" font-size="30" font-style="italic" font-weight="700" fill="#000" opacity=".65" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1031" font-family="Georgia, serif" font-size="30" font-style="italic" font-weight="700" fill="url(#gvBrassText)" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1050" font-family="Arial" font-size="8.5" font-weight="600" letter-spacing="1.7" fill="#c7a164" text-anchor="middle" opacity=".9">VICTOR V &#183; CAMDEN N.J.</text>' +
        '<circle cx="519" cy="1007" r="3" fill="url(#gvBrassRing)"/><circle cx="685" cy="1007" r="3" fill="url(#gvBrassRing)"/>' +
        '<circle cx="519" cy="1057" r="3" fill="url(#gvBrassRing)"/><circle cx="685" cy="1057" r="3" fill="url(#gvBrassRing)"/>' +
        // 트레이드마크 뱃지
        '<ellipse cx="600" cy="964" rx="48" ry="20" fill="#000" opacity=".42" filter="url(#soTight)"/>' +
        '<ellipse cx="600" cy="962" rx="47" ry="20" fill="#120e0a" stroke="#7d6640" stroke-width="1.8"/>' +
        '<ellipse cx="600" cy="959" rx="41" ry="15" fill="none" stroke="#a68850" stroke-width="1.1" opacity=".55"/>' +
        '<text x="600" y="966" font-family="Arial" font-size="8.6" font-weight="700" letter-spacing="1.4" fill="#c9a868" text-anchor="middle">HIS MASTER&#8217;S VOICE</text>' +
        // 굽도리 2단 + 바닥 접지
        molding(168, 1032, 1148, 1176) +
        molding(146, 1054, 1174, 1210) +
        '<ellipse cx="620" cy="1218" rx="530" ry="24" fill="#000" opacity=".68" filter="url(#soWide)"/>' +

        // ── 태엽 크랭크 (우측면)
        '<ellipse cx="1124" cy="955" rx="33" ry="30" fill="#000" opacity=".48" filter="url(#soTight)"/>' +
        '<ellipse cx="1120" cy="950" rx="31" ry="29" fill="url(#gvNickelBall)" stroke="#14171b" stroke-width="2.5"/>' +
        '<ellipse cx="1112" cy="942" rx="11" ry="8" fill="#ffffff" opacity=".62"/>' +
        '<path d="M1120 950 L1214 936" stroke="url(#gvNickel)" stroke-width="14.5" stroke-linecap="round"/>' +
        '<path d="M1124 945.5 L1210 932.5" stroke="#ffffff" stroke-width="3.2" opacity=".56" stroke-linecap="round"/>' +
        '<g id="gvCrankG" transform="rotate(0 1214 936)">' +
        '<rect x="1207" y="852" width="14" height="88" rx="7" fill="url(#gvNickel)" stroke="#14171b" stroke-width="1.6"/>' +
        '<rect x="1210" y="858" width="3.2" height="76" rx="1.6" fill="#ffffff" opacity=".6"/>' +
        '<rect x="1199" y="822" width="30" height="50" rx="14" fill="#6f4623" stroke="#201004" stroke-width="2"/>' +
        mfaTexRect("woodV", 1199, 822, 30, 50, 14, .55) +
        '<rect x="1204" y="828" width="7.5" height="38" rx="3.8" fill="#d9a166" opacity=".6"/>' +
        '<rect x="1199" y="822" width="30" height="50" rx="14" fill="url(#gvVarnish)"/>' +
        '</g>' +
        '<circle id="gvCrankHit" cx="1214" cy="900" r="76" fill="#000" fill-opacity="0" style="cursor:pointer"><title>태엽 크랭크 — 돌려서 스프링 모터를 감습니다</title></circle>' +
        '<text x="1214" y="1002" font-family="Arial" font-size="14" font-weight="700" letter-spacing="2.4" fill="#c9a066" text-anchor="middle">WIND</text>' +

        // ── 상판 조작부: 조속기 · 브레이크
        '<g id="gvSpeedPlate">' +
        '<ellipse cx="313" cy="894" rx="56" ry="32" fill="#000" opacity=".56" filter="url(#soSoft)"/>' +
        '<ellipse cx="310" cy="884" rx="53" ry="30" fill="url(#gvNickel)" stroke="#181b20" stroke-width="2"/>' +
        '<ellipse cx="310" cy="882" rx="49" ry="26" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".52"/>' +
        '<ellipse cx="310" cy="884" rx="41" ry="22" fill="#101216"/>' +
        '<ellipse cx="310" cy="882" rx="41" ry="22" fill="none" stroke="#000" stroke-width="2.2" opacity=".7"/>' +
        '<text x="310" y="872" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.3" fill="#c9ced2" text-anchor="middle">SPEED</text>' +
        '<path id="gvSpeedPtr" d="M310 884 L310 865" stroke="#f6efdc" stroke-width="3.6" stroke-linecap="round" transform="rotate(0 310 884)"/>' +
        '<text id="gvSpeedText" x="310" y="899" font-family="Arial" font-size="11.5" font-weight="700" fill="#f0e4c8" text-anchor="middle">78</text>' +
        '</g>' +
        '<ellipse id="gvSpeedHit" cx="310" cy="884" rx="60" ry="36" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none"><title>SPEED — 위아래로 끌어 회전수를 60~88rpm으로 조절</title></ellipse>' +
        // 브레이크
        '<ellipse cx="381" cy="810" rx="28" ry="18" fill="#000" opacity=".52" filter="url(#soSoft)"/>' +
        '<ellipse cx="378" cy="800" rx="27" ry="18" fill="url(#gvNickel)" stroke="#181b20" stroke-width="2"/>' +
        '<ellipse cx="378" cy="798" rx="23" ry="14" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".45"/>' +
        '<path id="gvBrakeLever" d="M378 800 L406 772" stroke="#101216" stroke-width="12" stroke-linecap="round" transform="rotate(0 378 800)"/>' +
        '<circle cx="378" cy="800" r="9.5" fill="url(#gvNickelBall)" stroke="#1a1c20" stroke-width="1"/>' +
        '<text x="378" y="768" font-family="Arial" font-size="11.5" font-weight="700" letter-spacing="1.6" fill="#c9a066" text-anchor="middle">BRAKE</text>' +
        '<ellipse id="gvBrakeHit" cx="386" cy="792" rx="48" ry="38" fill="#000" fill-opacity="0" style="cursor:pointer"><title>브레이크 — 플래터를 세우고 다시 돌립니다</title></ellipse>' +

        // ── 바늘통 (탁자 위) — 에나멜 리소그래프 틴과 강철 바늘
        '<g id="gvTinG">' +
        '<ellipse cx="1276" cy="1154" rx="74" ry="27" fill="#000" opacity=".66" filter="url(#soSoft)"/>' +
        '<g stroke="#000" stroke-width="3.6" stroke-linecap="round" opacity=".4" transform="translate(2 3)">' +
        '<path d="M1352 1152 L1394 1146"/><path d="M1356 1162 L1400 1158"/><path d="M1350 1140 L1388 1132"/></g>' +
        '<g stroke="url(#soChrome)" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M1352 1152 L1394 1146"/><path d="M1356 1162 L1400 1158"/><path d="M1350 1140 L1388 1132"/></g>' +
        '<ellipse cx="1268" cy="1140" rx="62" ry="23" fill="#4f1810" stroke="#240a05" stroke-width="2"/>' +
        '<rect x="1206" y="1116" width="124" height="24" fill="url(#gvTinBody)"/>' +
        '<ellipse cx="1268" cy="1116" rx="62" ry="23" fill="url(#gvTinLid)" stroke="#240a05" stroke-width="2"/>' +
        '<ellipse cx="1268" cy="1116" rx="60" ry="21" fill="' + mfaTexFill("grainFine") + '" opacity=".18" pointer-events="none"/>' +
        '<ellipse cx="1250" cy="1106" rx="28" ry="8.5" fill="#ffffff" opacity=".2"/>' +
        '<ellipse cx="1268" cy="1116" rx="45" ry="15.5" fill="none" stroke="#f4d59c" stroke-width="1.6" opacity=".9"/>' +
        '<text x="1268" y="1113" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#faf0cf" text-anchor="middle">Victor</text>' +
        '<text x="1268" y="1128" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.7" fill="#f4dbaa" text-anchor="middle">NEEDLES</text>' +
        '</g>' +
        '<ellipse id="gvTinHit" cx="1276" cy="1130" rx="88" ry="44" fill="#000" fill-opacity="0" style="cursor:pointer"><title>바늘통 — 새 강철 바늘로 갈아 끼웁니다 (한 면마다 교체)</title></ellipse>' +
        '<text x="1268" y="1200" font-family="Arial" font-size="13" font-weight="600" letter-spacing="1.8" fill="#a4834f" text-anchor="middle">바늘 교체</text>' +

        // ── 오른쪽 정보 열
        '<text x="1470" y="90" font-family="Arial" font-size="15" font-weight="700" letter-spacing="3.6" fill="#a9895a">78 R.P.M. &#183; ACOUSTIC</text>' +
        '<rect x="1478" y="120" width="462" height="462" rx="5" fill="#000" opacity=".58" filter="url(#soSoft)"/>' +
        '<rect x="1470" y="112" width="462" height="462" rx="5" fill="url(#gvPaper)" stroke="#7d6b48" stroke-width="2"/>' +
        '<g clip-path="url(#gvSleeveClip)">' +
        mfaTexRect("grain", 1470, 112, 462, 462, 0, .26) +
        '<rect x="1470" y="112" width="462" height="462" fill="url(#gvVarnish)" opacity=".28"/>' +
        '<circle cx="1701" cy="343" r="142" fill="#0b0908"/>' +
        '<circle cx="1701" cy="343" r="140" fill="none" stroke="#6d5c3c" stroke-width="4"/>' +
        '<circle cx="1701" cy="343" r="134" fill="none" stroke="#efe3c6" stroke-width="1.4" opacity=".32"/>' +
        '<circle id="gvSleeveLabel" cx="1701" cy="343" r="104" fill="#b7472f"/>' +
        mfaTexCircle("grainFine", 1701, 343, 104, .14) +
        '<circle cx="1701" cy="343" r="104" fill="none" stroke="#000" stroke-width="2" opacity=".32"/>' +
        '<circle cx="1701" cy="343" r="97" fill="none" stroke="#eadfc4" stroke-width="2" opacity=".55"/>' +
        '<text id="gvSleeveBig" x="1701" y="298" font-family="Georgia, serif" font-size="27" font-weight="700" fill="#f8f0da" text-anchor="middle"></text>' +
        '<text id="gvSleeveTitle" x="1701" y="323" font-family="Arial" font-size="14" fill="#f4e9cc" text-anchor="middle"></text>' +
        '<text id="gvSleeveArtist" x="1701" y="382" font-family="Arial" font-size="12" fill="#e6d5ae" text-anchor="middle"></text>' +
        '<text class="gv-label-ink" x="1701" y="410" font-family="Arial" font-size="11.5" font-weight="700" letter-spacing="1.8" fill="#f4e9cc" text-anchor="middle">78 R.P.M.</text>' +
        '<circle cx="1701" cy="343" r="7" fill="#0d0b09"/>' +
        '<path d="M1470 112 H1932 M1470 574 H1932" stroke="#8a7752" stroke-width="1" opacity=".5"/>' +
        '<text x="1494" y="154" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#5f4f33">Victor Record</text>' +
        '<text id="gvSleeveNote" x="1494" y="546" font-family="Arial" font-size="13" fill="#5f4f33"></text>' +
        // 종이 가장자리 에이징과 접힌 자국, 디스크 링 웨어
        '<rect x="1470" y="112" width="462" height="462" fill="url(#gvPaperEdge)" pointer-events="none"/>' +
        '<path d="M1470 236 H1932" stroke="#8a7146" stroke-width="2.2" opacity=".2"/>' +
        '<path d="M1470 233 H1932" stroke="#efe4c8" stroke-width="1.6" opacity=".22"/>' +
        '<circle cx="1701" cy="343" r="147" fill="none" stroke="#7d6540" stroke-width="3" opacity=".18"/>' +
        '</g>' +
        '<g id="gvCrateBtn" style="cursor:pointer"><title>음반 수납장 열기</title>' +
        '<rect x="1470" y="600" width="296" height="42" rx="8" fill="#000" opacity=".5"/>' +
        '<rect x="1470" y="596" width="296" height="42" rx="8" fill="#241f18" stroke="#6b5836" stroke-width="1.5"/>' +
        mfaTexRect("brushFine", 1470, 596, 296, 42, 8, .15) +
        '<path d="M1476 601 H1760" stroke="#ffffff" stroke-width="1.4" opacity=".16"/>' +
        '<text id="gvCrateLabel" x="1618" y="624" font-family="Arial" font-size="14" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#9636; 음반 수납장</text></g>' +
        '<circle id="gvPrevRec" cx="1820" cy="617" r="25" fill="#241f18" stroke="#6b5836" stroke-width="1.5" style="cursor:pointer"><title>이전 음반</title></circle>' +
        '<text x="1820" y="626" font-family="Georgia, serif" font-size="26" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#8249;</text>' +
        '<circle id="gvNextRec" cx="1892" cy="617" r="25" fill="#241f18" stroke="#6b5836" stroke-width="1.5" style="cursor:pointer"><title>다음 음반</title></circle>' +
        '<text x="1892" y="626" font-family="Georgia, serif" font-size="26" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#8250;</text>' +
        '<g id="gvTrackList" clip-path="url(#gvListClip)"></g>' +
        // 태엽·바늘 게이지
        '<rect x="1470" y="1050" width="462" height="118" rx="9" fill="url(#gvPlate)" stroke="#4a3c26" stroke-width="1.5"/>' +
        mfaTexRect("brushFine", 1470, 1050, 462, 118, 9, .14) +
        '<path d="M1476 1054 H1926" stroke="#ffffff" stroke-width="1.4" opacity=".12"/>' +
        '<text x="1492" y="1088" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#b09060">태엽 WIND</text>' +
        '<rect x="1616" y="1076" width="200" height="13" rx="6.5" fill="#080604" stroke="#4a3d29"/>' +
        '<rect id="gvWindBar" x="1616" y="1076" width="200" height="13" rx="6.5" fill="#d7a24a"/>' +
        '<rect x="1616" y="1076" width="200" height="5" rx="2.5" fill="#ffffff" opacity=".14" pointer-events="none"/>' +
        '<text id="gvWindText" x="1912" y="1088" font-family="Arial" font-size="12" font-weight="700" fill="#e0c99b" text-anchor="end">100%</text>' +
        '<text x="1492" y="1134" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#b09060">바늘 NEEDLE</text>' +
        '<rect x="1616" y="1122" width="200" height="13" rx="6.5" fill="#080604" stroke="#4a3d29"/>' +
        '<rect id="gvNeedleBar" x="1616" y="1122" width="0" height="13" rx="6.5" fill="#8d7b4e"/>' +
        '<rect x="1616" y="1122" width="200" height="5" rx="2.5" fill="#ffffff" opacity=".1" pointer-events="none"/>' +
        '<text id="gvNeedleText" x="1912" y="1134" font-family="Arial" font-size="12" font-weight="700" fill="#e0c99b" text-anchor="end">새 바늘</text>' +
        '<text id="gvCredit" x="60" y="1226" font-family="Arial" font-size="12" fill="#7d6747"></text>' +
        soloFilmGrade(0, 0, 2000, 1240) +
        '</svg>';
}

// ===================================================================
// 금성 A-501 — 국산 1호 5구 진공관 라디오 (1959)
// ===================================================================
// 실물 전면 구조: 상아색 인서트(좌 타공 그릴 / 우 다이얼 유리)를 크롬 테가 두르고,
// 그 위를 끝이 뾰족한 크롬 스피어 몰딩이 가로지른다. 하단 어두운 띠에
// GoldStar 금박 스크립트와 VOLUME · SELECT · TUNER 세 노브, 아래로 벌어진 두 다리.
// 다이얼 눈금: 상단 FM(작동), 하단 SW(실물 눈금 그대로 — SELECT=SW에서 읽는다).
const A5_DIAL = { x88: 1002, px: 29.5, drawX: 1297, y0: 300, y1: 430 };   // FM 88~108MHz

const A501_FINISHES = {
    charcoal: {
        label: "금성 A-501 · 차콜",
        // 베이크라이트·유레아 사출 캐비닛 — 깊이 있는 웜 차콜과 라커 광택
        shell: ["#5e5850", "#3d3933", "#24211e", "#131210"],
        shellEdge: "#0a0908",
        rim: "#9c9384",
        band: ["#322e29", "#1d1b18", "#0e0d0c"],
        ivory: ["#f5ecd2", "#e5d8b4", "#c7b68e"],
        grille: "#dfd2b0",
        clothHi: "#f3e8ca",
        clothMid: "#c7b691",
        clothLo: "#6a5f48",
        perf: "#3e372a",
        ink: "#362e22",
        sub: "#746850",
        bandInk: "#b2a896",
        script: "#cf9d48",
        leg: "#151413"
    },
    mint: {
        label: "금성 A-501 · 민트",
        shell: ["#9bc0b0", "#719c8c", "#477263", "#264e40"],
        shellEdge: "#153229",
        rim: "#c4ddd1",
        band: ["#527f70", "#3a6154", "#244439"],
        ivory: ["#f6eed6", "#e6dab8", "#c9ba94"],
        grille: "#e6dbc0",
        clothHi: "#f6eed2",
        clothMid: "#c9bd9b",
        clothLo: "#68644f",
        perf: "#484a3b",
        ink: "#33362a",
        sub: "#666b59",
        bandInk: "#d4e3d6",
        script: "#d3a14c",
        leg: "#264339"
    }
};

function mfaA501Svg(finish) {
    const key = A501_FINISHES[finish] ? finish : "charcoal";
    const t = A501_FINISHES[key];
    // FM 눈금 — 인쇄가 유리 뒤에 있으므로 숫자마다 얇은 그림자를 함께 찍는다
    const fmTicks = (() => {
        let out = "";
        for (let f = 88; f <= 108; f += 0.5) {
            const x = (A5_DIAL.x88 + (f - 88) * A5_DIAL.px).toFixed(1);
            const major = Math.abs(f % 4) < 0.01;
            const mid = Math.abs(f % 2) < 0.01;
            out += '<path d="M' + x + ' ' + (A5_DIAL.y0 + 14) + ' V' + (A5_DIAL.y0 + (major ? 32 : mid ? 26 : 21)) +
                '" stroke="' + t.ink + '" stroke-width="' + (major ? 2.6 : 1.4) + '" opacity="' + (major ? ".88" : ".55") + '"/>';
        }
        for (let f = 88; f <= 108; f += 4) {
            const x = (A5_DIAL.x88 + (f - 88) * A5_DIAL.px).toFixed(1);
            out += '<text x="' + (Number(x) + 1.5) + '" y="' + (A5_DIAL.y0 + 3.5) + '" font-family="Arial" font-size="34" font-weight="700" fill="#fff7e2" opacity=".32" text-anchor="middle">' + f + '</text>' +
                '<text x="' + x + '" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="34" font-weight="700" fill="' + t.ink + '" text-anchor="middle">' + f + '</text>';
        }
        return out;
    })();
    // 하단 SW 눈금 — 실물 그대로 (0.5·5·5.5·6·7·8·10·12·14·16 MC와 미터밴드)
    const swScale = (() => {
        const marks = [
            ["0.5", 1002], ["5", 1060], ["5.5", 1112], ["6", 1164], ["7", 1231],
            ["8", 1296], ["10", 1373], ["12", 1453], ["14", 1529], ["16", 1602]
        ];
        const bands = [["65м", 1030], ["60м", 1086], ["50м", 1168], ["40м", 1263], ["30м", 1347], ["25м", 1431], ["20м", 1511]];
        return marks.map(([lbl, x]) =>
            '<text x="' + x + '" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="27" font-weight="600" fill="' + t.ink + '" text-anchor="middle" opacity=".88">' + lbl + '</text>').join("") +
            bands.map(([lbl, x]) =>
                '<text x="' + x + '" y="' + (A5_DIAL.y1 + 26) + '" font-family="Arial" font-size="15" fill="' + t.sub + '" text-anchor="middle" opacity=".88">' + lbl + '</text>').join("");
    })();

    return '<svg class="solo-svg a5-svg a5-' + key + '" data-finish="' + key + '" viewBox="0 0 2000 880" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="금성 A-501 진공관 라디오 ' + t.label + '">' +
        '<defs>' + soloMaterialDefs("a5") +
        // 베이크라이트 캐비닛 — 상단 곡면 라커 광택과 좌우 입체 셰이딩
        '<linearGradient id="a5Shell" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.shell[0] + '"/><stop offset=".13" stop-color="' + t.shell[1] + '"/>' +
        '<stop offset=".54" stop-color="' + t.shell[2] + '"/><stop offset=".88" stop-color="' + t.shell[3] + '"/>' +
        '<stop offset="1" stop-color="' + t.shellEdge + '"/></linearGradient>' +
        '<linearGradient id="a5ShellSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000000" stop-opacity=".56"/><stop offset=".07" stop-color="#000000" stop-opacity=".18"/>' +
        '<stop offset=".24" stop-color="#ffffff" stop-opacity=".09"/><stop offset=".72" stop-color="#000000" stop-opacity=".08"/>' +
        '<stop offset=".93" stop-color="#000000" stop-opacity=".34"/><stop offset="1" stop-color="#000000" stop-opacity=".68"/></linearGradient>' +
        '<linearGradient id="a5Gloss" x1="0" y1="0" x2=".28" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".34"/><stop offset=".09" stop-color="#ffffff" stop-opacity=".12"/>' +
        '<stop offset=".24" stop-color="#ffffff" stop-opacity=".02"/><stop offset=".48" stop-color="#ffffff" stop-opacity="0"/>' +
        '<stop offset=".88" stop-color="#000000" stop-opacity=".16"/><stop offset="1" stop-color="#000000" stop-opacity=".36"/></linearGradient>' +
        '<linearGradient id="a5Band" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.band[0] + '"/><stop offset=".42" stop-color="' + t.band[1] + '"/><stop offset="1" stop-color="' + t.band[2] + '"/></linearGradient>' +
        // 상아색 인서트 — 따뜻한 빈티지 아이보리 에나멜
        '<linearGradient id="a5Ivory" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.ivory[0] + '"/><stop offset=".5" stop-color="' + t.ivory[1] + '"/><stop offset="1" stop-color="' + t.ivory[2] + '"/></linearGradient>' +
        // 다이얼 바탕 — 은은한 텅스텐 파일럿 램프가 양옆에서 비치는 웜 아이보리 글라스
        '<linearGradient id="a5Glass" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#f8edd0"/><stop offset=".3" stop-color="#efe0b4"/><stop offset=".75" stop-color="#d8c390"/><stop offset="1" stop-color="#bca474"/></linearGradient>' +
        '<radialGradient id="a5DialWarmBase" cx=".48" cy=".42" r=".65">' +
        '<stop offset="0" stop-color="#ffeaa8" stop-opacity=".42"/><stop offset=".52" stop-color="#ffd06e" stop-opacity=".18"/>' +
        '<stop offset="1" stop-color="#9e6d24" stop-opacity=".1"/></radialGradient>' +
        '<radialGradient id="a5EdgeLampL" cx=".08" cy=".34" r=".42">' +
        '<stop offset="0" stop-color="#ffe184" stop-opacity=".56"/><stop offset=".45" stop-color="#ffc152" stop-opacity=".2"/>' +
        '<stop offset="1" stop-color="#ffaa30" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5EdgeLampR" cx=".92" cy=".34" r=".42">' +
        '<stop offset="0" stop-color="#ffe184" stop-opacity=".46"/><stop offset=".45" stop-color="#ffc152" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="#ffaa30" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="a5GlassSheen" x1="0" y1="0" x2=".82" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".56"/><stop offset=".13" stop-color="#ffffff" stop-opacity=".2"/>' +
        '<stop offset=".24" stop-color="#ffffff" stop-opacity=".03"/><stop offset=".48" stop-color="#ffffff" stop-opacity=".14"/>' +
        '<stop offset=".56" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#7c6d52" stop-opacity=".16"/></linearGradient>' +
        '<linearGradient id="a5InsetTop" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#2c2419" stop-opacity=".54"/><stop offset=".26" stop-color="#2c2419" stop-opacity=".14"/>' +
        '<stop offset="1" stop-color="#2c2419" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="a5InsetLeft" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2c2419" stop-opacity=".44"/><stop offset=".35" stop-color="#2c2419" stop-opacity=".08"/>' +
        '<stop offset="1" stop-color="#2c2419" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="a5Yellow" cx=".44" cy=".58" r=".78">' +
        '<stop offset="0" stop-color="#b9873a" stop-opacity="0"/><stop offset=".56" stop-color="#b9873a" stop-opacity=".05"/>' +
        '<stop offset=".85" stop-color="#a9762e" stop-opacity=".14"/><stop offset="1" stop-color="#8a5d22" stop-opacity=".26"/></radialGradient>' +
        '<radialGradient id="a5GrilleShade" cx=".4" cy=".38" r=".82">' +
        '<stop offset=".36" stop-color="#000000" stop-opacity="0"/><stop offset=".76" stop-color="#241e12" stop-opacity=".18"/>' +
        '<stop offset="1" stop-color="#17120a" stop-opacity=".46"/></radialGradient>' +
        '<radialGradient id="a5SpeakerCone" cx=".48" cy=".48" r=".52">' +
        '<stop offset="0" stop-color="#120f0a" stop-opacity=".42"/><stop offset=".56" stop-color="#221c13" stop-opacity=".26"/>' +
        '<stop offset=".86" stop-color="#2e271c" stop-opacity=".1"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5LampWash" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#fff0bc" stop-opacity=".68"/><stop offset=".45" stop-color="#ffd578" stop-opacity=".28"/><stop offset="1" stop-color="#ffb848" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5LampSide" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ffe08c" stop-opacity=".62"/><stop offset=".5" stop-color="#ffb84d" stop-opacity=".22"/><stop offset="1" stop-color="#ff9f30" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5FilGlow" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ffa645" stop-opacity=".62"/><stop offset=".5" stop-color="#e8742a" stop-opacity=".24"/><stop offset="1" stop-color="#c85a1e" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="a5Gold" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fae4a6"/><stop offset=".42" stop-color="' + t.script + '"/><stop offset="1" stop-color="#8b6220"/></linearGradient>' +
        // 직조 천 스피커 그릴 패턴 (모아레 없는 순수 빈티지 바스켓 위브 + 음향 공극 + 금사 하이라이트)
        '<pattern id="a5Cloth" width="14" height="14" patternUnits="userSpaceOnUse">' +
        '<rect width="14" height="14" fill="#2d261b" opacity=".78"/>' +
        '<rect x="0.6" y="1.2" width="6.2" height="4.8" rx="1.4" fill="' + t.clothHi + '" opacity=".92"/>' +
        '<rect x="7.6" y="8.2" width="6.2" height="4.8" rx="1.4" fill="' + t.clothHi + '" opacity=".88"/>' +
        '<rect x="1.2" y="7.6" width="4.8" height="6.2" rx="1.4" fill="' + t.clothMid + '" opacity=".92"/>' +
        '<rect x="8.2" y="0.6" width="4.8" height="6.2" rx="1.4" fill="' + t.clothMid + '" opacity=".88"/>' +
        '<path d="M1 2.2 H6.4 M8 9.2 H13.4" stroke="#fff9e8" stroke-width=".95" opacity=".55"/>' +
        '<path d="M2.2 8 V13.4 M9.2 1 V6.4" stroke="#e5c886" stroke-width=".8" opacity=".42"/>' +
        '<path d="M0.6 5.9 H6.8 M7.6 12.9 H13.8 M5.9 7.6 V13.8 M12.9 0.6 V6.8" stroke="#18130c" stroke-width="1" opacity=".52"/>' +
        '</pattern>' +
        '<radialGradient id="a5LampGlass" cx=".34" cy=".28" r=".85">' +
        '<stop offset="0" stop-color="#6cc088"/><stop offset=".42" stop-color="#2f744b"/><stop offset="1" stop-color="#0d2617"/></radialGradient>' +
        '<clipPath id="a5SpearClip"><path d="M256 566 L1000 538 L1744 566 L1000 594 Z"/></clipPath>' +
        '<clipPath id="a5GlassClip"><rect x="905" y="243" width="845" height="392" rx="7"/></clipPath>' +
        '<clipPath id="a5GrilleClip"><rect x="250" y="243" width="643" height="392" rx="7"/></clipPath>' +
        '<clipPath id="a5ShellClip"><path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z"/></clipPath>' +
        '</defs>' +

        '<rect width="2000" height="880" rx="10" fill="#100f0e"/>' +
        '<ellipse cx="900" cy="390" rx="920" ry="410" fill="#322e29" opacity=".55" filter="url(#soWide)"/>' +
        '<ellipse cx="1000" cy="848" rx="840" ry="34" fill="#000" opacity=".76" filter="url(#soWide)"/>' +

        // ── 캐비닛 — 아래가 넓고 위로 좁아지며 윗면이 완만하게 휜 베이크라이트 하우징
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="#000" opacity=".64" filter="url(#soSoft)" transform="translate(8 14)"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Shell)" stroke="' + t.shellEdge + '" stroke-width="3"/>' +
        '<g clip-path="url(#a5ShellClip)">' +
        mfaTexRect("grainFine", 150, 96, 1700, 704, 0, .15) +
        '<rect x="150" y="96" width="1700" height="704" fill="url(#a5ShellSide)"/>' +
        // 상단 곡면을 따라 흐르는 라커 광택 띠 (좌상단 키 라이트)
        '<path d="M205 210 Q1000 108 1795 210 L1788 264 Q1000 162 212 264 Z" fill="#ffffff" opacity=".16" filter="url(#soSoft)"/>' +
        '<path d="M214 202 Q620 130 1080 132 L1050 156 Q620 154 222 222 Z" fill="#ffffff" opacity=".14" filter="url(#soTight)"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Gloss)"/>' +
        '</g>' +
        // 윗면 — 뒤로 넘어간 곡면 + 선명한 상단 림 하이라이트
        '<path d="M205 200 Q1000 96 1795 200 Q1000 126 205 200 Z" fill="' + t.shellEdge + '" opacity=".85"/>' +
        '<path d="M209 197 Q1000 100 1791 197" fill="none" stroke="' + t.rim + '" stroke-width="3.2" opacity=".78"/>' +
        '<path d="M212 193 Q1000 96 1788 193" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".32"/>' +

        // ── 상아색 인서트 — 브러시드 크롬 베젤 안에 앉힌다
        '<rect x="226" y="220" width="1548" height="440" rx="16" fill="#000" opacity=".58" filter="url(#soTight)"/>' +
        '<rect x="234" y="227" width="1528" height="420" rx="13" fill="url(#soChromeAged)" stroke="#1b1e21" stroke-width="1.6"/>' +
        mfaTexRect("brush", 234, 227, 1528, 420, 13, .28) +
        '<rect x="239" y="232" width="1518" height="410" rx="10" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".42"/>' +
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Ivory)"/>' +
        mfaTexRect("grainFine", 246, 239, 1508, 400, 9, .14) +
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Yellow)"/>' +

        // ── 좌: 직조 천 스피커 그릴 (5인치 드라이버 음영 + 진공관 글로우)
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="' + t.grille + '"/>' +
        // 진공관 불빛은 프레임마다 밝기가 바뀐다 — 독립 그룹 유지
        '<g clip-path="url(#a5GrilleClip)">' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5Cloth)"/>' +
        '<circle cx="572" cy="439" r="186" fill="url(#a5SpeakerCone)"/>' +
        '<ellipse id="a5TubeGlow" cx="572" cy="440" rx="300" ry="210" fill="url(#a5FilGlow)" opacity="0"/>' +
        '</g>' +
        '<g clip-path="url(#a5GrilleClip)" pointer-events="none">' +
        mfaTexRect("grainFine", 250, 243, 643, 392, 0, .14) +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5GrilleShade)"/>' +
        '<rect x="250" y="243" width="643" height="22" fill="url(#a5InsetTop)"/>' +
        '<rect x="250" y="243" width="18" height="392" fill="url(#a5InsetLeft)"/>' +
        '</g>' +
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="none" stroke="#857c65" stroke-width="1.8" opacity=".68"/>' +
        // 금성 왕관 엠블럼 — 직조 천 위로 떠 있는 금속 압인 브라스
        '<g id="a5Crest" transform="translate(312 286) scale(1.35)">' +
        '<path d="M2 32 L6 8 L16 24 L26 2 L36 24 L46 8 L50 32 Z" fill="#1a1105" opacity=".52" filter="url(#soTight)"/>' +
        '<path d="M0 28 L4 4 L14 20 L24 -2 L34 20 L44 4 L48 28 Z" fill="url(#a5Gold)" stroke="#6d4814" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M0 28 L4 4 L14 20 L24 -2" fill="none" stroke="#fff2c8" stroke-width="1.6" opacity=".9"/>' +
        '<rect x="-2" y="29" width="52" height="7" rx="3" fill="url(#a5Gold)" stroke="#6d4814" stroke-width="1.2"/>' +
        '<rect x="-1" y="29.6" width="50" height="2" rx="1" fill="#fff2c8" opacity=".72"/>' +
        '<circle cx="24" cy="-8" r="4.4" fill="#fae2a2" stroke="#6d4814" stroke-width="1"/>' +
        '<circle cx="4" cy="1" r="3" fill="#fae2a2"/><circle cx="44" cy="1" r="3" fill="#fae2a2"/>' +
        '</g>' +

        // ── 우: 다이얼 유리 — 따뜻한 파일럿 램프 글로우와 광학 유리 반사
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="url(#a5Glass)"/>' +
        '<g clip-path="url(#a5GlassClip)">' +
        mfaTexRect("grainFine", 905, 243, 845, 392, 0, .09) +
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5DialWarmBase)" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5EdgeLampL)" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5EdgeLampR)" pointer-events="none"/>' +
        '<g id="a5DialLamp" opacity="0" pointer-events="none">' +
        '<ellipse cx="1330" cy="420" rx="450" ry="235" fill="url(#a5LampWash)"/>' +
        '<ellipse cx="955" cy="360" rx="170" ry="150" fill="url(#a5LampSide)"/>' +
        '<ellipse cx="1695" cy="360" rx="170" ry="150" fill="url(#a5LampSide)"/>' +
        '</g>' +
        // FM 행 (작동 눈금)
        '<text x="922" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="25" font-weight="700" letter-spacing="1" fill="' + t.sub + '">FM</text>' +
        fmTicks +
        '<g id="a5Marks"></g>' +
        // SW 행 (실물 눈금)
        '<text x="922" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="25" font-weight="700" letter-spacing="1" fill="' + t.sub + '">SW</text>' +
        swScale +
        '<text x="1626" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="20" font-weight="600" fill="' + t.sub + '">MHz</text>' +
        '<text x="1626" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="20" font-weight="600" fill="' + t.sub + '">MC</text>' +
        // 바늘 — 유리 뒤에서 살짝 떠 있는 지침과 얇은 투영 그림자
        '<g id="a5Ptr" transform="translate(0,0)">' +
        '<path d="M' + (A5_DIAL.drawX + 4) + ' 264 V469" stroke="#4d412c" stroke-width="4.5" opacity=".28"/>' +
        '<path d="M' + A5_DIAL.drawX + ' 262 V470" stroke="#851d12" stroke-width="3.2"/>' +
        '<path d="M' + (A5_DIAL.drawX + 1) + ' 262 V470" stroke="#f68464" stroke-width="1.2" opacity=".86"/>' +
        '<path d="M' + (A5_DIAL.drawX - 9) + ' 257 L' + (A5_DIAL.drawX + 9) + ' 257 L' + A5_DIAL.drawX + ' 274 Z" fill="#851d12"/>' +
        '<path d="M' + (A5_DIAL.drawX - 6) + ' 259 L' + (A5_DIAL.drawX + 2) + ' 259" stroke="#f68464" stroke-width="1.4" opacity=".78"/>' +
        '</g>' +
        // 현재 방송 이름 — 다이얼 유리에 인쇄된 국명 자리
        '<text id="a5StationText" x="1330" y="516" font-family="Arial" font-size="24" font-weight="600" letter-spacing="1.6" fill="' + t.ink + '" text-anchor="middle" opacity=".9"></text>' +
        '<text x="1332" y="614" font-family="Georgia, serif" font-size="20" font-style="italic" font-weight="700" letter-spacing="3" fill="#fff7e2" opacity=".32" text-anchor="middle">TWO BAND SUPER HETERODYNE</text>' +
        '<text x="1330" y="612" font-family="Georgia, serif" font-size="20" font-style="italic" font-weight="700" letter-spacing="3" fill="' + t.sub + '" text-anchor="middle" opacity=".96">TWO BAND SUPER HETERODYNE</text>' +
        // 광학 유리면 반사 — 좌상단 사선 스윕과 베젤 인셋 음영
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5GlassSheen)" pointer-events="none"/>' +
        '<polygon points="905,243 1190,243 995,635 905,635" fill="#ffffff" opacity=".09" pointer-events="none"/>' +
        '<polygon points="1240,243 1315,243 1120,635 1045,635" fill="#ffffff" opacity=".055" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="22" fill="url(#a5InsetTop)" pointer-events="none"/>' +
        '<rect x="905" y="243" width="18" height="392" fill="url(#a5InsetLeft)" pointer-events="none"/>' +
        '<path d="M916 254 H1738" stroke="#fffbf0" stroke-width="2" opacity=".36" pointer-events="none"/>' +
        '</g>' +
        // 10KC 배지 — 크롬 링 + 에메랄드 유리 돔 동조 표시등
        '<circle cx="1704" cy="294" r="34" fill="#000" opacity=".48" filter="url(#soTight)"/>' +
        '<circle cx="1702" cy="290" r="33" fill="url(#soChrome)" stroke="#1a1d21" stroke-width="1.4"/>' +
        '<circle cx="1702" cy="290" r="28" fill="#0f2417"/>' +
        '<circle id="a5Lamp" cx="1702" cy="290" r="26" fill="url(#a5LampGlass)"/>' +
        '<ellipse cx="1692" cy="278" rx="11" ry="6.5" fill="#f0fff4" opacity=".32" transform="rotate(-20 1692 278)" pointer-events="none"/>' +
        '<text x="1702" y="296" font-family="Arial" font-size="15" font-weight="700" fill="#e8faec" text-anchor="middle" pointer-events="none">10KC</text>' +
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="none" stroke="#857c65" stroke-width="1.8" opacity=".68"/>' +

        // ── 스피어 몰딩 — 날카로운 상하 패싯과 브러시드 크롬 광택
        '<path d="M256 576 L1000 552 L1744 576 L1000 603 Z" fill="#000" opacity=".42" filter="url(#soTight)"/>' +
        '<path d="M256 566 L1000 538 L1744 566 L1000 594 Z" fill="url(#soChromeAged)" stroke="#25292d" stroke-width="1.8"/>' +
        // 상단 밝은 패싯 / 하단 어두운 패싯으로 마름모 단면 입체감 확보
        '<path d="M256 566 L1000 538 L1744 566 L1000 566 Z" fill="#ffffff" opacity=".24" pointer-events="none"/>' +
        '<path d="M256 566 L1000 566 L1744 566 L1000 594 Z" fill="#0e1216" opacity=".26" pointer-events="none"/>' +
        '<g clip-path="url(#a5SpearClip)" pointer-events="none">' +
        mfaTexRect("brush", 256, 536, 1488, 60, 0, .28) +
        '</g>' +
        '<path d="M300 563 L1000 542 L1700 563" fill="none" stroke="#ffffff" stroke-width="3.6" opacity=".72" stroke-linecap="round"/>' +
        '<path d="M280 566 H1720" fill="none" stroke="#f4f6f2" stroke-width="1.6" opacity=".62"/>' +
        '<path d="M310 580 L1000 589 L1690 580" fill="none" stroke="#181c21" stroke-width="2.2" opacity=".56"/>' +

        // 다이얼 드래그 히트존
        '<rect id="a5DialHit" x="930" y="252" width="800" height="230" fill="#000" fill-opacity="0" style="cursor:ew-resize;touch-action:none" tabindex="0" role="slider" aria-label="주파수 다이얼 — 드래그하여 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>드래그하여 주파수를 맞추세요</title></rect>' +

        // ── 하단 어두운 띠 — 로고와 세 노브
        '<rect x="196" y="647" width="1608" height="153" fill="url(#a5Band)"/>' +
        '<rect x="196" y="647" width="1608" height="153" fill="url(#a5ShellSide)" opacity=".45" pointer-events="none"/>' +
        mfaTexRect("grainFine", 196, 647, 1608, 153, 0, .2) +
        '<rect x="196" y="647" width="1608" height="4" fill="#ffffff" opacity=".18"/>' +
        '<rect x="196" y="651" width="1608" height="6" fill="#000000" opacity=".28"/>' +
        '<rect x="196" y="794" width="1608" height="6" fill="#000000" opacity=".5"/>' +
        // 좌측 크롬 장식 배지
        '<rect x="264" y="692" width="54" height="32" rx="4" fill="#000" opacity=".52" filter="url(#soTight)"/>' +
        '<rect x="262" y="688" width="54" height="32" rx="4" fill="url(#soChromeV)" stroke="#0d0d0e" stroke-width="1.5"/>' +
        mfaTexRect("brushFine", 262, 688, 54, 32, 4, .26) +
        '<rect x="277" y="694" width="11" height="20" rx="2" fill="#14161a"/>' +
        // 금박 양각 GoldStar 스크립트
        '<text x="382" y="745" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#1a1104" opacity=".7">GoldStar</text>' +
        '<text x="380" y="742" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="url(#a5Gold)">GoldStar</text>' +
        '<text x="379.5" y="740.5" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#fff2c8" opacity=".26">GoldStar</text>' +
        '<path d="M382 753 Q520 769 660 749" fill="none" stroke="#1a1104" stroke-width="3" opacity=".45"/>' +
        '<path d="M382 751 Q520 767 660 747" fill="none" stroke="url(#a5Gold)" stroke-width="2.6" opacity=".88"/>' +
        soloKnob(1146, 716, 42, "a5Vol") +
        soloKnob(1420, 716, 42, "a5Sel") +
        soloKnob(1694, 716, 42, "a5Tune") +
        '<g font-family="Arial" font-size="15" font-weight="600" letter-spacing="2.2" fill="' + t.bandInk + '" text-anchor="middle">' +
        '<text x="1146" y="788">VOLUME</text><text x="1420" y="788">SELECT</text><text x="1694" y="788">TUNER</text></g>' +
        '<g font-family="Arial" font-size="15" font-weight="700" letter-spacing="1.4" fill="' + t.bandInk + '" text-anchor="middle">' +
        '<text id="a5SelSc" x="1350" y="684" opacity=".32">SC</text>' +
        '<text id="a5SelPu" x="1420" y="668" opacity=".16">PU</text>' +
        '<text id="a5SelSw" x="1490" y="684" opacity=".32">SW</text>' +
        '</g>' +
        '<g fill="' + t.bandInk + '" opacity=".35"><circle cx="1372" cy="700" r="2.6"/><circle cx="1420" cy="690" r="2.6"/><circle cx="1468" cy="700" r="2.6"/></g>' +
        '<circle id="a5VolHit" cx="1146" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="음량 — 좌우로 끌어 조절, 왼쪽 끝은 전원 OFF" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><title>VOLUME — 좌우로 끌어 음량 조절 (반시계 끝 = 전원 OFF)</title></circle>' +
        '<circle id="a5SelHit" cx="1420" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="밴드 선택 — SC 방송 · SW 단파"><title>SELECT — SC(방송 수신) · SW(단파). PU(픽업 입력)는 연결된 기기가 없습니다</title></circle>' +
        '<circle id="a5TuneHit" cx="1694" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="선국 노브 — 좌우로 끌어 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>TUNER — 좌우로 끌어 선국하세요</title></circle>' +

        // ── 다리 — 아래로 벌어진 두 발 + 접지 그림자
        '<ellipse cx="394" cy="868" rx="68" ry="11" fill="#000" opacity=".72" filter="url(#soTight)"/>' +
        '<ellipse cx="1610" cy="868" rx="68" ry="11" fill="#000" opacity=".72" filter="url(#soTight)"/>' +
        '<path d="M404 798 L472 798 L440 866 L344 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M408 802 L462 802 L437 856" fill="none" stroke="#ffffff" stroke-width="2" opacity=".16"/>' +
        '<path d="M1528 798 L1596 798 L1656 866 L1560 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M1536 802 L1590 802 L1628 856" fill="none" stroke="#ffffff" stroke-width="2" opacity=".14"/>' +
        '<text x="1804" y="838" font-family="Arial" font-size="13" letter-spacing="1.6" fill="' + t.bandInk + '" opacity=".55" text-anchor="end">金星社 &#183; A-501 &#183; AC 5球 &#183; 1959</text>' +
        soloFilmGrade(0, 0, 2000, 880) +
        '</svg>';
}

// ===================================================================
// Lasonic TRC-931 — 1985 붐박스
// ===================================================================
// 실물 전면 구조: 크롬 파이프 손잡이 아래 3밴드(FM·AM·SW) 튜너 스케일이 전폭으로
// 지나가고, 그 밑에 좌(볼륨·밸런스·FUNCTION)/중(5밴드 그래픽 EQ)/우(ON-OFF·녹음·
// 밴드 셀렉터) 조작부가 늘어선다. 중앙 세로로 오토리버스 데크 A → 카운터·LASONIC
// 로고 → 데크 B → 피아노 키가 쌓이고, 양옆을 크롬 3스포크 그릴의 대형 우퍼가
// 채운다. 모서리에는 콘 트위터. 검은 사출 캐비닛에 크롬 포인트가 80년대 문법이다.
const BB_DIAL = { x88: 560, px: 44, y0: 296 };                        // FM 88~108MHz → x 560..1440
const BB_EQ = { xs: [712, 806, 900, 994, 1088], y0: 470, y1: 574 };   // 5밴드 슬롯 (0dB = 522)

function mfaBoomboxSvg() {
    // ── 튜너 스케일 세 줄 — 유리 뒤 인쇄물이라 밝은 그림자를 함께 찍지 않는다(뒤가 어둡다)
    const fmRow = (() => {
        let out = '<text x="447" y="308" font-family="Arial" font-size="13" font-weight="700" fill="#e8e6df">FM</text>';
        for (let f = 88; f <= 108; f++) {
            const x = (BB_DIAL.x88 + (f - 88) * BB_DIAL.px).toFixed(1);
            const major = f % 2 === 0;
            out += '<path d="M' + x + ' ' + (major ? 299 : 302) + ' V311" stroke="' + (major ? "#d8d6cf" : "#8a8d92") +
                '" stroke-width="' + (major ? 2 : 1.2) + '" opacity="' + (major ? ".85" : ".55") + '"/>';
            if (major) out += '<text x="' + x + '" y="294" font-family="Arial" font-size="15" font-weight="700" fill="#d8d6cf" text-anchor="middle">' + f + '</text>';
        }
        out += '<text x="1500" y="308" font-family="Arial" font-size="9" fill="#9aa0a6">MHz</text>';
        return out;
    })();
    const amRow = (() => {
        const vals = ["53", "60", "70", "80", "90", "100", "120", "140", "160"];
        let out = '<text x="447" y="348" font-family="Arial" font-size="13" font-weight="700" fill="#b8bcc2">AM</text>';
        vals.forEach((v, i) => {
            const x = (560 + i * (880 / (vals.length - 1))).toFixed(1);
            out += '<path d="M' + x + ' 342 V349" stroke="#9aa0a6" stroke-width="1.2" opacity=".55"/>' +
                '<text x="' + x + '" y="337" font-family="Arial" font-size="12.5" fill="#b8bcc2" text-anchor="middle">' + v + '</text>';
        });
        out += '<text x="1500" y="348" font-family="Arial" font-size="8" fill="#9aa0a6">x10KHz</text>';
        return out;
    })();
    const swRow = (() => {
        const vals = ["4.0", "4.5", "5", "5.5", "6", "7", "8", "9.5", "12"];
        let out = '<text x="447" y="382" font-family="Arial" font-size="13" font-weight="700" fill="#9aa0a6">SW</text>';
        vals.forEach((v, i) => {
            const x = (560 + i * (880 / (vals.length - 1))).toFixed(1);
            out += '<path d="M' + x + ' 372 V378" stroke="#7a7d84" stroke-width="1.2" opacity=".5"/>' +
                '<text x="' + x + '" y="368" font-family="Arial" font-size="11.5" fill="#9aa0a6" text-anchor="middle">' + v + '</text>';
        });
        out += '<text x="1500" y="382" font-family="Arial" font-size="8" fill="#9aa0a6">MHz</text>';
        return out;
    })();

    // ── 5밴드 EQ 슬라이더 (붙박이 + 캡은 런타임이 translate)
    const eqLabels = ["80Hz", "250Hz", "1KHz", "3.5KHz", "10KHz"];
    const eqSliders = BB_EQ.xs.map((x, i) => {
        let out = '<rect x="' + (x - 5.5) + '" y="' + (BB_EQ.y0 - 1) + '" width="11" height="' + (BB_EQ.y1 - BB_EQ.y0 + 2) + '" rx="5.5" fill="#020304" stroke="#2c3037" stroke-width="1"/>' +
            '<rect x="' + (x - 4) + '" y="' + BB_EQ.y0 + '" width="8" height="' + (BB_EQ.y1 - BB_EQ.y0) + '" rx="4" fill="#050608"/>' +
            '<rect x="' + (x - 1) + '" y="' + (BB_EQ.y0 + 2) + '" width="2" height="' + (BB_EQ.y1 - BB_EQ.y0 - 4) + '" fill="#4a4e57" opacity=".28"/>' +
            '<rect x="' + (x - 16) + '" y="521" width="32" height="2" fill="#6b707a" opacity=".65"/>';
        for (let db = -10; db <= 10; db += 5) {
            if (db === 0) continue;
            const y = (522 - db * 5.2).toFixed(1);
            out += '<rect x="' + (x - 14) + '" y="' + y + '" width="5.5" height="1.5" fill="#5b606a" opacity=".48"/>' +
                '<rect x="' + (x + 8.5) + '" y="' + y + '" width="5.5" height="1.5" fill="#5b606a" opacity=".48"/>';
        }
        out += '<g id="bbEqCap' + i + '">' +
            '<rect x="' + (x - 13) + '" y="512" width="28" height="29" rx="4" fill="#000" opacity=".6" filter="url(#soTight)"/>' +
            '<rect x="' + (x - 14.5) + '" y="508.5" width="29" height="29" rx="4" fill="url(#bbEqCapG)" stroke="#050608" stroke-width="1.5"/>' +
            mfaTexRect("brushFine", x - 14, 509, 28, 28, 3.5, .28) +
            '<rect x="' + (x - 13.5) + '" y="509.5" width="27" height="3" rx="1.5" fill="#aeb4be" opacity=".52"/>' +
            '<rect x="' + (x - 11.5) + '" y="514.5" width="23" height="1.4" fill="#060709" opacity=".78"/>' +
            '<rect x="' + (x - 11.5) + '" y="518" width="23" height="1.2" fill="#060709" opacity=".6"/>' +
            '<rect x="' + (x - 14.5) + '" y="521.5" width="29" height="3.2" fill="#e24538"/>' +
            '<rect x="' + (x - 13) + '" y="521.8" width="26" height="1" fill="#ff9e92" opacity=".65"/>' +
            '<rect x="' + (x - 11.5) + '" y="527.5" width="23" height="1.2" fill="#060709" opacity=".65"/>' +
            '<rect x="' + (x - 11.5) + '" y="531" width="23" height="1.4" fill="#060709" opacity=".82"/>' +
            '<rect x="' + (x - 13.5) + '" y="534.5" width="27" height="2" rx="1" fill="#000" opacity=".55"/>' +
            '</g>' +
            '<rect id="bbEqHit' + i + '" x="' + (x - 32) + '" y="458" width="64" height="130" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none" tabindex="0" role="slider" aria-label="EQ ' + eqLabels[i] + ' — 위아래로 끌어 조절" aria-valuemin="-10" aria-valuemax="10" aria-valuenow="0"><title>' + eqLabels[i] + ' ±10dB</title></rect>' +
            '<text x="' + x + '" y="595" font-family="Arial" font-size="11" fill="#c4c7c9" text-anchor="middle">' + eqLabels[i] + '</text>';
        return out;
    }).join("");

    // ── 콘 트위터 (모서리) — 크롬 링 + 타공 메탈 그릴 + 우퍼와 통일된 콘·더스트캡 + 가로 크롬 바
    const twt = (cx, clip) =>
        '<ellipse cx="' + (cx + 4) + '" cy="513" rx="59" ry="57" fill="#000" opacity=".58" filter="url(#soSoft)"/>' +
        '<circle cx="' + cx + '" cy="506" r="55" fill="url(#soChrome)" stroke="#08090b" stroke-width="2"/>' +
        '<circle cx="' + cx + '" cy="506" r="51" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".4"/>' +
        '<circle cx="' + cx + '" cy="506" r="46" fill="#07080a" stroke="#000" stroke-width="1.8"/>' +
        '<circle cx="' + cx + '" cy="506" r="36" fill="url(#bbSurround)" opacity=".85"/>' +
        '<circle cx="' + cx + '" cy="506" r="29" fill="url(#bbCone)" opacity=".75"/>' +
        '<circle cx="' + cx + '" cy="506" r="11" fill="url(#bbCap)"/>' +
        '<circle cx="' + cx + '" cy="506" r="46" fill="url(#bbMesh)" opacity=".88"/>' +
        '<g clip-path="url(#' + clip + ')">' +
        '<g transform="translate(2 5)" opacity=".55" filter="url(#soTight)">' +
        '<rect x="' + (cx - 52) + '" y="488" width="104" height="10" rx="5" fill="#000"/>' +
        '<rect x="' + (cx - 52) + '" y="514" width="104" height="10" rx="5" fill="#000"/>' +
        '</g>' +
        '<rect x="' + (cx - 52) + '" y="488" width="104" height="10" rx="5" fill="url(#soChromeV)" stroke="#0d0f12" stroke-width="1"/>' +
        '<rect x="' + (cx - 52) + '" y="514" width="104" height="10" rx="5" fill="url(#soChromeV)" stroke="#0d0f12" stroke-width="1"/>' +
        '<rect x="' + (cx - 48) + '" y="489.5" width="96" height="2" rx="1" fill="#ffffff" opacity=".65"/>' +
        '<rect x="' + (cx - 48) + '" y="515.5" width="96" height="2" rx="1" fill="#ffffff" opacity=".65"/>' +
        '</g>' +
        '<circle cx="' + cx + '" cy="506" r="46" fill="url(#bbSpkShade)"/>' +
        '<path d="M' + (cx - 40) + ' 480 A48 48 0 0 1 ' + (cx - 4) + ' 459" fill="none" stroke="#ffffff" stroke-width="3" opacity=".32" stroke-linecap="round"/>';

    // ── 대형 우퍼 — 크롬 트림 링 + 서라운드·골드 립 콘·더스트캡 + 타공 메탈 그릴 + 크롬 3스포크(그림자 포함)
    const speaker = (cx, clip) =>
        '<ellipse cx="' + (cx + 10) + '" cy="935" rx="304" ry="292" fill="#000" opacity=".6" filter="url(#soSoft)"/>' +
        '<circle cx="' + cx + '" cy="915" r="306" fill="none" stroke="#000" stroke-width="8" opacity=".48"/>' +
        '<circle cx="' + cx + '" cy="915" r="298" fill="#090a0c"/>' +
        // 외곽 크롬 베젤 링
        '<circle cx="' + cx + '" cy="915" r="298" fill="none" stroke="url(#soChrome)" stroke-width="14"/>' +
        '<path d="M' + (cx - 242) + ' 742 A298 298 0 0 1 ' + (cx + 95) + ' 633" fill="none" stroke="#ffffff" stroke-width="3.2" opacity=".55" stroke-linecap="round"/>' +
        '<circle cx="' + cx + '" cy="915" r="290.5" fill="none" stroke="#040508" stroke-width="3.2" opacity=".88"/>' +
        '<circle cx="' + cx + '" cy="915" r="305" fill="none" stroke="#1f2228" stroke-width="2" opacity=".68"/>' +
        // 깊은 스피커 인클로저 웰
        '<circle cx="' + cx + '" cy="915" r="284" fill="#08090b"/>' +
        // 롤 서라운드 (볼록한 고무/폼 서스펜션 링)
        '<circle cx="' + cx + '" cy="915" r="256" fill="url(#bbSurround)"/>' +
        '<circle cx="' + cx + '" cy="915" r="256" fill="none" stroke="#040507" stroke-width="5" opacity=".8"/>' +
        '<path d="M' + (cx - 196) + ' 775 A240 240 0 0 1 ' + (cx + 96) + ' 696" fill="none" stroke="#5b6069" stroke-width="8" opacity=".32" filter="url(#soTight)" stroke-linecap="round"/>' +
        // 리브드 골드-브론즈 우퍼 콘 + 종이 질감
        '<circle cx="' + cx + '" cy="915" r="220" fill="url(#bbCone)"/>' +
        mfaTexCircle("grainFine", cx, 915, 220, .28) +
        '<circle cx="' + cx + '" cy="915" r="220" fill="none" stroke="#070503" stroke-width="6" opacity=".65"/>' +
        // 동심원 콘 보강 리브 (어두운 홈 + 좌상단 미세 하이라이트)
        '<circle cx="' + cx + '" cy="915" r="188" fill="none" stroke="#000" stroke-width="2.6" opacity=".28"/>' +
        '<circle cx="' + (cx - 1.5) + '" cy="913.5" r="188" fill="none" stroke="#e2c88c" stroke-width="1.2" opacity=".16"/>' +
        '<circle cx="' + cx + '" cy="915" r="154" fill="none" stroke="#000" stroke-width="2.4" opacity=".26"/>' +
        '<circle cx="' + (cx - 1.5) + '" cy="913.5" r="154" fill="none" stroke="#e2c88c" stroke-width="1.1" opacity=".14"/>' +
        '<circle cx="' + cx + '" cy="915" r="120" fill="none" stroke="#000" stroke-width="2.2" opacity=".24"/>' +
        '<circle cx="' + (cx - 1.5) + '" cy="913.5" r="120" fill="none" stroke="#e2c88c" stroke-width="1" opacity=".12"/>' +
        // 돔형 더스트 캡 + 접착 링 그림자 + 하이라이트
        '<circle cx="' + (cx + 4) + '" cy="921" r="66" fill="#000" opacity=".55" filter="url(#soTight)"/>' +
        '<circle cx="' + cx + '" cy="915" r="64" fill="url(#bbCap)" stroke="#050506" stroke-width="2.5"/>' +
        mfaTexCircle("grainFine", cx, 915, 62, .22) +
        '<ellipse cx="' + (cx - 20) + '" cy="892" rx="24" ry="15" fill="#ffffff" opacity=".18" transform="rotate(-22 ' + (cx - 20) + ' 892)"/>' +
        // 타공 메탈 그릴 (깊이감 있는 블랙 새틴 펀칭 메시 + 광택)
        '<circle cx="' + cx + '" cy="915" r="284" fill="#040508" opacity=".22"/>' +
        '<circle cx="' + cx + '" cy="915" r="284" fill="url(#bbMesh)"/>' +
        '<circle cx="' + cx + '" cy="915" r="284" fill="url(#bbMeshSheen)"/>' +
        '<circle cx="' + cx + '" cy="915" r="284" fill="url(#bbSpkShade)"/>' +
        // 3스포크 크롬 바 + 메시 위로 떨어지는 입체 그림자
        '<g clip-path="url(#' + clip + ')">' +
        '<g transform="translate(8 14)" opacity=".58" filter="url(#soSoft)">' +
        [0, 47, -47].map((ang) =>
            '<rect x="' + (cx - 292) + '" y="896" width="584" height="38" rx="19" fill="#000" transform="rotate(' + ang + ' ' + cx + ' 915)"/>'
        ).join("") +
        '</g>' +
        [0, 47, -47].map((ang) =>
            '<g transform="rotate(' + ang + ' ' + cx + ' 915)">' +
            '<rect x="' + (cx - 292) + '" y="896" width="584" height="38" rx="19" fill="url(#soChromeV)" stroke="#0b0d11" stroke-width="2.4"/>' +
            mfaTexRect("brush", cx - 290, 897, 580, 36, 18, .22) +
            '<rect x="' + (cx - 290) + '" y="899.5" width="580" height="5.5" rx="2.7" fill="#ffffff" opacity=".68"/>' +
            '<rect x="' + (cx - 290) + '" y="925.5" width="580" height="4.5" rx="2.2" fill="#090b0f" opacity=".72"/>' +
            '</g>').join("") +
        '</g>' +
        // 스포크 가장자리 인클로저 비네팅
        '<circle cx="' + cx + '" cy="915" r="284" fill="url(#bbSpkShade)" opacity=".78"/>' +
        // 중앙 크롬 허브 메달리온 + 스핀 캡 + 체결 나사
        '<circle cx="' + (cx + 4) + '" cy="921" r="56" fill="#000" opacity=".55" filter="url(#soTight)"/>' +
        '<circle cx="' + cx + '" cy="915" r="54" fill="url(#soChrome)" stroke="#090a0d" stroke-width="3"/>' +
        '<circle cx="' + cx + '" cy="915" r="44" fill="url(#soCapDark)" stroke="#050608" stroke-width="1.5"/>' +
        mfaTexCircle("spun", cx, 915, 42, .45) +
        '<circle cx="' + cx + '" cy="915" r="41" fill="url(#soKnurl)" opacity=".28"/>' +
        soloScrew(cx, 915, 9, true) +
        '<path d="M' + (cx - 44) + ' 888 A54 54 0 0 1 ' + (cx - 2) + ' 861" fill="none" stroke="#ffffff" stroke-width="4" opacity=".42" stroke-linecap="round"/>';

    // ── 트랜스포트 피아노 키 6개 — REW · PLAY · F.FWD · REC · STOP/EJ · PAUSE
    const keyDefs = [
        { id: "bbKeyRew", label: "REW", tag: "", glyph: "rew", title: "되감기 — 이전 곡" },
        { id: "bbKeyPlay", label: "PLAY", tag: "#d9ba43", glyph: "play", title: "PLAY — 테이프(음반) 재생" },
        { id: "bbKeyFf", label: "F.FWD", tag: "", glyph: "ff", title: "빨리감기 — 다음 곡" },
        { id: "bbKeyRec", label: "REC", tag: "#b5342a", glyph: "rec", title: "녹음 — 방지 탭이 부러져 있다" },
        { id: "bbKeyStop", label: "STOP/EJ", tag: "", glyph: "stop", title: "정지 — 멈춘 상태에서 한 번 더 누르면 EJECT(테이프 교체)" },
        { id: "bbKeyPause", label: "PAUSE", tag: "", glyph: "pause", title: "일시정지" }
    ];
    const keyGlyph = (kc, glyph) => {
        if (glyph === "rew") return '<path d="M' + (kc + 12) + ' 1038 L' + (kc - 1) + ' 1047 L' + (kc + 12) + ' 1056 Z M' + (kc - 1) + ' 1038 L' + (kc - 14) + ' 1047 L' + (kc - 1) + ' 1056 Z" fill="#eceae4"/>';
        if (glyph === "ff") return '<path d="M' + (kc - 12) + ' 1038 L' + (kc + 1) + ' 1047 L' + (kc - 12) + ' 1056 Z M' + (kc + 1) + ' 1038 L' + (kc + 14) + ' 1047 L' + (kc + 1) + ' 1056 Z" fill="#eceae4"/>';
        if (glyph === "play") return '<path d="M' + (kc - 7) + ' 1037 L' + (kc + 10) + ' 1047 L' + (kc - 7) + ' 1057 Z" fill="#eceae4"/>';
        if (glyph === "rec") return '<circle cx="' + kc + '" cy="1047" r="7.5" fill="#e04638" stroke="#5c130c" stroke-width="1.5"/>';
        if (glyph === "stop") return '<rect x="' + (kc - 7.5) + '" y="1039.5" width="15" height="15" fill="#eceae4"/>';
        return '<rect x="' + (kc - 8.5) + '" y="1039" width="6" height="16" fill="#eceae4"/><rect x="' + (kc + 2.5) + '" y="1039" width="6" height="16" fill="#eceae4"/>';
    };
    const keys = '<rect x="767" y="1014" width="474" height="60" rx="7" fill="#040507" stroke="#22252b" stroke-width="1.2"/>' +
        keyDefs.map((k, i) => {
            const x = 772 + i * 78;
            const kc = x + 37;
            const label = k.tag
                ? '<rect x="' + (kc - 26) + '" y="999" width="52" height="14" rx="2.5" fill="' + k.tag + '"/>' +
                  '<text x="' + kc + '" y="1009.5" font-family="Arial" font-size="8" font-weight="700" letter-spacing="1" fill="' + (k.tag === "#d9ba43" ? "#14120a" : "#f6efe4") + '" text-anchor="middle">' + k.label + '</text>'
                : '<text x="' + kc + '" y="1009.5" font-family="Arial" font-size="10" font-weight="600" letter-spacing=".7" fill="#d5d6d4" text-anchor="middle">' + k.label + '</text>';
            return label +
                '<g id="' + k.id + 'G">' +
                '<rect x="' + x + '" y="1018" width="74" height="52" rx="5" fill="url(#bbKey)" stroke="#050608" stroke-width="1.5"/>' +
                mfaTexRect("grainFine", x + 1, 1019, 72, 50, 4, .22) +
                '<rect x="' + (x + 2) + '" y="1019.5" width="70" height="7" rx="3.5" fill="#7c828d" opacity=".46"/>' +
                '<path d="M' + (x + 5) + ' 1020 H' + (x + 69) + '" stroke="#ffffff" stroke-width="1.2" opacity=".32"/>' +
                '<rect x="' + (x + 2) + '" y="1062" width="70" height="6.5" rx="3" fill="#000" opacity=".52"/>' +
                keyGlyph(kc, k.glyph) +
                '</g>' +
                '<rect id="' + k.id + '" x="' + x + '" y="1012" width="74" height="62" fill="#000" fill-opacity="0" style="cursor:pointer"><title>' + k.title + '</title></rect>';
        }).join("");

    // ── 카세트 허브 — 흰 톱니 링 + 3스포크 (데크 B만 런타임이 돌린다)
    const hub = (id, cx, cy) =>
        '<g id="' + id + '">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="#0d0e10" stroke="#e2dcd0" stroke-width="3.5"/>' +
        '<g fill="#e2dcd0">' +
        '<rect x="' + (cx - 1.5) + '" y="' + (cy - 13) + '" width="3" height="26"/>' +
        '<rect x="' + (cx - 1.5) + '" y="' + (cy - 13) + '" width="3" height="26" transform="rotate(60 ' + cx + ' ' + cy + ')"/>' +
        '<rect x="' + (cx - 1.5) + '" y="' + (cy - 13) + '" width="3" height="26" transform="rotate(120 ' + cx + ' ' + cy + ')"/>' +
        '</g></g>';

    return '<svg class="solo-svg bb-svg" viewBox="0 0 2000 1330" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Lasonic TRC-931 붐박스">' +
        '<defs>' + soloMaterialDefs("bb") +
        '<linearGradient id="bbWall" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#25221e"/><stop offset=".55" stop-color="#151311"/><stop offset="1" stop-color="#0a0908"/></linearGradient>' +
        '<linearGradient id="bbBody" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#313338"/><stop offset=".08" stop-color="#26282d"/><stop offset=".45" stop-color="#1a1b20"/>' +
        '<stop offset=".86" stop-color="#0f1014"/><stop offset="1" stop-color="#08090b"/></linearGradient>' +
        '<linearGradient id="bbSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000000" stop-opacity=".5"/><stop offset=".06" stop-color="#000000" stop-opacity=".14"/>' +
        '<stop offset=".26" stop-color="#ffffff" stop-opacity=".045"/><stop offset=".72" stop-color="#000000" stop-opacity=".06"/>' +
        '<stop offset=".94" stop-color="#000000" stop-opacity=".28"/><stop offset="1" stop-color="#000000" stop-opacity=".6"/></linearGradient>' +
        '<linearGradient id="bbInset" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#0a0b0d"/><stop offset=".3" stop-color="#111317"/><stop offset="1" stop-color="#0b0c0f"/></linearGradient>' +
        '<linearGradient id="bbPanel" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#22242a"/><stop offset=".48" stop-color="#15171c"/><stop offset="1" stop-color="#0e0f13"/></linearGradient>' +
        '<linearGradient id="bbGlass" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1a2127"/><stop offset=".42" stop-color="#11171c"/><stop offset="1" stop-color="#0a0e12"/></linearGradient>' +
        '<linearGradient id="bbDialGloss" x1="0" y1="0" x2=".9" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".14"/><stop offset=".2" stop-color="#ffffff" stop-opacity=".04"/>' +
        '<stop offset=".42" stop-color="#ffffff" stop-opacity="0"/><stop offset=".6" stop-color="#ffffff" stop-opacity=".07"/>' +
        '<stop offset=".68" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".16"/></linearGradient>' +
        '<linearGradient id="bbTapeGlass" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1c2f36"/><stop offset=".5" stop-color="#121f24"/><stop offset="1" stop-color="#0a1216"/></linearGradient>' +
        '<linearGradient id="bbDoor" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#1c1e24"/><stop offset=".55" stop-color="#13151a"/><stop offset="1" stop-color="#0d0e12"/></linearGradient>' +
        '<linearGradient id="bbKey" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#5a5f68"/><stop offset=".22" stop-color="#363a42"/><stop offset=".72" stop-color="#1b1d22"/><stop offset="1" stop-color="#0b0c0f"/></linearGradient>' +
        '<linearGradient id="bbEqCapG" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#696e78"/><stop offset=".16" stop-color="#3d414a"/><stop offset=".48" stop-color="#1f2228"/>' +
        '<stop offset=".52" stop-color="#2c3038"/><stop offset=".85" stop-color="#17191e"/><stop offset="1" stop-color="#0a0b0e"/></linearGradient>' +
        '<linearGradient id="bbTrim" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#484d56"/><stop offset=".18" stop-color="#d2d7de"/><stop offset=".38" stop-color="#7c828c"/>' +
        '<stop offset=".58" stop-color="#eef1f5"/><stop offset=".82" stop-color="#6e747e"/><stop offset="1" stop-color="#343840"/></linearGradient>' +
        // 세로로 선 크롬 원기둥 — 명암 띠가 좌우로 갈린다 (손잡이 스트럿·힌지 너클)
        '<linearGradient id="bbChromeH" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2c3037"/><stop offset=".16" stop-color="#f0f4f8"/><stop offset=".36" stop-color="#7c838e"/>' +
        '<stop offset=".54" stop-color="#ffffff"/><stop offset=".76" stop-color="#6e7580"/><stop offset="1" stop-color="#22262c"/></linearGradient>' +
        // 손잡이 고무 그립 — 위가 밝고 아래로 말려 들어가는 원통
        '<linearGradient id="bbGrip" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#474c54"/><stop offset=".24" stop-color="#282b31"/><stop offset=".72" stop-color="#131519"/><stop offset="1" stop-color="#090a0d"/></linearGradient>' +
        // 우퍼 서라운드 (토로이드 롤 서스펜션 — 좌상단 고무 광택이 읽히도록 명암 강화)
        '<radialGradient id="bbSurround" cx=".44" cy=".42" r=".56">' +
        '<stop offset=".73" stop-color="#07080a"/><stop offset=".81" stop-color="#30353e"/>' +
        '<stop offset=".88" stop-color="#4e5460"/><stop offset=".95" stop-color="#181b20"/><stop offset="1" stop-color="#050608"/></radialGradient>' +
        // 우퍼 콘 — 좌상단 키 라이트와 우하단 음영이 뚜렷한 메탈릭 골드-브론즈 종이 콘
        '<radialGradient id="bbCone" cx=".36" cy=".34" r=".72">' +
        '<stop offset="0" stop-color="#cba96a"/><stop offset=".32" stop-color="#967d49"/>' +
        '<stop offset=".68" stop-color="#4e3d24"/><stop offset="1" stop-color="#161008"/></radialGradient>' +
        '<radialGradient id="bbCap" cx=".32" cy=".28" r=".92">' +
        '<stop offset="0" stop-color="#766e5e"/><stop offset=".42" stop-color="#312c24"/><stop offset=".82" stop-color="#13110e"/><stop offset="1" stop-color="#060605"/></radialGradient>' +
        '<radialGradient id="bbSpkShade" cx=".42" cy=".38" r=".82">' +
        '<stop offset=".48" stop-color="#000000" stop-opacity="0"/><stop offset=".8" stop-color="#000000" stop-opacity=".28"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity=".64"/></radialGradient>' +
        '<linearGradient id="bbMeshSheen" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".1"/><stop offset=".34" stop-color="#ffffff" stop-opacity=".02"/>' +
        '<stop offset=".68" stop-color="#000000" stop-opacity=".05"/><stop offset="1" stop-color="#000000" stop-opacity=".2"/></linearGradient>' +
        // 타공 메탈 그릴 — 육각 엇갈림 펀칭 + 구멍 하단 메탈 립 하이라이트로 두께감 표현
        '<pattern id="bbMesh" width="14" height="12" patternUnits="userSpaceOnUse">' +
        '<rect width="14" height="12" fill="#181a1f" opacity=".28"/>' +
        '<g fill="#737984" opacity=".36"><circle cx="3.5" cy="3.9" r="3.1"/><circle cx="10.5" cy="9.9" r="3.1"/></g>' +
        '<g fill="#030406" opacity=".88"><circle cx="3.5" cy="3" r="3.1"/><circle cx="10.5" cy="9" r="3.1"/></g></pattern>' +
        '<clipPath id="bbSpkClipL"><circle cx="455" cy="915" r="290"/></clipPath>' +
        '<clipPath id="bbSpkClipR"><circle cx="1545" cy="915" r="290"/></clipPath>' +
        '<clipPath id="bbTwClipL"><circle cx="228" cy="506" r="47"/></clipPath>' +
        '<clipPath id="bbTwClipR"><circle cx="1772" cy="506" r="47"/></clipPath>' +
        '</defs>' +

        // ── 배경과 접지
        '<rect x="0" y="0" width="2000" height="1330" fill="url(#bbWall)"/>' +
        '<ellipse cx="860" cy="460" rx="900" ry="480" fill="#322f2a" opacity=".26" filter="url(#soWide)"/>' +
        '<rect x="0" y="1270" width="2000" height="60" fill="#0b0a09"/>' +
        '<ellipse cx="1000" cy="1296" rx="810" ry="30" fill="#000" opacity=".68" filter="url(#soWide)"/>' +

        // ── 크롬 파이프 손잡이 (몸통 뒤로 꽂힌다) — 스트럿·엘보·그립 슬리브의 3부 구성
        '<path d="M500 268 V158 Q500 106 552 106 H1448 Q1500 106 1500 158 V268" fill="none" stroke="#000" stroke-width="28" opacity=".34" filter="url(#soSoft)" transform="translate(10 16)"/>' +
        '<path d="M500 268 V158 Q500 106 552 106 H1448 Q1500 106 1500 158 V268" fill="none" stroke="#04050a" stroke-width="30" stroke-linecap="round"/>' +
        '<path d="M500 268 V158 Q500 106 552 106 H1448 Q1500 106 1500 158 V268" fill="none" stroke="url(#soChromeV)" stroke-width="24"/>' +
        '<rect x="488" y="162" width="24" height="106" fill="url(#bbChromeH)"/>' +
        '<rect x="1488" y="162" width="24" height="106" fill="url(#bbChromeH)"/>' +
        mfaTexRect("brushV", 488, 162, 24, 106, 0, .24) +
        mfaTexRect("brushV", 1488, 162, 24, 106, 0, .24) +
        '<path d="M494.5 168 V256" stroke="#ffffff" stroke-width="2.8" opacity=".52" stroke-linecap="round"/>' +
        '<path d="M1493 168 V256" stroke="#ffffff" stroke-width="2.4" opacity=".42" stroke-linecap="round"/>' +
        '<path d="M507.5 168 V256 M1507.5 168 V256" stroke="#0b0d11" stroke-width="3.5" opacity=".54"/>' +
        '<rect x="484" y="155" width="32" height="11" rx="4.5" fill="url(#soChromeV)" stroke="#05060a" stroke-width="1.4"/>' +
        '<rect x="1484" y="155" width="32" height="11" rx="4.5" fill="url(#soChromeV)" stroke="#05060a" stroke-width="1.4"/>' +
        '<path d="M556 99.5 H1444" stroke="#ffffff" stroke-width="3.6" opacity=".62" stroke-linecap="round"/>' +
        '<path d="M556 116.5 H1444" stroke="#0c0e12" stroke-width="3.2" opacity=".56" stroke-linecap="round"/>' +
        '<path d="M505.5 158 Q505.5 111.5 552 111.5" fill="none" stroke="#ffffff" stroke-width="2.6" opacity=".48" stroke-linecap="round"/>' +
        '<path d="M1448 111.5 Q1494.5 111.5 1494.5 158" fill="none" stroke="#ffffff" stroke-width="2.2" opacity=".36" stroke-linecap="round"/>' +
        // 중앙 고무 그립 — 미세 그레인 + 골지 리브
        '<rect x="827" y="86" width="346" height="44" rx="22" fill="#04050a"/>' +
        '<rect x="831" y="89" width="338" height="38" rx="19" fill="url(#bbGrip)"/>' +
        mfaTexRect("grainFine", 831, 89, 338, 38, 19, .26) +
        (() => {
            let ribs = "";
            for (let x = 856; x <= 1144; x += 12) {
                ribs += '<path d="M' + x + ' 92 V124" stroke="#050609" stroke-width="4" opacity=".56"/>' +
                    '<path d="M' + (x + 3.4) + ' 92 V124" stroke="#646a74" stroke-width="1.4" opacity=".38"/>';
            }
            return ribs;
        })() +
        '<rect x="838" y="91" width="324" height="7" rx="3.5" fill="#ffffff" opacity=".12"/>' +
        '<rect x="838" y="119" width="324" height="5" rx="2.5" fill="#000000" opacity=".4"/>' +
        '<rect x="820" y="87" width="14" height="42" rx="6" fill="url(#soChromeV)" stroke="#05060a" stroke-width="1.2"/>' +
        '<rect x="1166" y="87" width="14" height="42" rx="6" fill="url(#soChromeV)" stroke="#05060a" stroke-width="1.2"/>' +

        // ── 캐비닛 (무광 텍스처 블랙 ABS 플라스틱 — materials.js grain)
        '<rect x="150" y="250" width="1700" height="1000" rx="20" fill="#000" opacity=".52" filter="url(#soSoft)" transform="translate(8 14)"/>' +
        '<rect x="150" y="250" width="1700" height="1000" rx="20" fill="url(#bbBody)" stroke="#050506" stroke-width="3"/>' +
        mfaTexRect("grain", 150, 250, 1700, 1000, 20, .36) +
        '<rect x="150" y="250" width="1700" height="1000" rx="20" fill="url(#bbSide)" pointer-events="none"/>' +
        '<rect x="172" y="252.5" width="1656" height="2.8" rx="1.4" fill="#6b707a" opacity=".62"/>' +
        '<rect x="154" y="254" width="1692" height="992" rx="18" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".07"/>' +

        // ── 튜너 스케일 스트립 + 브러시드 크롬 구분 트림
        '<rect x="170" y="266" width="1660" height="140" rx="10" fill="url(#bbInset)" stroke="#000" stroke-width="2"/>' +
        mfaTexRect("grainFine", 170, 266, 1660, 140, 10, .18) +
        '<rect x="170" y="406" width="1660" height="4" fill="url(#bbTrim)" opacity=".8"/>' +
        mfaTexRect("brush", 170, 406, 1660, 4, 0, .35) +
        '<path d="M170 405.5 H1830" stroke="#000" stroke-width="2" opacity=".85"/>' +

        // 손잡이 결착 브래킷 — 브러시드 크롬 + 너클 + 볼트
        '<ellipse cx="504" cy="297" rx="48" ry="8" fill="#000" opacity=".48" filter="url(#soTight)"/>' +
        '<ellipse cx="1504" cy="297" rx="48" ry="8" fill="#000" opacity=".48" filter="url(#soTight)"/>' +
        '<rect x="462" y="254" width="76" height="38" rx="9" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="2"/>' +
        mfaTexRect("brushFine", 462, 254, 76, 38, 9, .26) +
        '<rect x="1462" y="254" width="76" height="38" rx="9" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="2"/>' +
        mfaTexRect("brushFine", 1462, 254, 76, 38, 9, .26) +
        '<rect x="466" y="257" width="68" height="5" rx="2.5" fill="#ffffff" opacity=".48"/>' +
        '<rect x="1466" y="257" width="68" height="5" rx="2.5" fill="#ffffff" opacity=".48"/>' +
        '<rect x="483" y="247" width="34" height="24" rx="10" fill="url(#bbChromeH)" stroke="#070809" stroke-width="1.8"/>' +
        '<rect x="1483" y="247" width="34" height="24" rx="10" fill="url(#bbChromeH)" stroke="#070809" stroke-width="1.8"/>' +
        '<path d="M486 252 H514" stroke="#ffffff" stroke-width="1.8" opacity=".45" stroke-linecap="round"/>' +
        '<path d="M1486 252 H1514" stroke="#ffffff" stroke-width="1.6" opacity=".38" stroke-linecap="round"/>' +
        soloScrew(473, 283, 4.5, false) + soloScrew(527, 283, 4.5, false) +
        soloScrew(1473, 283, 4.5, false) + soloScrew(1527, 283, 4.5, false) +
        // 좌측 인디케이터 블록
        '<rect x="190" y="282" width="54" height="54" rx="6" fill="#d9ba43" stroke="#0a0a0c" stroke-width="2"/>' +
        '<rect x="190" y="282" width="54" height="26" rx="6" fill="#ffffff" opacity=".16"/>' +
        '<rect x="192" y="330" width="50" height="4" rx="2" fill="#000" opacity=".26"/>' +
        '<path d="M217 320 V299 M207 309 L217 299 L227 309 M205 324 H229" fill="none" stroke="#1a1710" stroke-width="3.5" stroke-linecap="round"/>' +
        '<rect x="254" y="282" width="78" height="54" rx="6" fill="#0d0e11" stroke="#2c2f36" stroke-width="1.6"/>' +
        '<text x="293" y="303" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.5" fill="#7ea0d8" text-anchor="middle">POWER</text>' +
        '<circle id="bbPowerLed" cx="293" cy="318" r="5.5" fill="#3a1512" stroke="#000" stroke-width="1"/>' +
        '<rect x="342" y="282" width="54" height="54" rx="6" fill="#45b0bf" stroke="#0a0a0c" stroke-width="2"/>' +
        '<rect x="342" y="282" width="54" height="26" rx="6" fill="#ffffff" opacity=".16"/>' +
        '<rect x="344" y="330" width="50" height="4" rx="2" fill="#000" opacity=".26"/>' +
        '<path d="M352 316 Q360 300 369 316 Q378 332 386 316 M352 306 Q360 290 369 306 M369 326 Q378 310 386 326" fill="none" stroke="#0f2f33" stroke-width="2.6" stroke-linecap="round"/>' +
        '<text x="293" y="356" font-family="Arial" font-size="7.5" letter-spacing="2" fill="#767a82" text-anchor="middle">INDICATOR</text>' +
        // 다이얼 유리 — 깊이 있는 틴티드 아크릴 + 사선 유리 반사
        '<rect x="430" y="276" width="1200" height="118" rx="8" fill="url(#bbGlass)" stroke="#000" stroke-width="2.2"/>' +
        '<rect x="430" y="276" width="1200" height="16" rx="6" fill="#000" opacity=".36"/>' +
        '<text x="507" y="314" font-family="Arial" font-size="11" fill="#c8cbcd">ST</text>' +
        '<circle id="bbStLed" cx="527" cy="310" r="4.5" fill="#3a1512" stroke="#000" stroke-width="1"/>' +
        '<g id="bbRowFM">' + fmRow + '<g id="bbStMarks"></g></g>' + '<g id="bbRowAM">' + amRow + '</g><g id="bbRowSW">' + swRow + '</g>' +
        '<g id="bbNeedle"><rect x="560.5" y="280" width="4" height="112" fill="#000" opacity=".4"/>' +
        '<rect x="558.2" y="280" width="3.6" height="112" fill="#f05346" opacity=".98"/>' +
        '<rect x="559.4" y="280" width="1.2" height="112" fill="#ffe6dc" opacity=".88"/></g>' +
        '<rect x="430" y="276" width="1200" height="118" rx="8" fill="url(#bbDialGloss)" pointer-events="none"/>' +
        '<polygon points="438,277 610,277 500,393 438,393" fill="#ffffff" opacity=".06" pointer-events="none"/>' +
        '<path d="M440 278 H1620" stroke="#ffffff" stroke-width="1.2" opacity=".16" pointer-events="none"/>' +
        '<rect id="bbDialHit" x="430" y="270" width="1200" height="130" fill="#000" fill-opacity="0" style="cursor:ew-resize;touch-action:none" tabindex="0" role="slider" aria-label="주파수 다이얼 — 드래그하여 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>드래그하여 주파수를 맞추세요</title></rect>' +

        // ── 대형 크롬 튜닝 노브 (스핀 가공 알루미늄 페이스 + 널링 크롬 림)
        '<ellipse cx="1763" cy="334" rx="84" ry="80" fill="#000" opacity=".58" filter="url(#soSoft)"/>' +
        '<circle cx="1755" cy="318" r="78" fill="url(#soChrome)" stroke="#0d0f12" stroke-width="2.2"/>' +
        '<circle cx="1755" cy="318" r="78" fill="url(#soKnurl)" opacity=".54"/>' +
        '<circle cx="1755" cy="318" r="68" fill="none" stroke="#0c0e12" stroke-width="2.4" opacity=".62"/>' +
        '<circle cx="1755" cy="318" r="59" fill="url(#soChromeV)" stroke="#22252b" stroke-width="1.6"/>' +
        mfaTexCircle("spun", 1755, 318, 58, .62) +
        '<circle cx="1755" cy="318" r="48" fill="none" stroke="#14161a" stroke-width="1" opacity=".3"/>' +
        '<circle cx="1755" cy="318" r="38" fill="none" stroke="#14161a" stroke-width="1" opacity=".24"/>' +
        '<circle cx="1755" cy="318" r="16" fill="url(#soCapDark)" stroke="#0a0b0d" stroke-width="1.6"/>' +
        mfaTexCircle("spun", 1755, 318, 14, .35) +
        '<path d="M1708 278 A62 62 0 0 1 1788 266" fill="none" stroke="#ffffff" stroke-width="2.6" opacity=".48" stroke-linecap="round"/>' +
        '<g id="bbTuneKnob" transform="rotate(0 1755 318)"><circle cx="1755" cy="276" r="5.2" fill="#eceae4" stroke="#101215" stroke-width="1.3"/><rect x="1753.6" y="286" width="2.8" height="26" rx="1.4" fill="#0a0b0d" opacity=".6"/></g>' +
        '<circle id="bbTuneHit" cx="1755" cy="318" r="88" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="TUNING 노브 — 좌우로 끌어 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>TUNING — 좌우로 끌어 선국하세요</title></circle>' +

        // ── 조작부 스트립 (무광 그레인 + 브러시드 하단 크롬 트림)
        '<rect x="170" y="412" width="1660" height="192" fill="url(#bbPanel)" stroke="#000" stroke-width="2"/>' +
        mfaTexRect("grainFine", 170, 412, 1660, 192, 0, .28) +
        '<rect x="172" y="414" width="1656" height="2" fill="#4f545e" opacity=".48"/>' +
        '<path d="M652 416 V602 M1188 416 V602" stroke="#000" stroke-width="2.2" opacity=".78"/>' +
        '<path d="M654 416 V602 M1190 416 V602" stroke="#4c515c" stroke-width="1" opacity=".36"/>' +
        '<rect x="170" y="603" width="1660" height="4" fill="url(#bbTrim)" opacity=".75"/>' +
        mfaTexRect("brush", 170, 603, 1660, 4, 0, .35) +
        '<path d="M170 603 H1830" stroke="#000" stroke-width="2" opacity=".82"/>' +
        twt(228, "bbTwClipL") + twt(1772, "bbTwClipR") +

        // 좌 — VOLUME · BALANCE · FUNCTION · 토글
        soloKnob(352, 478, 35, "bbVol") +
        '<text x="352" y="537" font-family="Arial" font-size="9" letter-spacing="1.5" fill="#a2a8ae" text-anchor="middle">VOLUME</text>' +
        '<circle id="bbVolHit" cx="352" cy="478" r="48" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="음량 — 좌우로 끌어 조절" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><title>VOLUME — 좌우로 끌어 음량 조절</title></circle>' +
        soloKnob(452, 478, 28, "bbBal") +
        '<text x="452" y="537" font-family="Arial" font-size="9" letter-spacing="1.5" fill="#a2a8ae" text-anchor="middle">BALANCE</text>' +
        '<rect x="518" y="426" width="118" height="18" rx="3" fill="#be352b"/>' +
        '<rect x="518" y="426" width="118" height="3" rx="1.5" fill="#ffffff" opacity=".16"/>' +
        '<text x="577" y="439" font-family="Arial" font-size="9" font-weight="700" letter-spacing="2" fill="#f6efe4" text-anchor="middle">FUNCTION</text>' +
        '<rect x="545" y="452" width="15" height="76" rx="7" fill="#040506" stroke="#2c3037" stroke-width="1.2"/>' +
        '<g id="bbFnLever">' +
        '<rect x="531" y="454" width="47" height="26" rx="6" fill="#000" opacity=".52" filter="url(#soTight)"/>' +
        '<rect x="529" y="450" width="47" height="26" rx="6" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="1.6"/>' +
        mfaTexRect("brushFine", 530, 451, 45, 24, 5, .28) +
        '<rect x="537" y="459" width="31" height="2" fill="#0a0b0d" opacity=".68"/><rect x="537" y="465" width="31" height="2" fill="#0a0b0d" opacity=".68"/></g>' +
        '<text id="bbFnRadio" x="590" y="469" font-family="Arial" font-size="10" font-weight="700" fill="#d8d6cf">RADIO</text>' +
        '<text id="bbFnTape" x="590" y="519" font-family="Arial" font-size="10" font-weight="700" fill="#d8d6cf" opacity=".38">TAPE</text>' +
        '<rect id="bbFnHit" x="515" y="422" width="130" height="114" fill="#000" fill-opacity="0" style="cursor:pointer"><title>FUNCTION — RADIO·TAPE 전환</title></rect>' +
        // 토글 4개 (LOUDNESS·MODE 실효, TAPE SEL·MIC SEL 각인)
        '<text x="336" y="557" font-family="Arial" font-size="8" letter-spacing="1" fill="#a2a8ae" text-anchor="middle">LOUDNESS</text>' +
        '<rect x="310" y="562" width="52" height="13" rx="6" fill="#040506" stroke="#2c3037" stroke-width="1"/>' +
        '<g id="bbLoudCap"><rect x="312" y="559" width="22" height="19" rx="4" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="1.2"/>' +
        '<path d="M318 563 V574 M323 563 V574 M328 563 V574" stroke="#181b20" stroke-width="1" opacity=".5"/></g>' +
        '<text id="bbLoudState" x="336" y="596" font-family="Arial" font-size="7.5" fill="#82868e" text-anchor="middle">OFF</text>' +
        '<rect id="bbLoudHit" x="296" y="548" width="80" height="54" fill="#000" fill-opacity="0" style="cursor:pointer"><title>LOUDNESS — 저음 보강</title></rect>' +
        '<text x="430" y="557" font-family="Arial" font-size="8" letter-spacing="1" fill="#a2a8ae" text-anchor="middle">MODE</text>' +
        '<rect x="404" y="562" width="52" height="13" rx="6" fill="#040506" stroke="#2c3037" stroke-width="1"/>' +
        '<g id="bbModeCap"><rect x="406" y="559" width="22" height="19" rx="4" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="1.2"/>' +
        '<path d="M412 563 V574 M417 563 V574 M422 563 V574" stroke="#181b20" stroke-width="1" opacity=".5"/></g>' +
        '<text id="bbModeState" x="430" y="596" font-family="Arial" font-size="7.5" fill="#82868e" text-anchor="middle">STEREO</text>' +
        '<rect id="bbModeHit" x="390" y="548" width="80" height="54" fill="#000" fill-opacity="0" style="cursor:pointer"><title>MODE — STEREO·MONO</title></rect>' +
        '<text x="524" y="557" font-family="Arial" font-size="8" letter-spacing="1" fill="#82868e" text-anchor="middle">TAPE SEL</text>' +
        '<rect x="498" y="562" width="52" height="13" rx="6" fill="#040506" stroke="#22252b" stroke-width="1"/>' +
        '<rect x="528" y="559" width="22" height="19" rx="4" fill="url(#soChromeAged)" stroke="#0a0b0d" stroke-width="1.2"/>' +
        '<text x="524" y="596" font-family="Arial" font-size="7.5" fill="#63676e" text-anchor="middle">NORMAL</text>' +
        '<text x="618" y="557" font-family="Arial" font-size="8" letter-spacing="1" fill="#82868e" text-anchor="middle">MIC SEL</text>' +
        '<rect x="592" y="562" width="52" height="13" rx="6" fill="#040506" stroke="#22252b" stroke-width="1"/>' +
        '<rect x="594" y="559" width="22" height="19" rx="4" fill="url(#soChromeAged)" stroke="#0a0b0d" stroke-width="1.2"/>' +
        '<text x="618" y="596" font-family="Arial" font-size="7.5" fill="#63676e" text-anchor="middle">INT</text>' +

        // 중 — 5밴드 그래픽 EQ
        '<rect x="678" y="424" width="488" height="21" rx="3" fill="#be352b"/>' +
        '<rect x="678" y="424" width="488" height="3" rx="1.5" fill="#ffffff" opacity=".16"/>' +
        '<text x="922" y="439" font-family="Arial" font-size="10.5" font-weight="700" letter-spacing="2" fill="#f6efe4" text-anchor="middle">5 - BAND GRAPHIC EQUALIZER</text>' +
        '<text x="694" y="475" font-family="Arial" font-size="8" fill="#82868e" text-anchor="end">+10</text>' +
        '<text x="694" y="525" font-family="Arial" font-size="8" fill="#82868e" text-anchor="end">0</text>' +
        '<text x="694" y="577" font-family="Arial" font-size="8" fill="#82868e" text-anchor="end">-10</text>' +
        '<text x="1152" y="475" font-family="Arial" font-size="8" fill="#82868e">+10</text>' +
        '<text x="1152" y="525" font-family="Arial" font-size="8" fill="#82868e">0</text>' +
        '<text x="1152" y="577" font-family="Arial" font-size="8" fill="#82868e">-10</text>' +
        eqSliders +

        // 우 — AUTO REVERSE · ON/OFF · 녹음 노브 · BAND SELECTOR
        '<text x="1218" y="452" font-family="Georgia, serif" font-size="21" font-style="italic" font-weight="700" fill="#d04230">Auto Reverse</text>' +
        '<path d="M1390 437 A12 12 0 1 1 1390 453 M1390 453 L1396 447 M1390 453 L1383 449" fill="none" stroke="#d04230" stroke-width="2.2" stroke-linecap="round"/>' +
        '<rect x="1218" y="470" width="92" height="104" rx="8" fill="none" stroke="#be352b" stroke-width="2" opacity=".86"/>' +
        '<text id="bbPowerOnTxt" x="1243" y="498" font-family="Arial" font-size="11" font-weight="700" fill="#d8d6cf" text-anchor="middle">ON</text>' +
        '<text id="bbPowerOffTxt" x="1243" y="546" font-family="Arial" font-size="11" font-weight="700" fill="#d8d6cf" text-anchor="middle" opacity=".38">OFF</text>' +
        '<rect x="1277" y="482" width="14" height="80" rx="7" fill="#040506" stroke="#2c3037" stroke-width="1.2"/>' +
        '<g id="bbPowerLever">' +
        '<rect x="1265" y="484" width="42" height="24" rx="6" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<rect x="1263" y="480" width="42" height="24" rx="6" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="1.5"/>' +
        mfaTexRect("brushFine", 1264, 481, 40, 22, 5, .28) +
        '<rect x="1270" y="488" width="28" height="2" fill="#0a0b0d" opacity=".68"/><rect x="1270" y="494" width="28" height="2" fill="#0a0b0d" opacity=".68"/></g>' +
        '<rect id="bbPowerHit" x="1212" y="464" width="104" height="116" fill="#000" fill-opacity="0" style="cursor:pointer"><title>전원 ON/OFF</title></rect>' +
        soloKnob(1390, 508, 27, "bbMic", { pointer: false }) +
        '<text x="1390" y="556" font-family="Arial" font-size="7.5" letter-spacing="1" fill="#a2a8ae" text-anchor="middle">MIC MIX VOL</text>' +
        soloKnob(1478, 508, 27, "bbRecVol", { pointer: false }) +
        '<text x="1478" y="556" font-family="Arial" font-size="7.5" letter-spacing="1" fill="#a2a8ae" text-anchor="middle">REC VOL</text>' +
        '<text id="bbBandFM" x="1554" y="482" font-family="Arial" font-size="10" font-weight="700" fill="#d8d6cf" text-anchor="middle">FM</text>' +
        '<text id="bbBandAM" x="1615" y="482" font-family="Arial" font-size="10" font-weight="700" fill="#d8d6cf" text-anchor="middle" opacity=".38">AM</text>' +
        '<text id="bbBandSW" x="1676" y="482" font-family="Arial" font-size="10" font-weight="700" fill="#d8d6cf" text-anchor="middle" opacity=".38">SW</text>' +
        '<rect x="1540" y="492" width="148" height="15" rx="7" fill="#040506" stroke="#2c3037" stroke-width="1.2"/>' +
        '<g id="bbBandCap"><rect x="1540" y="489" width="28" height="21" rx="6" fill="url(#soChromeV)" stroke="#0a0b0d" stroke-width="1.4"/>' +
        mfaTexRect("brushFine", 1541, 490, 26, 19, 5, .26) +
        '<path d="M1549 493 V506 M1554 493 V506 M1559 493 V506" stroke="#181b20" stroke-width="1.1" opacity=".55"/></g>' +
        '<rect x="1540" y="524" width="148" height="20" rx="3" fill="#3b63b2"/>' +
        '<rect x="1540" y="524" width="148" height="3" rx="1.5" fill="#ffffff" opacity=".18"/>' +
        '<text x="1614" y="538" font-family="Arial" font-size="8.5" font-weight="700" letter-spacing="1.5" fill="#eef2f8" text-anchor="middle">BAND SELECTOR</text>' +
        '<rect id="bbBandHit" x="1530" y="468" width="168" height="86" fill="#000" fill-opacity="0" style="cursor:pointer"><title>BAND SELECTOR — FM·AM·SW</title></rect>' +

        // ── 우퍼 두 발
        speaker(455, "bbSpkClipL") + speaker(1545, "bbSpkClipR") +

        // ── 중앙 카세트 컬럼: 데크 A
        '<rect x="760" y="618" width="480" height="112" rx="10" fill="#16181d" stroke="#2c3038" stroke-width="2"/>' +
        '<rect x="770" y="626" width="460" height="96" rx="6" fill="url(#bbDoor)" stroke="#000" stroke-width="1.6"/>' +
        mfaTexRect("grainFine", 770, 626, 460, 96, 6, .22) +
        '<path d="M776 627.5 H1224" stroke="#ffffff" stroke-width="1" opacity=".12"/>' +
        '<text x="786" y="646" font-family="Arial" font-size="9" letter-spacing="1" fill="#d04230">AUTO REVERSE</text>' +
        '<text x="1214" y="646" font-family="Arial" font-size="9" fill="#82cf9f" text-anchor="end">&#9668;&#9668; &#9658;&#9658;</text>' +
        '<rect x="786" y="654" width="428" height="58" rx="5" fill="url(#bbTapeGlass)" stroke="#000" stroke-width="2.2"/>' +
        '<rect x="796" y="660" width="408" height="46" rx="4" fill="#212329" stroke="#08090b" stroke-width="1.5"/>' +
        // 데크 A 내부 테이프 창 + 테이프 팩 (라벨 아래층에 배치해 라벨이 깔끔하게 유지된다)
        '<rect x="896" y="675" width="208" height="29" rx="4" fill="#0d0e11" stroke="#050608" stroke-width="1"/>' +
        '<circle cx="930" cy="691" r="19" fill="#1a140f"/>' +
        '<circle cx="1070" cy="691" r="19" fill="#1a140f"/>' +
        '<rect x="856" y="661" width="288" height="13" rx="2" fill="#e2dcd0" opacity=".9"/>' +
        '<text x="1000" y="670.5" font-family="Arial" font-size="7.8" fill="#4a4438" text-anchor="middle" letter-spacing="1">MAD FOR AUDIO &#183; C-90</text>' +
        hub("bbHubAL", 930, 691) + hub("bbHubAR", 1070, 691) +
        // 데크 A 아크릴 창 유리 반사 (고정)
        '<rect x="786" y="654" width="428" height="10" rx="4" fill="#000" opacity=".32" pointer-events="none"/>' +
        '<polygon points="790,656 916,656 856,710 790,710" fill="#ffffff" opacity=".08" pointer-events="none"/>' +
        '<polygon points="942,656 986,656 926,710 882,710" fill="#ffffff" opacity=".045" pointer-events="none"/>' +
        '<path d="M792 656 H1208" stroke="#ffffff" stroke-width="1" opacity=".18" pointer-events="none"/>' +
        '<text x="790" y="720" font-family="Arial" font-size="8" fill="#8f9399">TAPE A</text>' +

        // 카운터 · RESET · LASONIC 브러시드 배지
        '<text x="786" y="756" font-family="Arial" font-size="8" letter-spacing="1" fill="#8f9399">COUNTER</text>' +
        '<rect x="782" y="760" width="76" height="26" rx="3" fill="#050607" stroke="#2c3037" stroke-width="1.4"/>' +
        '<rect x="783" y="761" width="74" height="7" fill="#000" opacity=".45" pointer-events="none"/>' +
        '<text id="bbCounter" x="820" y="779" font-family="Consolas, monospace" font-size="16" letter-spacing="3" fill="#ece8de" text-anchor="middle">000</text>' +
        '<rect x="868" y="762" width="48" height="22" rx="4" fill="url(#bbKey)" stroke="#000" stroke-width="1.2"/>' +
        '<text x="892" y="776.5" font-family="Arial" font-size="7.5" letter-spacing="1" fill="#a8adb4" text-anchor="middle">RESET</text>' +
        '<rect id="bbResetHit" x="862" y="756" width="60" height="34" fill="#000" fill-opacity="0" style="cursor:pointer"><title>카운터 리셋</title></rect>' +
        '<rect x="1010" y="748" width="220" height="44" rx="6" fill="#0a0b0e" stroke="#363a42" stroke-width="1.6"/>' +
        mfaTexRect("brushFine", 1011, 749, 218, 42, 5, .2) +
        '<path d="M1014 750 H1226" stroke="#ffffff" stroke-width="1" opacity=".18"/>' +
        '<path d="M1028 756 L1046 756 L1036 784 L1018 784 Z" fill="#c8392d"/>' +
        '<text x="1142" y="780" font-family="Arial" font-size="26" font-weight="900" font-style="italic" letter-spacing="2" fill="url(#soChromeV)" text-anchor="middle">LASONIC</text>' +

        // 데크 B
        '<rect x="760" y="800" width="480" height="210" rx="10" fill="#16181d" stroke="#2c3038" stroke-width="2"/>' +
        '<rect x="770" y="808" width="460" height="194" rx="8" fill="url(#bbDoor)" stroke="#000" stroke-width="1.6"/>' +
        mfaTexRect("grainFine", 770, 808, 460, 194, 8, .22) +
        '<path d="M778 810 H1222" stroke="#ffffff" stroke-width="1.1" opacity=".14"/>' +
        soloScrew(781, 819, 5, true) + soloScrew(1219, 819, 5, true) +
        soloScrew(781, 991, 5, true) + soloScrew(1219, 991, 5, true) +
        '<text x="794" y="833" font-family="Arial" font-size="18" font-weight="700" letter-spacing="1" fill="#eceae4">TRC-931</text>' +
        '<rect x="884" y="818" width="58" height="17" rx="2" fill="#be352b"/>' +
        '<text x="913" y="830.5" font-family="Arial" font-size="8" font-weight="700" letter-spacing="1" fill="#f6efe4" text-anchor="middle">METAL</text>' +
        '<text x="1210" y="830" font-family="Arial" font-size="7.5" letter-spacing="1" fill="#92969c" text-anchor="end">AUTO STOP SYSTEM</text>' +
        '<rect x="786" y="842" width="72" height="14" rx="2" fill="#be352b"/>' +
        '<text x="822" y="852.5" font-family="Arial" font-size="7" font-weight="700" letter-spacing="1" fill="#f6efe4" text-anchor="middle">TAPE SCALE</text>' +
        '<path d="M786 866 H904" stroke="#535760" stroke-width="1.5" opacity=".75"/>' +
        '<path d="M790 866 V860 M810 866 V862 M830 866 V860 M850 866 V862 M870 866 V860 M890 866 V862" stroke="#535760" stroke-width="1.2" opacity=".65"/>' +
        '<text x="794" y="996" font-family="Arial" font-size="11" fill="#c6c9cb">TAPE B</text>' +
        '<text x="1055" y="996" font-family="Arial" font-size="9.5" letter-spacing="2.5" fill="#bcc0c6" text-anchor="middle">STEREO CASSETTE RECORDER</text>' +
        '<rect x="915" y="842" width="290" height="112" rx="8" fill="url(#bbTapeGlass)" stroke="#000" stroke-width="2.5"/>' +
        '<rect x="925" y="850" width="270" height="96" rx="6" fill="#1e2026" stroke="#08090b" stroke-width="1.5"/>' +
        // 데크 B 내부 테이프 창 + 마그네틱 테이프 팩 (고정 스핀 반사) + 회전 허브
        '<rect x="946" y="888" width="228" height="52" rx="5" fill="#0d0e11" stroke="#060709" stroke-width="1.2"/>' +
        '<circle cx="990" cy="915" r="28" fill="#1c1610" stroke="#2f261c" stroke-width="1.2"/>' +
        mfaTexCircle("spun", 990, 915, 27, .28) +
        '<circle cx="1130" cy="915" r="21" fill="#1c1610" stroke="#2f261c" stroke-width="1.2"/>' +
        mfaTexCircle("spun", 1130, 915, 20, .28) +
        '<rect x="940" y="855" width="240" height="30" rx="3" fill="#e2dcd0" opacity=".92"/>' +
        '<text id="bbTapeTitle" x="1060" y="868" font-family="Arial" font-size="10.5" font-weight="700" fill="#3a3428" text-anchor="middle"></text>' +
        '<text id="bbTapeArtist" x="1060" y="880.5" font-family="Arial" font-size="10" fill="#484238" text-anchor="middle"></text>' +
        hub("bbHubBL", 990, 915) + hub("bbHubBR", 1130, 915) +
        // 데크 B 카세트 창 유리 반사 (회전 허브 바깥의 고정 아크릴 글로스)
        '<rect x="915" y="842" width="290" height="14" rx="6" fill="#000" opacity=".34" pointer-events="none"/>' +
        '<polygon points="920,844 1046,844 962,952 920,952" fill="#ffffff" opacity=".09" pointer-events="none"/>' +
        '<polygon points="1072,844 1114,844 1030,952 988,952" fill="#ffffff" opacity=".045" pointer-events="none"/>' +
        '<path d="M922 845 H1198" stroke="#ffffff" stroke-width="1.2" opacity=".2" pointer-events="none"/>' +
        // 데크 B 도어가 곧 테이프 교체 창구다 — 눌러서 수납장을 연다
        '<text x="794" y="910" font-family="Arial" font-size="9" letter-spacing="1.5" fill="#92969c">&#9650; EJECT</text>' +
        '<text x="794" y="924" font-family="Arial" font-size="7" letter-spacing="1" fill="#6b6f76">TAPE CHANGE</text>' +
        '<rect id="bbTapeHit" x="770" y="808" width="460" height="194" rx="8" fill="#000" fill-opacity="0" style="cursor:pointer"><title>EJECT — 테이프를 꺼내고 음반 수납장에서 새 테이프를 고릅니다</title></rect>' +

        // 트랜스포트 키 + ONE TOUCH + 벤트
        keys +
        '<circle cx="940" cy="1090" r="4" fill="#d44234"/>' +
        '<text x="952" y="1094" font-family="Arial" font-size="8" letter-spacing="1.5" fill="#a2a8ae">ONE TOUCH RECORDING</text>' +
        '<rect x="850" y="1104" width="300" height="130" rx="8" fill="#0b0c0f" stroke="#282b33" stroke-width="1.6"/>' +
        (() => {
            let out = "";
            for (let i = 0; i < 9; i++) {
                const y = 1112 + i * 13;
                out += '<rect x="862" y="' + y + '" width="276" height="6" rx="3" fill="#030405"/>' +
                    '<rect x="862" y="' + (y + 6.5) + '" width="276" height="1.2" fill="#484c54" opacity=".36"/>';
            }
            return out;
        })() +
        '<text x="1000" y="1247" font-family="Arial" font-size="7.5" letter-spacing="2" fill="#6d7178" text-anchor="middle">FREQUENCY RESPONDER</text>' +

        // ── 발 + 바닥 접지 그림자
        '<ellipse cx="350" cy="1291" rx="68" ry="8" fill="#000" opacity=".68" filter="url(#soTight)"/>' +
        '<ellipse cx="1650" cy="1291" rx="68" ry="8" fill="#000" opacity=".68" filter="url(#soTight)"/>' +
        '<rect x="290" y="1250" width="120" height="40" rx="9" fill="#08090b" stroke="#000" stroke-width="2"/>' +
        '<rect x="296" y="1252" width="108" height="3" rx="1.5" fill="#484c54" opacity=".55"/>' +
        '<rect x="1590" y="1250" width="120" height="40" rx="9" fill="#08090b" stroke="#000" stroke-width="2"/>' +
        '<rect x="1596" y="1252" width="108" height="3" rx="1.5" fill="#484c54" opacity=".55"/>' +
        '<text x="1830" y="1318" font-family="Arial" font-size="13" letter-spacing="1.6" fill="#8f9399" opacity=".55" text-anchor="end">LASONIC &#183; TRC-931 &#183; AM/FM/SW &#183; 5-BAND EQ &#183; 1985</text>' +
        soloFilmGrade(0, 0, 2000, 1330) +
        '</svg>';
}

const SOLO_MODELS = {
    victorv: {
        label: "VICTOR V 축음기",
        kind: "phono",
        year: 1907,
        desc: "전기 증폭 이전의 어쿠스틱 축음기 — 강철 바늘·운모 진동판·놋쇠 나팔관. 음반만 재생합니다.",
        render: mfaVictorVSvg
    },
    a501: {
        label: "금성 A-501 라디오",
        kind: "radio",
        year: 1959,
        desc: "국산 1호 라디오 — 5구 진공관·5인치 스피커·2밴드 슈퍼헤테로다인. 방송만 수신합니다.",
        finishes: A501_FINISHES,
        render: mfaA501Svg
    }
,
    trc931: {
        label: "LASONIC TRC-931 붐박스",
        kind: "boombox",
        year: 1985,
        desc: "1980년대 대표 붐박스 — AM/FM/SW 튜너·카세트 2조·5밴드 그래픽 EQ. 방송과 음반을 모두 재생합니다.",
        render: mfaBoomboxSvg
    }
};
const SOLO_ORDER = ["victorv", "a501", "trc931"];
