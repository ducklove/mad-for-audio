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
        await page.evaluate(() => window.MFA_READY);
        await page.evaluate(() => { openSchedule(); schedSetView("res"); document.getElementById("trackAnalysisPanel").open = true; });
    }

    async function addReservationForTest(page, title, trackAnalysis) {
        return page.evaluate(({title, trackAnalysis}) => {
            const day = new Date(Date.now() + 86400000);
            return addReservation({stationId: "kbs1fm", title, startMin: 1200, endMin: 1260,
                repeat: "once", ymd: FMSchedule.ymdOf(day), ...(trackAnalysis === undefined ? {} : {trackAnalysis})});
        }, {title, trackAnalysis});
    }

    test("미연결 기기는 곡 분리 메뉴·버튼·PC 접속 시도가 없음", async ({page, context}) => {
        let requests = 0;
        await context.route("http://127.0.0.1:8766/**", route => { requests++; return route.abort(); });
        await page.setViewportSize({width: 390, height: 844});
        await page.reload();
        await show(page);
        const reservation = await addReservationForTest(page, "일반 녹음");
        expect(reservation.trackAnalysis).toBeNull();
        await expect(page.locator("#trackAnalysisPanel")).toBeHidden();
        await expect(page.getByRole("button", {name: /^곡 분리/})).toHaveCount(0);
        await expect(page.getByRole("button", {name: "＋ 직접 입력 예약"})).toBeVisible();
        expect(requests).toBe(0);
    });

    test("서버 연결과 모델 준비에 따라 표시하고 기존 설정은 보존", async ({page, context}) => {
        let ready = true, offline = false;
        await context.route("http://127.0.0.1:8766/**", route => {
            if (offline) return route.abort();
            return route.fulfill({json: route.request().url().endsWith("/health") ? {localConfigured: ready} : []});
        });
        await page.evaluate(() => localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test", enabled: true})));
        await page.reload(); await show(page);
        await expect(page.locator("#trackAnalysisPanel")).toBeVisible();
        const original = await addReservationForTest(page, "분리 예약");
        expect(original.trackAnalysis.enabled).toBe(true);
        await expect(page.getByRole("button", {name: "곡 분리 켬", exact: true})).toBeVisible();
        ready = false;
        await page.getByRole("button", {name: "분석 결과 새로고침"}).click();
        await expect(page.locator("#trackAnalysisPanel")).toBeHidden();
        expect((await addReservationForTest(page, "모델 미설치 예약")).trackAnalysis).toBeNull();
        await expect(page.getByRole("button", {name: /^곡 분리/})).toHaveCount(0);
        offline = true;
        await page.reload(); await show(page);
        await expect(page.locator("#trackAnalysisPanel")).toBeHidden();
        expect((await addReservationForTest(page, "연결 끊김 예약")).trackAnalysis).toBeNull();
        expect(await page.evaluate(() => JSON.parse(localStorage.getItem("fmRadio.trackAnalysis")).enabled)).toBe(true);
        offline = false; ready = true;
        await page.reload(); await show(page);
        await expect(page.locator("#trackAnalysisPanel")).toBeVisible();
        await expect(page.getByRole("button", {name: "곡 분리 켬", exact: true})).toHaveCount(1);
        expect((await addReservationForTest(page, "재연결 예약")).trackAnalysis.enabled).toBe(true);
    });

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

    test("예약별 선택 저장과 기존 예약 기본값 유지", async ({page, context}) => {
        await context.route("http://127.0.0.1:8766/**", route => route.fulfill({json:
            route.request().url().endsWith("/health") ? {localConfigured: true} : []}));
        await page.evaluate(() => localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test"})));
        await page.reload();
        await show(page);
        await expect(page.locator("#trackAnalysisPanel")).toBeVisible();
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

    test("곡 정보만 재검토 요청과 파일 한도 안내", async ({page, context}) => {
        let metadataRequests = 0;
        const job = {id: "c57c221c-8fbc-4da5-8523-52fb326ac2d9", name: "검증 방송", message: "곡 정보 확인 필요",
            status: "review", metadataNotice: "음성 전송 잔여량에 따라 전사 텍스트로 교정했습니다.", tracks: [{id: 1, title: "소나타", start: 10, end: 70, review: true}]};
        await context.route("http://127.0.0.1:8766/**", route => {
            const url = route.request().url();
            if (url.endsWith("/metadata")) { metadataRequests++; return route.fulfill({json: job}); }
            return route.fulfill({json: url.endsWith("/health") ? {localConfigured: true, metadataReview: true} : [job]});
        });
        await page.evaluate(() => localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test"})));
        await page.reload(); await show(page);
        await page.locator(".analysis-job > summary").click();
        await expect(page.getByText(job.metadataNotice)).toBeVisible();
        await page.getByRole("button", {name: "곡 정보만 재검토", exact: true}).click();
        expect(metadataRequests).toBe(1);
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

    test("PC 서버 상시 녹음의 채널 추가·설정·중지와 원본 저장", async ({page, context}) => {
        const initial = {stationId: "kbs1fm", enabled: false, startMinute: 0, endMinute: 1440,
            weekdays: [0,1,2,3,4,5,6], programs: [], excludeReruns: true, splitTracks: true,
            cloudFallback: true, maxCloudSeconds: 600, segmentMinutes: 120};
        let rules = [initial], saved;
        const state = () => ({rules, channels: [{id: "kbs1fm", name: "KBS 1FM", rerunSupported: true, scheduleSupported: true},
            {id: "cbsmusic", name: "CBS 음악FM", rerunSupported: false, scheduleSupported: true}], runtime: {}, queuedJobs: 0, freeBytes: 50 * 1024 ** 3});
        await context.route("http://127.0.0.1:8766/**", async route => {
            const request = route.request(), path = new URL(request.url()).pathname;
            if (path === "/health") return route.fulfill({json: {localConfigured: true, serverRecorder: true}});
            if (path === "/recorder") {
                if (request.method() === "PUT") { saved = request.postDataJSON(); rules = saved.rules; }
                return route.fulfill({json: state()});
            }
            if (path.endsWith("/files/original")) return route.fulfill({body: "audio", contentType: "audio/mp4"});
            return route.fulfill({json: [{id: "test-original", name: "서버 검증", source: "server-recorder", status: "recorded", message: "PC 원본 녹음 저장 완료", tracks: []}]});
        });
        await page.evaluate(() => localStorage.setItem("fmRadio.trackAnalysis", JSON.stringify({token: "test"})));
        await page.reload(); await show(page);
        await page.locator("[data-recorder-panel] > summary").click();
        await expect(page.locator("[data-recorder-channels] option")).toHaveCount(2);
        await page.locator("[data-recorder-channels]").selectOption(["cbsmusic"]);
        await page.locator("[data-recorder-start]").fill("23:00");
        await page.locator("[data-recorder-end]").fill("01:00");
        await page.locator("[data-recorder-mode]").selectOption("original");
        await page.locator("[data-recorder-reruns]").uncheck();
        await page.getByRole("button", {name: "설정 저장·녹음 시작"}).click();
        await expect.poll(() => rules.length).toBe(2);
        expect(rules[0]).toEqual(initial);
        expect(rules[1]).toMatchObject({stationId: "cbsmusic", enabled: true, startMinute: 1380, endMinute: 60, splitTracks: false, excludeReruns: false});
        await page.getByRole("button", {name: "서버 녹음 끄기", exact: true}).click();
        await expect.poll(() => rules[1].enabled).toBe(false);
        await expect(page.getByRole("button", {name: "서버 녹음 켜기", exact: true})).toHaveCount(2);
        await page.locator(".analysis-job > summary").click();
        const downloadPromise = page.waitForEvent("download");
        await page.getByRole("button", {name: "녹음 원본 저장", exact: true}).click();
        expect((await downloadPromise).suggestedFilename()).toBe("서버 검증.m4a");
    });
});
