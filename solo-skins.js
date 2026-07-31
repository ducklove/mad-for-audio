/*
 * Mad for Audio — 단독 기기(SOLO) 카탈로그
 *
 * 랙에 물려 쓰는 컴포넌트가 아니라, 그 자체로 완결된 기기 두 종의 SVG다.
 * 앰프도 EQ도 없이 혼자 소리를 내던 시대의 물건이라 랙 문법(유닛 전원 위계·
 * 소스 셀렉터)을 따르지 않는다. 단독 기기를 고르면 랙은 통째로 내려가고
 * 화면에는 이 기기 하나만 남는다.
 *
 *  · VICTOR V (Victor Talking Machine Co., 1905–1921)
 *      전기 증폭 이전의 어쿠스틱 축음기. 강철 바늘이 셸락 판의 홈을 긁으면
 *      운모 진동판이 떨고, 그 떨림이 나팔관을 지나며 증폭된다.
 *  · 금성 A-501 (금성사, 1959)
 *      국산 1호 라디오. 5구 진공관·5인치 스피커·2밴드 슈퍼헤테로다인.
 *      40×17×17cm 플라스틱 캐비닛(락희화학)과 상아색 전면이 정면 구조다.
 *
 * 외형 근거와 앱에서 허용한 변형은 docs/EQUIPMENT_REFERENCES.md에 정리했다.
 * 동적 id는 축음기 gv*, 라디오 a5* 접두사를 쓴다 (문서 전역 id 충돌 회피).
 */

// ===================================================================
// VICTOR V — 어쿠스틱 축음기
// ===================================================================
// 원근: 케이스 앞면 → 뒷면 오프셋 (160, -190). 상판·우측면·굽도리 모두 같은 벡터.
// 고정 좌표(런타임이 의존): 플래터 중심 (680,835) rx300 ry82,
// 톤암 브래킷 (392,772), 나팔 목 (360,748).
const GV_PC = { x: 680, y: 835, rx: 300, ry: 82 };
const GV_K = GV_PC.ry / GV_PC.rx;          // 원근 압축비 — 원판을 눕혀 보는 각도
const GV_ARM = { x: 352, y: 766 };         // 톤암 뒷마운트(피벗) — 상판 뒤 왼쪽 모서리
const GV_DISC = 252;                       // 10인치 셸락판 반지름 (원형 좌표계)
const GV_ARM_REST = 1.28;                  // 톤암 거치 반경비 (판 바깥의 크러치)

function gvHornPetals() {
    // 나팔 안쪽 이음매 — 목(소실점)에서 벨 가장자리로 방사한다.
    let out = "";
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const ex = 900 + Math.cos(a) * 380;
        const ey = 370 + Math.sin(a) * 320;
        const mx = 645 + (ex - 645) * 0.52 + Math.cos(a) * 26;
        const my = 548 + (ey - 548) * 0.52 + Math.sin(a) * 22;
        out += '<path d="M645 548 Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' +
            ex.toFixed(1) + ' ' + ey.toFixed(1) + '" fill="none" stroke="#4a2c0b" stroke-width="1.8" opacity=".42"/>';
    }
    return out;
}

function gvGrooves() {
    // 셸락판의 굵은 홈 — 78회전은 홈 간격이 넓어 육안으로 보인다 (원형 좌표계)
    let out = "";
    for (let r = 104; r <= GV_DISC - 6; r += 6.5) {
        out += '<circle r="' + r + '" fill="none" stroke="#000" stroke-width="1.1" opacity="' +
            (r % 26 < 7 ? ".5" : ".26") + '"/>';
    }
    return out;
}

function gvFlutes(x, y, w, h) {
    // 코너 기둥의 세로 홈 (quarter-sawn oak 기둥)
    let out = "";
    for (let i = 1; i <= 3; i++) {
        const fx = x + (w / 4) * i;
        out += '<path d="M' + fx.toFixed(1) + ' ' + (y + 14) + ' V' + (y + h - 14) +
            '" stroke="#2a1608" stroke-width="3" opacity=".5"/>' +
            '<path d="M' + (fx + 2.4).toFixed(1) + ' ' + (y + 14) + ' V' + (y + h - 14) +
            '" stroke="#c08a4e" stroke-width="1.4" opacity=".3"/>';
    }
    return out;
}

function mfaVictorVSvg() {
    const DX = 160, DY = -190;
    const off = (x, y) => (x + DX).toFixed(0) + " " + (y + DY).toFixed(0);
    // 굽도리 몰딩 한 단 — 앞면 사각형 + 우측면 사면
    const molding = (x1, x2, y1, y2, fill) =>
        '<polygon points="' + x2 + ',' + y1 + ' ' + off(x2, y1) + ' ' + off(x2, y2) + ' ' + x2 + ',' + y2 +
        '" fill="url(#gvOakSide)" stroke="#231308" stroke-width="2"/>' +
        '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" fill="' + fill + '"/>' +
        '<path d="M' + x1 + ' ' + (y1 + 2) + ' H' + x2 + '" stroke="#e0a866" stroke-width="2" opacity=".26"/>';

    return '<svg class="solo-svg gv-svg" viewBox="0 0 2000 1240" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Victor V 축음기 — 나팔관 어쿠스틱 재생">' +
        '<defs>' +
        '<linearGradient id="gvOakTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c2874a"/><stop offset=".34" stop-color="#9a6432"/><stop offset=".7" stop-color="#b07a41"/><stop offset="1" stop-color="#7d4d25"/></linearGradient>' +
        '<linearGradient id="gvOakFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a86f38"/><stop offset=".2" stop-color="#8a5729"/><stop offset=".62" stop-color="#7a4b23"/><stop offset="1" stop-color="#4e2d13"/></linearGradient>' +
        '<linearGradient id="gvOakSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f3a1a"/><stop offset=".55" stop-color="#764824"/><stop offset="1" stop-color="#40230f"/></linearGradient>' +
        '<pattern id="gvRay" width="150" height="26" patternUnits="userSpaceOnUse">' +
        '<path d="M0 5 C40 1 78 11 122 5 S148 2 150 8 M0 18 C46 13 84 24 128 17 S147 15 150 20" fill="none" stroke="#e6b170" stroke-width="1.3" opacity=".2"/>' +
        '<path d="M0 11 C42 16 76 5 124 12 S146 16 150 12" fill="none" stroke="#2b1708" stroke-width="1" opacity=".34"/>' +
        '<path d="M18 0 L24 26 M96 0 L90 26" stroke="#f0c489" stroke-width="2.4" opacity=".13"/></pattern>' +
        // 놋쇠 나팔 — 소실점(목)에서 어둡고 벨 입구로 갈수록 밝아진다.
        // 초점을 실제 목 좌표(645,548)에 맞춰야 이음매와 명암이 한 방향으로 읽힌다.
        '<radialGradient id="gvHornIn" cx=".16" cy=".78" r="1.05">' +
        '<stop offset="0" stop-color="#241509"/><stop offset=".08" stop-color="#3a2409"/><stop offset=".22" stop-color="#6b4713"/>' +
        '<stop offset=".45" stop-color="#a8792c"/><stop offset=".68" stop-color="#d5a94e"/><stop offset=".86" stop-color="#f0d089"/><stop offset="1" stop-color="#b98736"/></radialGradient>' +
        '<linearGradient id="gvHornRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3c11"/><stop offset=".16" stop-color="#f5dc9c"/><stop offset=".38" stop-color="#a67d2e"/><stop offset=".58" stop-color="#fbe7b4"/><stop offset=".8" stop-color="#8a6423"/><stop offset="1" stop-color="#3d270b"/></linearGradient>' +
        '<linearGradient id="gvRimSpec" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaea" stop-opacity=".85"/><stop offset=".22" stop-color="#ffeec4" stop-opacity=".3"/><stop offset=".45" stop-color="#ffffff" stop-opacity="0"/><stop offset=".82" stop-color="#1e1204" stop-opacity=".28"/><stop offset="1" stop-color="#120b02" stop-opacity=".5"/></linearGradient>' +
        '<linearGradient id="gvHornNeck" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4b3010"/><stop offset=".3" stop-color="#c89a45"/><stop offset=".56" stop-color="#f2d491"/><stop offset=".8" stop-color="#9a7229"/><stop offset="1" stop-color="#402809"/></linearGradient>' +
        '<linearGradient id="gvNickel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c4f54"/><stop offset=".18" stop-color="#f2f3f0"/><stop offset=".42" stop-color="#93979b"/><stop offset=".64" stop-color="#e8e9e5"/><stop offset=".84" stop-color="#5f6367"/><stop offset="1" stop-color="#26282c"/></linearGradient>' +
        '<radialGradient id="gvNickelRound" cx=".34" cy=".3" r=".85"><stop offset="0" stop-color="#f4f5f2"/><stop offset=".42" stop-color="#a9adb0"/><stop offset=".78" stop-color="#6a6e72"/><stop offset="1" stop-color="#2a2c30"/></radialGradient>' +
        '<radialGradient id="gvShellac" cx=".42" cy=".38" r=".72"><stop offset="0" stop-color="#2a2622"/><stop offset=".55" stop-color="#1a1715"/><stop offset=".88" stop-color="#121010"/><stop offset="1" stop-color="#221e1b"/></radialGradient>' +
        '<linearGradient id="gvShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e2" stop-opacity=".24"/><stop offset=".5" stop-color="#ffedcd" stop-opacity=".05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="gvBaize" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5b3f"/><stop offset=".6" stop-color="#22452f"/><stop offset="1" stop-color="#16301f"/></linearGradient>' +
        '<linearGradient id="gvPaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d4b4"/><stop offset=".45" stop-color="#d3c19c"/><stop offset="1" stop-color="#b8a37c"/></linearGradient>' +
        '<linearGradient id="gvPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2115"/><stop offset=".5" stop-color="#1c150d"/><stop offset="1" stop-color="#100b06"/></linearGradient>' +
        '<filter id="gvSoft" x="-40%" y="-40%" width="190%" height="190%"><feGaussianBlur stdDeviation="9"/></filter>' +
        '<filter id="gvHornShade" x="-25%" y="-25%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>' +
        '<clipPath id="gvBellClip"><ellipse cx="900" cy="370" rx="372" ry="313"/></clipPath>' +
        '<clipPath id="gvSleeveClip"><rect x="1470" y="112" width="462" height="462" rx="5"/></clipPath>' +
        '<clipPath id="gvListClip"><rect x="1462" y="600" width="480" height="440"/></clipPath>' +
        '<path id="gvLabelArc" d="M -58 0 A 58 58 0 0 1 58 0" fill="none"/>' +
        '</defs>' +

        // 배경 — 전시장 벽처럼 은은한 조명 웅덩이
        '<rect width="2000" height="1240" rx="10" fill="#191512"/>' +
        '<ellipse cx="880" cy="560" rx="820" ry="620" fill="#3a2c1e" opacity=".38" filter="url(#gvHornShade)"/>' +
        '<rect x="1432" y="52" width="536" height="1136" rx="10" fill="#141110" stroke="#2d2419" stroke-width="2"/>' +

        // ---------- 나팔 (목 → 벨) ----------
        // 벨 뒤로 지나가는 목관을 먼저 그린다
        '<path d="M330 728 C316 672 344 622 400 596 C482 558 566 558 648 574 L672 646 C588 628 500 630 440 666 C398 690 378 710 372 742 Z" fill="url(#gvHornNeck)" stroke="#33200a" stroke-width="2.5"/>' +
        '<path d="M352 720 C342 674 368 636 418 614 C486 584 560 582 636 594" fill="none" stroke="#ffeec0" stroke-width="5" opacity=".4"/>' +
        '<path d="M368 740 C360 700 384 668 430 648 C500 616 572 616 652 630" fill="none" stroke="#3a2408" stroke-width="4" opacity=".38"/>' +
        // 니켈 엘보 — 톤암 뒷마운트에서 나팔로 이어지는 관절
        '<path d="M352 766 C324 776 300 764 298 738 C296 712 314 696 340 700 L364 716 Z" fill="url(#gvNickel)" stroke="#25272b" stroke-width="2"/>' +
        '<ellipse cx="330" cy="730" rx="28" ry="25" fill="url(#gvNickelRound)" stroke="#1e2023" stroke-width="2"/>' +
        // 나팔 크레인(지지대) — 주철 기둥과 검은 조절 바퀴
        '<path d="M262 806 V664 L436 610" fill="none" stroke="#141414" stroke-width="11" stroke-linecap="round"/>' +
        '<circle cx="262" cy="648" r="21" fill="#17171a" stroke="#3d3d42" stroke-width="2"/>' +
        '<circle cx="262" cy="648" r="8" fill="url(#gvNickelRound)"/>' +
        '<circle cx="436" cy="610" r="16" fill="#0f0f11" stroke="#3a3a40" stroke-width="2"/>' +
        '<circle cx="436" cy="610" r="6" fill="#5c5c62"/>' +

        // 벨 — 바깥 테와 안쪽 면
        '<ellipse cx="906" cy="386" rx="392" ry="332" fill="#0d0a06" opacity=".5" filter="url(#gvSoft)"/>' +
        '<ellipse cx="900" cy="370" rx="390" ry="330" fill="url(#gvHornRim)"/>' +
        '<ellipse cx="900" cy="370" rx="372" ry="313" fill="url(#gvHornIn)"/>' +
        '<g clip-path="url(#gvBellClip)">' +
        gvHornPetals() +
        // 안쪽 벽에 고인 빛 — 목 반대편(오른쪽 아래) 곡면에서 반사가 길게 번진다
        '<path d="M1090 194 A300 250 0 0 1 1043 645" fill="none" stroke="#ffe6ac" stroke-width="86" opacity=".2" filter="url(#gvSoft)"/>' +
        '<path d="M1112 236 A250 206 0 0 1 1064 590" fill="none" stroke="#fff4d6" stroke-width="26" opacity=".18" filter="url(#gvSoft)"/>' +
        // 목 주변의 그늘 — 소리가 빨려 들어가는 깊이
        '<ellipse cx="654" cy="542" rx="88" ry="74" fill="#180d02" opacity=".34" filter="url(#gvSoft)"/>' +
        // 나팔 목 — 소리가 들어오는 구멍
        '<ellipse cx="645" cy="548" rx="36" ry="31" fill="none" stroke="#a87c34" stroke-width="5" opacity=".8"/>' +
        '<ellipse id="gvHornMouth" cx="645" cy="548" rx="32" ry="27" fill="#120a02"/>' +
        '<ellipse cx="648" cy="540" rx="20" ry="15" fill="#2e1c05"/>' +
        '</g>' +
        // 벨 입구 테 — 두께가 있는 금속 링. 위쪽에 하이라이트, 아래쪽에 그늘.
        '<ellipse cx="900" cy="370" rx="381" ry="322" fill="none" stroke="url(#gvHornRim)" stroke-width="18"/>' +
        '<ellipse cx="900" cy="370" rx="372" ry="313" fill="none" stroke="#2c1c06" stroke-width="3" opacity=".55"/>' +
        '<ellipse cx="900" cy="370" rx="381" ry="322" fill="none" stroke="url(#gvRimSpec)" stroke-width="8"/>' +
        '<ellipse cx="900" cy="370" rx="390" ry="330" fill="none" stroke="#201304" stroke-width="3" opacity=".85"/>' +

        // ---------- 캐비닛 ----------
        // 상판
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvOakTop)" stroke="#2c1809" stroke-width="3"/>' +
        '<polygon points="190,930 ' + off(190, 930) + ' ' + off(1010, 930) + ' 1010,930" fill="url(#gvRay)" opacity=".85"/>' +
        // 상판 니켈 테두리(모서리 보강판)
        '<polygon points="206,922 ' + off(206, 922) + ' ' + off(994, 922) + ' 994,922" fill="none" stroke="#cfa46a" stroke-width="2" opacity=".45"/>' +

        // 플래터 — 니켈 림 + 녹색 융
        '<ellipse cx="682" cy="846" rx="302" ry="84" fill="#0b0805" opacity=".55" filter="url(#gvSoft)"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + GV_PC.rx + '" ry="' + GV_PC.ry + '" fill="url(#gvNickel)" stroke="#26282c" stroke-width="2.5"/>' +
        '<ellipse cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_PC.rx - 14) + '" ry="' + (GV_PC.ry - 4) + '" fill="url(#gvBaize)"/>' +

        // 셸락 판 — 원형 좌표계에서 그리고 원근으로 눕힌다 (회전이 자연스럽다)
        '<g id="gvSpinG" transform="translate(' + GV_PC.x + ' ' + GV_PC.y + ') scale(1 ' + GV_K.toFixed(4) + ')">' +
        '<circle r="' + GV_DISC + '" fill="url(#gvShellac)"/>' +
        gvGrooves() +
        '<path d="M0 0 L0 -' + GV_DISC + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 ' + (GV_DISC * 0.72).toFixed(0) + ' -' + (GV_DISC * 0.69).toFixed(0) + ' Z" fill="url(#gvShine)"/>' +
        '<path d="M0 0 L0 ' + GV_DISC + ' A' + GV_DISC + ' ' + GV_DISC + ' 0 0 1 -' + (GV_DISC * 0.66).toFixed(0) + ' ' + (GV_DISC * 0.74).toFixed(0) + ' Z" fill="url(#gvShine)" opacity=".5"/>' +
        '<circle r="98" fill="#b7472f" id="gvLabelDisc"/>' +
        '<circle r="98" fill="none" stroke="#eadfc4" stroke-width="2.5" opacity=".7"/>' +
        '<circle r="88" fill="none" stroke="#eadfc4" stroke-width="1" opacity=".45"/>' +
        '<text font-family="Georgia, serif" font-size="15" letter-spacing="2" fill="#f4e7c8"><textPath href="#gvLabelArc" startOffset="50%" text-anchor="middle">MAD FOR AUDIO RECORDS</textPath></text>' +
        '<text id="gvLabelBig" x="0" y="-8" font-family="Georgia, serif" font-size="26" font-weight="700" fill="#f6ecd2" text-anchor="middle">78</text>' +
        '<text id="gvLabelTitle" x="0" y="20" font-family="Arial" font-size="14" fill="#f0e2c2" text-anchor="middle"></text>' +
        '<text id="gvLabelArtist" x="0" y="42" font-family="Arial" font-size="12" fill="#e6d3ab" text-anchor="middle"></text>' +
        '<text x="0" y="66" font-family="Arial" font-size="12" font-weight="700" letter-spacing="1.4" fill="#f6ecd2" text-anchor="middle">78 R.P.M.</text>' +
        '<circle r="7" fill="#0d0b09"/>' +
        '</g>' +
        // 판 위 히트존 — 회전 중 문지르면 마찰음
        '<ellipse id="gvDiscHit" cx="' + GV_PC.x + '" cy="' + GV_PC.y + '" rx="' + (GV_DISC * 1) + '" ry="' + (GV_DISC * GV_K).toFixed(0) + '" fill="#000" fill-opacity="0" style="cursor:grab"><title>도는 판을 문지르면 바늘이 긁힙니다</title></ellipse>' +

        // 톤암 — 브래킷은 고정, 관은 프레임마다 다시 그린다
        '<ellipse cx="' + GV_ARM.x + '" cy="' + (GV_ARM.y + 8) + '" rx="42" ry="20" fill="#000" opacity=".45" filter="url(#gvSoft)"/>' +
        // 톤암 크러치 — 연주하지 않을 때 사운드박스를 얹어 두는 니켈 받침
        '<path d="M1004 872 V820" stroke="url(#gvNickel)" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M988 812 Q1004 796 1020 812" fill="none" stroke="url(#gvNickel)" stroke-width="8" stroke-linecap="round"/>' +
        '<path id="gvArm" d="M352 766 L988 753" stroke="url(#gvNickel)" stroke-width="17" stroke-linecap="round" fill="none"/>' +
        '<path id="gvArmHi" d="M352 766 L988 753" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".38"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="38" ry="34" fill="url(#gvNickelRound)" stroke="#1d1f22" stroke-width="2.5"/>' +
        '<ellipse cx="' + GV_ARM.x + '" cy="' + GV_ARM.y + '" rx="15" ry="13" fill="#2a2c30"/>' +
        // 사운드박스(Exhibition reproducer) — 프레임이 위치·각도를 갱신한다
        '<g id="gvBoxG" transform="translate(988 753)">' +
        '<ellipse cx="0" cy="9" rx="46" ry="26" fill="#000" opacity=".45" filter="url(#gvSoft)"/>' +
        '<ellipse cx="0" cy="0" rx="44" ry="40" fill="url(#gvNickelRound)" stroke="#1c1e21" stroke-width="3"/>' +
        '<ellipse cx="0" cy="0" rx="32" ry="29" fill="#15171a"/>' +
        '<ellipse cx="0" cy="0" rx="26" ry="23" fill="#c9c3b2" opacity=".22"/>' +
        '<ellipse cx="-8" cy="-9" rx="12" ry="9" fill="#fdfbf3" opacity=".2"/>' +
        '<text x="0" y="4" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#d9d2be" text-anchor="middle" opacity=".8">Exhibition</text>' +
        '<path d="M0 30 L0 46" stroke="url(#gvNickel)" stroke-width="7" stroke-linecap="round"/>' +
        '<path id="gvNeedle" d="M0 44 L0 58" stroke="#dfe2e4" stroke-width="3.4" stroke-linecap="round"/>' +
        '<circle cx="26" cy="24" r="6" fill="#3a3d41" stroke="#8d9195"/>' +
        '</g>' +
        '<ellipse id="gvArmHit" cx="988" cy="753" rx="66" ry="52" fill="#000" fill-opacity="0" style="cursor:grab"><title>톤암 — 잡아서 원하는 곡 위에 바늘을 내려놓으세요</title></ellipse>' +

        // 앞면 + 우측면
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvOakSide)" stroke="#221206" stroke-width="3"/>' +
        '<polygon points="1010,930 ' + off(1010, 930) + ' ' + off(1010, 1150) + ' 1010,1150" fill="url(#gvRay)" opacity=".5"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvOakFront)" stroke="#221206" stroke-width="3"/>' +
        '<rect x="190" y="930" width="820" height="220" fill="url(#gvRay)" opacity=".9"/>' +
        '<path d="M190 936 H1010" stroke="#e2ab6b" stroke-width="3" opacity=".3"/>' +
        // 코너 기둥
        '<rect x="190" y="930" width="72" height="220" fill="url(#gvOakFront)" stroke="#2c1809" stroke-width="2"/>' + gvFlutes(190, 930, 72, 220) +
        '<rect x="938" y="930" width="72" height="220" fill="url(#gvOakFront)" stroke="#2c1809" stroke-width="2"/>' + gvFlutes(938, 930, 72, 220) +
        '<rect x="184" y="924" width="84" height="20" rx="3" fill="#8f5b2c" stroke="#2c1809" stroke-width="2"/>' +
        '<rect x="932" y="924" width="84" height="20" rx="3" fill="#8f5b2c" stroke="#2c1809" stroke-width="2"/>' +
        '<rect x="184" y="1130" width="84" height="22" rx="3" fill="#8f5b2c" stroke="#2c1809" stroke-width="2"/>' +
        '<rect x="932" y="1130" width="84" height="22" rx="3" fill="#8f5b2c" stroke="#2c1809" stroke-width="2"/>' +
        // 금박 데칼 — Victor 스크립트와 사명 판
        '<text x="600" y="1022" font-family="Georgia, serif" font-size="62" font-style="italic" font-weight="700" fill="#d9ab5c" text-anchor="middle" opacity=".92">Victor</text>' +
        '<path d="M470 1038 Q600 1058 730 1038" fill="none" stroke="#c79a4e" stroke-width="2" opacity=".7"/>' +
        '<text x="600" y="1082" font-family="Arial" font-size="16" font-weight="600" letter-spacing="3" fill="#e0b06a" text-anchor="middle" opacity=".95">VICTOR TALKING MACHINE CO.</text>' +
        '<text x="600" y="1110" font-family="Arial" font-size="13" letter-spacing="2.6" fill="#c79a58" text-anchor="middle" opacity=".85">CAMDEN, N.J. &#183; VICTOR V</text>' +
        // 굽도리 몰딩 2단
        molding(168, 1032, 1148, 1176, "#8a5628") +
        molding(146, 1054, 1174, 1210, "#74471f") +

        // 태엽 크랭크 — 우측면
        '<ellipse cx="1120" cy="950" rx="30" ry="28" fill="url(#gvNickelRound)" stroke="#1d1f22" stroke-width="2.5"/>' +
        '<path d="M1120 950 L1214 936" stroke="url(#gvNickel)" stroke-width="13" stroke-linecap="round"/>' +
        '<g id="gvCrankG" transform="rotate(0 1214 936)">' +
        '<path d="M1214 936 L1214 856" stroke="url(#gvNickel)" stroke-width="12" stroke-linecap="round"/>' +
        '<rect x="1201" y="826" width="26" height="46" rx="12" fill="#6b4423" stroke="#2c1809" stroke-width="2"/>' +
        '<rect x="1206" y="832" width="7" height="34" rx="3" fill="#a9764a" opacity=".6"/>' +
        '</g>' +
        '<circle id="gvCrankHit" cx="1214" cy="900" r="74" fill="#000" fill-opacity="0" style="cursor:pointer"><title>태엽 크랭크 — 돌려서 스프링 모터를 감습니다</title></circle>' +
        '<text x="1214" y="1000" font-family="Arial" font-size="14" font-weight="700" letter-spacing="2" fill="#c39a5f" text-anchor="middle">WIND</text>' +

        // 상판 조작부 — 속도 조절기 · 브레이크 · 바늘통
        '<g id="gvSpeedPlate">' +
        '<ellipse cx="286" cy="884" rx="54" ry="30" fill="#1a1a1d" opacity=".45" filter="url(#gvSoft)"/>' +
        '<ellipse cx="284" cy="876" rx="52" ry="29" fill="url(#gvNickel)" stroke="#22242a" stroke-width="2"/>' +
        '<ellipse cx="284" cy="876" rx="40" ry="22" fill="#141518"/>' +
        '<text x="284" y="864" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.2" fill="#b9bdc0" text-anchor="middle">SPEED</text>' +
        '<path id="gvSpeedPtr" d="M284 876 L284 858" stroke="#f0e6cf" stroke-width="3.4" stroke-linecap="round" transform="rotate(0 284 876)"/>' +
        '<text id="gvSpeedText" x="284" y="890" font-family="Arial" font-size="11" font-weight="700" fill="#e8dcc2" text-anchor="middle">78</text>' +
        '</g>' +
        '<ellipse id="gvSpeedHit" cx="284" cy="876" rx="58" ry="34" fill="#000" fill-opacity="0" style="cursor:ns-resize;touch-action:none"><title>SPEED — 위아래로 끌어 회전수를 60~88rpm으로 조절</title></ellipse>' +
        // 브레이크 레버
        '<ellipse cx="1058" cy="800" rx="34" ry="22" fill="url(#gvNickel)" stroke="#22242a" stroke-width="2"/>' +
        '<path id="gvBrakeLever" d="M1058 800 L1092 764" stroke="#1b1c20" stroke-width="12" stroke-linecap="round" transform="rotate(0 1058 800)"/>' +
        '<circle cx="1058" cy="800" r="9" fill="url(#gvNickelRound)"/>' +
        '<text x="1058" y="832" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.4" fill="#c9a066" text-anchor="middle">BRAKE</text>' +
        '<ellipse id="gvBrakeHit" cx="1068" cy="788" rx="52" ry="44" fill="#000" fill-opacity="0" style="cursor:pointer"><title>브레이크 — 플래터를 세우고 다시 돌립니다</title></ellipse>' +
        // 바늘통 — 축음기 옆 탁자 위. 실물처럼 한 면마다 새 강철 바늘로 간다.
        '<g id="gvTinG">' +
        '<ellipse cx="1272" cy="1146" rx="66" ry="24" fill="#000" opacity=".5" filter="url(#gvSoft)"/>' +
        '<g stroke="#c9ccce" stroke-width="2.4" stroke-linecap="round" opacity=".85">' +
        '<path d="M1352 1152 L1392 1146"/><path d="M1356 1162 L1398 1158"/><path d="M1350 1140 L1386 1132"/></g>' +
        '<ellipse cx="1268" cy="1140" rx="62" ry="23" fill="#6d241b" stroke="#331109" stroke-width="2"/>' +
        '<rect x="1206" y="1116" width="124" height="24" fill="#6d241b"/>' +
        '<ellipse cx="1268" cy="1116" rx="62" ry="23" fill="#a03d2c" stroke="#331109" stroke-width="2"/>' +
        '<ellipse cx="1268" cy="1116" rx="44" ry="15" fill="none" stroke="#eccb92" stroke-width="1.6" opacity=".8"/>' +
        '<text x="1268" y="1113" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#f4e0b4" text-anchor="middle">Victor</text>' +
        '<text x="1268" y="1128" font-family="Arial" font-size="9" font-weight="700" letter-spacing="1.6" fill="#f0d5a4" text-anchor="middle">NEEDLES</text>' +
        '</g>' +
        '<ellipse id="gvTinHit" cx="1276" cy="1130" rx="86" ry="42" fill="#000" fill-opacity="0" style="cursor:pointer"><title>바늘통 — 새 강철 바늘로 갈아 끼웁니다 (한 면마다 교체)</title></ellipse>' +
        '<text x="1268" y="1198" font-family="Arial" font-size="13" font-weight="600" letter-spacing="1.6" fill="#9b7d4e" text-anchor="middle">바늘 교체</text>' +

        // ---------- 오른쪽 정보 열 ----------
        '<text x="1470" y="88" font-family="Arial" font-size="15" font-weight="700" letter-spacing="3.4" fill="#9b7d4e">78 R.P.M. &#183; ACOUSTIC</text>' +
        // 종이 봉투 (레코드 슬리브)
        '<rect x="1478" y="120" width="462" height="462" rx="5" fill="#0a0908" opacity=".5" filter="url(#gvSoft)"/>' +
        '<rect x="1470" y="112" width="462" height="462" rx="5" fill="url(#gvPaper)" stroke="#8a7752" stroke-width="2"/>' +
        '<g clip-path="url(#gvSleeveClip)">' +
        '<circle cx="1701" cy="343" r="136" fill="#141110"/>' +
        '<circle cx="1701" cy="343" r="136" fill="none" stroke="#8a7752" stroke-width="3"/>' +
        '<circle id="gvSleeveLabel" cx="1701" cy="343" r="104" fill="#b7472f"/>' +
        '<circle cx="1701" cy="343" r="104" fill="none" stroke="#eadfc4" stroke-width="2" opacity=".7"/>' +
        '<text id="gvSleeveBig" x="1701" y="316" font-family="Georgia, serif" font-size="26" font-weight="700" fill="#f6ecd2" text-anchor="middle"></text>' +
        '<text id="gvSleeveTitle" x="1701" y="346" font-family="Arial" font-size="14" fill="#f2e5c6" text-anchor="middle"></text>' +
        '<text id="gvSleeveArtist" x="1701" y="370" font-family="Arial" font-size="12" fill="#e3d0a8" text-anchor="middle"></text>' +
        '<text x="1701" y="398" font-family="Arial" font-size="11" font-weight="700" letter-spacing="1.6" fill="#f0e2c0" text-anchor="middle">78 R.P.M.</text>' +
        '<circle cx="1701" cy="343" r="7" fill="#100e0c"/>' +
        '<path d="M1470 112 H1932 M1470 574 H1932" stroke="#8a7752" stroke-width="1" opacity=".5"/>' +
        '<text x="1494" y="152" font-family="Georgia, serif" font-size="19" font-style="italic" fill="#6d5c3c">Victor Record</text>' +
        '<text id="gvSleeveNote" x="1494" y="544" font-family="Arial" font-size="13" fill="#6d5c3c"></text>' +
        '</g>' +
        '<g id="gvCrateBtn" style="cursor:pointer"><title>음반 수납장 열기</title>' +
        '<rect x="1470" y="596" width="296" height="40" rx="7" fill="#26211a" stroke="#5b4a30" stroke-width="1.5"/>' +
        '<text id="gvCrateLabel" x="1618" y="623" font-family="Arial" font-size="14" fill="#d8c69e" text-anchor="middle" pointer-events="none">&#9636; 음반 수납장</text></g>' +
        '<circle id="gvPrevRec" cx="1820" cy="616" r="24" fill="#26211a" stroke="#5b4a30" stroke-width="1.5" style="cursor:pointer"><title>이전 음반</title></circle>' +
        '<text x="1820" y="625" font-family="Georgia, serif" font-size="26" fill="#d8c69e" text-anchor="middle" pointer-events="none">&#8249;</text>' +
        '<circle id="gvNextRec" cx="1892" cy="616" r="24" fill="#26211a" stroke="#5b4a30" stroke-width="1.5" style="cursor:pointer"><title>다음 음반</title></circle>' +
        '<text x="1892" y="625" font-family="Georgia, serif" font-size="26" fill="#d8c69e" text-anchor="middle" pointer-events="none">&#8250;</text>' +
        '<g id="gvTrackList" clip-path="url(#gvListClip)"></g>' +
        // 태엽·바늘 게이지
        '<rect x="1470" y="1054" width="462" height="112" rx="8" fill="url(#gvPlate)" stroke="#3f3323" stroke-width="1.5"/>' +
        '<text x="1492" y="1088" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#a98d5c">태엽 WIND</text>' +
        '<rect x="1616" y="1076" width="200" height="12" rx="6" fill="#0d0b08" stroke="#4a3d29"/>' +
        '<rect id="gvWindBar" x="1616" y="1076" width="200" height="12" rx="6" fill="#d7a24a"/>' +
        '<text id="gvWindText" x="1912" y="1088" font-family="Arial" font-size="12" font-weight="700" fill="#d9c294" text-anchor="end">100%</text>' +
        '<text x="1492" y="1136" font-family="Arial" font-size="12" font-weight="700" letter-spacing="2" fill="#a98d5c">바늘 NEEDLE</text>' +
        '<rect x="1616" y="1124" width="200" height="12" rx="6" fill="#0d0b08" stroke="#4a3d29"/>' +
        '<rect id="gvNeedleBar" x="1616" y="1124" width="0" height="12" rx="6" fill="#b05a2a"/>' +
        '<text id="gvNeedleText" x="1912" y="1136" font-family="Arial" font-size="12" font-weight="700" fill="#d9c294" text-anchor="end">새 바늘</text>' +
        '<text id="gvCredit" x="60" y="1226" font-family="Arial" font-size="12" fill="#7a6647"></text>' +
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
        shell: ["#4a453f", "#33302c", "#232120", "#151413"],
        shellSide: "#1b1a19",
        band: ["#2c2926", "#1c1a19"],
        ivory: ["#f2ecdb", "#e6dcc2", "#cec2a3"],
        grille: "#e9e1cb",
        perf: "#6a6250",
        ink: "#2e2a24",
        sub: "#6b6353",
        bandInk: "#a9a294",
        script: "#c8913f",
        leg: "#191817"
    },
    mint: {
        label: "금성 A-501 · 민트",
        shell: ["#9fc9b6", "#7cae99", "#5d9280", "#3d6d5d"],
        shellSide: "#3f7362",
        band: ["#5b8c7b", "#3e6b5c"],
        ivory: ["#f6f1e2", "#eae2ca", "#d3c8aa"],
        grille: "#f0e9d5",
        perf: "#6f7364",
        ink: "#2b3630",
        sub: "#5d6d64",
        bandInk: "#d7e6dc",
        script: "#c8913f",
        leg: "#2c4c41"
    }
};

function a5Knob(cx, cy, r, id, label, sub) {
    return '<g id="' + id + 'G">' +
        '<ellipse cx="' + cx + '" cy="' + (cy + 5) + '" rx="' + r + '" ry="' + (r * 0.9) + '" fill="#000" opacity=".45"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#a5KnobBody)" stroke="#0b0b0c" stroke-width="2"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.52) + '" fill="url(#a5KnobChrome)"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.2) + '" fill="#2b2c2f"/>' +
        '<g id="' + id + 'Ptr" transform="rotate(0 ' + cx + ' ' + cy + ')">' +
        '<rect x="' + (cx - 2.2) + '" y="' + (cy - r + 5) + '" width="4.4" height="' + (r * 0.42) + '" rx="2" fill="#f0efe8" opacity=".85"/>' +
        '</g></g>' +
        '<text x="' + cx + '" y="' + (cy + r + 30) + '" font-family="Arial" font-size="15" font-weight="600" letter-spacing="2.2" fill="' + sub + '" text-anchor="middle">' + label + '</text>';
}

function mfaA501Svg(finish) {
    const key = A501_FINISHES[finish] ? finish : "charcoal";
    const t = A501_FINISHES[key];
    const fmTicks = (() => {
        let out = "";
        for (let f = 88; f <= 108; f += 0.5) {
            const x = (A5_DIAL.x88 + (f - 88) * A5_DIAL.px).toFixed(1);
            const major = Math.abs(f % 4) < 0.01;
            const mid = Math.abs(f % 2) < 0.01;
            out += '<path d="M' + x + ' ' + (A5_DIAL.y0 + 14) + ' V' + (A5_DIAL.y0 + (major ? 32 : mid ? 26 : 21)) +
                '" stroke="' + t.ink + '" stroke-width="' + (major ? 2.4 : 1.3) + '" opacity="' + (major ? ".85" : ".55") + '"/>';
        }
        for (let f = 88; f <= 108; f += 4) {
            const x = (A5_DIAL.x88 + (f - 88) * A5_DIAL.px).toFixed(1);
            out += '<text x="' + x + '" y="' + (A5_DIAL.y0 + 2) + '" font-family="Arial" font-size="34" font-weight="700" fill="' + t.ink + '" text-anchor="middle">' + f + '</text>';
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
            '<text x="' + x + '" y="' + (A5_DIAL.y1 + 2) + '" font-family="Arial" font-size="27" font-weight="600" fill="' + t.ink + '" text-anchor="middle" opacity=".82">' + lbl + '</text>').join("") +
            bands.map(([lbl, x]) =>
                '<text x="' + x + '" y="' + (A5_DIAL.y1 + 26) + '" font-family="Arial" font-size="15" fill="' + t.sub + '" text-anchor="middle" opacity=".8">' + lbl + '</text>').join("");
    })();

    return '<svg class="solo-svg a5-svg a5-' + key + '" data-finish="' + key + '" viewBox="0 0 2000 880" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="금성 A-501 진공관 라디오 ' + t.label + '">' +
        '<defs>' +
        '<linearGradient id="a5Shell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.shell[0] + '"/><stop offset=".22" stop-color="' + t.shell[1] + '"/><stop offset=".72" stop-color="' + t.shell[2] + '"/><stop offset="1" stop-color="' + t.shell[3] + '"/></linearGradient>' +
        '<linearGradient id="a5Band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.band[0] + '"/><stop offset="1" stop-color="' + t.band[1] + '"/></linearGradient>' +
        '<linearGradient id="a5Ivory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + t.ivory[0] + '"/><stop offset=".55" stop-color="' + t.ivory[1] + '"/><stop offset="1" stop-color="' + t.ivory[2] + '"/></linearGradient>' +
        '<linearGradient id="a5Glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf8e9"/><stop offset=".42" stop-color="#f3ead2"/><stop offset="1" stop-color="#ded2b2"/></linearGradient>' +
        '<linearGradient id="a5Chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfb"/><stop offset=".2" stop-color="#b9bec1"/><stop offset=".52" stop-color="#eef1f1"/><stop offset=".8" stop-color="#82878b"/><stop offset="1" stop-color="#d8dcdd"/></linearGradient>' +
        '<radialGradient id="a5KnobBody" cx=".34" cy=".28" r=".88"><stop offset="0" stop-color="#4b4c50"/><stop offset=".5" stop-color="#26272a"/><stop offset="1" stop-color="#0e0f11"/></radialGradient>' +
        '<radialGradient id="a5KnobChrome" cx=".34" cy=".28" r=".85"><stop offset="0" stop-color="#f6f7f5"/><stop offset=".45" stop-color="#a8acaf"/><stop offset="1" stop-color="#565a5e"/></radialGradient>' +
        '<radialGradient id="a5LampWash" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".5"/><stop offset=".6" stop-color="#ffd484" stop-opacity=".16"/><stop offset="1" stop-color="#ffc464" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="a5FilGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff9d3c" stop-opacity=".5"/><stop offset=".55" stop-color="#e8722a" stop-opacity=".18"/><stop offset="1" stop-color="#c85a1e" stop-opacity="0"/></radialGradient>' +
        '<pattern id="a5Perf" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="6.5" cy="7.4" r="2.9" fill="#ffffff" opacity=".5"/><circle cx="6.5" cy="6.5" r="2.9" fill="' + t.perf + '"/></pattern>' +
        '<filter id="a5Soft" x="-40%" y="-40%" width="190%" height="190%"><feGaussianBlur stdDeviation="7"/></filter>' +
        '<clipPath id="a5GlassClip"><rect x="905" y="243" width="845" height="392" rx="7"/></clipPath>' +
        '<clipPath id="a5GrilleClip"><rect x="250" y="243" width="643" height="392" rx="7"/></clipPath>' +
        '</defs>' +

        '<rect width="2000" height="880" rx="10" fill="#131211"/>' +
        '<ellipse cx="1000" cy="470" rx="880" ry="380" fill="#2a2724" opacity=".5" filter="url(#a5Soft)"/>' +

        // 캐비닛 — 아래가 넓고 위로 좁아지며 윗면이 완만하게 휜다
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="#07070a" opacity=".55" filter="url(#a5Soft)" transform="translate(6 12)"/>' +
        '<path d="M150 800 H1850 L1795 200 Q1000 96 205 200 Z" fill="url(#a5Shell)" stroke="#0c0c0d" stroke-width="3"/>' +
        // 윗면 — 뒤로 넘어간 곡면이 살짝 보인다
        '<path d="M205 200 Q1000 96 1795 200 Q1000 130 205 200 Z" fill="' + t.shellSide + '" opacity=".9"/>' +
        '<path d="M212 196 Q1000 104 1788 196" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".14"/>' +

        // 상아색 인서트 — 크롬 테
        '<rect x="238" y="231" width="1524" height="416" rx="12" fill="url(#a5Chrome)"/>' +
        '<rect x="246" y="239" width="1508" height="400" rx="9" fill="url(#a5Ivory)"/>' +

        // 좌: 타공 스피커 그릴
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="' + t.grille + '"/>' +
        '<g clip-path="url(#a5GrilleClip)">' +
        '<rect x="250" y="243" width="643" height="392" fill="url(#a5Perf)"/>' +
        // 5인치 스피커 뒤에서 새어 나오는 진공관 불빛
        '<ellipse id="a5TubeGlow" cx="572" cy="440" rx="300" ry="210" fill="url(#a5FilGlow)" opacity="0"/>' +
        '</g>' +
        '<rect x="250" y="243" width="643" height="392" rx="7" fill="none" stroke="#a89f84" stroke-width="1.5" opacity=".55"/>' +
        // 금성 왕관 엠블럼
        '<g id="a5Crest" transform="translate(312 286) scale(1.35)">' +
        '<path d="M0 28 L4 4 L14 20 L24 -2 L34 20 L44 4 L48 28 Z" fill="#c8913f" stroke="#7d5419" stroke-width="1.4" stroke-linejoin="round"/>' +
        '<path d="M0 28 L4 4 L14 20 L24 -2" fill="none" stroke="#f0c877" stroke-width="1.2" opacity=".8"/>' +
        '<rect x="-2" y="29" width="52" height="7" rx="3" fill="#c8913f" stroke="#7d5419" stroke-width="1.2"/>' +
        '<circle cx="24" cy="-8" r="4.4" fill="#e8bb66" stroke="#7d5419" stroke-width="1"/>' +
        '<circle cx="4" cy="1" r="3" fill="#e8bb66"/><circle cx="44" cy="1" r="3" fill="#e8bb66"/>' +
        '</g>' +

        // 우: 다이얼 유리
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
        '<path d="M' + (A5_DIAL.drawX + 2) + ' 264 V468" stroke="#000" stroke-width="3" opacity=".22"/>' +
        '<path d="M' + A5_DIAL.drawX + ' 262 V470" stroke="#7d1f14" stroke-width="2.8"/>' +
        '<path d="M' + (A5_DIAL.drawX + 0.9) + ' 262 V470" stroke="#e8674a" stroke-width="1" opacity=".75"/>' +
        '<path d="M' + (A5_DIAL.drawX - 9) + ' 258 L' + (A5_DIAL.drawX + 9) + ' 258 L' + A5_DIAL.drawX + ' 274 Z" fill="#7d1f14"/>' +
        '</g>' +
        // 현재 방송 이름 — 다이얼 유리에 인쇄된 국명 자리
        '<text id="a5StationText" x="1330" y="516" font-family="Arial" font-size="24" font-weight="600" letter-spacing="1.6" fill="' + t.ink + '" text-anchor="middle" opacity=".85"></text>' +
        '<text x="1330" y="612" font-family="Georgia, serif" font-size="27" font-style="italic" font-weight="700" letter-spacing="3" fill="' + t.sub + '" text-anchor="middle" opacity=".9">TWO BAND SUPER HETERODYNE</text>' +
        '</g>' +
        // 10KC 배지 — 앱에서는 동조(신호) 표시등으로 켜진다
        '<circle cx="1702" cy="292" r="31" fill="#1d3a26" stroke="#0e1d13" stroke-width="2"/>' +
        '<circle id="a5Lamp" cx="1702" cy="292" r="25" fill="#204a2f"/>' +
        '<text x="1702" y="298" font-family="Arial" font-size="15" font-weight="700" fill="#cfe6d4" text-anchor="middle" pointer-events="none">10KC</text>' +
        '<rect x="905" y="243" width="845" height="392" rx="7" fill="none" stroke="#a89f84" stroke-width="1.5" opacity=".55"/>' +
        '<polygon points="905,243 1220,243 1050,635 905,635" fill="url(#lzGlassSweep)" opacity=".5" pointer-events="none"/>' +

        // 스피어 몰딩 — 양 끝이 뾰족하게 좁아지며 전면을 가로지르는 크롬 장식
        '<path d="M256 572 L1000 544 L1744 572 L1000 600 Z" fill="#000" opacity=".3" transform="translate(0 5)"/>' +
        '<path d="M256 566 L1000 538 L1744 566 L1000 594 Z" fill="url(#a5Chrome)" stroke="#4a5054" stroke-width="2"/>' +
        '<path d="M320 563 L1000 545 L1680 563" fill="none" stroke="#ffffff" stroke-width="4.5" opacity=".92"/>' +
        '<path d="M320 577 L1000 566 L1680 577" fill="none" stroke="#2f363f" stroke-width="2.4" opacity=".62"/>' +
        '<path d="M256 566 L360 560 M1640 560 L1744 566" stroke="#8f959a" stroke-width="1.6" opacity=".8"/>' +

        // 다이얼 드래그 히트존
        '<rect id="a5DialHit" x="930" y="252" width="800" height="230" fill="#000" fill-opacity="0" style="cursor:ew-resize;touch-action:none" tabindex="0" role="slider" aria-label="주파수 다이얼 — 드래그하여 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>드래그하여 주파수를 맞추세요</title></rect>' +

        // 하단 어두운 띠 — 로고와 세 노브
        '<rect x="196" y="647" width="1608" height="153" fill="url(#a5Band)"/>' +
        '<rect x="196" y="647" width="1608" height="4" fill="#ffffff" opacity=".1"/>' +
        '<rect x="262" y="690" width="52" height="30" rx="4" fill="url(#a5Chrome)" stroke="#0d0d0e" stroke-width="1.5"/>' +
        '<rect x="276" y="696" width="10" height="18" rx="2" fill="#1a1b1d"/>' +
        '<text x="380" y="742" font-family="Georgia, serif" font-size="52" font-style="italic" font-weight="700" fill="' + t.script + '">GoldStar</text>' +
        '<path d="M382 752 Q520 768 660 748" fill="none" stroke="' + t.script + '" stroke-width="2.2" opacity=".65"/>' +
        a5Knob(1146, 716, 42, "a5Vol", "VOLUME", t.bandInk) +
        a5Knob(1420, 716, 42, "a5Sel", "SELECT", t.bandInk) +
        a5Knob(1694, 716, 42, "a5Tune", "TUNER", t.bandInk) +
        '<g font-family="Arial" font-size="15" font-weight="700" letter-spacing="1.4" fill="' + t.bandInk + '" text-anchor="middle">' +
        '<text id="a5SelSc" x="1350" y="684" opacity=".32">SC</text>' +
        '<text id="a5SelPu" x="1420" y="668" opacity=".32">PU</text>' +
        '<text id="a5SelSw" x="1490" y="684" opacity=".32">SW</text>' +
        '</g>' +
        '<g fill="' + t.bandInk + '" opacity=".3"><circle cx="1372" cy="700" r="2.6"/><circle cx="1420" cy="690" r="2.6"/><circle cx="1468" cy="700" r="2.6"/></g>' +
        '<circle id="a5VolHit" cx="1146" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="음량 — 좌우로 끌어 조절, 왼쪽 끝은 전원 OFF" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><title>VOLUME — 좌우로 끌어 음량 조절 (반시계 끝 = 전원 OFF)</title></circle>' +
        '<circle id="a5SelHit" cx="1420" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:pointer" tabindex="0" role="button" aria-label="입력 선택 — SC 방송 · PU 음반 · SW 단파"><title>SELECT — SC(방송) · PU(음반 픽업) · SW(단파)</title></circle>' +
        '<circle id="a5TuneHit" cx="1694" cy="716" r="62" fill="#000" fill-opacity="0" style="cursor:grab;touch-action:none" tabindex="0" role="slider" aria-label="선국 노브 — 좌우로 끌어 선국" aria-valuemin="88" aria-valuemax="108" aria-valuenow="98"><title>TUNER — 좌우로 끌어 선국하세요</title></circle>' +

        // 다리 — 아래로 벌어진 두 발
        '<path d="M404 798 L472 798 L440 866 L344 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M410 802 L462 802 L436 856" fill="none" stroke="#ffffff" stroke-width="2" opacity=".1"/>' +
        '<path d="M1528 798 L1596 798 L1656 866 L1560 866 Z" fill="' + t.leg + '" stroke="#08080a" stroke-width="2.5"/>' +
        '<path d="M1538 802 L1590 802 L1626 856" fill="none" stroke="#ffffff" stroke-width="2" opacity=".1"/>' +
        '<ellipse cx="392" cy="868" rx="62" ry="9" fill="#000" opacity=".55"/>' +
        '<ellipse cx="1608" cy="868" rx="62" ry="9" fill="#000" opacity=".55"/>' +
        '<text x="1804" y="838" font-family="Arial" font-size="13" letter-spacing="1.6" fill="' + t.bandInk + '" opacity=".55" text-anchor="end">金星社 &#183; A-501 &#183; AC 5球 &#183; 1959</text>' +
        '</svg>';
}

const SOLO_MODELS = {
    victorv: {
        label: "VICTOR V 축음기",
        kind: "phono",
        year: 1907,
        desc: "전기 증폭 이전의 어쿠스틱 축음기 — 강철 바늘·운모 진동판·놋쇠 나팔관. 태엽을 감아 돌리고 한 면마다 바늘을 간다.",
        render: mfaVictorVSvg
    },
    a501: {
        label: "금성 A-501 라디오",
        kind: "radio",
        year: 1959,
        desc: "국산 1호 라디오 — 5구 진공관·5인치 스피커·2밴드 슈퍼헤테로다인. 따뜻한 2차 배음과 부드러운 포화로 FM을 받는다.",
        finishes: A501_FINISHES,
        render: mfaA501Svg
    }
};
const SOLO_ORDER = ["victorv", "a501"];
