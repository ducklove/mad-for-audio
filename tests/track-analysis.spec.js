const {test, expect} = require("@playwright/test");
const {mockExternal} = require("./fixtures");

test.describe("예약 녹음 곡 분리", () => {
    // WebKit의 서비스워커 내부 fetch는 Playwright route를 우회한다. 이 테스트는 PC API 계약 대상이다.
    test.use({serviceWorkers: "block"});
    test.beforeEach(async ({context, page}) => {
        await mockExternal(context);
        await page.goto("/");
        await page.evaluate(() => window.MFA_READY);
    });

    async function show(page) {
        await page.evaluate(() => { openSchedule(); schedSetView("res"); document.getElementById("trackAnalysisPanel").open = true; });
    }

    test("PC 연결 링크를 한 번 교환하고 배포 환경 설정을 유지", async ({page, context}) => {
        const ticket = "t".repeat(43), token = "p".repeat(43);
        let pairs = 0;
        await context.route("http://127.0.0.1:8766/**", async route => {
            const req = route.request(), path = new URL(req.url()).pathname;
            const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"};
            if (req.method() === "OPTIONS") return route.fulfill({status: 204, headers});
            if (path === "/pair") {
                expect(req.headers().authorization).toBe("Bearer " + ticket);
                pairs++;
                return route.fulfill({headers, json: {token}});
            }
            expect(req.headers().authorization).toBe("Bearer " + token);
            return route.fulfill({headers, json: path === "/health" ?
                {localConfigured: true, geminiConfigured: true, geminiProvider: "openrouter"} : []});
        });
        await page.goto("/index.html#pc-analysis-pair=" + ticket);
        await expect(page.locator("[data-analysis-status]")).toContainText("OpenRouter · Gemini 보완 사용 가능");
        await expect(page.locator("[data-analysis-status]")).toBeVisible();
        expect(page.url()).not.toContain(ticket);
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem("fmRadio.trackAnalysis")).token)).toBe(token);
        await page.reload();
        await show(page);
        await expect(page.locator("[data-analysis-status]")).toContainText("PC 분석 서비스 연결됨");
        expect(pairs).toBe(1);
    });

    test("예약별 선택 저장과 기존 예약 기본값 유지", async ({page}) => {
        await show(page);
        const add = async title => page.evaluate(title => {
            const day = new Date(Date.now() + 86400000);
            return addReservation({stationId: "kbs1fm", title, startMin: 1200, endMin: 1260,
                repeat: "once", ymd: FMSchedule.ymdOf(day)});
        }, title);
        expect((await add("기존 방식")).trackAnalysis).toBeNull();
        await page.locator("[data-analysis-enabled]").check();
        await page.locator("[data-analysis-cloud]").uncheck();
        expect((await add("곡 분리 예약")).trackAnalysis).toEqual({enabled: true, cloudFallback: false, maxCloudSeconds: 600});
        await expect(page.getByRole("button", {name: "곡 분리 켬", exact: true})).toHaveCount(1);
        await page.reload();
        await page.evaluate(() => window.MFA_READY);
        await show(page);
        await expect(page.getByRole("button", {name: "곡 분리 켬", exact: true})).toHaveCount(1);
        await page.getByRole("button", {name: "곡 분리 켬", exact: true}).click();
        await expect(page.getByRole("button", {name: "곡 분리 끔", exact: true})).toHaveCount(2);
    });

    test("녹음 종료 뒤 원본 보존·옵션 고정·한 번 전송·재실행 복구", async ({page, context, browserName}) => {
        const uploads = [];
        const found = new Set();
        await context.route("http://127.0.0.1:8766/**", async route => {
            const req = route.request(), path = new URL(req.url()).pathname;
            const headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"};
            if (req.method() === "OPTIONS") return route.fulfill({status: 204, headers});
            if (path === "/health") return route.fulfill({headers, json: {localConfigured: true, geminiConfigured: false}});
            if (path === "/jobs") return route.fulfill({headers, json: []});
            if (req.method() === "GET") return route.fulfill({headers, status: found.has(path) ? 200 : 404,
                json: found.has(path) ? {status: "done"} : {detail: "작업 없음"}});
            if (req.method() === "PUT") {
                // WebKit 프로토콜은 Blob 본문을 노출하지 않는다. 아래 IndexedDB 원본 크기도 검증한다.
                uploads.push({meta: JSON.parse(decodeURIComponent(req.headers()["x-mfa-meta"])), size: req.postDataBuffer()?.length});
                found.add(path);
                return route.fulfill({headers, json: {status: "queued"}});
            }
            return route.fulfill({status: 404, headers});
        });
        await page.evaluate(() => {
            localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test-local-token", enabled: true, cloudFallback: false}));
        });
        await page.reload(); await page.evaluate(() => window.MFA_READY);
        await page.evaluate(() => {
            fireReservation({id: 98331, stationId: "kbs1fm", title: "곡 분리 실녹음", enabled: true,
                trackAnalysis: {enabled: true, cloudFallback: false, maxCloudSeconds: 120}},
            {ymd: "test", startTs: Date.now(), endTs: Date.now() + 45000}, "98331:test");
        });
        await page.waitForFunction(() => !!recorder && deckMode === "rec", null, {timeout: 22000, polling: 150});
        await page.waitForTimeout(5000);
        await page.evaluate(() => {
            // 녹음 시작 뒤 설정이 바뀌어도 그 녹음에 적용할 설정은 보존된다.
            activeResRec.res.trackAnalysis = null;
            finishReservedRecording();
        });
        await expect.poll(() => uploads.length, {timeout: 18000}).toBe(1);
        expect(uploads[0].meta.options.cloudFallback).toBe(false);
        expect(uploads[0].meta.options.maxCloudSeconds).toBe(120);
        if (browserName === "chromium") expect(uploads[0].size).toBeGreaterThan(20000);
        const saved = await page.evaluate(() => new Promise(resolve => {
            const req = recDb.transaction("recordings").objectStore("recordings").getAll();
            req.onsuccess = () => resolve(req.result.filter(r => r.analysisId).map(r => ({id: r.analysisId, bytes: r.blob?.size || r.blobBuf?.byteLength})));
        }));
        expect(saved).toHaveLength(1);
        expect(saved[0].bytes).toBeGreaterThan(20000);
        await page.reload(); await page.evaluate(() => window.MFA_READY);
        await page.waitForTimeout(1500);
        expect(uploads).toHaveLength(1);
    });

    test("확인 필요 곡의 메타데이터 표시와 수정", async ({page, context}) => {
        let update;
        const job = {id: "c57c221c-8fbc-4da5-8523-52fb326ac2d9", name: "검증 방송", message: "1곡 저장 · 확인 필요",
            status: "review", tracks: [{id: 1, title: "", composer: "모차르트", performer: "", start: 10, end: 70,
                review: true, source: "gemini-review", evidence: "모차르트의 곡입니다"}]};
        await context.route("http://127.0.0.1:8766/**", async route => {
            if (route.request().method() === "POST") {
                update = route.request().postDataJSON();
                return route.fulfill({json: job});
            }
            return route.fulfill({json: route.request().url().endsWith("/health") ? {localConfigured: true} : [job]});
        });
        await page.evaluate(() => localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test"})));
        await page.reload(); await page.evaluate(() => window.MFA_READY); await show(page);
        await page.locator(".analysis-job > summary").click();
        await page.locator(".analysis-track > summary").click();
        await expect(page.locator(".analysis-track > summary")).toContainText("연주자 미확인");
        await page.locator('.analysis-edit input[name="title"]').fill("피아노 소나타");
        await page.locator('.analysis-edit input[name="performer"]').fill("김연주");
        await page.getByRole("button", {name: "수정·확인 후 저장"}).click();
        await expect.poll(() => update?.title).toBe("피아노 소나타");
        expect(update.performer).toBe("김연주");
    });
});
