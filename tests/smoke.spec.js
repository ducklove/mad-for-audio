// FM 라디오 스모크 테스트
// 재생은 모의 HLS(MP3/TS)로 검증한다 — 실제 방송 스트림 연결은 환경(지역·정책)에
// 좌우되므로 테스트하지 않는다. 파이프라인(선국→URL 해석→hls.js→<audio>)이 대상이다.
const { test, expect } = require("@playwright/test");
const { mockExternal, collectErrors } = require("./fixtures");

test.describe("데스크톱", () => {
    test.use({ viewport: { width: 1440, height: 2200 } });

    let errors;
    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        errors = collectErrors(page);
        await page.goto("/");
        await page.waitForFunction(() => typeof window.Hls !== "undefined");
        await page.waitForFunction(() => Array.isArray(window.MFA_RECORDS));
    });

    test.afterEach(() => {
        expect(errors, "콘솔 오류·페이지 예외 없음").toEqual([]);
    });

    test("초기 렌더링: 기본 랙 4기기·숨김 EQ·가로 오버플로 없음", async ({ page }) => {
        await expect(page).toHaveTitle(/Mad for Audio/);
        for (const id of ["tunerStage", "ampStage", "deckStage", "ttStage"]) {
            await expect(page.locator(`#${id} svg`)).toBeVisible();
        }
        await expect(page.locator("#eqStage svg")).toHaveCount(1);
        await expect(page.locator("#eqStage")).toBeHidden();
        const overflow = await page.evaluate(() =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });

    test("음반 카탈로그 JSON 로드·기본 형식 검증", async ({ page }) => {
        const catalog = await page.evaluate(() => ({
            count: window.MFA_RECORDS.length,
            valid: window.MFA_RECORDS.every((record) =>
                record.title && record.composer && record.performer && record.credit &&
                Array.isArray(record.tracks) && record.tracks.length > 0 &&
                record.tracks.every((track) => track.t && track.f)),
        }));
        expect(catalog.count).toBeGreaterThanOrEqual(58);
        expect(catalog.valid).toBe(true);
    });

    test("RF 스위치로 채널 목록 열기 → 전 채널 렌더링", async ({ page }) => {
        await page.click("#tsRfHit");
        await expect(page.locator("#stationMain")).not.toHaveClass(/collapsed/);
        const count = await page.locator(".station").count();
        const expected = await page.evaluate(() => window.FMRadio.stations.length);
        expect(count).toBe(expected);
    });

    test("선국 → 모의 스트림 실제 재생", async ({ page }) => {
        await page.click("#tsRfHit");
        await page.locator("#kbsList .station").first().click();
        await expect(page.locator("#nowStation")).toHaveText("KBS 1FM");
        await page.waitForFunction(() => {
            const a = document.getElementById("audioPlayer");
            return !a.paused && a.currentTime > 0.5;
        }, null, { timeout: 15000 });
    });

    test("빠른 채널 전환에도 예외 없이 생존", async ({ page }) => {
        await page.click("#tsRfHit");
        const cards = page.locator("#stationMain .station");
        const n = Math.min(await cards.count(), 6);
        for (let i = 0; i < n; i++) {
            await cards.nth(i).click();
            await page.waitForTimeout(120);
        }
        // KBS 채널로 복귀 → 재생 확인
        await cards.first().click();
        await page.waitForFunction(() => {
            const a = document.getElementById("audioPlayer");
            return !a.paused && a.currentTime > 0.5;
        }, null, { timeout: 15000 });
    });

    test("튜너 전원 스위치 = 정지/재생 토글", async ({ page }) => {
        await page.click("#tsRfHit");
        await page.locator("#kbsList .station").first().click();
        await page.waitForFunction(() => !document.getElementById("audioPlayer").paused, null, { timeout: 15000 });

        await page.click("#tsPowerHit");
        await page.waitForFunction(() => document.getElementById("audioPlayer").paused);

        await page.click("#tsPowerHit");
        await page.waitForFunction(() => !document.getElementById("audioPlayer").paused, null, { timeout: 15000 });
    });

    test("설정 모달: 열기 → ESC로 닫기", async ({ page }) => {
        await page.click('button:has-text("오디오 구성")');
        await expect(page.locator("#settingsOverlay")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.locator("#settingsOverlay")).toBeHidden();
    });

    test("추가 하이파이 16종: 피커 등록·기기군별 스킨 전환", async ({ page }) => {
        await page.click('button:has-text("오디오 구성")');
        await expect(page.locator("#skinPicker .skin-btn")).toHaveCount(9);
        await expect(page.locator("#ampPicker .skin-btn")).toHaveCount(10);
        await expect(page.locator("#deckPicker .skin-btn")).toHaveCount(6);
        await expect(page.locator("#ttPicker .skin-btn")).toHaveCount(6);
        await expect(page.locator("#eqPicker .skin-btn")).toHaveCount(5);

        await page.locator('#skinPicker .skin-btn', { hasText: "REVOX B760" }).click();
        await expect(page.locator('#tunerStage svg[aria-label*="REVOX B760"]')).toHaveCount(1);
        await page.locator('#ampPicker .skin-btn', { hasText: "CLASS A · L-550" }).click();
        await expect(page.locator('#ampStage svg[aria-label*="LUXMAN L-550"]')).toHaveCount(1);
        await page.locator('#deckPicker .skin-btn', { hasText: "REVOX B215" }).click();
        await expect(page.locator('#deckStage svg[aria-label*="REVOX B215"]')).toHaveCount(1);
        await page.locator('#ttPicker .skin-btn', { hasText: "TECHNICS SL-1200MK2" }).click();
        await expect(page.locator('#ttStage svg[aria-label*="TECHNICS SL-1200MK2"]')).toHaveCount(1);
        await page.locator('#eqPicker .skin-btn', { hasText: "CHAMPAGNE · 10밴드" }).click();
        await expect(page.locator('#eqStage svg[aria-label*="GE-10C"]')).toHaveCount(1);
        await expect(page.locator('[id^="eqBandLvl"]')).toHaveCount(80);

        const saved = await page.evaluate(() => ({
            tuner: JSON.parse(localStorage.getItem("fmRadio.skin")),
            amp: JSON.parse(localStorage.getItem("fmRadio.amp")),
            deck: JSON.parse(localStorage.getItem("fmRadio.deck")),
            turntable: JSON.parse(localStorage.getItem("fmRadio.turntable")),
        }));
        expect(saved).toEqual({ tuner: "b760", amp: "l550", deck: "b215", turntable: "sl1200" });
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem("fmRadio.eq")).model)).toBe("ge10chrome");
    });

    test("설명서에 신규 기기별 소개와 음색·동작 차이가 기록됨", async ({ page }) => {
        await page.goto("/manual.html");
        for (const name of ["TX-9500 II", "T-110", "T-100", "B760", "SA-9900", "AU-111", "L-550", "E-303", "B215", "TCD 3014A", "TC-KA7ES", "CT-F1250", "SL-1200MK2", "TD 124", "GARRARD", "Sondek LP12", "GE-10S / GE-10C"]) {
            await expect(page.locator("body")).toContainText(name);
        }
    });

    test("진공관 DSP: 싱글엔디드 배음·푸시풀 대칭·새그·댐핑이 모델별로 다름", async ({ page }) => {
        const dsp = await page.evaluate(() => {
            const api = window.MFA_AmpDSP;
            const harmonics = (id, fullChain = false) => {
                const size = 1024;
                const wave = Array.from({ length: size }, (_, i) =>
                    fullChain
                        ? api.sampleChain(id, .98 * Math.sin(2 * Math.PI * i / size))
                        : api.sample(id, "power", .98 * Math.sin(2 * Math.PI * i / size)));
                const magnitude = (harmonic) => {
                    let re = 0;
                    let im = 0;
                    for (let i = 0; i < size; i++) {
                        const phase = 2 * Math.PI * harmonic * i / size;
                        re += wave[i] * Math.cos(phase);
                        im -= wave[i] * Math.sin(phase);
                    }
                    return Math.hypot(re, im);
                };
                const fundamental = magnitude(1);
                const h2 = magnitude(2) / fundamental;
                const h3 = magnitude(3) / fundamental;
                const h5 = magnitude(5) / fundamental;
                return { h2, h3, h5, thd: Math.hypot(h2, h3, h5) };
            };
            const p300 = api.sample("300b", "power", .5);
            const n300 = api.sample("300b", "power", -.5);
            const pkt = api.sample("kt88", "power", .5);
            const nkt = api.sample("kt88", "power", -.5);
            return {
                asym300b: Math.abs(p300 + n300),
                asymKt88: Math.abs(pkt + nkt),
                softSlopeHigh: api.sample("300b", "power", .95) - api.sample("300b", "power", .85),
                softSlopeLow: api.sample("300b", "power", .25) - api.sample("300b", "power", .15),
                softSlopeNegativeHigh: api.sample("300b", "power", -.85) - api.sample("300b", "power", -.95),
                softSlopeNegativeLow: api.sample("300b", "power", -.15) - api.sample("300b", "power", -.25),
                centerSlope: api.sample("300b", "power", .4) - api.sample("300b", "power", .3),
                p300: api.inspect("300b"),
                el34: api.inspect("el34"),
                kt88: api.inspect("kt88"),
                au111: api.inspect("au111"),
                h300b: harmonics("300b"),
                hEl34: harmonics("el34"),
                hKt88: harmonics("kt88"),
                hAu111: harmonics("au111"),
                chain300b: harmonics("300b", true),
                chainEl34: harmonics("el34", true),
                chainKt88: harmonics("kt88", true),
                chainAu111: harmonics("au111", true),
            };
        });
        expect(dsp.asym300b).toBeGreaterThan(0.015);
        expect(dsp.asymKt88).toBeLessThan(0.01);
        expect(dsp.h300b.h2).toBeGreaterThan(dsp.h300b.h3);
        expect(dsp.hKt88.h3).toBeGreaterThan(dsp.hKt88.h2 * 5);
        expect(dsp.hEl34.h3).toBeGreaterThan(dsp.hEl34.h2);
        expect(dsp.hAu111.h3).toBeGreaterThan(dsp.hAu111.h2);
        expect(dsp.hKt88.thd).toBeLessThan(dsp.hEl34.thd);
        expect(dsp.hKt88.thd).toBeLessThan(.02);
        expect(dsp.chain300b.thd).toBeLessThan(.035);
        expect(dsp.chainEl34.thd).toBeLessThan(.015);
        expect(dsp.chainKt88.thd).toBeLessThan(.01);
        expect(dsp.chainAu111.thd).toBeLessThan(.02);
        expect(dsp.centerSlope).toBeGreaterThan(.09);
        expect(dsp.centerSlope).toBeLessThan(.11);
        expect(dsp.softSlopeHigh).toBeLessThan(dsp.softSlopeLow);
        expect(dsp.softSlopeNegativeHigh).toBeLessThan(dsp.softSlopeNegativeLow);
        expect(dsp.p300.dampingFactor).toBeLessThan(dsp.el34.dampingFactor);
        expect(dsp.el34.dampingFactor).toBeLessThan(dsp.kt88.dampingFactor);
        expect(dsp.au111.sagRatio).toBeGreaterThan(dsp.el34.sagRatio);
        expect(dsp.p300.sagRatio).toBeLessThan(dsp.kt88.sagRatio);
        expect(dsp.p300.transformerBand[1]).toBeLessThan(dsp.kt88.transformerBand[1]);
    });

    test("재생 중 진공관 4종 전환: Web Audio 회로 재설정 후에도 재생 유지", async ({ page }) => {
        await page.click("#tsRfHit");
        await page.locator("#kbsList .station").first().click();
        await page.waitForFunction(() => {
            const audio = document.getElementById("audioPlayer");
            return !audio.paused && audio.currentTime > 0.5;
        }, null, { timeout: 15000 });

        await page.click('button:has-text("오디오 구성")');
        for (const label of ["EL34 · 8B", "300B · 91E", "KT88 · 275", "6L6GC · AU-111"]) {
            await page.locator("#ampPicker .skin-btn", { hasText: label }).click();
            await page.waitForTimeout(100);
            await expect(page.locator("#audioPlayer")).toHaveJSProperty("paused", false);
        }
    });
});

test.describe("모바일 390px", () => {
    test.use({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
    });

    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForFunction(() => typeof window.Hls !== "undefined");
        await page.waitForFunction(() => Array.isArray(window.MFA_RECORDS));
    });

    test("가로 오버플로 없음 + 선국·재생", async ({ page }) => {
        const overflow = await page.evaluate(() =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);

        await page.click("#tsRfHit");
        await page.locator("#kbsList .station").first().click();
        await page.waitForFunction(() => {
            const a = document.getElementById("audioPlayer");
            return !a.paused && a.currentTime > 0.5;
        }, null, { timeout: 15000 });
    });
});

test.describe("초소형 320px", () => {
    test.use({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });

    test("가로 오버플로 없음", async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForTimeout(800);
        const overflow = await page.evaluate(() =>
            document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
    });
});

test.describe("iOS 폴백 (MSE 없음 + 네이티브 HLS)", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test("audio.src에 m3u8 직접 할당", async ({ context, page }) => {
        await context.addInitScript(() => {
            delete window.MediaSource;
            const orig = HTMLMediaElement.prototype.canPlayType;
            HTMLMediaElement.prototype.canPlayType = function (t) {
                if (t && t.includes("mpegurl")) return "maybe";
                return orig.call(this, t);
            };
        });
        await mockExternal(context);
        await page.goto("/");
        await page.waitForTimeout(800);
        await page.click("#tsRfHit");
        await page.locator("#kbsList .station").first().click();
        await page.waitForFunction(() =>
            document.getElementById("audioPlayer").src.includes("playlist.m3u8"));
    });
});

test.describe("키보드 조작", () => {
    test.use({ viewport: { width: 1440, height: 1200 } });

    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForFunction(() => typeof window.Hls !== "undefined");
        await page.waitForFunction(() => Array.isArray(window.MFA_RECORDS));
    });

    test("튜너 RF 스위치: 포커스 + Enter로 채널 목록 토글", async ({ page }) => {
        await page.evaluate(() => document.getElementById("tsRfHit").focus());
        await page.keyboard.press("Enter");
        await expect(page.locator("#stationMain")).not.toHaveClass(/collapsed/);
        await page.keyboard.press("Enter");
        await expect(page.locator("#stationMain")).toHaveClass(/collapsed/);
    });

    test("튜닝 노브: 화살표 키로 선국", async ({ page }) => {
        await page.evaluate(() => document.getElementById("tsKnobHit").focus());
        await page.keyboard.press("ArrowRight");
        await expect(page.locator("#nowStation")).not.toHaveText("방송을 선택하세요");
    });

    test("EQ 슬라이더: 화살표 키로 게인 조절 + 저장", async ({ page }) => {
        await page.click('button:has-text("오디오 구성")');
        await page.click('button:has-text("GE-10 · 10밴드")');
        await page.keyboard.press("Escape");
        await page.evaluate(() => document.getElementById("eqHit0").focus());
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowUp");
        const gain = await page.evaluate(() => JSON.parse(localStorage.getItem("fmRadio.eq")).gains.ge10[0]);
        expect(gain).toBe(2);
        const valueNow = await page.getAttribute("#eqHit0", "aria-valuenow");
        expect(valueNow).toBe("2");
    });
});

test.describe("모바일 컨트롤 바", () => {
    test.use({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
    });

    test("이전/다음 채널 버튼으로 선국", async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForFunction(() => typeof window.Hls !== "undefined");

        await expect(page.locator(".player-bar")).toBeVisible();
        await page.locator('button[aria-label="다음 채널"]').click();
        await expect(page.locator("#nowStation")).toHaveText("KBS 1FM");
        await page.waitForFunction(() => {
            const a = document.getElementById("audioPlayer");
            return !a.paused && a.currentTime > 0.5;
        }, null, { timeout: 15000 });
    });
});

test.describe("채널 검색", () => {
    test.use({ viewport: { width: 1440, height: 1600 } });

    test("검색어로 카드·그룹 필터링", async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForFunction(() => typeof window.Hls !== "undefined");
        await page.click("#tsRfHit");

        // offsetParent 기준 = 실제 렌더링 가시성 (hidden 속성이 CSS에 지는 회귀를 잡는다)
        await page.fill("#stationSearch", "클래식");
        const visible = await page.evaluate(() =>
            [...document.querySelectorAll("#groupsMount .station")].filter((el) => el.offsetParent !== null).length);
        expect(visible).toBe(1);
        const visibleGroups = await page.evaluate(() =>
            [...document.querySelectorAll("#groupsMount .group")].filter((el) => el.offsetParent !== null).length);
        expect(visibleGroups).toBe(1);

        await page.fill("#stationSearch", "");
        const restored = await page.evaluate(() =>
            [...document.querySelectorAll("#groupsMount .station")].filter((el) => el.offsetParent !== null).length);
        const total = await page.evaluate(() => window.FMRadio.stations.length);
        expect(restored).toBe(total);
    });
});

test.describe("미니 플레이어 (widget.html)", () => {
    test("PlayerCore로 선국·재생", async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/widget.html?station=kbs1fm");
        await page.waitForFunction(() => typeof window.Hls !== "undefined" && typeof window.PlayerCore !== "undefined");
        await page.click("#btnPlay");
        await page.waitForFunction(() => {
            const a = document.getElementById("audioPlayer");
            return !a.paused && a.currentTime > 0.5;
        }, null, { timeout: 15000 });
    });
});

test.describe("접근성", () => {
    test("axe-core: 심각/치명 위반 없음", async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/");
        await page.waitForTimeout(800);
        await page.evaluate(() => document.getElementById("stationMain").classList.remove("collapsed"));
        await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const violations = await page.evaluate(async () => {
            const res = await axe.run(document, { resultTypes: ["violations"] });
            return res.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                count: v.nodes.length,
                targets: v.nodes.map((node) => node.target.join(" ")),
            }));
        });
        const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious, JSON.stringify(violations)).toEqual([]);
    });
});
