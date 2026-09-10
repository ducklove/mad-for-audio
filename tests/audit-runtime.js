// 로컬 모의 스트림으로 반복 가능한 초기 로딩·CPU·접근성 계측.
// node audit-runtime.js [산출물 이름] [앱 주소]
const { chromium } = require('@playwright/test');
const { mockExternal } = require('./fixtures');
const fs = require('fs');
const path = require('path');

(async () => {
    const label = process.argv[2] || 'current';
    const baseURL = process.argv[3] || 'http://127.0.0.1:8123/';
    const output = path.join(__dirname, 'artifacts', 'runtime-audit');
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ args: ['--autoplay-policy=document-user-activation-required'] });
    const results = [];
    try {
        for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
            const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
            await mockExternal(context);
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            const cdp = await context.newCDPSession(page);
            await cdp.send('Performance.enable');
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            await page.addInitScript(() => {
                window.audit = { longTasks: [], lcp: 0, cls: 0, shifts: [], frames: 0 };
                new PerformanceObserver(list => list.getEntries().forEach(e => audit.longTasks.push(e.duration))).observe({ type: 'longtask', buffered: true });
                new PerformanceObserver(list => list.getEntries().forEach(e => audit.lcp = e.startTime)).observe({ type: 'largest-contentful-paint', buffered: true });
                new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) { audit.cls += e.value; audit.shifts.push({ value: e.value, sources: e.sources.map(s => ({ target: s.node?.id || s.node?.className, before: s.previousRect.toJSON(), after: s.currentRect.toJSON() })) }); } })).observe({ type: 'layout-shift', buffered: true });
                const original = window.requestAnimationFrame;
                window.requestAnimationFrame = callback => original.call(window, now => { audit.frames++; callback(now); });
            });
            await page.goto(baseURL);
            await page.waitForFunction(() => window.MFA_BOOTSTRAP?.phase === 'ready');
            const readyMs = await page.evaluate(() => performance.now());
            await page.waitForTimeout(4000);
            const initial = await page.evaluate(() => {
                const button = document.getElementById('btnPlay');
                const r = button.getBoundingClientRect();
                const startRect = document.getElementById('listeningStart')?.getBoundingClientRect();
                return {
                    state: audioState, playing: isPlaying, unitPower: { ...unitPower },
                    hint: playerSubtext.textContent, playVisible: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight,
                    startVisible: !!startRect && startRect.width > 0 && startRect.top >= 0 && startRect.bottom <= innerHeight,
                    overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
                    domNodes: document.querySelectorAll('*').length,
                    resourceBytes: performance.getEntriesByType('resource').filter(r => new URL(r.name).origin === location.origin).reduce((sum, r) => sum + r.decodedBodySize, 0),
                    ...audit
                };
            });
            await page.screenshot({ path: path.join(output, `${label}-${viewport.width}.png`) });
            const before = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
            const frameStart = await page.evaluate(() => audit.frames);
            await page.waitForTimeout(5000);
            const after = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
            const idleFrames = await page.evaluate(start => audit.frames - start, frameStart);
            await page.addScriptTag({ path: require.resolve('axe-core') });
            const accessibility = await page.evaluate(async () => {
                const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
                return { passes: r.passes.length, violations: r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, examples: v.nodes.slice(0, 3).map(n => n.target) })) };
            });
            const start = page.locator('#listeningStart');
            const canStart = await start.isVisible() || await page.locator('#btnPlay').isVisible();
            let playback = { available: canStart };
            if (canStart) {
                await (await start.isVisible() ? start : page.locator('#btnPlay')).click();
                await page.waitForFunction(() => isPlaying && !audio.paused && audio.currentTime > 0, null, { timeout: 15000 });
                playback = await page.evaluate(() => ({ playing: isPlaying, state: audioState, context: audioCtx?.state, speakerOpen: ampSpeakerOpen(), gain: gainNode?.gain.value, time: audio.currentTime }));
            }
            const row = { viewport, cpuThrottle: 4, readyMs, initial, idle: { frames: idleFrames, taskMs: (after.TaskDuration - before.TaskDuration) * 1000, scriptMs: (after.ScriptDuration - before.ScriptDuration) * 1000, heapBytes: after.JSHeapUsedSize }, accessibility, playback, errors };
            results.push(row);
            console.log(JSON.stringify(row));
            await context.close();
        }
    } finally {
        await browser.close();
        fs.writeFileSync(path.join(output, `${label}.json`), JSON.stringify(results, null, 2));
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
