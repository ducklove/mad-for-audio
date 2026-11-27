// 재질 텍스처 라이브러리 — 브러시드·스핀 가공 금속, 목재 결, 도장 그레인, 레더렛, 주물 표면.
// 클래식 스크립트 — skins.js보다 먼저 로드한다. 로드 순서: store→materials→skins→...
//
// 왜 SVG 필터(feTurbulence)가 아니라 래스터 패턴인가:
// 이 앱의 주 사용 환경은 Safari/WKWebView다. WebKit은 바늘·릴이 움직일 때마다 필터 영역을
// 다시 계산하므로 큰 패널에 노이즈 필터를 걸면 모바일에서 프레임이 무너진다. 대신 시작할 때
// 한 번만 캔버스로 이음매 없는 타일을 만들고 blob URL로 <pattern>에 물린다. 타일링은
// 래스터라이저가 가장 싸게 처리하는 경로라 애니메이션 비용에 영향이 거의 없다.
//
// 모든 텍스처는 "중성 오버레이"다: 밝은 결은 흰색 알파, 어두운 결은 검은색 알파로 기록하므로
// 기존 그라디언트·색 위에 얹어도 바탕색을 바꾸지 않고 표면 질감만 더한다.
//
// 패턴 id는 lzTex* 접두를 쓴다. applyPanelLighting이 LZ_DEFS와 함께 SVG마다 범위를 입혀
// (mfa-lz-N-lzTex…) 컴포넌트 사이 id 충돌이 없다. 스킨 마크업은 url(#lzTexBrushH)처럼
// 범위 없는 이름으로 참조하면 마운트 시 자동으로 바뀐다.

const MFA_TEXTURES = (() => {
    const empty = {};
    if (typeof document === "undefined" || typeof Uint8ClampedArray === "undefined") return empty;

    // 결정적 난수 — 새로고침해도 같은 결이 나와야 스크린샷 비교가 흔들리지 않는다.
    function rng(seed) {
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
    function lattice(px, py, seed) {
        const r = rng(seed);
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
    function fbm(w, h, cellsX, cellsY, octaves, seed) {
        const layers = [];
        let amp = 1, total = 0;
        for (let o = 0; o < octaves; o++) {
            const cx = cellsX << o, cy = cellsY << o;
            layers.push({ n: lattice(cx, cy, seed + o * 101), sx: cx / w, sy: cy / h, amp });
            total += amp;
            amp *= .5;
        }
        return (x, y) => {
            let v = 0;
            for (const l of layers) v += l.n(x * l.sx, y * l.sy) * l.amp;
            return v / total;
        };
    }

    function toUrl(canvas) {
        try {
            const data = canvas.toDataURL("image/png");
            if (typeof Blob === "undefined" || typeof URL === "undefined" || !URL.createObjectURL || typeof atob !== "function") return data;
            const bin = atob(data.slice(data.indexOf(",") + 1));
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            // blob URL은 짧아서 SVG 문자열·DOM 속성에 반복해 실어도 메모리 부담이 없다.
            return URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
        } catch (error) {
            return "";
        }
    }

    // v ∈ [-1, 1] → 중성 오버레이 픽셀 (밝으면 흰 알파, 어두우면 검은 알파)
    function paint(w, h, sample, gain) {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext && canvas.getContext("2d");
        if (!ctx) return "";
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const v = Math.max(-1, Math.min(1, sample(x, y) * gain));
                const i = (y * w + x) * 4;
                const c = v >= 0 ? 255 : 0;
                d[i] = c; d[i + 1] = c; d[i + 2] = c;
                d[i + 3] = Math.round(Math.abs(v) * 255);
            }
        }
        ctx.putImageData(img, 0, 0);
        return toUrl(canvas);
    }

    const out = {};
    try {
        // 1. 헤어라인 브러시드 알루미늄 (가로 결) — 줄마다 밝기가 다르고, 드물게 긴 스크래치가 지난다.
        {
            const W = 1024, H = 256;
            const streak = fbm(W, H, 4, 256, 3, 11);
            const fine = fbm(W, H, 64, 256, 2, 23);
            const r = rng(37);
            const scratches = new Float32Array(H);
            for (let y = 0; y < H; y++) scratches[y] = r() < .07 ? (r() * 2 - 1) * .9 : 0;
            out.brushH = paint(W, H, (x, y) => streak(x, y) * .85 + fine(x, y) * .35 + scratches[y] * (.6 + .4 * Math.sin(x / W * Math.PI * 2 * 3 + y)), .9);
        }
        // 세로 결 — 가로 결과 통계는 같고 방향만 다르다 (EQ 슬라이더 판·세로 트림).
        {
            const W = 256, H = 1024;
            const streak = fbm(W, H, 256, 4, 3, 13);
            const fine = fbm(W, H, 256, 64, 2, 29);
            out.brushV = paint(W, H, (x, y) => streak(x, y) * .85 + fine(x, y) * .35, .9);
        }
        // 2. 미세 그레인 — 분체 도장·주물·무광 플라스틱의 표면. 고주파와 저주파 얼룩을 섞는다.
        {
            const W = 256, H = 256;
            const r = rng(53);
            const white = new Float32Array(W * H);
            for (let i = 0; i < white.length; i++) white[i] = r() * 2 - 1;
            const mottle = fbm(W, H, 4, 4, 3, 61);
            out.grain = paint(W, H, (x, y) => white[y * W + x] * .7 + mottle(x, y) * .45, .55);
        }
        // 3. 스핀 가공 (동심원 결 + 고정 광원의 원뿔 반사) — 노브 캡·플래터 림·스핀들 캡.
        {
            const S = 512, C = S / 2;
            const rings = fbm(4096, 64, 512, 4, 2, 71);
            const sheenAngle = -0.62;  // 좌상단 광원
            out.spun = paint(S, S, (x, y) => {
                const dx = x + .5 - C, dy = y + .5 - C;
                const rr = Math.sqrt(dx * dx + dy * dy);
                if (rr > C) return 0;
                const t = Math.atan2(dy, dx);
                const ring = rings(rr * 8, (t / (Math.PI * 2) + .5) * 64);
                // cos(2θ)는 선반 가공면 특유의 마주 보는 두 쐐기 하이라이트를 만든다.
                const cone = Math.cos(2 * (t - sheenAngle));
                const edge = Math.min(1, (C - rr) / 6);
                return (ring * .55 + cone * .62 * Math.min(1, rr / (C * .18))) * edge;
            }, .85);
        }
        // 4. 원목 결 — 길게 흐르는 결 다발이 완만하게 휘고, 늦은재 선은 가늘게, 섬유 줄무늬가 색 얼룩을 만든다.
        {
            const W = 1024, H = 512;
            const warp = fbm(W, H, 2, 4, 3, 83);
            const drift = fbm(W, H, 1, 2, 2, 85);
            const fiber = fbm(W, H, 8, 256, 3, 89);
            const streaks = fbm(W, H, 2, 32, 2, 91);
            const pores = rng(97);
            const poreMap = new Float32Array(W * H);
            for (let i = 0; i < poreMap.length; i++) poreMap[i] = pores() < .01 ? -1 : 0;
            const bands = 22;
            out.wood = paint(W, H, (x, y) => {
                const phase = (y / H + warp(x, y) * .07 + drift(x, y) * .05) * bands * Math.PI * 2;
                const s = Math.sin(phase);
                // 늦은재(어두운 결)는 가늘고 진하게, 그 옆 이른재는 살짝 밝게
                const late = Math.pow(Math.max(0, s), 6);
                const ring = -late * .95 + Math.max(0, -s) * .12;
                return ring * .75 + fiber(x, y) * .45 + streaks(x, y) * .4 + poreMap[y * W + x] * .25;
            }, .8);
        }
        // 5. 레더렛·톨렉스 — 작은 셀이 오목볼록하게 반복되는 엠보싱 표면.
        {
            const W = 256, H = 256;
            const cells = fbm(W, H, 48, 48, 1, 107);
            const fine = fbm(W, H, 128, 128, 1, 109);
            const broad = fbm(W, H, 4, 4, 2, 113);
            out.leather = paint(W, H, (x, y) => {
                const c = cells(x, y);
                const groove = Math.exp(-c * c * 90);
                return -groove * .55 + c * .25 + fine(x, y) * .2 + broad(x, y) * .25;
            }, .7);
        }
        // 6. 해머톤·주물 — 망치 자국처럼 오목한 반점과 가장자리 반사. 진공관 앰프 섀시·턴테이블 베이스.
        {
            const W = 384, H = 384;
            const blobs = fbm(W, H, 24, 24, 2, 131);
            const broad = fbm(W, H, 3, 3, 2, 137);
            out.hammer = paint(W, H, (x, y) => {
                const v = blobs(x, y);
                const rim = Math.exp(-v * v * 40);   // 반점 테두리의 밝은 반사
                return v * .55 + rim * .35 - .12 + broad(x, y) * .3;
            }, .7);
        }
    } catch (error) {
        return empty;
    }
    return out;
})();

// 패턴 정의 — LZ_DEFS에 합쳐져 SVG마다 범위가 입혀진다.
// 타일 크기는 viewBox 단위(대부분 2000폭 패널이 화면에서 0.5~0.7배)로 잡아 결 간격이 실제 크기에 맞게 보이도록 했다.
function mfaTextureDefs() {
    const t = MFA_TEXTURES;
    const tile = (id, url, w, h, transform) => url
        ? '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + w + '" height="' + h + '"' +
            (transform ? ' patternTransform="' + transform + '"' : '') +
            '><image href="' + url + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/></pattern>'
        : '<pattern id="' + id + '" width="1" height="1"></pattern>';
    // 스핀 가공은 원마다 중심이 달라 객체 경계 단위로 늘려 붙인다.
    const fit = (id, url) => url
        ? '<pattern id="' + id + '" patternContentUnits="objectBoundingBox" width="1" height="1"><image href="' + url + '" width="1" height="1" preserveAspectRatio="none"/></pattern>'
        : '<pattern id="' + id + '" width="1" height="1"></pattern>';
    return tile("lzTexBrushH", t.brushH, 1024, 128) +
        tile("lzTexBrushFine", t.brushH, 512, 64) +
        tile("lzTexBrushV", t.brushV, 128, 512) +
        tile("lzTexGrain", t.grain, 192, 192) +
        tile("lzTexGrainFine", t.grain, 96, 96) +
        tile("lzTexWood", t.wood, 1024, 512) +
        tile("lzTexWoodV", t.wood, 1024, 512, "rotate(90)") +
        tile("lzTexLeather", t.leather, 128, 128) +
        tile("lzTexHammer", t.hammer, 288, 288) +
        fit("lzTexSpun", t.spun);
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
