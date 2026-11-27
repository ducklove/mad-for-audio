// 재질 텍스처 라이브러리 — 브러시드·스핀 가공 금속, 목재 결, 도장 그레인, 레더렛, 주물 표면.
// 클래식 스크립트 — skins.js보다 먼저 로드한다. 로드 순서: store→materials→skins→...
//
// 왜 SVG 필터(feTurbulence)가 아니라 래스터 패턴인가:
// 이 앱의 주 사용 환경은 Safari/WKWebView다. WebKit은 바늘·릴이 움직일 때마다 필터 영역을
// 다시 계산하므로 큰 패널에 노이즈 필터를 걸면 모바일에서 프레임이 무너진다. 대신 캔버스로
// 이음매 없는 타일을 한 번만 만들고 blob URL로 <pattern>에 물린다. 타일링은 래스터라이저가
// 가장 싸게 처리하는 경로라 애니메이션 비용에 영향이 거의 없다.
//
// 생성은 첫 화면을 막지 않는다: 유휴 시간에 몇 줄씩 나눠 계산하고(긴 작업 없음), PNG 인코딩은
// 비동기 toBlob에 맡긴다. 패턴의 <image>는 data-mfa-tex로 표시해 두고 텍스처가 준비되는 대로
// 이미 마운트된 SVG까지 href를 채운다(mfaHydrateTextures). 모두 준비되면 MFA_TEXTURES_READY가 풀린다.
//
// 모든 텍스처는 "중성 오버레이"다: 밝은 결은 흰색 알파, 어두운 결은 검은색 알파로 기록하므로
// 기존 그라디언트·색 위에 얹어도 바탕색을 바꾸지 않고 표면 질감만 더한다.
//
// 패턴 id는 lzTex* 접두를 쓴다. applyPanelLighting이 LZ_DEFS와 함께 SVG마다 범위를 입혀
// (mfa-lz-N-lzTex…) 컴포넌트 사이 id 충돌이 없다. 스킨 마크업은 url(#lzTexBrushH)처럼
// 범위 없는 이름으로 참조하면 마운트 시 자동으로 바뀐다.

const MFA_TEXTURES = {};

// 결정적 난수 — 새로고침해도 같은 결이 나와야 스크린샷 비교가 흔들리지 않는다.
function mfaRng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// 주기 경계에서 감기는 값 노이즈 — 타일 가장자리가 이어지도록 격자를 period로 감는다.
function mfaLattice(px, py, seed) {
    const r = mfaRng(seed);
    const g = new Float32Array(px * py);
    for (let i = 0; i < g.length; i++) g[i] = r() * 2 - 1;
    return (x, y) => {
        const xi = Math.floor(x), yi = Math.floor(y);
        const fx = x - xi, fy = y - yi;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
        const y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py;
        const a = g[y0 * px + x0], b = g[y0 * px + x1], c = g[y1 * px + x0], d = g[y1 * px + x1];
        return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    };
}

// 옥타브마다 주기를 두 배로 늘려도 타일 크기의 약수를 유지해 이음매가 생기지 않는다.
function mfaFbm(w, h, cellsX, cellsY, octaves, seed) {
    const layers = [];
    let amp = 1, total = 0;
    for (let o = 0; o < octaves; o++) {
        const cx = cellsX << o, cy = cellsY << o;
        layers.push({ n: mfaLattice(cx, cy, seed + o * 101), sx: cx / w, sy: cy / h, amp });
        total += amp;
        amp *= .5;
    }
    return (x, y) => {
        let v = 0;
        for (const l of layers) v += l.n(x * l.sx, y * l.sy) * l.amp;
        return v / total;
    };
}

// 텍스처 레시피 — 준비 순서는 화면에서 가장 넓게 쓰이는 재질부터다.
// make()는 표본 함수를 돌려준다(노이즈 격자 준비는 가볍고, 비싼 픽셀 계산은 유휴 시간에 나눠 돈다).
const MFA_TEXTURE_RECIPES = [
    // 헤어라인 브러시드 알루미늄 (가로 결) — 줄마다 밝기가 다르고, 드물게 긴 스크래치가 지난다.
    { key: "brushH", w: 1024, h: 256, gain: .9, make(W, H) {
        const streak = mfaFbm(W, H, 4, 256, 3, 11);
        const fine = mfaFbm(W, H, 64, 256, 2, 23);
        const r = mfaRng(37);
        const scratches = new Float32Array(H);
        for (let y = 0; y < H; y++) scratches[y] = r() < .07 ? (r() * 2 - 1) * .9 : 0;
        return (x, y) => streak(x, y) * .85 + fine(x, y) * .35 + scratches[y] * (.6 + .4 * Math.sin(x / W * Math.PI * 2 * 3 + y));
    } },
    // 스핀 가공 (동심원 결 + 고정 광원의 원뿔 반사) — 노브 캡·플래터 림·스핀들 캡.
    { key: "spun", w: 512, h: 512, gain: .85, make(S) {
        const C = S / 2;
        const rings = mfaFbm(4096, 64, 512, 4, 2, 71);
        const sheenAngle = -0.62;  // 좌상단 광원
        return (x, y) => {
            const dx = x + .5 - C, dy = y + .5 - C;
            const rr = Math.sqrt(dx * dx + dy * dy);
            if (rr > C) return 0;
            const t = Math.atan2(dy, dx);
            const ring = rings(rr * 8, (t / (Math.PI * 2) + .5) * 64);
            // cos(2θ)는 선반 가공면 특유의 마주 보는 두 쐐기 하이라이트를 만든다.
            const cone = Math.cos(2 * (t - sheenAngle));
            const edge = Math.min(1, (C - rr) / 6);
            return (ring * .55 + cone * .62 * Math.min(1, rr / (C * .18))) * edge;
        };
    } },
    // 미세 그레인 — 분체 도장·주물·무광 플라스틱의 표면. 고주파와 저주파 얼룩을 섞는다.
    { key: "grain", w: 256, h: 256, gain: .55, make(W, H) {
        const r = mfaRng(53);
        const white = new Float32Array(W * H);
        for (let i = 0; i < white.length; i++) white[i] = r() * 2 - 1;
        const mottle = mfaFbm(W, H, 4, 4, 3, 61);
        return (x, y) => white[y * W + x] * .7 + mottle(x, y) * .45;
    } },
    // 원목 결 — 길게 흐르는 결 다발이 완만하게 휘고, 늦은재 선은 가늘게, 섬유 줄무늬가 색 얼룩을 만든다.
    { key: "wood", w: 1024, h: 512, gain: .8, make(W, H) {
        const warp = mfaFbm(W, H, 2, 4, 3, 83);
        const drift = mfaFbm(W, H, 1, 2, 2, 85);
        const fiber = mfaFbm(W, H, 8, 256, 3, 89);
        const streaks = mfaFbm(W, H, 2, 32, 2, 91);
        const pores = mfaRng(97);
        const poreMap = new Float32Array(W * H);
        for (let i = 0; i < poreMap.length; i++) poreMap[i] = pores() < .01 ? -1 : 0;
        const bands = 22;
        return (x, y) => {
            const phase = (y / H + warp(x, y) * .07 + drift(x, y) * .05) * bands * Math.PI * 2;
            const s = Math.sin(phase);
            // 늦은재(어두운 결)는 가늘고 진하게, 그 옆 이른재는 살짝 밝게
            const late = Math.pow(Math.max(0, s), 6);
            const ring = -late * .95 + Math.max(0, -s) * .12;
            return ring * .75 + fiber(x, y) * .45 + streaks(x, y) * .4 + poreMap[y * W + x] * .25;
        };
    } },
    // 세로 결 — 가로 결과 통계는 같고 방향만 다르다 (세로 트림·손잡이 레일).
    { key: "brushV", w: 256, h: 1024, gain: .9, make(W, H) {
        const streak = mfaFbm(W, H, 256, 4, 3, 13);
        const fine = mfaFbm(W, H, 256, 64, 2, 29);
        return (x, y) => streak(x, y) * .85 + fine(x, y) * .35;
    } },
    // 해머톤·주물 — 망치 자국처럼 오목한 반점과 가장자리 반사. 크링클 트랜스 커버·크림 해머 도장.
    { key: "hammer", w: 384, h: 384, gain: .7, make(W, H) {
        const blobs = mfaFbm(W, H, 24, 24, 2, 131);
        const broad = mfaFbm(W, H, 3, 3, 2, 137);
        return (x, y) => {
            const v = blobs(x, y);
            const rim = Math.exp(-v * v * 40);   // 반점 테두리의 밝은 반사
            return v * .55 + rim * .35 - .12 + broad(x, y) * .3;
        };
    } },
    // 레더렛·톨렉스 — 작은 셀이 오목볼록하게 반복되는 엠보싱 표면.
    { key: "leather", w: 256, h: 256, gain: .7, make(W, H) {
        const cells = mfaFbm(W, H, 48, 48, 1, 107);
        const fine = mfaFbm(W, H, 128, 128, 1, 109);
        const broad = mfaFbm(W, H, 4, 4, 2, 113);
        return (x, y) => {
            const c = cells(x, y);
            const groove = Math.exp(-c * c * 90);
            return -groove * .55 + c * .25 + fine(x, y) * .2 + broad(x, y) * .25;
        };
    } }
];

// 준비된 텍스처를 패턴 <image>에 채운다. root를 주면 그 안만, 없으면 문서 전체를 훑는다.
function mfaHydrateTextures(root) {
    const scope = root || (typeof document !== "undefined" ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll("image[data-mfa-tex]").forEach((img) => {
        const url = MFA_TEXTURES[img.getAttribute("data-mfa-tex")];
        if (url && img.getAttribute("href") !== url) img.setAttribute("href", url);
    });
}

const MFA_TEXTURES_READY = (() => {
    if (typeof document === "undefined" || typeof Uint8ClampedArray === "undefined") return Promise.resolve(MFA_TEXTURES);
    const idle = typeof requestIdleCallback === "function"
        ? (fn) => requestIdleCallback(fn, { timeout: 120 })
        : (fn) => setTimeout(() => fn({ timeRemaining: () => 8, didTimeout: true }), 0);
    const finish = (key, url) => {
        if (url) {
            MFA_TEXTURES[key] = url;
            mfaHydrateTextures();
        }
    };
    const encode = (key, canvas) => new Promise((resolve) => {
        const fallback = () => {
            try { finish(key, canvas.toDataURL("image/png")); } catch (error) {}
            resolve();
        };
        // toBlob은 인코딩을 메인 스레드 밖에서 처리하고, blob URL은 짧아 SVG 속성에 반복해 실어도 가볍다.
        if (!canvas.toBlob || typeof URL === "undefined" || !URL.createObjectURL) return fallback();
        try {
            canvas.toBlob((blob) => {
                if (!blob) return fallback();
                finish(key, URL.createObjectURL(blob));
                resolve();
            }, "image/png");
        } catch (error) {
            fallback();
        }
    });
    return new Promise((resolveAll) => {
        const pending = [];
        let index = 0, job = null;
        const step = (deadline) => {
            const sliceEnd = performance.now() + Math.max(6, Math.min(12, deadline && deadline.timeRemaining ? deadline.timeRemaining() : 8));
            try {
                while (index < MFA_TEXTURE_RECIPES.length) {
                    if (!job) {
                        const recipe = MFA_TEXTURE_RECIPES[index];
                        const canvas = document.createElement("canvas");
                        canvas.width = recipe.w;
                        canvas.height = recipe.h;
                        const ctx = canvas.getContext && canvas.getContext("2d");
                        if (!ctx) { index = MFA_TEXTURE_RECIPES.length; break; }
                        job = { recipe, canvas, ctx, img: ctx.createImageData(recipe.w, recipe.h), sample: recipe.make(recipe.w, recipe.h), y: 0 };
                    }
                    const { recipe, img, sample } = job;
                    const d = img.data, W = recipe.w, gain = recipe.gain;
                    // v ∈ [-1, 1] → 중성 오버레이 픽셀 (밝으면 흰 알파, 어두우면 검은 알파)
                    while (job.y < recipe.h) {
                        const y = job.y++;
                        for (let x = 0; x < W; x++) {
                            const v = Math.max(-1, Math.min(1, sample(x, y) * gain));
                            const i = (y * W + x) * 4;
                            const c = v >= 0 ? 255 : 0;
                            d[i] = c; d[i + 1] = c; d[i + 2] = c;
                            d[i + 3] = Math.round(Math.abs(v) * 255);
                        }
                        if ((y & 3) === 3 && performance.now() > sliceEnd) break;
                    }
                    if (job.y < recipe.h) break;
                    job.ctx.putImageData(img, 0, 0);
                    pending.push(encode(recipe.key, job.canvas));
                    job = null;
                    index++;
                    if (performance.now() > sliceEnd) break;
                }
            } catch (error) {
                index = MFA_TEXTURE_RECIPES.length;   // 텍스처 없이도 기존 그라디언트만으로 그린다.
                job = null;
            }
            if (index < MFA_TEXTURE_RECIPES.length) idle(step);
            else Promise.all(pending).then(() => resolveAll(MFA_TEXTURES));
        };
        idle(step);
    });
})();

// 패턴 정의 — LZ_DEFS에 합쳐져 SVG마다 범위가 입혀진다. href는 준비된 텍스처로 채우고,
// 아직이면 비워 두었다가 mfaHydrateTextures가 채운다.
// 타일 크기는 viewBox 단위(대부분 2000폭 패널이 화면에서 0.5~0.7배)로 잡아 결 간격이 실제 크기에 맞게 보이도록 했다.
function mfaTextureDefs() {
    const image = (key, w, h) => '<image data-mfa-tex="' + key + '"' + (MFA_TEXTURES[key] ? ' href="' + MFA_TEXTURES[key] + '"' : '') +
        ' width="' + w + '" height="' + h + '" preserveAspectRatio="none"/>';
    const tile = (id, key, w, h, transform) =>
        '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + w + '" height="' + h + '"' +
        (transform ? ' patternTransform="' + transform + '"' : '') + '>' + image(key, w, h) + '</pattern>';
    // 스핀 가공은 원마다 중심이 달라 객체 경계 단위로 늘려 붙인다.
    const fit = (id, key) => '<pattern id="' + id + '" patternContentUnits="objectBoundingBox" width="1" height="1">' + image(key, 1, 1) + '</pattern>';
    return tile("lzTexBrushH", "brushH", 1024, 128) +
        tile("lzTexBrushFine", "brushH", 512, 64) +
        tile("lzTexBrushV", "brushV", 128, 512) +
        tile("lzTexGrain", "grain", 192, 192) +
        tile("lzTexGrainFine", "grain", 96, 96) +
        tile("lzTexWood", "wood", 1024, 512) +
        tile("lzTexWoodV", "wood", 1024, 512, "rotate(90)") +
        tile("lzTexLeather", "leather", 128, 128) +
        tile("lzTexHammer", "hammer", 288, 288) +
        fit("lzTexSpun", "spun");
}

// 스킨에서 재질 오버레이를 얹는 헬퍼. 바탕 도형 위에 같은 윤곽으로 한 겹 더 그린다.
// kind: brush | brushFine | brushV | grain | grainFine | wood | woodV | leather | hammer | spun
const MFA_TEX_IDS = {
    brush: "lzTexBrushH", brushFine: "lzTexBrushFine", brushV: "lzTexBrushV",
    grain: "lzTexGrain", grainFine: "lzTexGrainFine", wood: "lzTexWood", woodV: "lzTexWoodV",
    leather: "lzTexLeather", hammer: "lzTexHammer", spun: "lzTexSpun"
};

function mfaTexFill(kind) {
    return "url(#" + (MFA_TEX_IDS[kind] || MFA_TEX_IDS.grain) + ")";
}

function mfaTexRect(kind, x, y, w, h, rx, opacity, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') +
        ' fill="' + mfaTexFill(kind) + '" opacity="' + (opacity == null ? .6 : opacity) + '" pointer-events="none"' + (extra ? ' ' + extra : '') + '/>';
}

function mfaTexCircle(kind, cx, cy, r, opacity, extra) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + mfaTexFill(kind) + '" opacity="' + (opacity == null ? .6 : opacity) + '" pointer-events="none"' + (extra ? ' ' + extra : '') + '/>';
}

function mfaTexPath(kind, d, opacity, extra) {
    return '<path d="' + d + '" fill="' + mfaTexFill(kind) + '" opacity="' + (opacity == null ? .6 : opacity) + '" pointer-events="none"' + (extra ? ' ' + extra : '') + '/>';
}

// ----- 모델별 표면 재질 규칙 -----
// 각 스킨의 면을 채우는 그라디언트·패턴 id를 키로, 마운트할 때 실제 재질을 입힌다.
//   replace: 기존의 규칙적인 벡터 헤어라인 패턴(…Brush/…Fine/…Grain)을 래스터 재질로 바꾼다.
//   overlay: 바탕 도형 바로 위에 같은 윤곽의 재질 층을 한 겹 더한다 (바탕색·그라디언트는 그대로).
// 스킨 마크업을 건드리지 않고 재질만 한곳에서 조율하기 위한 표다. 상호작용 요소(버튼·스위치)는
// 눌림 이동과 상태 색 변화를 따라가지 못하므로 대상에서 뺀다.
// [fill 참조, 방식, 재질, 불투명도]
const MFA_SURFACE_RULES = [
    // 튜너 — YAMAHA T-2 샴페인 브러시드 / McIntosh MR78 블랙 글라스 / Marantz 10B 샴페인 + 월넛
    ["url(#tnBrush)", "replace", "brush", .42],
    ["url(#tnKnobFace)", "overlay", "spun", .55],
    // MR78 전면은 블랙 글라스다 — 결 대신 거의 보이지 않는 미세 입자만 남겨 유리의 매끈함을 살린다.
    ["url(#mrFine)", "replace", "grainFine", .05],
    ["url(#mrKnob)", "overlay", "spun", .5],
    ["url(#mrChrome)", "overlay", "spun", .5],
    ["url(#mzWoodGrain)", "replace", "wood", .78],
    ["url(#mzBrush)", "replace", "brushFine", .17],
    ["url(#mzKnob)", "overlay", "spun", .5],
    // 이퀄라이저 — 블랙 헤어라인 두 종과 Technics 실버
    ["url(#eqBrush)", "replace", "brushFine", .3],
    ["url(#eqField)", "overlay", "grainFine", .22],
    ["url(#eq8Brush)", "replace", "brush", .44],
    ["url(#eq8Field)", "overlay", "grainFine", .2],
    // 앰프 — MC2105 노브, 8B 크림 패널·크링클 트랜스, 91E, E-303 샴페인, MA2375 스틸
    ["url(#refMcknob)", "overlay", "spun", .45],
    ["url(#refMcrim)", "overlay", "brushV", .28],
    ["url(#m8Brush)", "replace", "brushFine", .18],
    ["url(#m8Fine)", "replace", "grainFine", .14],
    ["url(#m8Can)", "overlay", "hammer", .32],
    ["url(#m8Plaque)", "overlay", "brushFine", .36],
    ["url(#weBrush)", "replace", "brushFine", .15],
    ["url(#weFine)", "replace", "grainFine", .14],
    ["url(#weKnob)", "overlay", "spun", .3],
    ["url(#e303Hair)", "replace", "brushFine", .2],
    ["url(#e303KnobFace)", "overlay", "spun", .55],
    ["url(#e303MeterFace)", "overlay", "grainFine", .16],
    ["url(#ma2375Backdrop)", "overlay", "grain", .22],
    ["url(#ma2375Brush)", "replace", "brush", .5],
    ["url(#ma2375LowerFace)", "overlay", "brush", .32],
    ["url(#ma2375SteelBand)", "overlay", "brushV", .38],
    ["url(#ma2375KnobCap)", "overlay", "spun", .5],
    // 카세트 데크 — DRAGON 블랙, B215 실버, Tandberg 로즈우드·블랙, CT-F1250 실버·월넛, W-990RX
    ["url(#dkFine)", "replace", "brushFine", .26],
    ["url(#dkDoor)", "overlay", "grainFine", .22],
    ["url(#dkKey)", "overlay", "brushFine", .22],
    ["url(#refBbrush)", "replace", "brush", .34],
    ["url(#refBsilver)", "overlay", "brushFine", .26],
    ["url(#refBblack)", "overlay", "grain", .26],
    ["url(#refTbrush)", "replace", "brushFine", .26],
    ["url(#refTknob)", "overlay", "spun", .5],
    ["url(#ctfWood)", "overlay", "wood", .72],
    ["url(#ctfFace)", "overlay", "brush", .4],
    ["url(#ctfKnob)", "overlay", "spun", .5],
    ["url(#w9Brush)", "replace", "brush", .4],
    ["url(#w9Apron)", "overlay", "grainFine", .24],
    // 오디오 타이머 DT-540 (블랙·실버 공용)
    ["url(#dtBrush)", "replace", "brush", .4]
];

const MFA_SURFACE_STRIP = ["id", "class", "style", "filter", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray",
    "tabindex", "role", "aria-label", "aria-hidden", "data-cx", "data-cy", "clip-path", "mask"];

function mfaApplySurfaces(svg) {
    if (!svg || svg.getAttribute("data-mfa-surfaces") === "1") return;
    svg.setAttribute("data-mfa-surfaces", "1");
    MFA_SURFACE_RULES.forEach(([fill, mode, kind, opacity]) => {
        svg.querySelectorAll('[fill="' + fill + '"]').forEach((el) => {
            if (el.closest("defs, pattern, clipPath, mask, symbol")) return;
            const base = el.hasAttribute("opacity") ? Number(el.getAttribute("opacity")) : 1;
            if (mode === "replace") {
                el.setAttribute("fill", mfaTexFill(kind));
                el.setAttribute("opacity", String(+(opacity * (base > 0 ? Math.min(1, base * 1.4) : 1)).toFixed(3)));
                return;
            }
            const layer = el.cloneNode(false);
            MFA_SURFACE_STRIP.forEach((name) => layer.removeAttribute(name));
            Array.from(layer.attributes).forEach((attr) => { if (/^on|^aria-|^data-/.test(attr.name)) layer.removeAttribute(attr.name); });
            layer.setAttribute("class", "mfaSurface");
            layer.setAttribute("fill", mfaTexFill(kind));
            layer.setAttribute("opacity", String(+(opacity * base).toFixed(3)));
            layer.setAttribute("pointer-events", "none");
            el.parentNode.insertBefore(layer, el.nextSibling);
        });
    });
}
