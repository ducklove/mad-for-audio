const { test, expect } = require("@playwright/test");
const { mockExternal, collectErrors } = require("./fixtures");

test.describe("기기 디자인 회귀", () => {
    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        await page.goto("/index.html");
        await page.evaluate(() => window.MFA_READY);
    });

    test("10B 다이얼은 CRT와 분리되고 실제 선국 좌표와 일치한다", async ({ page }) => {
        await page.evaluate(() => initTunerSkin("m10b"));
        const geometry = await page.evaluate(() => {
            const hit = document.getElementById("tsDialHit").getBBox();
            const labels = [...document.querySelectorAll('#tunerStage g.dialScale text')].map(el => el.getBBox());
            const svgBox = tunerSvgEl.getBoundingClientRect();
            return {
                hitX: hit.x,
                labels: labels.map(b => ({ left: b.x, right: b.x + b.width })),
                positions: [88, 98, 108].map(f => tsFreqToX(f)),
                roundtrip: [88, 93.1, 108].map(f => clientXToFreq(svgBox.left + tsFreqToX(f) / 2000 * svgBox.width))
            };
        });
        expect(geometry.hitX).toBeGreaterThan(768);
        for (const label of geometry.labels) {
            expect(label.left).toBeGreaterThan(768);
            expect(label.right).toBeLessThan(1610);
        }
        expect(geometry.positions).toEqual([820, 1200, 1580]);
        geometry.roundtrip.forEach((f, i) => expect(f).toBeCloseTo([88, 93.1, 108][i]));
        await page.locator("#tsDialHit").focus();
        await page.keyboard.press("ArrowRight");
        await expect(page.locator("#tsDialHit")).toHaveAttribute("aria-valuenow", /\d/);
    });

    test("단독 기기 명판은 밝고 어두운 라벨과 긴 제목을 수납한다", async ({ page }) => {
        const errors = collectErrors(page);
        for (const bg of ["#f6eed2", "#241411"]) {
            const result = await page.evaluate((color) => {
                setSoloModel("victorv");
                RECORD = { ...RECORD, labelBg: color, labelBig: "매우 긴 앨범 제목 ".repeat(10), jTitle: "교향곡 전집 ".repeat(20), performer: "오케스트라 ".repeat(20) };
                gvPaintRecord();
                const el = document.getElementById("gvSleeveBig");
                return { width: el.getComputedTextLength(), ink: el.getAttribute("fill"), name: el.getAttribute("aria-label"), text: el.firstChild.textContent };
            }, bg);
            expect(result.width).toBeLessThanOrEqual(168.1);
            expect(result.ink).toBe(bg === "#f6eed2" ? "#3a2b1e" : "#f0e8d0");
            expect(result.name.length).toBeGreaterThan(result.text.length);
            expect(result.text).toContain("…");
        }
        await page.evaluate(() => { setSoloModel("trc931"); bbSyncTape(); });
        expect(await page.locator("#bbTapeTitle").evaluate(el => el.getComputedTextLength())).toBeLessThanOrEqual(278.1);
        expect(errors).toEqual([]);
    });

    test("턴테이블 재킷 로드 실패와 성공을 모두 표시한다", async ({ page, context }) => {
        await page.evaluate(() => mountTurntable());
        await expect(page.locator("#ttCoverImage")).toHaveAttribute("opacity", "0");
        // 로드 성공은 외부 서비스 상태 대신 작은 로컬 SVG 응답으로 재현한다.
        await context.route("https://upload.wikimedia.org/**", route => route.fulfill({
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="508" height="396"><rect width="508" height="396" fill="#456"/></svg>'
        }));
        await page.evaluate(() => mountTurntable());
        await expect(page.locator("#ttCoverImage")).toHaveAttribute("opacity", "1");
    });
});
