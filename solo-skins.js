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
 *
 * ── 재질 원칙 (MR-78 패널과 같은 기준) ────────────────────────────────
 * 금속은 매끈한 그라데이션이 아니라 **명암이 교차하는 띠**로 읽힌다. 크롬·니켈·
 * 놋쇠는 어두운 값과 거의 흰 값을 번갈아 배치하고, 그 위에 하드 스펙큘러를 얹는다.
 * 모든 면은 (1) 접지 그림자 (2) 형태 그라데이션 (3) 상단 에지 라이트 (4) 하단
 * 폐색 그림자 네 겹으로 세운다. 광원은 좌상단 하나로 통일한다.
 *
 * 외형 근거와 앱에서 허용한 변형은 docs/EQUIPMENT_REFERENCES.md에 정리했다.
 * 동적 id는 축음기 gv*, 라디오 a5* 접두사를 쓴다 (문서 전역 id 충돌 회피).
 */

// ===================================================================
// 공통 재질 헬퍼
// ===================================================================

// 실물 노브의 4겹 구성: 접지 그림자 → 금속 링 → 널링 캡 → 좌상단 스펙큘러.
// ptrId가 붙은 그룹만 회전시키면 인디케이터가 돈다.
function soloKnob(cx, cy, r, id, o) {
    const opt = o || {};
    const ring = opt.ring || "url(#soChrome)";
    const cap = opt.cap || "url(#soCapDark)";
    const capR = r * (opt.capRatio || 0.78);
    const ptr = opt.pointer !== false;
    return '<g class="solo-knob">' +
        '<ellipse cx="' + (cx + 3) + '" cy="' + (cy + 9) + '" rx="' + (r * 1.03) + '" ry="' + (r * 0.98) + '" fill="#000" opacity=".5" filter="url(#soSoft)"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + ring + '" stroke="#14161a" stroke-width="1.4"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 1.5) + '" fill="none" stroke="#ffffff" stroke-width="1" opacity=".3"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + capR + '" fill="' + cap + '" stroke="#0a0b0d" stroke-width="1.8"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (capR - 2) + '" fill="url(#soKnurl)" opacity=".45"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (capR * 0.62) + '" fill="' + cap + '" stroke="#3d424a" stroke-width="1"/>' +
        '<path d="M' + (cx - capR * 0.72) + ' ' + (cy - capR * 0.4) + ' A' + (capR * 0.84) + ' ' + (capR * 0.84) + ' 0 0 1 ' + (cx + capR * 0.1) + ' ' + (cy - capR * 0.83) + '" fill="none" stroke="#ffffff" stroke-width="' + (r * 0.07).toFixed(1) + '" opacity=".22" stroke-linecap="round"/>' +
        '<ellipse cx="' + (cx - r * 0.34) + '" cy="' + (cy - r * 0.38) + '" rx="' + (r * 0.3) + '" ry="' + (r * 0.2) + '" fill="#ffffff" opacity=".07"/>' +
        (ptr ? '<g id="' + id + 'Ptr" transform="rotate(0 ' + cx + ' ' + cy + ')">' +
            '<rect x="' + (cx - r * 0.075) + '" y="' + (cy - capR + r * 0.02) + '" width="' + (r * 0.15) + '" height="' + (capR * 0.86) + '" rx="' + (r * 0.075) + '" fill="#05060a" opacity=".55"/>' +
            '<rect x="' + (cx - r * 0.06) + '" y="' + (cy - capR + r * 0.04) + '" width="' + (r * 0.12) + '" height="' + (capR * 0.82) + '" rx="' + (r * 0.06) + '" fill="#eef0ee"/>' +
            '<rect x="' + (cx - r * 0.022) + '" y="' + (cy - capR + r * 0.07) + '" width="' + (r * 0.044) + '" height="' + (capR * 0.76) + '" fill="#ffffff" opacity=".85"/>' +
            '</g>' : "") +
        '</g>';
}

// 체결 나사 — 슬롯에 그림자와 하이라이트를 함께 넣어야 금속으로 읽힌다
function soloScrew(x, y, r, dark) {
    return '<g transform="translate(' + x + ' ' + y + ')" pointer-events="none">' +
        '<circle cy="2" r="' + r + '" fill="#000" opacity=".45"/>' +
        '<circle r="' + r + '" fill="' + (dark ? "url(#soCapDark)" : "url(#soChrome)") + '" stroke="#0d0f12" stroke-width="1"/>' +
        '<circle r="' + (r - 1.2) + '" fill="none" stroke="#ffffff" stroke-width=".8" opacity=".35"/>' +
        '<path d="M' + (-r * 0.62) + ' ' + (-r * 0.2) + ' L' + (r * 0.62) + ' ' + (r * 0.2) + '" stroke="#05060a" stroke-width="' + (r * 0.3).toFixed(1) + '" stroke-linecap="round"/>' +
        '<path d="M' + (-r * 0.62) + ' ' + (-r * 0.36) + ' L' + (r * 0.62) + ' ' + (r * 0.04) + '" stroke="#ffffff" stroke-width=".9" opacity=".3" stroke-linecap="round"/>' +
        '</g>';
}

// 문서 전역에서 한 번만 정의하면 되는 공통 재질 defs (기기별 SVG 안에 삽입)
function soloMaterialDefs(prefix) {
    return '<linearGradient id="soChrome" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#2b2f36"/><stop offset=".1" stop-color="#e9edf1"/><stop offset=".26" stop-color="#767d87"/>' +
        '<stop offset=".44" stop-color="#fbfcfd"/><stop offset=".6" stop-color="#868d97"/><stop offset=".78" stop-color="#e2e7ea"/>' +
        '<stop offset=".9" stop-color="#5b626b"/><stop offset="1" stop-color="#24272d"/></linearGradient>' +
        '<linearGradient id="soChromeV" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fbfcfd"/><stop offset=".18" stop-color="#aeb5bd"/><stop offset=".38" stop-color="#f2f5f7"/>' +
        '<stop offset=".62" stop-color="#79808a"/><stop offset=".84" stop-color="#cdd3d9"/><stop offset="1" stop-color="#3a3f47"/></linearGradient>' +
        '<radialGradient id="soCapDark" cx=".34" cy=".28" r=".92">' +
        '<stop offset="0" stop-color="#454951"/><stop offset=".38" stop-color="#25282e"/><stop offset=".76" stop-color="#141619"/><stop offset="1" stop-color="#08090b"/></radialGradient>' +
        '<pattern id="soKnurl" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">' +
        '<path d="M1 0V7 M4.5 0V7" stroke="#c3c7ce" stroke-width=".9" opacity=".3"/>' +
        '<path d="M2.5 0V7 M6 0V7" stroke="#050608" stroke-width="1.2" opacity=".7"/></pattern>' +
        '<filter id="soSoft" x="-45%" y="-45%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>' +
        '<filter id="soWide" x="-60%" y="-60%" width="240%" height="240%"><feGaussianBlur stdDeviation="26"/></filter>' +
        '<filter id="soTight" x="-30%" y="-30%" width="170%" height="170%"><feGaussianBlur stdDeviation="2.6"/></filter>';
}

// ===================================================================
// VICTOR V — 어쿠스틱 축음기
// ===================================================================
// 원근: 케이스 앞면 → 뒷면 오프셋 (160, -190). 상판·우측면·굽도리 모두 같은 벡터.
// 고정 좌표(런타임이 의존): 플래터 중심 (680,835) rx300 ry82,
// 톤암 브래킷 (352,766), 거치 반경비 1.28.
const GV_PC = { x: 680, y: 835, rx: 300, ry: 82 };
const GV_K = GV_PC.ry / GV_PC.rx;          // 원근 압축비 — 원판을 눕혀 보는 각도
const GV_ARM = { x: 352, y: 766 };         // 톤암 뒷마운트(피벗) — 상판 뒤 왼쪽 모서리
const GV_DISC = 252;                       // 10인치 셸락판 반지름 (원형 좌표계)
const GV_ARM_REST = 1.34;                  // 톤암 거치 반경비 (판 바깥의 크러치)
const GV_BELL = { cx: 900, cy: 370, rx: 390, ry: 330 };
const GV_THROAT = { x: 645, y: 548 };

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
    for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
        const ex = GV_BELL.cx + Math.cos(a) * (GV_BELL.rx - 14);
        const ey = GV_BELL.cy + Math.sin(a) * (GV_BELL.ry - 13);
        // 제어점을 바깥으로 밀어 원뿔면의 볼록함을 만든다
        const mx = GV_THROAT.x + (ex - GV_THROAT.x) * 0.55 + Math.cos(a + 0.35) * 44;
        const my = GV_THROAT.y + (ey - GV_THROAT.y) * 0.55 + Math.sin(a + 0.35) * 38;
        // 빛은 좌상단에서 들어와 오른쪽 아래 벽을 때린다 (a ≈ +0.7rad 부근이 가장 밝다)
        const lit = Math.max(0, Math.cos(a - 0.7));
        out += '<path d="M' + GV_THROAT.x + ' ' + GV_THROAT.y + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' +
            ex.toFixed(1) + ' ' + ey.toFixed(1) + '" fill="none" stroke="#2e1c04" stroke-width="1.8" opacity="' + (0.2 - lit * 0.1).toFixed(2) + '"/>' +
            '<path d="M' + (GV_THROAT.x + 2.5) + ' ' + (GV_THROAT.y + 1) + ' Q' + (mx + 2.5).toFixed(1) + ' ' + (my + 1).toFixed(1) + ' ' +
            (ex + 2.5).toFixed(1) + ' ' + (ey + 1).toFixed(1) + '" fill="none" stroke="#fff2cc" stroke-width="1.1" opacity="' + (0.04 + lit * 0.2).toFixed(2) + '"/>';
    }
    return out;
}

// 원뿔면의 등고선 — 벨 입구에서 목까지 줄어들며 목 쪽으로 밀려나는 타원 고리.
// 이것이 있어야 평평한 금색 원반이 아니라 '안으로 파인 관'으로 읽힌다.
function gvHornContours() {
    let out = "";
    for (let i = 1; i <= 15; i++) {
        const t = i / 16;
        const e = Math.pow(t, 1.35);                       // 목 쪽으로 갈수록 촘촘하게
        const cx = GV_BELL.cx + (GV_THROAT.x - GV_BELL.cx) * e * 0.94;
        const cy = GV_BELL.cy + (GV_THROAT.y - GV_BELL.cy) * e * 0.94;
        const rx = (GV_BELL.rx - 20) * (1 - e) + 33 * e;
        const ry = (GV_BELL.ry - 19) * (1 - e) + 29 * e;
        out += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
            '" fill="none" stroke="#1c1002" stroke-width="2.2" opacity="' + (0.018 + e * 0.042).toFixed(3) + '"/>' +
            '<ellipse cx="' + (cx + 2).toFixed(1) + '" cy="' + (cy - 2).toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) +
            '" fill="none" stroke="#ffeec2" stroke-width="1.6" opacity="' + (0.032 - e * 0.022).toFixed(3) + '"/>';
    }
    return out;
}

// 셸락판의 굵은 홈 — 78회전은 홈 간격이 넓어 육안으로 보인다 (원형 좌표계)
function gvGrooves() {
    let out = "";
    for (let r = 104; r <= GV_DISC - 6; r += 5.5) {
        const band = r % 22 < 6;
        out += '<circle r="' + r + '" fill="none" stroke="#000" stroke-width="' + (band ? 1.5 : 1) + '" opacity="' + (band ? ".55" : ".28") + '"/>';
    }
    return out;
}

// 사분할 오크의 세로 홈 기둥 — 면마다 광량이 다르다
function gvFlutes(x, y, w, h) {
    let out = "";
    for (let i = 1; i <= 3; i++) {
        const fx = x + (w / 4) * i;
        out += '<path d="M' + (fx - 2.6).toFixed(1) + ' ' + (y + 16) + ' V' + (y + h - 16) + '" stroke="#e0aa66" stroke-width="2" opacity=".22"/>' +
            '<path d="M' + fx.toFixed(1) + ' ' + (y + 16) + ' V' + (y + h - 16) + '" stroke="#241306" stroke-width="3.4" opacity=".55"/>' +
            '<path d="M' + (fx + 2.8).toFixed(1) + ' ' + (y + 16) + ' V' + (y + h - 16) + '" stroke="#b98549" stroke-width="1.6" opacity=".3"/>';
    }
    return out;
}

function mfaVictorVSvg() {
    const DX = 160, DY = -190;
    const off = (x, y) => (x + DX).toFixed(0) + " " + (y + DY).toFixed(0);
    // 굽도리 몰딩 한 단 — 앞면 + 우측면, 윗면 에지 라이트와 아랫면 폐색까지
    const molding = (x1, x2, y1, y2) =>
        '<polygon points="' + x2 + ',' + y1 + ' ' + off(x2, y1) + ' ' + off(x2, y2) + ' ' + x2 + ',' + y2 +
        '" fill="url(#gvOakSide)" stroke="#1d0f05" stroke-width="2"/>' +
        // 옆면 윗모서리에 에지 라이트 — 없으면 비스듬한 띠가 램프처럼 읽힌다
        '<path d="M' + (x2 + 1) + ' ' + (y1 + 2) + ' L' + off(x2 + 1, y1 + 2) + '" stroke="#e0a866" stroke-width="2.6" opacity=".38"/>' +
        '<path d="M' + (x2 + 1) + ' ' + (y2 - 1) + ' L' + off(x2 + 1, y2 - 1) + '" stroke="#0d0603" stroke-width="3" opacity=".6"/>' +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="url(#gvOakFace)" stroke="#1d0f05" stroke-width="2"/>' +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="url(#gvGrain)" opacity=".55"/>' +
        '<path d="M' + (x1 + 3) + ' ' + (y1 + 2.5) + ' H' + (x2 - 3) + '" stroke="#f0bd77" stroke-width="2.4" opacity=".4"/>' +
        '<path d="M' + (x1 + 3) + ' ' + (y2 - 2) + ' H' + (x2 - 3) + '" stroke="#120903" stroke-width="3" opacity=".55"/>';

    return '<svg class="solo-svg gv-svg" viewBox="0 0 2000 1240" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Victor V 축음기 — 나팔관 어쿠스틱 재생">' +
        '<defs>' + soloMaterialDefs("gv") +
        // ── 오크: 니스를 먹인 사분할 참나무. 결·도관·레이 플렉·광택을 따로 쌓는다
        '<linearGradient id="gvOakFace" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#c58c4e"/><stop offset=".06" stop-color="#a56c34"/><stop offset=".34" stop-color="#8b5628"/>' +
        '<stop offset=".72" stop-color="#6f4220"/><stop offset=".92" stop-color="#4a2911"/><stop offset="1" stop-color="#31190a"/></linearGradient>' +
        '<linearGradient id="gvOakTopFace" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#d59d5c"/><stop offset=".28" stop-color="#a97038"/><stop offset=".58" stop-color="#bd8144"/>' +
        '<stop offset=".82" stop-color="#8a5527"/><stop offset="1" stop-color="#5e3616"/></linearGradient>' +
        '<linearGradient id="gvOakSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#6b401d"/><stop offset=".4" stop-color="#7d4c23"/><stop offset=".78" stop-color="#4e2c12"/><stop offset="1" stop-color="#2c1707"/></linearGradient>' +
        // 사분할 참나무의 결 — 가로로 길게 흐르는 도관선. 무늬가 눈에 띄게 반복되면
        // 즉시 '그림'으로 읽히므로 타일을 크게 잡고 대비를 낮춘다 (사선 플렉 없음).
        '<pattern id="gvGrain" width="437" height="53" patternUnits="userSpaceOnUse">' +
        '<path d="M0 5 C104 1 186 11 288 5 S392 2 437 8" fill="none" stroke="#f0c68a" stroke-width="1.1" opacity=".1"/>' +
        '<path d="M0 12 C118 17 202 6 312 14 S404 18 437 13" fill="none" stroke="#261407" stroke-width="1.2" opacity=".2"/>' +
        '<path d="M0 20 C92 15 174 25 282 19 S396 15 437 22" fill="none" stroke="#e8b878" stroke-width=".9" opacity=".07"/>' +
        '<path d="M0 27 C126 32 206 22 322 29 S412 33 437 28" fill="none" stroke="#261407" stroke-width="1" opacity=".16"/>' +
        '<path d="M0 35 C84 31 168 40 268 34 S388 31 437 37" fill="none" stroke="#f0c68a" stroke-width=".9" opacity=".08"/>' +
        '<path d="M0 44 C112 49 196 39 306 46 S400 50 437 45" fill="none" stroke="#261407" stroke-width="1.1" opacity=".18"/>' +
        '</pattern>' +
        '<radialGradient id="gvWoodBlotch" cx=".3" cy=".3" r=".8">' +
        '<stop offset="0" stop-color="#d9a25e" stop-opacity=".12"/><stop offset=".6" stop-color="#8a5628" stop-opacity=".04"/>' +
        '<stop offset="1" stop-color="#3a2009" stop-opacity=".1"/></radialGradient>' +
        '<linearGradient id="gvVarnish" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffe6bd" stop-opacity=".26"/><stop offset=".2" stop-color="#ffdfb0" stop-opacity=".08"/>' +
        '<stop offset=".46" stop-color="#ffffff" stop-opacity="0"/><stop offset=".78" stop-color="#000000" stop-opacity=".1"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity=".26"/></linearGradient>' +
        // ── 놋쇠 원뿔: (1) 좌상단 광원의 방향성 명암을 리니어로 깔고
        //    (2) 목에서 퍼지는 폐색을 라디얼로 덮은 뒤 (3) 등고선과 이음매를 얹는다.
        '<linearGradient id="gvConeKey" x1=".14" y1="0" x2=".86" y2="1">' +
        '<stop offset="0" stop-color="#3f2708"/><stop offset=".16" stop-color="#644410"/><stop offset=".34" stop-color="#966c1c"/>' +
        '<stop offset=".52" stop-color="#c69434"/><stop offset=".7" stop-color="#e8bc5e"/><stop offset=".86" stop-color="#fadf95"/>' +
        '<stop offset="1" stop-color="#fff6d6"/></linearGradient>' +
        '<radialGradient id="gvConeThroat" cx=".16" cy=".78" r="1.02">' +
        '<stop offset="0" stop-color="#000000" stop-opacity=".97"/><stop offset=".1" stop-color="#000000" stop-opacity=".9"/>' +
        '<stop offset=".26" stop-color="#000000" stop-opacity=".7"/><stop offset=".46" stop-color="#000000" stop-opacity=".4"/>' +
        '<stop offset=".68" stop-color="#000000" stop-opacity=".16"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="gvBrassRing" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#33200a"/><stop offset=".1" stop-color="#fbeec2"/><stop offset=".24" stop-color="#8e6821"/>' +
        '<stop offset=".42" stop-color="#fff4d2"/><stop offset=".58" stop-color="#a37a2c"/><stop offset=".74" stop-color="#f4dfa6"/>' +
        '<stop offset=".9" stop-color="#6b4d18"/><stop offset="1" stop-color="#241505"/></linearGradient>' +
        '<linearGradient id="gvBrassTube" x1="0" y1="1" x2=".7" y2="0">' +
        '<stop offset="0" stop-color="#2b1a06"/><stop offset=".16" stop-color="#7a561b"/><stop offset=".38" stop-color="#f2dda2"/>' +
        '<stop offset=".54" stop-color="#fff8e2"/><stop offset=".72" stop-color="#a67c2c"/><stop offset=".9" stop-color="#4d360f"/>' +
        '<stop offset="1" stop-color="#241605"/></linearGradient>' +
        '<linearGradient id="gvRimSpec" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fffdf2" stop-opacity=".9"/><stop offset=".16" stop-color="#ffeec4" stop-opacity=".32"/>' +
        '<stop offset=".44" stop-color="#ffffff" stop-opacity="0"/><stop offset=".8" stop-color="#170e02" stop-opacity=".3"/>' +
        '<stop offset="1" stop-color="#0d0801" stop-opacity=".62"/></linearGradient>' +
        // ── 니켈 도금(톤암·플래터 림·사운드박스)
        '<linearGradient id="gvNickel" x1="0" y1="0" x2=".4" y2="1">' +
        '<stop offset="0" stop-color="#20242a"/><stop offset=".12" stop-color="#f3f6f8"/><stop offset=".3" stop-color="#7d848d"/>' +
        '<stop offset=".48" stop-color="#fdfefe"/><stop offset=".66" stop-color="#8b929b"/><stop offset=".84" stop-color="#dfe4e8"/>' +
        '<stop offset="1" stop-color="#1d2126"/></linearGradient>' +
        '<radialGradient id="gvNickelBall" cx=".32" cy=".26" r=".92">' +
        '<stop offset="0" stop-color="#ffffff"/><stop offset=".2" stop-color="#dfe3e7"/><stop offset=".52" stop-color="#959ba3"/>' +
        '<stop offset=".8" stop-color="#4e545c"/><stop offset="1" stop-color="#1b1e23"/></radialGradient>' +
        // ── 셸락판·융
        '<radialGradient id="gvShellac" cx=".4" cy=".36" r=".76">' +
        '<stop offset="0" stop-color="#2b2622"/><stop offset=".5" stop-color="#191614"/><stop offset=".86" stop-color="#100e0e"/><stop offset="1" stop-color="#231f1c"/></radialGradient>' +
        '<linearGradient id="gvDiscSpec" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fff3d8" stop-opacity=".3"/><stop offset=".38" stop-color="#e8cfa4" stop-opacity=".07"/>' +
        '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="gvFelt" cx=".38" cy=".3" r=".85">' +
        '<stop offset="0" stop-color="#3a6b4c"/><stop offset=".55" stop-color="#26492f"/><stop offset="1" stop-color="#122a1b"/></radialGradient>' +
        // ── 종이 봉투·명판
        '<linearGradient id="gvPaper" x1="0" y1="0" x2=".3" y2="1">' +
        '<stop offset="0" stop-color="#e9dcbe"/><stop offset=".4" stop-color="#d6c49e"/><stop offset=".8" stop-color="#c2ad86"/><stop offset="1" stop-color="#a8926b"/></linearGradient>' +
        '<linearGradient id="gvPlate" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#31261a"/><stop offset=".08" stop-color="#1e170f"/><stop offset=".7" stop-color="#141009"/><stop offset="1" stop-color="#0b0805"/></linearGradient>' +
        // ── 방
        '<radialGradient id="gvRoom" cx=".44" cy=".38" r=".78">' +
        '<stop offset="0" stop-color="#3d2f21"/><stop offset=".45" stop-color="#241b14"/><stop offset="1" stop-color="#0e0b09"/></radialGradient>' +
        '<linearGradient id="gvFloor" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#000000" stop-opacity="0"/><stop offset=".55" stop-color="#120b06" stop-opacity=".5"/><stop offset="1" stop-color="#080505" stop-opacity=".85"/></linearGradient>' +
        '<clipPath id="gvBellClip"><ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '"/></clipPath>' +
        '<clipPath id="gvSleeveClip"><rect x="1470" y="112" width="462" height="462" rx="5"/></clipPath>' +
        '<clipPath id="gvListClip"><rect x="1462" y="600" width="480" height="430"/></clipPath>' +
        '<path id="gvLabelArc" d="M -60 0 A 60 60 0 0 1 60 0" fill="none"/>' +
        '</defs>' +

        // ── 방: 키 라이트가 좌상단에서 들어오는 어두운 전시실
        '<rect width="2000" height="1240" rx="10" fill="url(#gvRoom)"/>' +
        '<ellipse cx="700" cy="330" rx="720" ry="520" fill="#6a5334" opacity=".22" filter="url(#soWide)"/>' +
        '<rect x="0" y="900" width="2000" height="340" fill="url(#gvFloor)"/>' +
        '<rect x="1432" y="52" width="536" height="1136" rx="10" fill="#100d0c" stroke="#2c2318" stroke-width="2"/>' +
        '<rect x="1432" y="52" width="536" height="3" fill="#5c4a30" opacity=".5"/>' +

        // ── 나팔 목 (벨 뒤로 지나간다)
        '<path d="M330 728 C316 672 344 622 400 596 C482 558 566 558 648 574 L672 646 C588 628 500 630 440 666 C398 690 378 710 372 742 Z" fill="url(#gvBrassTube)" stroke="#201304" stroke-width="2.5"/>' +
        '<path d="M348 722 C338 676 364 640 414 618 C482 588 556 586 632 598" fill="none" stroke="#fff8e0" stroke-width="6" opacity=".5"/>' +
        '<path d="M356 726 C346 680 372 644 420 622 C486 594 558 592 632 604" fill="none" stroke="#fffdf2" stroke-width="2" opacity=".55"/>' +
        '<path d="M370 742 C362 702 386 670 432 650 C502 618 574 618 654 632" fill="none" stroke="#2a1904" stroke-width="6" opacity=".45"/>' +

        // ── 니켈 엘보 (톤암 뒷마운트 ↔ 나팔)
        '<path d="M352 766 C324 776 300 764 298 738 C296 712 314 696 340 700 L364 716 Z" fill="url(#gvNickel)" stroke="#181b1f" stroke-width="2"/>' +
        '<ellipse cx="330" cy="730" rx="28" ry="25" fill="url(#gvNickelBall)" stroke="#15181c" stroke-width="2"/>' +
        '<ellipse cx="322" cy="722" rx="9" ry="7" fill="#ffffff" opacity=".55"/>' +

        // ── 주철 크레인 (나팔 지지대)
        '<path d="M262 806 V664 L436 610" fill="none" stroke="#0c0c0e" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M259 800 V668" stroke="#5a5c62" stroke-width="2.6" opacity=".55" stroke-linecap="round"/>' +
        '<circle cx="262" cy="648" r="22" fill="url(#soCapDark)" stroke="#4a4b50" stroke-width="2"/>' +
        '<circle cx="262" cy="648" r="9" fill="url(#gvNickelBall)"/>' +
        '<circle cx="436" cy="610" r="17" fill="url(#soCapDark)" stroke="#45464b" stroke-width="2"/>' +
        '<circle cx="433" cy="605" r="5" fill="#8b9099" opacity=".7"/>' +

        // ── 벨: 접지 그림자 → 바깥 테 → 안쪽 원뿔 → 이음매 → 방향광 → 스펙큘러 → 림
        '<ellipse cx="' + (GV_BELL.cx + 16) + '" cy="' + (GV_BELL.cy + 28) + '" rx="' + (GV_BELL.rx + 6) + '" ry="' + (GV_BELL.ry + 6) + '" fill="#000" opacity=".55" filter="url(#soWide)"/>' +
        // 나팔 바깥면 — 왼쪽 위로 살짝 보이는 초승달 (관의 두께)
        '<ellipse cx="' + (GV_BELL.cx - 9) + '" cy="' + (GV_BELL.cy - 9) + '" rx="' + (GV_BELL.rx + 3) + '" ry="' + (GV_BELL.ry + 3) + '" fill="url(#gvBrassTube)"/>' +
        // 안쪽 원뿔 — 방향광 리니어 → 목 폐색 라디얼 → 등고선 → 이음매 → 스펙큘러
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="url(#gvConeKey)"/>' +
        '<g clip-path="url(#gvBellClip)">' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="url(#gvConeThroat)"/>' +
        gvHornContours() +
        gvHornSeams() +
        // 원뿔 안쪽 벽에 고인 빛 — 목 반대편(오른쪽 아래) 곡면이 키 라이트를 받는다.
        // 테두리를 따라 흐르는 넓은 반사이므로 벨 안쪽 가장자리에 붙여 둔다.
        '<path d="' + gvBellArc(330, 278, -50, 96) + '" fill="none" stroke="#ffeec0" stroke-width="122" opacity=".17" filter="url(#soWide)"/>' +
        '<path d="' + gvBellArc(316, 266, -30, 78) + '" fill="none" stroke="#fff6dc" stroke-width="52" opacity=".14" filter="url(#soWide)"/>' +
        // 림 바로 안쪽의 하드 스펙큘러 — 금속의 결정적 신호
        '<path d="' + gvBellArc(354, 298, -26, 74) + '" fill="none" stroke="#fffdf3" stroke-width="15" opacity=".5" filter="url(#soSoft)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(354, 298, -22, 16) + '" fill="none" stroke="#fffef8" stroke-width="8" opacity=".55" filter="url(#soTight)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(300, 252, 30, 80) + '" fill="none" stroke="#fff6da" stroke-width="7" opacity=".28" filter="url(#soSoft)" stroke-linecap="round"/>' +
        // 목: 소리가 빨려 들어가는 구멍
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="38" ry="33" fill="none" stroke="#b98c33" stroke-width="7" opacity=".7"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 2) + '" cy="' + (GV_THROAT.y + 2) + '" rx="35" ry="30" fill="none" stroke="#ffe9b0" stroke-width="2.4" opacity=".38"/>' +
        '<ellipse id="gvHornMouth" cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="31" ry="26" fill="#080401"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 5) + '" cy="' + (GV_THROAT.y - 8) + '" rx="17" ry="11" fill="#301d05"/>' +
        // 백 년 된 놋쇠의 얼룩과 자잘한 흠 — 완벽하게 매끈하면 그림으로 보인다
        '<g opacity=".34" filter="url(#soWide)">' +
        '<ellipse cx="1020" cy="212" rx="86" ry="44" fill="#8a6a2c" opacity=".3"/>' +
        '<ellipse cx="812" cy="470" rx="104" ry="48" fill="#f3dda2" opacity=".16"/>' +
        '<ellipse cx="1146" cy="452" rx="70" ry="96" fill="#7a5a22" opacity=".26"/>' +
        '<ellipse cx="700" cy="238" rx="64" ry="40" fill="#6a4c1c" opacity=".28"/></g>' +
        '<g stroke="#fff6dc" stroke-width="1.1" opacity=".2" fill="none">' +
        '<path d="M760 300 Q900 262 1120 292"/><path d="M700 420 Q880 402 1080 440"/>' +
        '<path d="M840 172 Q950 160 1046 186"/></g>' +
        '<g stroke="#241505" stroke-width="1" opacity=".22" fill="none">' +
        '<path d="M772 310 Q912 272 1132 302"/><path d="M712 432 Q892 414 1092 452"/></g>' +
        '</g>' +
        // 벨 입구 테 — 두께가 있는 롤드 브라스. 좌상단은 흰 하이라이트, 우하단은 그늘.
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 9) + '" ry="' + (GV_BELL.ry - 8.5) + '" fill="none" stroke="url(#gvBrassRing)" stroke-width="20"/>' +
        '<path d="' + gvBellArc(381, 322, 196, 300) + '" fill="none" stroke="#fffdf4" stroke-width="8" opacity=".9" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(381, 322, 212, 284) + '" fill="none" stroke="#ffffff" stroke-width="3.4" opacity=".9" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(381, 322, 34, 116) + '" fill="none" stroke="#1a0f02" stroke-width="7" opacity=".5" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(381, 322, 120, 168) + '" fill="none" stroke="#e2c88e" stroke-width="5" opacity=".4" stroke-linecap="round"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="none" stroke="#180e02" stroke-width="3.4" opacity=".55"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + GV_BELL.rx + '" ry="' + GV_BELL.ry + '" fill="none" stroke="#120a01" stroke-width="3" opacity=".92"/>' +

        // ── 캐비닛 상판 (원근 평행사변형)
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvOakTopFace)" stroke="#201206" stroke-width="3"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvGrain)" opacity=".6"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvVarnish)" opacity=".9"/>' +
        // 나팔이 상판에 떨구는 그림자와, 니스 먹은 상판에 비친 놋쇠의 반사
        '<ellipse cx="760" cy="812" rx="330" ry="90" fill="#0a0602" opacity=".45" filter="url(#soWide)"/>' +
        '<ellipse cx="880" cy="798" rx="210" ry="46" fill="#e0aa55" opacity=".16" filter="url(#soWide)"/>' +
        '<polygon points="206,922 ' + off(206, 922) + ' ' + off(994, 922) + ' 994,922" fill="none" stroke="#dfae6c" stroke-width="2" opacity=".35"/>' +

        // ── 플래터: 니켈 림 + 녹색 융
        '<ellipse cx="686" cy="852" rx="308" ry="86" fill="#000" opacity=".6" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_PC.rx + '" ry="' + GV_PC.ry + '" fill="url(#gvNickel)" stroke="#191c20" stroke-width="2.5"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + (GV_PC.y - 2) + '" rx="' + (GV_PC.rx - 3) + '" ry="' + (GV_PC.ry - 3) + '" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".4"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 14) + '" ry="' + (GV_PC.ry - 4) + '" fill="url(#gvFelt)"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 14) + '" ry="' + (GV_PC.ry - 4) + '" fill="none" stroke="#0d1c12" stroke-width="2" opacity=".7"/>' +

        // ── 셸락 판 — 원형 좌표계에서 그리고 원근으로 눕힌다
        '<g id="gvSpinG" transform="translate(' + GV_PC.x + ' ' + GV_PC.y + ') scale(1 ' + GV_K.toFixed(4) + ')">' +
        '<circle r="' + GV_DISC + '" fill="url(#gvShellac)"/>' +
        gvGrooves() +
        '<path d="M0 0 L0 -' + GV_DISC + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 ' + (GV_DISC * 0.78).toFixed(0) + ' -' + (GV_DISC * 0.63).toFixed(0) + ' Z" fill="url(#gvDiscSpec)"/>' +
        '<path d="M0 0 L0 ' + GV_DISC + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 -' + (GV_DISC * 0.7).toFixed(0) + ' ' + (GV_DISC * 0.71).toFixed(0) + ' Z" fill="url(#gvDiscSpec)" opacity=".45"/>' +
        '<circle r="' + GV_DISC + '" fill="none" stroke="#3a332c" stroke-width="2.5" opacity=".7"/>' +
        '<circle r="100" fill="#b7472f" id="gvLabelDisc"/>' +
        '<circle r="100" fill="none" stroke="#000" stroke-width="2" opacity=".35"/>' +
        '<circle r="94" fill="none" stroke="#eadfc4" stroke-width="2.5" opacity=".55"/>' +
        '<circle r="86" fill="none" stroke="#eadfc4" stroke-width="1" opacity=".35"/>' +
        '<text font-family="Georgia, serif" font-size="16" letter-spacing="2.2" fill="#f6ead0"><textPath href="#gvLabelArc" startOffset="50%" text-anchor="middle">MAD FOR AUDIO RECORDS</textPath></text>' +
        '<text id="gvLabelBig" x="0" y="-6" font-family="Georgia, serif" font-size="27" font-weight="700" fill="#f8f0da" text-anchor="middle">78</text>' +
        '<text id="gvLabelTitle" x="0" y="22" font-family="Arial" font-size="14" fill="#f2e6c8" text-anchor="middle"></text>' +
        '<text id="gvLabelArtist" x="0" y="44" font-family="Arial" font-size="12" fill="#e6d5ae" text-anchor="middle"></text>' +
        '<text x="0" y="70" font-family="Arial" font-size="12.5" font-weight="700" letter-spacing="1.6" fill="#f8f0da" text-anchor="middle">78 R.P.M.</text>' +
        '<circle r="7" fill="#0a0807"/>' +
        '</g>' +
        '<ellipse id="gvDiscHit" cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_DISC + '" ry="' + (GV_DISC * GV_K).toFixed(0) + '" fill="#000" fill-opacity="0" style="cursor:grab"><title>도는 판을 문지르면 바늘이 긁힙니다</title></ellipse>' +

        // ── 톤암 크러치
        '<ellipse cx="1005" cy="888" rx="30" ry="11" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<ellipse cx="1003" cy="884" rx="27" ry="9" fill="url(#gvNickel)" stroke="#191c20" stroke-width="1.5"/>' +
        '<path d="M1003 882 V820" stroke="url(#gvNickel)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M1000 878 V822" stroke="#ffffff" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>' +
        '<path d="M985 812 Q1003 794 1021 812" fill="none" stroke="url(#gvNickel)" stroke-width="9" stroke-linecap="round"/>' +

        // ── 톤암 (프레임마다 다시 그린다) + 판에 지는 그림자
        '<path id="gvArmShadow" d="M352 766 L1003 752" transform="translate(6 26)" stroke="#000" stroke-width="16" stroke-linecap="round" fill="none" opacity=".34" filter="url(#soSoft)"/>' +
        '<path id="gvArm" d="M352 766 L1003 752" stroke="url(#gvNickel)" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        '<path id="gvArmLo" d="M352 766 L1003 752" transform="translate(0 3.6)" stroke="#1a1d21" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>' +
        '<path id="gvArmHi" d="M352 766 L1003 752" transform="translate(0 -2.8)" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".6"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + (GV_ARM.y + 10) + '" rx="42" ry="16" fill="#000" opacity=".5" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="39" ry="35" fill="url(#gvNickelBall)" stroke="#14171b" stroke-width="2.5"/>' +
        '<ellipse cx="' + (GV_ARM.x - 12) + '" cy="' + (GV_ARM.y - 12) + '" rx="13" ry="10" fill="#ffffff" opacity=".5"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="15" ry="13" fill="url(#soCapDark)"/>' +
        // 사운드박스(Exhibition reproducer)
        '<g id="gvBoxG" transform="translate(1003 752)">' +
        '<ellipse cx="2" cy="14" rx="47" ry="24" fill="#000" opacity=".5" filter="url(#soSoft)"/>' +
        '<circle cx="0" cy="0" r="45" fill="url(#gvNickel)" stroke="#15181c" stroke-width="3"/>' +
        '<circle cx="0" cy="0" r="38" fill="url(#gvNickelBall)"/>' +
        '<circle cx="0" cy="0" r="30" fill="#111316" stroke="#5b6067" stroke-width="1.5"/>' +
        '<circle cx="0" cy="0" r="25" fill="#cfc9b6" opacity=".26"/>' +
        '<ellipse cx="-9" cy="-10" rx="12" ry="8" fill="#fffdf6" opacity=".35"/>' +
        '<text x="0" y="4" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#e2dbc6" text-anchor="middle" opacity=".85">Exhibition</text>' +
        '<path d="M0 30 L0 47" stroke="url(#gvNickel)" stroke-width="8" stroke-linecap="round"/>' +
        '<path id="gvNeedle" d="M0 45 L0 59" stroke="#e8ebee" stroke-width="3.6" stroke-linecap="round"/>' +
        '<circle cx="27" cy="25" r="6.5" fill="url(#soCapDark)" stroke="#949aa1" stroke-width="1.2"/>' +
        '</g>' +
        '<ellipse id="gvArmHit" cx="1003" cy="752" rx="66" ry="52" fill="#000" fill-opacity="0" style="cursor:grab"><title>톤암 — 잡아서 원하는 곡 위에 바늘을 내려놓으세요</title></ellipse>' +

        // ── 캐비닛 우측면 + 앞면
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvOakSide)" stroke="#1b0e05" stroke-width="3"/>' +
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvGrain)" opacity=".45"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvOakFace)" stroke="#1b0e05" stroke-width="3"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvGrain)" opacity=".8"/>' +
        '<ellipse cx="430" cy="1010" rx="270" ry="120" fill="url(#gvWoodBlotch)"/>' +
        '<ellipse cx="880" cy="1080" rx="220" ry="100" fill="url(#gvWoodBlotch)"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvVarnish)"/>' +
        '<path d="M194 934 H1006" stroke="#ffd79a" stroke-width="3" opacity=".4"/>' +
        '<path d="M194 1147 H1006" stroke="#0d0603" stroke-width="4" opacity=".6"/>' +
        // 코너 기둥
        '<rect x="190" y="930" width="74" height="220" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        '<rect x="190" y="930" width="74" height="220" fill="url(#gvGrain)" opacity=".5"/>' + gvFlutes(190, 930, 74, 220) +
        '<rect x="936" y="930" width="74" height="220" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        '<rect x="936" y="930" width="74" height="220" fill="url(#gvGrain)" opacity=".5"/>' + gvFlutes(936, 930, 74, 220) +
        '<rect x="184" y="922" width="86" height="22" rx="4" fill="url(#gvOakTopFace)" stroke="#241306" stroke-width="2"/>' +
        '<rect x="930" y="922" width="86" height="22" rx="4" fill="url(#gvOakTopFace)" stroke="#241306" stroke-width="2"/>' +
        '<rect x="184" y="1128" width="86" height="24" rx="4" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        '<rect x="930" y="1128" width="86" height="24" rx="4" fill="url(#gvOakFace)" stroke="#241306" stroke-width="2"/>' +
        // 금박 데칼 — 니스 아래 인쇄된 것처럼 그림자와 하이라이트를 함께
        '<text x="602" y="1024" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#1c0d03" opacity=".55" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1021" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#e8bd6e" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1019" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#fff0c8" opacity=".35" text-anchor="middle">Victor</text>' +
        '<path d="M462 1040 Q600 1062 738 1040" fill="none" stroke="#d8ab5c" stroke-width="2.4" opacity=".75"/>' +
        '<text x="600" y="1084" font-family="Arial" font-size="16" font-weight="600" letter-spacing="3.2" fill="#f0c583" text-anchor="middle" opacity=".92">VICTOR TALKING MACHINE CO.</text>' +
        '<text x="600" y="1112" font-family="Arial" font-size="13" letter-spacing="2.8" fill="#c79a58" text-anchor="middle" opacity=".8">CAMDEN, N.J. &#183; VICTOR V</text>' +
        // 굽도리 2단 + 바닥 접지
        molding(168, 1032, 1148, 1176) +
        molding(146, 1054, 1174, 1210) +
        '<ellipse cx="620" cy="1216" rx="520" ry="24" fill="#000" opacity=".6" filter="url(#soWide)"/>' +

        // ── 태엽 크랭크 (우측면)
        '<ellipse cx="1120" cy="950" rx="31" ry="29" fill="url(#gvNickelBall)" stroke="#14171b" stroke-width="2.5"/>' +
        '<ellipse cx="1112" cy="942" rx="10" ry="8" fill="#ffffff" opacity=".5"/>' +
        '<path d="M1120 950 L1214 936" stroke="url(#gvNickel)" stroke-width="14" stroke-linecap="round"/>' +
        '<path d="M1124 946 L1210 933" stroke="#ffffff" stroke-width="3" opacity=".4" stroke-linecap="round"/>' +
        '<g id="gvCrankG" transform="rotate(0 1214 936)">' +
        '<path d="M1214 936 L1214 856" stroke="url(#gvNickel)" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M1211 934 L1211 858" stroke="#ffffff" stroke-width="2.6" opacity=".45" stroke-linecap="round"/>' +
        '<rect x="1199" y="822" width="30" height="50" rx="14" fill="#6b4423" stroke="#221105" stroke-width="2"/>' +
        '<rect x="1204" y="828" width="8" height="38" rx="4" fill="#b78455" opacity=".65"/>' +
        '<rect x="1199" y="822" width="30" height="50" rx="14" fill="url(#gvVarnish)"/>' +
        '</g>' +
        '<circle id="gvCrankHit" cx="1214" cy="900" r="76" fill="#000" fill-opacity="0" style="cursor:pointer"><title>태엽 크랭크 — 돌려서 스프링 모터를 감습니다</title></circle>' +
        '<text x="1214" y="1002" font-family="Arial" font-size="14" font-weight="700" letter-spacing="2.4" fill="#c9a066" text-anchor="middle">WIND</text>' +

        // ── 상판 조작부: 조속기 · 브레이크
        '<g id="gvSpeedPlate">' +
        '<ellipse cx="286" cy="886" rx="55" ry="31" fill="#000" opacity=".5" filter="url(#soSoft)"/>' +
        '<ellipse cx="284" cy="876" rx="53" ry="30" fill="url(#gvNickel)" stroke="#181b20" stroke-width="2"/>' +
        '<ellipse cx="284" cy="874" rx="49" ry="26" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".4"/>' +
        '<ellipse cx="284" cy="876" rx="41" ry="22" fill="#101216"/>' +
        '<ellipse cx="284" cy="874" rx="41" ry="22" fill="none" stroke="#000" stroke-width="2" opacity=".6"/>' +
        '<text x="284" y="864" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.3" fill="#c3c8cc" text-anchor="middle">SPEED</text>' +
        '<path id="gvSpeedPtr" d="M284 876 L284 857" stroke="#f6efdc" stroke-width="3.6" stroke-linecap="round" transform="rotate(0 284 876)"/>' +
        '<text id="gvSpeedText" x="284" y="891" font-family="Arial" font-size="11.5" font-weight="700" fill="#f0e4c8" text-anchor="middle">78</text>' +
        '</g>' +
        '<ellipse id="gvSpeedHit" cx="284" cy="876" rx="60" ry="36" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none"><title>SPEED — 위아래로 끌어 회전수를 60~88rpm으로 조절</title></ellipse>' +
        '<ellipse cx="1110" cy="784" rx="34" ry="22" fill="#000" opacity=".45" filter="url(#soSoft)"/>' +
        '<ellipse cx="1108" cy="776" rx="34" ry="22" fill="url(#gvNickel)" stroke="#181b20" stroke-width="2"/>' +
        '<ellipse cx="1108" cy="774" rx="30" ry="18" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".35"/>' +
        '<path id="gvBrakeLever" d="M1108 776 L1138 746" stroke="#0e0f12" stroke-width="12" stroke-linecap="round" transform="rotate(0 1108 776)"/>' +
        '<circle cx="1108" cy="776" r="10" fill="url(#gvNickelBall)"/>' +
        '<text x="1108" y="812" font-family="Arial" font-size="11.5" font-weight="700" letter-spacing="1.6" fill="#c9a066" text-anchor="middle">BRAKE</text>' +
        '<ellipse id="gvBrakeHit" cx="1116" cy="768" rx="52" ry="42" fill="#000" fill-opacity="0" style="cursor:pointer"><title>브레이크 — 플래터를 세우고 다시 돌립니다</title></ellipse>' +

        // ── 바늘통 (탁자 위)
        '<g id="gvTinG">' +
        '<ellipse cx="1276" cy="1152" rx="72" ry="26" fill="#000" opacity=".6" filter="url(#soSoft)"/>' +
        '<g stroke="#c9ccce" stroke-width="2.4" stroke-linecap="round" opacity=".9">' +
        '<path d="M1352 1152 L1394 1146"/><path d="M1356 1162 L1400 1158"/><path d="M1350 1140 L1388 1132"/></g>' +
        '<ellipse cx="1268" cy="1140" rx="62" ry="23" fill="#5e1f16" stroke="#2a0d07" stroke-width="2"/>' +
        '<rect x="1206" y="1116" width="124" height="24" fill="#6d241b"/>' +
        '<rect x="1206" y="1116" width="124" height="24" fill="url(#gvVarnish)" opacity=".6"/>' +
        '<ellipse cx="1268" cy="1116" rx="62" ry="23" fill="#a03d2c" stroke="#2a0d07" stroke-width="2"/>' +
        '<ellipse cx="1268" cy="1112" rx="56" ry="19" fill="#bb4f38" opacity=".55"/>' +
        '<ellipse cx="1252" cy="1106" rx="26" ry="8" fill="#ffffff" opacity=".16"/>' +
        '<ellipse cx="1268" cy="1116" rx="44" ry="15" fill="none" stroke="#f0d19a" stroke-width="1.6" opacity=".85"/>' +
        '<text x="1268" y="1113" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#f8e8bf" text-anchor="middle">Victor</text>' +
        '<text x="1268" y="1128" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.7" fill="#f4dbaa" text-anchor="middle">NEEDLES</text>' +
        '</g>' +
        '<ellipse id="gvTinHit" cx="1276" cy="1130" rx="88" ry="44" fill="#000" fill-opacity="0" style="cursor:pointer"><title>바늘통 — 새 강철 바늘로 갈아 끼웁니다 (한 면마다 교체)</title></ellipse>' +
        '<text x="1268" y="1200" font-family="Arial" font-size="13" font-weight="600" letter-spacing="1.8" fill="#a4834f" text-anchor="middle">바늘 교체</text>' +

        // ── 오른쪽 정보 열
        '<text x="1470" y="90" font-family="Arial" font-size="15" font-weight="700" letter-spacing="3.6" fill="#a9895a">78 R.P.M. &#183; ACOUSTIC</text>' +
        '<rect x="1478" y="120" width="462" height="462" rx="5" fill="#000" opacity=".55" filter="url(#soSoft)"/>' +
        '<rect x="1470" y="112" width="462" height="462" rx="5" fill="url(#gvPaper)" stroke="#7d6b48" stroke-width="2"/>' +
        '<g clip-path="url(#gvSleeveClip)">' +
        '<rect x="1470" y="112" width="462" height="462" fill="url(#gvVarnish)" opacity=".35"/>' +
        '<circle cx="1701" cy="343" r="140" fill="#0b0908"/>' +
        '<circle cx="1701" cy="343" r="140" fill="none" stroke="#6d5c3c" stroke-width="4"/>' +
        '<circle cx="1701" cy="343" r="134" fill="none" stroke="#efe3c6" stroke-width="1.4" opacity=".3"/>' +
        '<circle id="gvSleeveLabel" cx="1701" cy="343" r="104" fill="#b7472f"/>' +
        '<circle cx="1701" cy="343" r="104" fill="none" stroke="#000" stroke-width="2" opacity=".3"/>' +
        '<circle cx="1701" cy="343" r="97" fill="none" stroke="#eadfc4" stroke-width="2" opacity=".55"/>' +
        '<text id="gvSleeveBig" x="1701" y="314" font-family="Georgia, serif" font-size="27" font-weight="700" fill="#f8f0da" text-anchor="middle"></text>' +
        '<text id="gvSleeveTitle" x="1701" y="345" font-family="Arial" font-size="14" fill="#f4e9cc" text-anchor="middle"></text>' +
        '<text id="gvSleeveArtist" x="1701" y="369" font-family="Arial" font-size="12" fill="#e6d5ae" text-anchor="middle"></text>' +
        '<text x="1701" y="398" font-family="Arial" font-size="11.5" font-weight="700" letter-spacing="1.8" fill="#f4e9cc" text-anchor="middle">78 R.P.M.</text>' +
        '<circle cx="1701" cy="343" r="7" fill="#0d0b09"/>' +
        '<path d="M1470 112 H1932 M1470 574 H1932" stroke="#8a7752" stroke-width="1" opacity=".5"/>' +
        '<text x="1494" y="154" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#5f4f33">Victor Record</text>' +
        '<text id="gvSleeveNote" x="1494" y="546" font-family="Arial" font-size="13" fill="#5f4f33"></text>' +
        '</g>' +
        '<g id="gvCrateBtn" style="cursor:pointer"><title>음반 수납장 열기</title>' +
        '<rect x="1470" y="600" width="296" height="42" rx="8" fill="#000" opacity=".5"/>' +
        '<rect x="1470" y="596" width="296" height="42" rx="8" fill="#241f18" stroke="#6b5836" stroke-width="1.5"/>' +
        '<path d="M1476 601 H1760" stroke="#ffffff" stroke-width="1.4" opacity=".14"/>' +
        '<text id="gvCrateLabel" x="1618" y="624" font-family="Arial" font-size="14" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#9636; 음반 수납장</text></g>' +
        '<circle id="gvPrevRec" cx="1820" cy="617" r="25" fill="#241f18" stroke="#6b5836" stroke-width="1.5" style="cursor:pointer"><title>이전 음반</title></circle>' +
        '<text x="1820" y="626" font-family="Georgia, serif" font-size="26" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#8249;</text>' +
        '<circle id="gvNextRec" cx="1892" cy="617" r="25" fill="#241f18" stroke="#6b5836" stroke-width="1.5" style="cursor:pointer"><title>다음 음반</title></circle>' +
        '<text x="1892" y="626" font-family="Georgia, serif" font-size="26" fill="#ddcaa0" text-anchor="middle" pointer-events="none">&#8250;</text>' +
        '<g id="gvTrackList" clip-path="url(#gvListClip)"></g>' +
        // 태엽·바늘 게이지
        '<rect x="1470" y="1050" width="462" height="118" rx="9" fill="url(#gvPlate)" stroke="#4a3c26" stroke-width="1.5"/>' +
        '<path d="M1476 1054 H1926" stroke="#ffffff" stroke-width="1.4" opacity=".1"/>' +
        '<text x="1492" y="1088" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#b09060">태엽 WIND</text>' +
        '<rect x="1616" y="1076" width="200" height="13" rx="6.5" fill="#080604" stroke="#4a3d29"/>' +
        '<rect id="gvWindBar" x="1616" y="1076" width="200" height="13" rx="6.5" fill="#d7a24a"/>' +
        '<rect x="1616" y="1076" width="200" height="5" rx="2.5" fill="#ffffff" opacity=".12" pointer-events="none"/>' +
        '<text id="gvWindText" x="1912" y="1088" font-family="Arial" font-size="12" font-weight="700" fill="#e0c99b" text-anchor="end">100%</text>' +
        '<text x="1492" y="1134" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#b09060">바늘 NEEDLE</text>' +
        '<rect x="1616" y="1122" width="200" height="13" rx="6.5" fill="#080604" stroke="#4a3d29"/>' +
        '<rect id="gvNeedleBar" x="1616" y="1122" width="0" height="13" rx="6.5" fill="#8d7b4e"/>' +
        '<rect x="1616" y="1122" width="200" height="5" rx="2.5" fill="#ffffff" opacity=".08" pointer-events="none"/>' +
        '<text id="gvNeedleText" x="1912" y="1134" font-family="Arial" font-size="12" font-weight="700" fill="#e0c99b" text-anchor="end">새 바늘</text>' +
        '<text id="gvCredit" x="60" y="1226" font-family="Arial" font-size="12" fill="#7d6747"></text>' +
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
        shell: ["#6a635b", "#3b3630", "#211e1c", "#100e0d"],
        shellEdge: "#080707",
        rim: "#8b8378",
        band: ["#332f2b", "#1a1817", "#0c0b0b"],
        ivory: ["#f6f1e2", "#e9dfc6", "#cdc0a0"],
        grille: "#eae2cc",
        perf: "#5f5847",
        ink: "#2b2721",
        sub: "#6b6353",
        bandInk: "#b3ac9d",
        script: "#d19a45",
        leg: "#161514"
    },
    mint: {
        label: "금성 A-501 · 민트",
        shell: ["#b6dbca", "#8cbcaa", "#5f9483", "#356d5c"],
        shellEdge: "#254e42",
        rim: "#c8e4d8",
        band: ["#5d8e7d", "#43705f", "#2c5348"],
        ivory: ["#f8f3e5", "#ece4cd", "#d5cbad"],
        grille: "#f2ebd8",
        perf: "#6b6f5f",
        ink: "#28322c",
        sub: "#5a6a61",
        bandInk: "#dcecdf",
        script: "#d19a45",
        leg: "#2b4b40"
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
            out += '<text x="' + (Number(x) + 1.5) + '" y="' + (A5_DIAL.y0 + 3.5) + '" font-family="Arial" font-size="34" font-weight="700" fill="#ffffff" opacity=".5" text-anchor="middle">' + f + '</text>' +
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
            '<text x="' + x + '" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="27" font-weight="600" fill="' + t.ink + '" text-anchor="middle" opacity=".85">' + lbl + '</text>').join("") +
            bands.map(([lbl, x]) =>
                '<text x="' + x + '" y="' + (A5_DIAL.y1 + 26) + '" font-family="Arial" font-size="15" fill="' + t.sub + '" text-anchor="middle" opacity=".85">' + lbl + '</text>').join("");
    })();

    return '<svg class="solo-svg a5-svg a5-' + key + '" data-finish="' + key + '" viewBox="0 0 2000 880" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="금성 A-501 진공관 라디오 ' + t.label + '">' +
        '<defs>' + soloMaterialDefs("a5") +
        // 사출 플라스틱 — 위로 갈수록 밝고 아래는 어둡되, 상단 곡면에 넓은 광택 띠
        '<linearGradient id="a5Shell" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.shell[0] + '"/><stop offset=".14" stop-color="' + t.shell[1] + '"/>' +
        '<stop offset=".55" stop-color="' + t.shell[2] + '"/><stop offset=".88" stop-color="' + t.shell[3] + '"/>' +
        '<stop offset="1" stop-color="' + t.shellEdge + '"/></linearGradient>' +
        '<linearGradient id="a5ShellSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000000" stop-opacity=".62"/><stop offset=".07" stop-color="#000000" stop-opacity=".22"/>' +
        '<stop offset=".26" stop-color="#ffffff" stop-opacity=".05"/><stop offset=".74" stop-color="#000000" stop-opacity=".08"/>' +
        '<stop offset=".94" stop-color="#000000" stop-opacity=".32"/><stop offset="1" stop-color="#000000" stop-opacity=".66"/></linearGradient>' +
        '<linearGradient id="a5Gloss" x1="0" y1="0" x2=".2" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".22"/><stop offset=".1" stop-color="#ffffff" stop-opacity=".05"/>' +
        '<stop offset=".3" stop-color="#ffffff" stop-opacity="0"/><stop offset=".9" stop-color="#000000" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity=".34"/></linearGradient>' +
        '<linearGradient id="a5Band" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.band[0] + '"/><stop offset=".45" stop-color="' + t.band[1] + '"/><stop offset="1" stop-color="' + t.band[2] + '"/></linearGradient>' +
        // 상아색 인서트 — 살짝 광택 있는 아이보리
        '<linearGradient id="a5Ivory" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + t.ivory[0] + '"/><stop offset=".5" stop-color="' + t.ivory[1] + '"/><stop offset="1" stop-color="' + t.ivory[2] + '"/></linearGradient>' +
        '<linearGradient id="a5Glass" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fffbef"/><stop offset=".34" stop-color="#f4ecd6"/><stop offset=".78" stop-color="#e6dabb"/><stop offset="1" stop-color="#cfc19d"/></linearGradient>' +
        '<linearGradient id="a5GlassSheen" x1="0" y1="0" x2=".8" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset=".14" stop-color="#ffffff" stop-opacity=".16"/>' +
        '<stop offset=".26" stop-color="#ffffff" stop-opacity=".02"/><stop offset=".54" stop-color="#ffffff" stop-opacity=".12"/>' +
        '<stop offset=".62" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#8a7f66" stop-opacity=".16"/></linearGradient>' +
        '<linearGradient id="a5InsetTop" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#3a3226" stop-opacity=".45"/><stop offset=".2" stop-color="#3a3226" stop-opacity=".1"/>' +
        '<stop offset="1" stop-color="#3a3226" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="a5GrilleShade" cx=".38" cy=".34" r=".85">' +
        '<stop offset=".4" stop-color="#000000" stop-opacity="0"/><stop offset=".8" stop-color="#241f14" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="#1a160e" stop-opacity=".38"/></radialGradient>' +
        '<radialGradient id="a5LampWash" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ffe6a8" stop-opacity=".55"/><stop offset=".55" stop-color="#ffd484" stop-opacity=".18"/><stop offset="1" stop-color="#ffc464" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5FilGlow" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ff9d3c" stop-opacity=".55"/><stop offset=".5" stop-color="#e8722a" stop-opacity=".2"/><stop offset="1" stop-color="#c85a1e" stop-opacity="0"/></radialGradient>' +
        // 타공판 — 구멍 아래에 밝은 립을 두면 두께가 생긴다
        '<pattern id="a5Perf" width="13" height="13" patternUnits="userSpaceOnUse">' +
        '<circle cx="6.5" cy="7.6" r="2.9" fill="#ffffff" opacity=".55"/>' +
        '<circle cx="6.5" cy="6.5" r="2.9" fill="' + t.perf + '"/>' +
        '<circle cx="6.5" cy="6.1" r="2.4" fill="#000000" opacity=".3"/></pattern>' +
        '<radialGradient id="a5LampGlass" cx=".34" cy=".3" r=".85">' +
        '<stop offset="0" stop-color="#8ef0b0"/><stop offset=".45" stop-color="#3fae6b"/><stop offset="1" stop-color="#123a22"/></radialGradient>' +
        '<clipPath id="a5GlassClip"><rect x="905" y="243" width="845" height="392" rx="7"/></clipPath>' +
        '<clipPath id="a5GrilleClip"><rect x="250" y="243" width="643" height="392" rx="7"/></clipPath>' +
        '<clipPath id="a5ShellClip"><path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z"/></clipPath>' +
        '</defs>' +

        '<rect width="2000" height="880" rx="10" fill="#100f0e"/>' +
        '<ellipse cx="940" cy="420" rx="900" ry="400" fill="#2e2b27" opacity=".55" filter="url(#soWide)"/>' +
        '<ellipse cx="1000" cy="846" rx="820" ry="34" fill="#000" opacity=".7" filter="url(#soWide)"/>' +

        // ── 캐비닛 — 아래가 넓고 위로 좁아지며 윗면이 완만하게 휜다
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="#000" opacity=".6" filter="url(#soSoft)" transform="translate(8 14)"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Shell)" stroke="' + t.shellEdge + '" stroke-width="3"/>' +
        '<g clip-path="url(#a5ShellClip)">' +
        '<rect x="150" y="96" width="1700" height="704" fill="url(#a5ShellSide)"/>' +
        // 상단 곡면을 따라 흐르는 넓은 광택 띠
        '<path d="M205 214 Q1000 112 1795 214 L1790 268 Q1000 168 210 268 Z" fill="#ffffff" opacity=".16" filter="url(#soSoft)"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Gloss)"/>' +
        '</g>' +
        // 윗면 — 뒤로 넘어간 곡면
        '<path d="M205 200 Q1000 96 1795 200 Q1000 128 205 200 Z" fill="' + t.shellEdge + '" opacity=".85"/>' +
        '<path d="M209 197 Q1000 100 1791 197" fill="none" stroke="' + t.rim + '" stroke-width="3.2" opacity=".7"/>' +
        '<path d="M209 193 Q1000 96 1791 193" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".3"/>' +

        // ── 상아색 인서트 — 크롬 베젤 안에 앉힌다
        '<rect x="228" y="221" width="1544" height="436" rx="16" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<rect x="234" y="227" width="1528" height="420" rx="13" fill="url(#soChromeV)"/>' +
        '<rect x="240" y="233" width="1516" height="408" rx="10" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".45"/>' +
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Ivory)"/>' +

        // ── 좌: 타공 스피커 그릴
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="' + t.grille + '"/>' +
        '<g clip-path="url(#a5GrilleClip)">' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5Perf)"/>' +
        '<ellipse id="a5TubeGlow" cx="572" cy="440" rx="300" ry="210" fill="url(#a5FilGlow)" opacity="0"/>' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5GrilleShade)"/>' +
        '<rect x="250" y="243" width="643" height="18" fill="url(#a5InsetTop)"/>' +
        '</g>' +
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="none" stroke="#8f8770" stroke-width="1.8" opacity=".6"/>' +
        // 금성 왕관 엠블럼 — 금속 압인처럼 그림자와 하이라이트를 함께
        '<g id="a5Crest" transform="translate(312 286) scale(1.35)">' +
        '<path d="M1 30 L5 6 L15 22 L25 0 L35 22 L45 6 L49 30 Z" fill="#4a3212" opacity=".45"/>' +
        '<path d="M0 28 L4 4 L14 20 L24 -2 L34 20 L44 4 L48 28 Z" fill="' + t.script + '" stroke="#7d5419" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M0 28 L4 4 L14 20 L24 -2" fill="none" stroke="#ffe6ad" stroke-width="1.4" opacity=".85"/>' +
        '<rect x="-2" y="29" width="52" height="7" rx="3" fill="' + t.script + '" stroke="#7d5419" stroke-width="1.2"/>' +
        '<rect x="-1" y="29.6" width="50" height="2" rx="1" fill="#ffe6ad" opacity=".6"/>' +
        '<circle cx="24" cy="-8" r="4.4" fill="#f0c987" stroke="#7d5419" stroke-width="1"/>' +
        '<circle cx="4" cy="1" r="3" fill="#f0c987"/><circle cx="44" cy="1" r="3" fill="#f0c987"/>' +
        '</g>' +

        // ── 우: 다이얼 유리
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="url(#a5Glass)"/>' +
        '<g clip-path="url(#a5GlassClip)">' +
        '<ellipse id="a5DialLamp" cx="1330" cy="420" rx="440" ry="230" fill="url(#a5LampWash)" opacity="0"/>' +
        // FM 행 (작동 눈금)
        '<text x="922" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="25" font-weight="700" letter-spacing="1" fill="' + t.sub + '">FM</text>' +
        fmTicks +
        '<g id="a5Marks"></g>' +
        // SW 행 (실물 눈금)
        '<text x="922" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="25" font-weight="700" letter-spacing="1" fill="' + t.sub + '">SW</text>' +
        swScale +
        '<text x="1626" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="20" font-weight="600" fill="' + t.sub + '">MHz</text>' +
        '<text x="1626" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="20" font-weight="600" fill="' + t.sub + '">MC</text>' +
        // 바늘 — 두 눈금을 함께 가로지르는 한 개의 지침
        '<g id="a5Ptr" transform="translate(0,0)">' +
        '<path d="M' + (A5_DIAL.drawX + 3) + ' 264 V468" stroke="#6b5f45" stroke-width="4" opacity=".3"/>' +
        '<path d="M' + A5_DIAL.drawX + ' 262 V470" stroke="#7d1f14" stroke-width="3"/>' +
        '<path d="M' + (A5_DIAL.drawX + 1) + ' 262 V470" stroke="#ef7b5c" stroke-width="1.1" opacity=".8"/>' +
        '<path d="M' + (A5_DIAL.drawX - 9) + ' 257 L' + (A5_DIAL.drawX + 9) + ' 257 L' + A5_DIAL.drawX + ' 274 Z" fill="#7d1f14"/>' +
        '<path d="M' + (A5_DIAL.drawX - 6) + ' 259 L' + (A5_DIAL.drawX + 2) + ' 259" stroke="#ef7b5c" stroke-width="1.4" opacity=".7"/>' +
        '</g>' +
        // 현재 방송 이름 — 다이얼 유리에 인쇄된 국명 자리
        '<text id="a5StationText" x="1330" y="516" font-family="Arial" font-size="24" font-weight="600" letter-spacing="1.6" fill="' + t.ink + '" text-anchor="middle" opacity=".88"></text>' +
        '<text x="1332" y="614" font-family="Georgia, serif" font-size="27" font-style="italic" font-weight="700" letter-spacing="3" fill="#ffffff" opacity=".45" text-anchor="middle">TWO BAND SUPER HETERODYNE</text>' +
        '<text x="1330" y="612" font-family="Georgia, serif" font-size="27" font-style="italic" font-weight="700" letter-spacing="3" fill="' + t.sub + '" text-anchor="middle" opacity=".95">TWO BAND SUPER HETERODYNE</text>' +
        // 유리면 반사
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5GlassSheen)" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="20" fill="url(#a5InsetTop)" pointer-events="none"/>' +
        '<path d="M918 256 H1738" stroke="#ffffff" stroke-width="2.4" opacity=".5" pointer-events="none"/>' +
        '</g>' +
        // 10KC 배지 — 앱에서는 동조(신호) 표시등으로 켜진다
        '<circle cx="1702" cy="292" r="33" fill="#000" opacity=".45"/>' +
        '<circle cx="1702" cy="290" r="33" fill="url(#soChromeV)"/>' +
        '<circle cx="1702" cy="290" r="28" fill="#12291b"/>' +
        '<circle id="a5Lamp" cx="1702" cy="290" r="26" fill="url(#a5LampGlass)"/>' +
        '<ellipse cx="1693" cy="279" rx="10" ry="6" fill="#ffffff" opacity=".35" pointer-events="none"/>' +
        '<text x="1702" y="296" font-family="Arial" font-size="15" font-weight="700" fill="#e2f4e6" text-anchor="middle" pointer-events="none">10KC</text>' +
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="none" stroke="#8f8770" stroke-width="1.8" opacity=".6"/>' +

        // ── 스피어 몰딩 — 양 끝이 뾰족하게 좁아지며 전면을 가로지르는 크롬 장식
        '<path d="M256 574 L1000 550 L1744 574 L1000 600 Z" fill="#000" opacity=".35" filter="url(#soTight)"/>' +
        '<path d="M256 566 L1000 538 L1744 566 L1000 594 Z" fill="url(#soChromeV)" stroke="#3c4247" stroke-width="2"/>' +
        '<path d="M320 562 L1000 544 L1680 562" fill="none" stroke="#ffffff" stroke-width="5" opacity=".95"/>' +
        '<path d="M320 572 L1000 558 L1680 572" fill="none" stroke="#9aa1a8" stroke-width="2" opacity=".7"/>' +
        '<path d="M320 580 L1000 568 L1680 580" fill="none" stroke="#22282f" stroke-width="2.4" opacity=".65"/>' +
        '<path d="M256 566 L372 558 M1628 558 L1744 566" stroke="#eef1f3" stroke-width="1.8" opacity=".85"/>' +

        // 다이얼 드래그 히트존
        '<rect id="a5DialHit" x="930" y="252" width="800" height="230" fill="#000" fill-opacity="0" style="cursor:ew-resize;touch-action:none" tabindex="0" role="slider" aria-label="주파수 다이얼 — 드래그하여 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>드래그하여 주파수를 맞추세요</title></rect>' +

        // ── 하단 어두운 띠 — 로고와 세 노브
        '<rect x="196" y="647" width="1608" height="153" fill="url(#a5Band)"/>' +
        '<rect x="196" y="647" width="1608" height="5" fill="#ffffff" opacity=".12"/>' +
        '<rect x="196" y="794" width="1608" height="6" fill="#000000" opacity=".45"/>' +
        '<rect x="262" y="690" width="54" height="32" rx="4" fill="#000" opacity=".4"/>' +
        '<rect x="262" y="688" width="54" height="32" rx="4" fill="url(#soChromeV)" stroke="#0d0d0e" stroke-width="1.5"/>' +
        '<rect x="277" y="694" width="11" height="20" rx="2" fill="#16171a"/>' +
        '<text x="382" y="744" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#3a2609" opacity=".55">GoldStar</text>' +
        '<text x="380" y="742" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="' + t.script + '">GoldStar</text>' +
        '<text x="380" y="740" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#ffe6ad" opacity=".3">GoldStar</text>' +
        '<path d="M382 752 Q520 768 660 748" fill="none" stroke="' + t.script + '" stroke-width="2.4" opacity=".7"/>' +
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
        '<g fill="' + t.bandInk + '" opacity=".3"><circle cx="1372" cy="700" r="2.6"/><circle cx="1420" cy="690" r="2.6"/><circle cx="1468" cy="700" r="2.6"/></g>' +
        '<circle id="a5VolHit" cx="1146" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="음량 — 좌우로 끌어 조절, 왼쪽 끝은 전원 OFF" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><title>VOLUME — 좌우로 끌어 음량 조절 (반시계 끝 = 전원 OFF)</title></circle>' +
        '<circle id="a5SelHit" cx="1420" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="밴드 선택 — SC 방송 · SW 단파"><title>SELECT — SC(방송 수신) · SW(단파). PU(픽업 입력)는 연결된 기기가 없습니다</title></circle>' +
        '<circle id="a5TuneHit" cx="1694" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="선국 노브 — 좌우로 끌어 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>TUNER — 좌우로 끌어 선국하세요</title></circle>' +

        // ── 다리 — 아래로 벌어진 두 발
        '<path d="M404 798 L472 798 L440 866 L344 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M410 802 L462 802 L437 856" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".14"/>' +
        '<path d="M1528 798 L1596 798 L1656 866 L1560 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M1538 802 L1590 802 L1628 856" fill="none" stroke="#ffffff" stroke-width="2.4" opacity=".14"/>' +
        '<ellipse cx="392" cy="868" rx="64" ry="10" fill="#000" opacity=".65" filter="url(#soTight)"/>' +
        '<ellipse cx="1608" cy="868" rx="64" ry="10" fill="#000" opacity=".65" filter="url(#soTight)"/>' +
        '<text x="1804" y="838" font-family="Arial" font-size="13" letter-spacing="1.6" fill="' + t.bandInk + '" opacity=".5" text-anchor="end">金星社 &#183; A-501 &#183; AC 5球 &#183; 1959</text>' +
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
};
const SOLO_ORDER = ["victorv", "a501"];
