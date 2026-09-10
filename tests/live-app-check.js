// 배포 후 실제 방송 재생 검증. 모킹 없이 KBS 1FM의 디코딩·시간 진행을 확인한다.
// node live-app-check.js [URL] [버전]
// AAC를 제공하는 설치된 Chrome 사용. Edge는 MFA_BROWSER_CHANNEL=msedge로 지정한다.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');

(async () => {
    const url = process.argv[2] || 'https://ducklove.github.io/mad-for-audio/';
    const version = process.argv[3];
    const browser = await chromium.launch({
        channel: process.env.MFA_BROWSER_CHANNEL || 'chrome',
        args: ['--autoplay-policy=document-user-activation-required']
    });
    try {
        for (const width of [1440, 390]) {
            const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, serviceWorkers: 'block' });
            const page = await context.newPage();
            const errors = [];
            const failedRequests = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('requestfailed', request => {
                const address = new URL(request.url());
                failedRequests.push({ url: address.origin + address.pathname, error: request.failure()?.errorText });
            });
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            try {
                await page.waitForFunction(() => window.MFA_BOOTSTRAP?.phase === 'ready', null, { timeout: 30000 });
            } catch (error) {
                console.error(JSON.stringify({ errors, failedRequests, bootstrap: await page.evaluate(() => ({
                    phase: window.MFA_BOOTSTRAP?.phase, error: window.MFA_BOOTSTRAP?.error,
                    title: document.querySelector('#listeningTitle')?.textContent,
                    state: document.readyState
                })) }));
                throw error;
            }
            if (version) assert.equal(await page.evaluate(() => MFA_BOOTSTRAP.version), version);
            assert.equal(await page.evaluate(() => MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"')), true,
                '실제 방송을 검사하려면 AAC를 지원하는 Chrome 또는 Edge가 필요합니다.');
            await page.locator('#listeningStart').click();
            try {
                await page.waitForFunction(() => isPlaying && audio.currentTime > 1 && audioCtx?.state === 'running', null, { timeout: 30000 });
            } catch (error) {
                console.error(JSON.stringify({ errors, failedRequests, playback: await page.evaluate(() => ({
                    playing: isPlaying, state: audioState, currentTime: audio.currentTime,
                    paused: audio.paused, readyState: audio.readyState, mediaError: audio.error?.message,
                    audioContext: audioCtx?.state, hint: document.querySelector('#listeningHint')?.textContent,
                    aacSupported: MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"')
                })) }));
                throw error;
            }
            await page.waitForFunction(() => {
                const samples = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(samples);
                return gainNode.gain.value > 0 && samples.some(value => Math.abs(value) > .0001);
            }, null, { timeout: 10000 });
            const result = await page.evaluate(() => ({
                version: MFA_BOOTSTRAP.version, width: innerWidth, station: currentStation.id,
                playing: isPlaying, currentTime: audio.currentTime, audioContext: audioCtx.state,
                gain: gainNode.gain.value, speakerOpen: ampSpeakerOpen(),
                overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth)
            }));
            await page.waitForFunction(previous => audio.currentTime > previous + .5, result.currentTime);
            assert.equal(result.speakerOpen, true);
            assert.equal(result.overflowPx, 0);
            await page.locator('#listeningStart').click();
            await page.waitForFunction(() => audio.paused && !isPlaying);
            assert.deepEqual(errors, []);
            console.log(JSON.stringify({ ...result, pauseWorks: true, decodedSignal: true, errors }));
            await context.close();
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
