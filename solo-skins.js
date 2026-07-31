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
            '<rect x="' + (cx - r * 0.06) + '" y="' + (cy - capR + r * 0.04) + '" width="' + (r * 0.12) + '" height="' + (capR * 0.82) + '" rx="' + (r * 0.06) + '" fill="#ddd9cd"/>' +
            '<rect x="' + (cx - r * 0.022) + '" y="' + (cy - capR + r * 0.07) + '" width="' + (r * 0.044) + '" height="' + (capR * 0.76) + '" fill="#f2eee0" opacity=".62"/>' +
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

// ── 세월의 흔적을 만드는 프랙탈 노이즈 오버레이 ────────────────────────────
// 손으로 찍은 얼룩은 규칙이 보여 금세 그림이 된다. feTurbulence로 불규칙한
// 마스크를 만들고 feColorMatrix의 알파 행으로 문턱값을 잘라 얼룩덜룩한 때·변색·
// 부식을 만든다. RGB 행은 상수로 고정해 '무슨 색의 때인지'만 지정한다.
//   alpha = aR·R + aG·G + off  (노이즈 평균 0.5 → off로 밀도를 조절)
// 비용: 필터당 한 번만 래스터라이즈된다. 회전하는 요소 위에는 절대 걸지 않는다.
function soloGrime(id, rgb, aR, aG, off, freq, octaves, seed) {
    return '<filter id="' + id + '" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + octaves + '" seed="' + seed + '" result="t"/>' +
        // 난류 출력은 알파도 노이즈다(프리멀티플라이드). 알파를 1로 눕히지 않으면
        // R·G 채널값이 엔진마다 달라져 크로미움과 WebKit의 임계값이 어긋난다.
        '<feColorMatrix in="t" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="' +
        '0 0 0 0 ' + rgb[0] + ' 0 0 0 0 ' + rgb[1] + ' 0 0 0 0 ' + rgb[2] + ' ' +
        aR + ' ' + aG + ' 0 0 ' + off + '"/>' +
        '</filter>';
}

// ── 오래된 물건을 찍은 사진의 색과 빛 ──────────────────────────────────
// 골동품 사진에는 순수한 검정도 순수한 흰색도 없다. 검정은 들리고 흰색은 눌리며,
// 전체가 앰버로 치우치고 채도가 낮다. 여기에 렌즈 비네팅과 필름 그레인이 얹힌다.
// SVG 루트 전체에 필터를 걸면 회전 갱신마다 다시 래스터라이즈되므로, 같은 결과를
// 정적 오버레이 레이어로만 만든다. (applyPanelLighting이 얹는 조명과 충돌하지 않는다)
function soloFilmGrade(x, y, w, h) {
    return '<g class="solo-grade" pointer-events="none">' +
        // 리프티드 블랙 + 앰버 시프트 — 그늘에 공기가 낀다
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#6b4f2e" opacity=".07"/>' +
        // 렌즈 비네팅
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#soVignette)"/>' +
        // 필름 그레인 — 벡터 특유의 무결점 면을 깨는 마지막 한 겹
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" filter="url(#soGrainL)" opacity=".05"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" filter="url(#soGrainD)" opacity=".07"/>' +
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
        // 세월 먹은 크롬 — 흰 하이라이트가 눌리고 전체가 회색 쪽으로 내려앉는다
        '<linearGradient id="soChromeAged" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#cfd2d1"/><stop offset=".2" stop-color="#8d918f"/><stop offset=".42" stop-color="#dcdedb"/>' +
        '<stop offset=".64" stop-color="#6a6e6d"/><stop offset=".86" stop-color="#a9aeac"/><stop offset="1" stop-color="#34383a"/></linearGradient>' +
        '<radialGradient id="soCapDark" cx=".34" cy=".28" r=".92">' +
        '<stop offset="0" stop-color="#454951"/><stop offset=".38" stop-color="#25282e"/><stop offset=".76" stop-color="#141619"/><stop offset="1" stop-color="#08090b"/></radialGradient>' +
        '<pattern id="soKnurl" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">' +
        '<path d="M1 0V7 M4.5 0V7" stroke="#c3c7ce" stroke-width=".9" opacity=".3"/>' +
        '<path d="M2.5 0V7 M6 0V7" stroke="#050608" stroke-width="1.2" opacity=".7"/></pattern>' +
        '<filter id="soSoft" x="-45%" y="-45%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>' +
        '<filter id="soWide" x="-60%" y="-60%" width="240%" height="240%"><feGaussianBlur stdDeviation="26"/></filter>' +
        '<filter id="soTight" x="-30%" y="-30%" width="170%" height="170%"><feGaussianBlur stdDeviation="2.6"/></filter>' +
        '<radialGradient id="soVignette" cx=".48" cy=".44" r=".78">' +
        '<stop offset=".5" stop-color="#000000" stop-opacity="0"/><stop offset=".82" stop-color="#0a0603" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="#070402" stop-opacity=".42"/></radialGradient>' +
        soloGrime("soGrainL", [0.72, 0.66, 0.54], 2.4, 1.1, -1.86, "0.75", 1, 3) +
        soloGrime("soGrainD", [0.06, 0.04, 0.02], 2.4, 1.1, -1.86, "0.82", 1, 9);
}

// ===================================================================
// VICTOR V — 어쿠스틱 축음기
// ===================================================================
// 원근: 케이스 앞면 → 뒷면 오프셋 (160, -190). 상판·우측면·굽도리 모두 같은 벡터.
// 고정 좌표(런타임이 의존): 플래터 중심 (680,835) rx300 ry82,
// 톤암 브래킷 (352,766), 거치 반경비 1.28.
const GV_PC = { x: 680, y: 835, rx: 300, ry: 82 };
const GV_K = GV_PC.ry / GV_PC.rx;          // 원근 압축비 — 원판을 눕혀 보는 각도
const GV_ARM = { x: 392, y: 782 };         // 톤암 뒷마운트(피벗) — 상판 뒤 왼쪽 모서리 안쪽
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
        // ── 오크: 100년 묵은 셸락 니스. 니스가 산화해 훨씬 어둡고 붉어졌고, 결의 대비도
        //    커졌다(도관에 때가 끼어 검게 가라앉는다). 실물 사진의 명암 폭을 그대로 따른다.
        '<linearGradient id="gvOakFace" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#7e4d23"/><stop offset=".06" stop-color="#693c1b"/><stop offset=".34" stop-color="#543015"/>' +
        '<stop offset=".72" stop-color="#3d2210"/><stop offset=".92" stop-color="#26140a"/><stop offset="1" stop-color="#170c05"/></linearGradient>' +
        '<linearGradient id="gvOakTopFace" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#8a5729"/><stop offset=".28" stop-color="#6a3f1d"/><stop offset=".58" stop-color="#764824"/>' +
        '<stop offset=".82" stop-color="#4e2c14"/><stop offset="1" stop-color="#331b0b"/></linearGradient>' +
        '<linearGradient id="gvOakSide" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#40240f"/><stop offset=".4" stop-color="#4c2b13"/><stop offset=".78" stop-color="#2a1608"/><stop offset="1" stop-color="#130903"/></linearGradient>' +
        // 사분할 참나무의 결 — 가로로 길게 흐르는 도관선. 무늬가 눈에 띄게 반복되면
        // 즉시 '그림'으로 읽히므로 타일을 크게 잡고 대비를 낮춘다 (사선 플렉 없음).
        // 사분할 참나무의 도관 — 참나무는 환공재라 도관이 굵고, 사분할 판재에서는
        // 연속 선이 아니라 짧게 끊긴 파선으로 드러난다. 100년이 지나면 그 도관에
        // 먼지와 왁스가 차서 필드보다 훨씬 어두워지고, 밝던 결은 산화로 사라진다.
        // 레이 플렉도 은빛에서 필드보다 어두운 색으로 뒤집힌다.
        '<pattern id="gvGrain" width="437" height="53" patternUnits="userSpaceOnUse">' +
        '<path d="M0 5 C104 1 186 11 288 5 S392 2 437 8" fill="none" stroke="#c79a5e" stroke-width="1.2" opacity=".1" stroke-dasharray="34 9 18 13 52 7 26"/>' +
        '<path d="M0 12 C118 17 202 6 312 14 S404 18 437 13" fill="none" stroke="#0e0602" stroke-width="2.6" opacity=".46" stroke-dasharray="46 11 22 8 64 14 30"/>' +
        '<path d="M0 20 C92 15 174 25 282 19 S396 15 437 22" fill="none" stroke="#0e0602" stroke-width="1.5" opacity=".28" stroke-dasharray="28 16 52 9 40"/>' +
        '<path d="M0 27 C126 32 206 22 322 29 S412 33 437 28" fill="none" stroke="#0e0602" stroke-width="2" opacity=".38" stroke-dasharray="58 12 26 10 44 8 36"/>' +
        '<path d="M0 35 C84 31 168 40 268 34 S388 31 437 37" fill="none" stroke="#b98a52" stroke-width="1" opacity=".09" stroke-dasharray="24 14 40 8 30"/>' +
        '<path d="M0 44 C112 49 196 39 306 46 S400 50 437 45" fill="none" stroke="#0e0602" stroke-width="2.3" opacity=".42" stroke-dasharray="40 9 62 15 24 11 48"/>' +
        // 레이 플렉 — 사분할 오크의 서명. 100년 지나면 필드보다 어둡다.
        '<path d="M62 6 L70 47 M198 4 L190 49 M330 8 L338 45" stroke="#1a0d04" stroke-width="5" opacity=".13"/>' +
        '<path d="M118 10 L112 42 M268 12 L274 44 M396 6 L390 46" stroke="#1a0d04" stroke-width="3.4" opacity=".1"/>' +
        '</pattern>' +
        '<radialGradient id="gvWoodBlotch" cx=".3" cy=".3" r=".8">' +
        '<stop offset="0" stop-color="#d9a25e" stop-opacity=".14"/><stop offset=".6" stop-color="#5c3413" stop-opacity=".06"/>' +
        '<stop offset="1" stop-color="#1d0f04" stop-opacity=".2"/></radialGradient>' +
        '<linearGradient id="gvVarnish" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#ffe6bd" stop-opacity=".26"/><stop offset=".2" stop-color="#ffdfb0" stop-opacity=".08"/>' +
        '<stop offset=".46" stop-color="#ffffff" stop-opacity="0"/><stop offset=".78" stop-color="#000000" stop-opacity=".1"/>' +
        '<stop offset="1" stop-color="#000000" stop-opacity=".26"/></linearGradient>' +
        // ── 놋쇠 원뿔: (1) 좌상단 광원의 방향성 명암을 리니어로 깔고
        //    (2) 목에서 퍼지는 폐색을 라디얼로 덮은 뒤 (3) 등고선과 이음매를 얹는다.
        '<linearGradient id="gvConeKey" x1=".14" y1="0" x2=".86" y2="1">' +
        '<stop offset="0" stop-color="#33200a"/><stop offset=".16" stop-color="#553a12"/><stop offset=".34" stop-color="#82601c"/>' +
        '<stop offset=".52" stop-color="#ac7f2e"/><stop offset=".7" stop-color="#cfa64c"/><stop offset=".86" stop-color="#dcc078"/>' +
        '<stop offset="1" stop-color="#e6cf93"/></linearGradient>' +
        '<radialGradient id="gvConeThroat" cx=".16" cy=".78" r="1.02">' +
        '<stop offset="0" stop-color="#000000" stop-opacity=".97"/><stop offset=".1" stop-color="#000000" stop-opacity=".9"/>' +
        '<stop offset=".26" stop-color="#000000" stop-opacity=".7"/><stop offset=".46" stop-color="#000000" stop-opacity=".4"/>' +
        '<stop offset=".68" stop-color="#000000" stop-opacity=".16"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="gvBrassRing" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#2a1a07"/><stop offset=".1" stop-color="#d8c08a"/><stop offset=".24" stop-color="#6f5118"/>' +
        '<stop offset=".42" stop-color="#e8d7a4"/><stop offset=".58" stop-color="#7d5c20"/><stop offset=".74" stop-color="#cbb279"/>' +
        '<stop offset=".9" stop-color="#584010"/><stop offset="1" stop-color="#1c1004"/></linearGradient>' +
        '<linearGradient id="gvBrassTube" x1="0" y1="1" x2=".7" y2="0">' +
        '<stop offset="0" stop-color="#221405"/><stop offset=".16" stop-color="#664614"/><stop offset=".38" stop-color="#d9bf82"/>' +
        '<stop offset=".54" stop-color="#f0dcaa"/><stop offset=".72" stop-color="#8c6725"/><stop offset=".9" stop-color="#402c0c"/>' +
        '<stop offset="1" stop-color="#241605"/></linearGradient>' +
        '<linearGradient id="gvRimSpec" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fffdf2" stop-opacity=".9"/><stop offset=".16" stop-color="#ffeec4" stop-opacity=".32"/>' +
        '<stop offset=".44" stop-color="#ffffff" stop-opacity="0"/><stop offset=".8" stop-color="#170e02" stop-opacity=".3"/>' +
        '<stop offset="1" stop-color="#0d0801" stop-opacity=".62"/></linearGradient>' +
        // ── 니켈 도금(톤암·플래터 림·사운드박스) — 100년 지난 도금은 거울이 아니다.
        //    중성 회색이 아니라 주변 나무의 호박색을 머금은 따뜻한 회색이고, 최고 명도가 눌려 있다.
        '<linearGradient id="gvNickel" x1="0" y1="0" x2=".4" y2="1">' +
        '<stop offset="0" stop-color="#23201c"/><stop offset=".12" stop-color="#ded7c9"/><stop offset=".3" stop-color="#76706a"/>' +
        '<stop offset=".48" stop-color="#efe8d9"/><stop offset=".66" stop-color="#837c74"/><stop offset=".84" stop-color="#cbc4b6"/>' +
        '<stop offset="1" stop-color="#1d1a17"/></linearGradient>' +
        '<radialGradient id="gvNickelBall" cx=".32" cy=".26" r=".92">' +
        '<stop offset="0" stop-color="#f4efe2"/><stop offset=".2" stop-color="#cdc6b8"/><stop offset=".52" stop-color="#8a847c"/>' +
        '<stop offset=".8" stop-color="#484440"/><stop offset="1" stop-color="#1a1815"/></radialGradient>' +
        // ── 셸락판·융
        '<radialGradient id="gvShellac" cx=".4" cy=".36" r=".76">' +
        '<stop offset="0" stop-color="#2b2622"/><stop offset=".5" stop-color="#191614"/><stop offset=".86" stop-color="#100e0e"/><stop offset="1" stop-color="#231f1c"/></radialGradient>' +
        '<linearGradient id="gvDiscSpec" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#fff3d8" stop-opacity=".3"/><stop offset=".38" stop-color="#e8cfa4" stop-opacity=".07"/>' +
        '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        // 융은 색이 바래고 먼지를 먹어 탁해졌다
        '<radialGradient id="gvFelt" cx=".38" cy=".3" r=".85">' +
        '<stop offset="0" stop-color="#3c5342"/><stop offset=".55" stop-color="#2a3a2c"/><stop offset="1" stop-color="#16211a"/></radialGradient>' +
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
        // 세월의 때 — 놋쇠 변색, 목 근처의 녹청, 니스에 낀 그을음
        soloGrime("gvTarnish", [0.13, 0.095, 0.04], 1.7, 1.0, -1.24, "0.021 0.017", 5, 11) +
        soloGrime("gvVerdigris", [0.15, 0.21, 0.15], 1.9, 0.6, -1.62, "0.035", 4, 5) +
        soloGrime("gvGrime", [0.07, 0.045, 0.02], 1.4, 0.9, -1.18, "0.026 0.019", 5, 23) +
        soloGrime("gvBloom", [0.82, 0.74, 0.6], 1.5, 0.9, -1.42, "0.009 0.014", 4, 19) +
        soloGrime("gvDecalErode", [0, 0, 0], 2.2, 1.1, -1.48, "0.055 0.045", 4, 37) +
        // 폭싱 — 종이 속 철 이온과 곰팡이가 습기와 반응해 만든 산화 반점. 군집을 이룬다.
        soloGrime("gvFoxing", [0.42, 0.26, 0.11], 2.4, 1.0, -2.05, "0.045 0.05", 4, 61) +
        // 종이 가장자리 갈변 — 사각형 종이에 원형 감쇠를 걸면 네 모서리가 가장 진해진다
        '<radialGradient id="gvPaperEdge" cx=".5" cy=".48" r=".72">' +
        '<stop offset=".42" stop-color="#8a6428" stop-opacity="0"/><stop offset=".78" stop-color="#8a6428" stop-opacity=".12"/>' +
        '<stop offset="1" stop-color="#6b4a1a" stop-opacity=".34"/></radialGradient>' +
        // 셸락 니스의 크레이징 — turbulence(=|합|)는 0 근처에 골이 생긴다. 그 골만 남기면
        // 손으로 그릴 수 없는 유기적인 균열망이 된다 (fractalNoise로는 안 나온다).
        '<filter id="gvCrazeF" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="turbulence" baseFrequency="0.052 0.068" numOctaves="2" seed="31" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.08 0 0 0 0 0.045 0 0 0 0 0.018 -11 0 0 0 0.86"/>' +
        '</filter>' +
        // 마감이 닳아 생나무가 비치는 가장자리
        '<radialGradient id="gvRubEdge" cx=".5" cy=".5" r=".74">' +
        '<stop offset=".52" stop-color="#c9924f" stop-opacity="0"/><stop offset=".86" stop-color="#c9924f" stop-opacity=".09"/>' +
        '<stop offset="1" stop-color="#e2ae6c" stop-opacity=".24"/></radialGradient>' +
        '<clipPath id="gvBellClip"><ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '"/></clipPath>' +
        '<mask id="gvWornDecal"><rect x="420" y="960" width="400" height="180" fill="#fff"/>' +
        '<rect x="420" y="960" width="400" height="180" filter="url(#gvDecalErode)"/></mask>' +
        '<clipPath id="gvCabClip"><path d="M190 930 H1010 V1150 H190 Z M190 930 L350 740 H1170 L1010 930 Z"/></clipPath>' +
        '<clipPath id="gvFrontClip"><rect x="190" y="930" width="820" height="220"/></clipPath>' +
        '<clipPath id="gvTopClip"><polygon points="190,930 350,740 1170,740 1010,930"/></clipPath>' +
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

        // ── 캐비닛 상판 (원근 평행사변형)
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvOakTopFace)" stroke="#201206" stroke-width="3"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvGrain)" opacity=".6"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvVarnish)" opacity=".9"/>' +
        // 나팔이 상판에 떨구는 그림자와, 니스 먹은 상판에 비친 놋쇠의 반사
        '<ellipse cx="760" cy="812" rx="330" ry="90" fill="#0a0602" opacity=".45" filter="url(#soWide)"/>' +
        '<ellipse cx="880" cy="798" rx="210" ry="46" fill="#e0aa55" opacity=".16" filter="url(#soWide)"/>' +
        '<polygon points="206,922 ' + off(206, 922) + ' ' + off(994, 922) + ' 994,922" fill="none" stroke="#c79658" stroke-width="2" opacity=".22" stroke-dasharray="120 26 210 18 160"/>' +
        // 공기 원근 — 뒤로 물러난 면일수록 대비가 낮고 대기색이 낀다. 앞면과 똑같이 선명하면 원근이 죽는다.
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="#6b5334" opacity=".1"/>' +

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
        // 물때 조수선 — 물이 스미고 마르며 가장자리에만 광물이 침착된다. 얼룩 안쪽보다
        // 경계선이 진한 것이 물때의 결정적 신호다. 그리고 리드아웃을 넘은 바늘이 라벨을 긁었다.
        '<path d="M-96 -22 Q-52 26 6 44 Q62 60 98 26" fill="none" stroke="#6b5330" stroke-width="3" opacity=".3"/>' +
        '<path d="M-96 -22 Q-52 26 6 44 Q62 60 98 26 L98 100 L-96 100 Z" fill="#6b5330" opacity=".1"/>' +
        '<path d="M-70 -68 A96 96 0 0 1 34 -92" fill="none" stroke="#2c2118" stroke-width="1.6" opacity=".4"/>' +
        '<path d="M-62 -74 A96 96 0 0 1 30 -96" fill="none" stroke="#f6ecd4" stroke-width="1" opacity=".2"/>' +
        '<circle r="13" fill="none" stroke="#3a2c1c" stroke-width="4" opacity=".3"/>' +
        '<circle r="7" fill="#0a0807"/>' +
        '</g>' +
        '<ellipse id="gvDiscHit" cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_DISC + '" ry="' + (GV_DISC * GV_K).toFixed(0) + '" fill="#000" fill-opacity="0" style="cursor:grab"><title>도는 판을 문지르면 바늘이 긁힙니다</title></ellipse>' +
        // ── 나팔 목 (벨 뒤로 지나간다)
        '<path d="M370 754 C356 698 384 648 440 622 C522 584 606 584 688 600 L712 672 C628 654 540 656 480 692 C438 716 418 736 412 768 Z" fill="url(#gvBrassTube)" stroke="#201304" stroke-width="2.5"/>' +
        '<path d="M388 748 C378 702 404 666 454 644 C522 614 596 612 672 624" fill="none" stroke="#f0dca6" stroke-width="6" opacity=".42" stroke-dasharray="86 12 54 9 120"/>' +
        '<path d="M396 752 C386 706 412 670 460 648 C526 620 598 618 672 630" fill="none" stroke="#ffeec0" stroke-width="2" opacity=".45" stroke-dasharray="60 14 92"/>' +
        '<path d="M410 768 C402 728 426 696 472 676 C542 644 614 644 694 658" fill="none" stroke="#2a1904" stroke-width="6" opacity=".45"/>' +

        // ── 니켈 엘보 (톤암 뒷마운트 ↔ 나팔)
        '<path d="M392 782 C370 792 352 780 352 760 C352 740 368 730 388 736 L404 750 Z" fill="url(#gvNickel)" stroke="#181b1f" stroke-width="2"/>' +
        '<ellipse cx="380" cy="760" rx="26" ry="23" fill="url(#gvNickelBall)" stroke="#15181c" stroke-width="2"/>' +
        '<ellipse cx="373" cy="753" rx="9" ry="7" fill="#f4efe2" opacity=".5"/>' +

        // ── 주철 크레인 (나팔 지지대)
        // 상판에 볼트로 고정된 주철 받침 — 기둥이 그냥 바닥에 닿아 있으면 떠 보인다
        '<ellipse cx="336" cy="828" rx="34" ry="13" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<ellipse cx="334" cy="822" rx="32" ry="12" fill="#141416" stroke="#3c3c42" stroke-width="1.6"/>' +
        '<ellipse cx="334" cy="818" rx="26" ry="9" fill="#1d1d21"/>' +
        '<ellipse cx="326" cy="815" rx="9" ry="3.4" fill="#6a6c72" opacity=".55"/>' +
        '<path d="M334 822 V682 L486 654" fill="none" stroke="#0c0c0e" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M331 816 V686" stroke="#5a5c62" stroke-width="2.6" opacity=".55" stroke-linecap="round"/>' +
        '<circle cx="334" cy="666" r="22" fill="url(#soCapDark)" stroke="#4a4b50" stroke-width="2"/>' +
        '<circle cx="334" cy="666" r="9" fill="url(#gvNickelBall)"/>' +
        '<circle cx="486" cy="654" r="17" fill="url(#soCapDark)" stroke="#45464b" stroke-width="2"/>' +
        '<circle cx="483" cy="649" r="5" fill="#8b9099" opacity=".7"/>' +

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
        // 백 년 된 놋쇠 — 라커가 벗겨지며 얼룩덜룩 변색한다. 변색은 광택보다 아래에 깔려야
        // 한다: 닦인 곳은 여전히 반사하고, 변색한 곳만 빛을 잃는다.
        '<rect x="500" y="20" width="820" height="700" fill="#000" filter="url(#gvTarnish)" opacity=".34"/>' +
        // 녹청은 목 둘레의 골에만 아주 얇게 — 넓게 깔면 곰팡이처럼 보인다
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="120" ry="100" fill="#000" filter="url(#gvVerdigris)" opacity=".22"/>' +
        // 원뿔 안쪽 벽에 고인 빛 — 목 반대편(오른쪽 아래) 곡면이 키 라이트를 받는다.
        '<path d="' + gvBellArc(330, 278, -50, 96) + '" fill="none" stroke="#ffeec0" stroke-width="122" opacity=".16" filter="url(#soWide)"/>' +
        '<path d="' + gvBellArc(316, 266, -30, 78) + '" fill="none" stroke="#fff6dc" stroke-width="52" opacity=".13" filter="url(#soWide)"/>' +
        // 림 바로 안쪽의 하드 스펙큘러 — 변색 위에서도 살아남는 금속의 신호.
        // 다만 백 년 된 도금이라 좁고 날카롭지 않고 조금 뿌옇게 퍼진다.
        // 놋쇠는 스펙큘러조차 따뜻하다 — 채도 0의 순백은 그 자체로 '새로 도금한 크롬' 신호다
        '<path d="' + gvBellArc(354, 298, -26, 74) + '" fill="none" stroke="#f4e0ac" stroke-width="17" opacity=".4" filter="url(#soSoft)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(354, 298, -22, 16) + '" fill="none" stroke="#ffeec0" stroke-width="9" opacity=".46" filter="url(#soTight)" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(300, 252, 30, 80) + '" fill="none" stroke="#eeda9e" stroke-width="8" opacity=".2" filter="url(#soSoft)" stroke-linecap="round"/>' +
        // 손이 닿는 림 안쪽은 닳아 오히려 밝게 남는다
        '<path d="' + gvBellArc(346, 292, 100, 250) + '" fill="none" stroke="#f6e3b4" stroke-width="34" opacity=".09" filter="url(#soWide)"/>' +
        // 긁힘과 얕은 찍힘 — 오래된 금속은 결코 매끈하지 않다
        // 긁힘은 파인 홈이다 — 바닥은 어둡고 광원 쪽 입술 한 줄만 밝다.
        // 밝은 선만 그으면 홈이 아니라 표면에 그은 광택 자국으로 읽힌다.
        '<g stroke="#1f1204" stroke-width="1.4" opacity=".34" fill="none">' +
        '<path d="M760 300 Q900 262 1120 292" stroke-dasharray="180 22 90 16 210"/>' +
        '<path d="M700 420 Q880 402 1080 440" stroke-dasharray="120 18 240"/>' +
        '<path d="M840 172 Q950 160 1046 186" stroke-dasharray="90 14 130"/>' +
        '<path d="M660 360 Q820 336 960 358" stroke-dasharray="160 20 110"/>' +
        '<path d="M772 310 Q912 272 1132 302" stroke-dasharray="70 26 190 18 90"/>' +
        '<path d="M712 432 Q892 414 1092 452" stroke-dasharray="210 16 130"/></g>' +
        '<g stroke="#e8d5a2" stroke-width=".9" opacity=".26" fill="none" transform="translate(0 -1.6)">' +
        '<path d="M760 300 Q900 262 1120 292" stroke-dasharray="180 22 90 16 210"/>' +
        '<path d="M700 420 Q880 402 1080 440" stroke-dasharray="120 18 240"/>' +
        '<path d="M840 172 Q950 160 1046 186" stroke-dasharray="90 14 130"/>' +
        '<path d="M660 360 Q820 336 960 358" stroke-dasharray="160 20 110"/>' +
        '<path d="M772 310 Q912 272 1132 302" stroke-dasharray="70 26 190 18 90"/>' +
        '<path d="M712 432 Q892 414 1092 452" stroke-dasharray="210 16 130"/></g>' +
        '<g pointer-events="none" filter="url(#soTight)">' +
        '<ellipse cx="1042" cy="330" rx="20" ry="12" fill="#241505" opacity=".22" transform="rotate(-18 1042 330)"/>' +
        '<ellipse cx="1045" cy="335" rx="18" ry="9" fill="#f7e6b6" opacity=".12" transform="rotate(-18 1045 335)"/>' +
        '<ellipse cx="782" cy="212" rx="15" ry="9" fill="#241505" opacity=".2" transform="rotate(12 782 212)"/>' +
        '<ellipse cx="784" cy="216" rx="13" ry="7" fill="#f7e6b6" opacity=".1" transform="rotate(12 784 216)"/>' +
        '<ellipse cx="900" cy="602" rx="24" ry="10" fill="#241505" opacity=".18"/>' +
        '<ellipse cx="902" cy="605" rx="21" ry="8" fill="#f7e6b6" opacity=".09"/></g>' +
        // 나팔 최심부는 100년치 응결수와 먼지가 씻겨 나가지 않는 자리다 — 가장 더러워야 한다.
        // 광량이 아니라 물성이 다르므로(광택이 죽은 검은 산화막) 그림자와 다르게 읽혀야 한다.
        '<ellipse cx="' + (GV_THROAT.x + 4) + '" cy="' + (GV_THROAT.y - 2) + '" rx="96" ry="82" fill="#120b03" opacity=".5" filter="url(#soWide)"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 2) + '" cy="' + GV_THROAT.y + '" rx="62" ry="53" fill="#0d0803" opacity=".55" filter="url(#soSoft)"/>' +
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="120" ry="100" fill="#000" filter="url(#gvVerdigris)" opacity=".3"/>' +
        // 목은 구멍이다 — 아무것도 반사하지 않으므로 모든 겹의 맨 위에 온다
        '<ellipse cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="38" ry="33" fill="none" stroke="#6d5119" stroke-width="7" opacity=".8"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 2) + '" cy="' + (GV_THROAT.y + 3) + '" rx="35" ry="30" fill="none" stroke="#c9ac6e" stroke-width="2" opacity=".22" stroke-dasharray="26 18 40"/>' +
        '<ellipse id="gvHornMouth" cx="' + GV_THROAT.x + '" cy="' + GV_THROAT.y + '" rx="31" ry="26" fill="#050200"/>' +
        '<ellipse cx="' + (GV_THROAT.x + 5) + '" cy="' + (GV_THROAT.y - 8) + '" rx="17" ry="11" fill="#1c1103"/>' +
        '</g>' +
        // 벨 입구 테 — 두께가 있는 롤드 브라스. 좌상단은 흰 하이라이트, 우하단은 그늘.
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 9) + '" ry="' + (GV_BELL.ry - 8.5) + '" fill="none" stroke="url(#gvBrassRing)" stroke-width="20"/>' +
        // 림 하이라이트도 따뜻하게, 그리고 끊기게 — 백 년 된 도금은 한 줄로 매끈하게 이어지지 않는다
        '<path d="' + gvBellArc(381, 322, 196, 300) + '" fill="none" stroke="#f2ddab" stroke-width="8" opacity=".72" stroke-linecap="round" stroke-dasharray="118 9 62 14 96 7 140"/>' +
        '<path d="' + gvBellArc(381, 322, 212, 284) + '" fill="none" stroke="#fff0c6" stroke-width="3.4" opacity=".78" stroke-linecap="round" stroke-dasharray="74 11 44 8 92"/>' +
        '<path d="' + gvBellArc(381, 322, 34, 116) + '" fill="none" stroke="#1a0f02" stroke-width="7" opacity=".5" stroke-linecap="round"/>' +
        '<path d="' + gvBellArc(381, 322, 120, 168) + '" fill="none" stroke="#e2c88e" stroke-width="5" opacity=".4" stroke-linecap="round"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + (GV_BELL.rx - 18) + '" ry="' + (GV_BELL.ry - 17) + '" fill="none" stroke="#180e02" stroke-width="3.4" opacity=".55"/>' +
        '<ellipse cx="' + GV_BELL.cx + '" cy="' + GV_BELL.cy + '" rx="' + GV_BELL.rx + '" ry="' + GV_BELL.ry + '" fill="none" stroke="#120a01" stroke-width="3" opacity=".92"/>' +


        // ── 톤암 크러치
        '<ellipse cx="1005" cy="888" rx="30" ry="11" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<ellipse cx="1003" cy="884" rx="27" ry="9" fill="url(#gvNickel)" stroke="#191c20" stroke-width="1.5"/>' +
        '<path d="M1003 882 V820" stroke="url(#gvNickel)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M1000 878 V822" stroke="#ffffff" stroke-width="2.2" opacity=".45" stroke-linecap="round"/>' +
        '<path d="M985 812 Q1003 794 1021 812" fill="none" stroke="url(#gvNickel)" stroke-width="9" stroke-linecap="round"/>' +

        // ── 톤암 (프레임마다 다시 그린다) + 판에 지는 그림자
        '<path id="gvArmShadow" d="M392 782 L1003 752" transform="translate(6 26)" stroke="#000" stroke-width="16" stroke-linecap="round" fill="none" opacity=".34" filter="url(#soSoft)"/>' +
        '<path id="gvArm" d="M392 782 L1003 752" stroke="url(#gvNickel)" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        '<path id="gvArmLo" d="M392 782 L1003 752" transform="translate(0 3.6)" stroke="#1a1d21" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>' +
        '<path id="gvArmHi" d="M392 782 L1003 752" transform="translate(0 -2.8)" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".6"/>' +
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
        // 100년치 그을음과 손때 — 니스 표면에 얼룩덜룩 앉는다
        '<g clip-path="url(#gvFrontClip)">' +
        '<rect x="190" y="930" width="820" height="220" fill="#000" filter="url(#gvGrime)" opacity=".38"/>' +
        // 셸락 니스의 크레이징 — 표면에 그물처럼 얽힌 미세 균열망
        '<rect x="190" y="930" width="820" height="220" fill="#000" filter="url(#gvCrazeF)" opacity=".62"/>' +
        // 모서리와 기둥 각은 마감이 닳아 생나무가 비친다
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvRubEdge)"/>' +
        // 물잔 자국 — 찬 잔 밑의 물이 셸락막에 스며 미세 공극을 만들고 빛을 산란시킨다.
        // 테두리는 물이 오래 고여 하얗게 뿌옇고 안쪽은 옅다.
        '<g pointer-events="none" opacity=".5">' +
        '<circle cx="742" cy="1064" r="41" fill="none" stroke="#d8c3a0" stroke-width="5" opacity=".3" filter="url(#soTight)"/>' +
        '<circle cx="742" cy="1064" r="38" fill="#cbb695" opacity=".08"/>' +
        '<circle cx="806" cy="1092" r="29" fill="none" stroke="#d8c3a0" stroke-width="4" opacity=".2" filter="url(#soTight)"/></g>' +
        // 블룸 — 습기가 셸락막 안에 만든 우윳빛 구름 얼룩 (경계가 없어 그라데이션으론 못 낸다)
        '<rect x="190" y="930" width="820" height="220" fill="#000" filter="url(#gvBloom)" opacity=".3"/>' +
        '</g>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvVarnish)"/>' +
        // 모서리 각(아리스)의 마감은 균일하게 닳지 않는다 — 100년 된 가구의 모서리 광선은
        // 반드시 끊겨 있다. 이어진 한 줄은 그 자체로 '새 물건' 신호다.
        '<path d="M194 934 H1006" stroke="#e8b877" stroke-width="3" opacity=".32" stroke-dasharray="96 14 42 9 168 22 74 11 210"/>' +
        '<path d="M194 936 H1006" stroke="#3a2109" stroke-width="1.6" opacity=".3" stroke-dasharray="40 120 60 90 180"/>' +
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
        '<g mask="url(#gvWornDecal)">' +
        '<text x="602" y="1024" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#1c0d03" opacity=".55" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1021" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#e8bd6e" text-anchor="middle">Victor</text>' +
        '<text x="600" y="1019" font-family="Georgia, serif" font-size="64" font-style="italic" font-weight="700" fill="#fff0c8" opacity=".35" text-anchor="middle">Victor</text>' +
        '<path d="M462 1040 Q600 1062 738 1040" fill="none" stroke="#d8ab5c" stroke-width="2.4" opacity=".75"/>' +
        '<text x="600" y="1084" font-family="Arial" font-size="16" font-weight="600" letter-spacing="3.2" fill="#f0c583" text-anchor="middle" opacity=".92">VICTOR TALKING MACHINE CO.</text>' +
        '<text x="600" y="1112" font-family="Arial" font-size="13" letter-spacing="2.8" fill="#c79a58" text-anchor="middle" opacity=".8">CAMDEN, N.J. &#183; VICTOR V</text>' +
        '</g>' +
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
        '<ellipse cx="312" cy="892" rx="55" ry="31" fill="#000" opacity=".5" filter="url(#soSoft)"/>' +
        '<ellipse cx="310" cy="884" rx="53" ry="30" fill="url(#gvNickel)" stroke="#181b20" stroke-width="2"/>' +
        '<ellipse cx="310" cy="882" rx="49" ry="26" fill="none" stroke="#ffffff" stroke-width="1.4" opacity=".4"/>' +
        '<ellipse cx="310" cy="884" rx="41" ry="22" fill="#101216"/>' +
        '<ellipse cx="310" cy="882" rx="41" ry="22" fill="none" stroke="#000" stroke-width="2" opacity=".6"/>' +
        '<text x="310" y="872" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.3" fill="#c3c8cc" text-anchor="middle">SPEED</text>' +
        '<path id="gvSpeedPtr" d="M310 884 L310 865" stroke="#f6efdc" stroke-width="3.6" stroke-linecap="round" transform="rotate(0 310 884)"/>' +
        '<text id="gvSpeedText" x="310" y="899" font-family="Arial" font-size="11.5" font-weight="700" fill="#f0e4c8" text-anchor="middle">78</text>' +
        '</g>' +
        '<ellipse id="gvSpeedHit" cx="310" cy="884" rx="60" ry="36" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none"><title>SPEED — 위아래로 끌어 회전수를 60~88rpm으로 조절</title></ellipse>' +
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
        // 100년 묵은 종이 — 갈색 폭싱 반점, 가장자리 갈변, 접힌 자국, 안에 든 판이 눌러 만든 원형 자국
        '<rect x="1470" y="112" width="462" height="462" fill="#000" filter="url(#gvFoxing)" opacity=".3"/>' +
        '<rect x="1470" y="112" width="462" height="462" fill="url(#gvPaperEdge)"/>' +
        '<path d="M1470 236 H1932" stroke="#8a7146" stroke-width="2.4" opacity=".22"/>' +
        '<path d="M1470 233 H1932" stroke="#efe4c8" stroke-width="1.6" opacity=".2"/>' +
        '<circle cx="1701" cy="343" r="146" fill="none" stroke="#7d6540" stroke-width="3" opacity=".2"/>' +
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
        // 70년 된 사출 플라스틱 — 광택이 죽어 반들거리지 않고, 색은 올리브 쪽으로 바랬다
        shell: ["#57524a", "#38342e", "#22201d", "#131211"],
        shellEdge: "#0a0908",
        rim: "#8a8172",
        band: ["#2f2c27", "#1c1a17", "#0e0d0c"],
        // 상아색 전면은 자외선과 담배 연기로 누렇게 변했다
        ivory: ["#eee4c4", "#ddd0aa", "#bfae85"],
        grille: "#e0d4b4",
        perf: "#4e483a",
        ink: "#3a3327",
        sub: "#7a6f57",
        bandInk: "#a49b8a",
        script: "#b98a3f",
        leg: "#151413"
    },
    mint: {
        label: "금성 A-501 · 민트",
        shell: ["#8fb0a0", "#6b9384", "#456d5f", "#284f41"],
        shellEdge: "#17352c",
        rim: "#a9c4b7",
        band: ["#4e786a", "#3a5f51", "#26473d"],
        ivory: ["#f0e7ca", "#e0d4b1", "#c3b58e"],
        grille: "#e6dbbe",
        perf: "#5b5c4a",
        ink: "#36382c",
        sub: "#6c7160",
        bandInk: "#c6d6c8",
        script: "#b98a3f",
        leg: "#28453b"
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
            out += '<text x="' + (Number(x) + 1.5) + '" y="' + (A5_DIAL.y0 + 3.5) + '" font-family="Arial" font-size="34" font-weight="700" fill="#f6eeda" opacity=".28" text-anchor="middle">' + f + '</text>' +
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
        '<stop offset="0" stop-color="#f2e8c8"/><stop offset=".34" stop-color="#e6d9b2"/><stop offset=".78" stop-color="#d4c398"/><stop offset="1" stop-color="#b8a67c"/></linearGradient>' +
        '<linearGradient id="a5GlassSheen" x1="0" y1="0" x2=".8" y2="1">' +
        '<stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset=".14" stop-color="#ffffff" stop-opacity=".16"/>' +
        '<stop offset=".26" stop-color="#ffffff" stop-opacity=".02"/><stop offset=".54" stop-color="#ffffff" stop-opacity=".12"/>' +
        '<stop offset=".62" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#8a7f66" stop-opacity=".16"/></linearGradient>' +
        '<linearGradient id="a5InsetTop" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#3a3226" stop-opacity=".45"/><stop offset=".2" stop-color="#3a3226" stop-opacity=".1"/>' +
        '<stop offset="1" stop-color="#3a3226" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="a5Yellow" cx=".46" cy=".62" r=".78">' +
        '<stop offset="0" stop-color="#b9873a" stop-opacity="0"/><stop offset=".5" stop-color="#b9873a" stop-opacity=".07"/>' +
        '<stop offset=".82" stop-color="#a9762e" stop-opacity=".17"/><stop offset="1" stop-color="#8e5f22" stop-opacity=".3"/></radialGradient>' +
        '<radialGradient id="a5GrilleShade" cx=".38" cy=".34" r=".85">' +
        '<stop offset=".4" stop-color="#000000" stop-opacity="0"/><stop offset=".8" stop-color="#241f14" stop-opacity=".16"/>' +
        '<stop offset="1" stop-color="#1a160e" stop-opacity=".38"/></radialGradient>' +
        '<radialGradient id="a5LampWash" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ffe6a8" stop-opacity=".55"/><stop offset=".55" stop-color="#ffd484" stop-opacity=".18"/><stop offset="1" stop-color="#ffc464" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5FilGlow" cx=".5" cy=".5" r=".5">' +
        '<stop offset="0" stop-color="#ff9d3c" stop-opacity=".55"/><stop offset=".5" stop-color="#e8722a" stop-opacity=".2"/><stop offset="1" stop-color="#c85a1e" stop-opacity="0"/></radialGradient>' +
        // 타공판 — 구멍 아래에 밝은 립을 두면 두께가 생긴다
        '<pattern id="a5Perf" width="26" height="26" patternUnits="userSpaceOnUse">' +
        '<g fill="#efe9d6" opacity=".4"><circle cx="6.5" cy="7.6" r="2.9"/><circle cx="19.5" cy="7.4" r="2.8"/>' +
        '<circle cx="6.5" cy="20.7" r="2.85"/><circle cx="19.5" cy="20.5" r="2.75"/></g>' +
        '<g fill="' + t.perf + '"><circle cx="6.5" cy="6.5" r="2.9"/><circle cx="19.5" cy="6.5" r="2.8"/>' +
        '<circle cx="6.5" cy="19.5" r="2.85"/><circle cx="19.5" cy="19.5" r="2.75"/></g>' +
        '<g fill="#000000"><circle cx="6.5" cy="6.1" r="2.4" opacity=".34"/><circle cx="19.5" cy="6.2" r="2.3" opacity=".22"/>' +
        '<circle cx="6.5" cy="19.2" r="2.3" opacity=".28"/><circle cx="19.5" cy="19.1" r="2.4" opacity=".4"/></g></pattern>' +
        '<radialGradient id="a5LampGlass" cx=".34" cy=".3" r=".85">' +
        '<stop offset="0" stop-color="#5ea877"/><stop offset=".45" stop-color="#2c6b45"/><stop offset="1" stop-color="#0e2718"/></radialGradient>' +
        // 70년치 노후 — 크롬 몰딩의 점 부식과 벗겨짐, 상아 전면의 때, 인쇄의 마모
        soloGrime("a5Corrode", [0.15, 0.14, 0.12], 1.85, 1.0, -1.18, "0.014 0.052", 4, 3) +
        soloGrime("a5Flake", [0.86, 0.85, 0.79], 2.0, 0.9, -1.72, "0.02 0.07", 3, 13) +
        soloGrime("a5Soil", [0.3, 0.24, 0.12], 1.45, 0.95, -1.42, "0.019 0.014", 5, 29) +
        soloGrime("a5Erode", [0, 0, 0], 2.1, 1.1, -1.42, "0.09 0.075", 4, 41) +
        soloGrime("a5Pit", [0.19, 0.18, 0.16], 1.6, 1.0, -1.2, "0.14 0.16", 3, 7) +
        '<filter id="a5CrazeF" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="turbulence" baseFrequency="0.034 0.028" numOctaves="2" seed="17" result="n"/>' +
        '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24 0 0 0 0 0.2 0 0 0 0 0.15 -9 0 0 0 0.72"/>' +
        '</filter>' +
        '<mask id="a5WornInk"><rect x="200" y="640" width="700" height="160" fill="#fff"/>' +
        '<rect x="200" y="640" width="700" height="160" filter="url(#a5Erode)"/></mask>' +
        '<clipPath id="a5SpearClip"><path d="M256 566 L1000 538 L1744 566 L1000 594 Z"/></clipPath>' +
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
        '<path d="M205 214 Q1000 112 1795 214 L1790 268 Q1000 168 210 268 Z" fill="#e8e4d6" opacity=".09" filter="url(#soSoft)"/>' +
        // 70년치 잔 스크래치와 손때 — 광택이 죽고 표면이 고르지 않다
        '<rect x="150" y="96" width="1700" height="704" fill="#000" filter="url(#a5Soil)" opacity=".22"/>' +
        '<rect x="150" y="96" width="1700" height="704" fill="#000" filter="url(#a5CrazeF)" opacity=".22"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Gloss)"/>' +
        '</g>' +
        // 윗면 — 뒤로 넘어간 곡면
        '<path d="M205 200 Q1000 96 1795 200 Q1000 128 205 200 Z" fill="' + t.shellEdge + '" opacity=".85"/>' +
        '<path d="M209 197 Q1000 100 1791 197" fill="none" stroke="' + t.rim + '" stroke-width="3.2" opacity=".7"/>' +
        '<path d="M209 193 Q1000 96 1791 193" fill="none" stroke="#e6e2d4" stroke-width="1.6" opacity=".2" stroke-dasharray="240 30 420 22 380"/>' +

        // ── 상아색 인서트 — 크롬 베젤 안에 앉힌다
        '<rect x="228" y="221" width="1544" height="436" rx="16" fill="#000" opacity=".5" filter="url(#soTight)"/>' +
        '<rect x="234" y="227" width="1528" height="420" rx="13" fill="url(#soChromeAged)"/>' +
        // 크롬 테도 70년치 점 부식을 먹었다. 테 폭이 12px뿐이라 큰 반점은 얼룩처럼 보이므로
        // 잘게 흐려 광택만 죽인다 (안쪽은 곧 상아 인서트가 덮는다).
        '<rect x="234" y="227" width="1528" height="420" rx="13" fill="#000" filter="url(#a5Pit)" opacity=".3"/>' +
        '<rect x="240" y="233" width="1516" height="408" rx="10" fill="none" stroke="#e6e2d4" stroke-width="1.6" opacity=".2"/>' +
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Ivory)"/>' +
        // 황변은 균일하지 않다 — 빛과 담배 연기가 먼저 닿는 위·가장자리부터 진해지고,
        // 손이 자주 닿아 닦이는 가운데 앞면은 덜하다.
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Yellow)"/>' +

        // ── 좌: 타공 스피커 그릴
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="' + t.grille + '"/>' +
        // 진공관 불빛은 프레임마다 밝기가 바뀐다. 필터가 걸린 노후 레이어와 같은 그룹에 두면
        // 그 그룹이 매 프레임 다시 래스터라이즈된다(실측 60→50fps). 그래서 그룹을 나눈다.
        '<g clip-path="url(#a5GrilleClip)">' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5Perf)"/>' +
        '<ellipse id="a5TubeGlow" cx="572" cy="440" rx="300" ry="210" fill="url(#a5FilGlow)" opacity="0"/>' +
        '</g>' +
        '<g clip-path="url(#a5GrilleClip)" pointer-events="none">' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5GrilleShade)"/>' +
        // 구멍마다 앉은 70년치 때 — 얼룩덜룩 번져 그릴 톤을 고르지 않게 만든다
        '<rect x="250" y="243" width="643" height="392" fill="#000" filter="url(#a5Soil)" opacity=".55"/>' +
        '<rect x="250" y="243" width="643" height="392" fill="#000" filter="url(#a5Pit)" opacity=".3"/>' +
        '<rect x="250" y="243" width="643" height="392" fill="#000" filter="url(#a5CrazeF)" opacity=".22"/>' +
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
        '<text x="1332" y="614" font-family="Georgia, serif" font-size="27" font-style="italic" font-weight="700" letter-spacing="3" fill="#f6eeda" opacity=".26" text-anchor="middle">TWO BAND SUPER HETERODYNE</text>' +
        '<text x="1330" y="612" font-family="Georgia, serif" font-size="27" font-style="italic" font-weight="700" letter-spacing="3" fill="' + t.sub + '" text-anchor="middle" opacity=".95">TWO BAND SUPER HETERODYNE</text>' +
        // 유리면 반사
        // 유리 뒷면 인쇄는 바래고, 앞면에는 먼지 필름과 얼룩이 앉았다
        '<rect x="905" y="243" width="845" height="392" fill="#000" filter="url(#a5Soil)" opacity=".3" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="392" fill="#000" filter="url(#a5CrazeF)" opacity=".16" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="392" fill="url(#a5GlassSheen)" pointer-events="none"/>' +
        '<rect x="905" y="243" width="845" height="20" fill="url(#a5InsetTop)" pointer-events="none"/>' +
        '<path d="M918 256 H1738" stroke="#efe9d6" stroke-width="2.4" opacity=".26" pointer-events="none" stroke-dasharray="180 40 300 26 240"/>' +
        '</g>' +
        // 10KC 배지 — 앱에서는 동조(신호) 표시등으로 켜진다
        '<circle cx="1702" cy="292" r="33" fill="#000" opacity=".45"/>' +
        '<circle cx="1702" cy="290" r="33" fill="url(#soChromeV)"/>' +
        '<circle cx="1702" cy="290" r="28" fill="#12291b"/>' +
        '<circle id="a5Lamp" cx="1702" cy="290" r="26" fill="url(#a5LampGlass)"/>' +
        '<ellipse cx="1693" cy="279" rx="10" ry="6" fill="#e8f0e6" opacity=".22" pointer-events="none"/>' +
        '<text x="1702" y="296" font-family="Arial" font-size="15" font-weight="700" fill="#e2f4e6" text-anchor="middle" pointer-events="none">10KC</text>' +
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="none" stroke="#8f8770" stroke-width="1.8" opacity=".6"/>' +

        // ── 스피어 몰딩 — 양 끝이 뾰족하게 좁아지며 전면을 가로지르는 크롬 장식
        '<path d="M256 574 L1000 550 L1744 574 L1000 600 Z" fill="#000" opacity=".35" filter="url(#soTight)"/>' +
        '<path d="M256 566 L1000 538 L1744 566 L1000 594 Z" fill="url(#soChromeAged)" stroke="#2f3437" stroke-width="2"/>' +
        '<path d="M320 562 L1000 544 L1680 562" fill="none" stroke="#dfe2dd" stroke-width="5" opacity=".62" stroke-dasharray="140 18 76 24 210 14 120"/>' +
        '<path d="M320 572 L1000 558 L1680 572" fill="none" stroke="#9aa1a8" stroke-width="2" opacity=".7"/>' +
        '<path d="M320 580 L1000 568 L1680 580" fill="none" stroke="#22282f" stroke-width="2.4" opacity=".65"/>' +
        '<path d="M256 566 L372 558 M1628 558 L1744 566" stroke="#cdd0cb" stroke-width="1.8" opacity=".5"/>' +
        // 70년 된 크롬은 거울이 아니다 — 점 부식으로 검게 얼룩지고 도금이 벗겨져 흰 각질이 인다
        '<g clip-path="url(#a5SpearClip)">' +
        '<rect x="256" y="530" width="1490" height="72" fill="#000" filter="url(#a5Corrode)" opacity=".72"/>' +
        '<rect x="256" y="530" width="1490" height="72" fill="#000" filter="url(#a5Flake)" opacity=".5"/>' +
        '</g>' +

        // 다이얼 드래그 히트존
        '<rect id="a5DialHit" x="930" y="252" width="800" height="230" fill="#000" fill-opacity="0" style="cursor:ew-resize;touch-action:none" tabindex="0" role="slider" aria-label="주파수 다이얼 — 드래그하여 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>드래그하여 주파수를 맞추세요</title></rect>' +

        // ── 하단 어두운 띠 — 로고와 세 노브
        '<rect x="196" y="647" width="1608" height="153" fill="url(#a5Band)"/>' +
        '<rect x="196" y="647" width="1608" height="5" fill="#ffffff" opacity=".12"/>' +
        '<rect x="196" y="794" width="1608" height="6" fill="#000000" opacity=".45"/>' +
        '<rect x="262" y="690" width="54" height="32" rx="4" fill="#000" opacity=".4"/>' +
        '<rect x="262" y="688" width="54" height="32" rx="4" fill="url(#soChromeV)" stroke="#0d0d0e" stroke-width="1.5"/>' +
        '<rect x="277" y="694" width="11" height="20" rx="2" fill="#16171a"/>' +
        // 금박 스크립트는 70년 동안 닳아 조각조각 남았다 (실물 사진에서도 끝 글자가 거의 사라졌다)
        '<g mask="url(#a5WornInk)">' +
        '<text x="382" y="744" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#3a2609" opacity=".55">GoldStar</text>' +
        '<text x="380" y="742" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="' + t.script + '">GoldStar</text>' +
        '<text x="380" y="740" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="#ffe6ad" opacity=".26">GoldStar</text>' +
        '<path d="M382 752 Q520 768 660 748" fill="none" stroke="' + t.script + '" stroke-width="2.4" opacity=".7"/>' +
        '</g>' +
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
        '<path d="M410 802 L462 802 L437 856" fill="none" stroke="#e6e2d4" stroke-width="2.4" opacity=".1"/>' +
        '<path d="M1528 798 L1596 798 L1656 866 L1560 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M1538 802 L1590 802 L1628 856" fill="none" stroke="#e6e2d4" stroke-width="2.4" opacity=".1"/>' +
        '<ellipse cx="392" cy="868" rx="64" ry="10" fill="#000" opacity=".65" filter="url(#soTight)"/>' +
        '<ellipse cx="1608" cy="868" rx="64" ry="10" fill="#000" opacity=".65" filter="url(#soTight)"/>' +
        '<text x="1804" y="838" font-family="Arial" font-size="13" letter-spacing="1.6" fill="' + t.bandInk + '" opacity=".5" text-anchor="end">金星社 &#183; A-501 &#183; AC 5球 &#183; 1959</text>' +
        soloFilmGrade(0, 0, 2000, 880) +
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
