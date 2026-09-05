const { test, expect } = require('@playwright/test');
const { mockExternal, collectErrors } = require('./fixtures');

test.describe('레퍼런스 재설계', () => {
    test.use({ viewport: { width: 1440, height: 1000 } });
    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        await page.goto('/');
        await page.evaluate(() => window.MFA_READY);
    });

    test('MC2105 전면 구획과 실제 게인·미터 범위 조작', async ({ page }) => {
        await page.evaluate(() => { ampModelId = 'mc2105'; mountAmp(); });
        const geometry = await page.evaluate(() => {
            const svg = document.querySelector('#ampStage svg');
            const b = el => el.getBoundingClientRect();
            const meters = [...svg.querySelectorAll('[data-panel-region="meter"]')].map(b);
            const logo = b(svg.querySelector('[data-panel-region="brand"]'));
            const body = b(svg.querySelector('[data-panel-region="chassis"]'));
            const controls = b(svg.querySelector('[data-app-controls]'));
            return { left: meters.every(m => m.right < logo.left), ratio: body.width/body.height, outside: controls.top > body.bottom };
        });
        expect(geometry.left).toBe(true);
        expect(geometry.ratio).toBeGreaterThan(2.2);
        expect(geometry.ratio).toBeLessThan(2.5);
        expect(geometry.outside).toBe(true);
        const gain = page.locator('#ampStage [role="slider"][aria-label^="L GAIN"]');
        const initial = await gain.getAttribute('aria-valuenow');
        await gain.focus(); await page.keyboard.press('ArrowDown');
        expect(Number(await gain.getAttribute('aria-valuenow'))).toBeLessThan(Number(initial));
        const range = page.getByRole('button', { name: '미터 범위', exact: true });
        for (const expected of [-10, -20, 'off', 0]) {
            await range.click();
            expect(await page.evaluate(() => fpGet('mc2105.meterRange', 0))).toBe(expected);
        }
    });

    test('MA2375 톤 노브의 클릭 중심과 지시선이 확대된 실물 부품에 맞는다', async ({ page }) => {
        await page.evaluate(() => { ampModelId = 'ma2375'; mountAmp(); });
        const distances = await page.evaluate(() => {
            const caps = [...document.querySelectorAll('#ampStage .ma2375-knob-bezel')];
            return [...document.querySelectorAll('#ampStage [role="slider"][aria-label^="TONE"]')].map(hit => {
                const b = hit.getBoundingClientRect(), center = {x:b.x+b.width/2,y:b.y+b.height/2};
                return Math.min(...caps.map(cap => { const p = new DOMPoint(cap.cx.baseVal.value,cap.cy.baseVal.value).matrixTransform(cap.getScreenCTM()); return Math.hypot(p.x-center.x,p.y-center.y); }));
            });
        });
        expect(distances).toHaveLength(5);
        distances.forEach(d => expect(d).toBeLessThan(.5));
        const tone = page.getByRole('slider', { name: 'TONE 1kHz', exact: true });
        await tone.focus(); await page.keyboard.press('ArrowUp');
        expect(await page.evaluate(() => fpGet('ma2375.tone2', 0))).toBeGreaterThan(0);
    });

    test('B215·Tandberg 표시창과 트랜스포트 구획·보관함·릴 중심 보존', async ({ page }) => {
        const errors = collectErrors(page);
        for (const model of ['b215','tcd3014']) {
            await page.evaluate(id => { deckModelId=id; mountDeck(); }, model);
            const result = await page.evaluate(id => {
                const svg=document.querySelector('#deckStage svg');
                const box = selector => svg.querySelector(selector).getBoundingClientRect();
                const tape=box('.reference-cassette'), transport=box('#deckTransport'), shelf=box('#deckShelf'), mic=box('#deckMicPanel');
                const bars=svg.querySelector('#deckVuL');
                const reel=svg.querySelector('#deckReelL'), pack=svg.querySelector('#deckPackL');
                return { arrangement:id==='b215'?tape.top>transport.bottom:transport.left>tape.right, shelfBelow:Math.min(shelf.top,mic.top)>tape.bottom, segmented:bars.dataset.meterStyle==='segments', reel:[reel.dataset.cx,reel.dataset.cy], pack:[pack.getAttribute('cx'),pack.getAttribute('cy')] };
            }, model);
            expect(result.arrangement).toBe(true); expect(result.shelfBelow).toBe(true); expect(result.segmented).toBe(true); expect(result.reel).toEqual(result.pack);
            await page.locator('#deckBtnPlay').click();
            await expect.poll(() => page.evaluate(() => deckMode)).toBe('play');
            await page.locator('#deckBtnStop').click();
            await expect.poll(() => page.evaluate(() => deckMode)).toBe('stop');
        }
        expect(errors).toEqual([]);
    });

    test('턴테이블 정보는 읽을 수 있는 HTML로 줄바꿈하고 모바일에서 본체 아래로 내려간다', async ({ page }) => {
        await page.evaluate(() => {
            const many=RECORDS.findIndex(r => r.tracks.length>=13);
            setRecord(many); ttModelId='sl1200'; mountTurntable();
        });
        await expect(page.locator('.tt-track-list button')).toHaveCount(13);
        const desktop = await page.evaluate(() => {
            const machine=document.querySelector('.tt-machine').getBoundingClientRect(), info=document.querySelector('.tt-record-panel').getBoundingClientRect();
            return { side:info.left>machine.right, font:parseFloat(getComputedStyle(document.querySelector('.tt-track-list button')).fontSize), tag:document.querySelector('#ttNextRec').tagName };
        });
        expect(desktop.side).toBe(true); expect(desktop.font).toBeGreaterThanOrEqual(13); expect(desktop.tag).toBe('BUTTON');
        // 원점 -40을 포함해 피치 0 위치를 실제 포인터로 눌러 본다.
        await page.locator('#ttPitchHit').scrollIntoViewIfNeeded();
        const center=await page.evaluate(() => { const svg=document.querySelector('#ttStage svg'), p=new DOMPoint(910,396).matrixTransform(svg.getScreenCTM()); return {x:p.x,y:p.y}; });
        const pitchBox=await page.locator('#ttPitchHit').boundingBox();
        await page.mouse.click(pitchBox.x+pitchBox.width/2,center.y);
        expect(await page.evaluate(() => ttPitch)).toBe(0);
        const before=await page.evaluate(() => recordIdx);
        await page.locator('#ttNextRec').focus(); await page.keyboard.press('Enter');
        expect(await page.evaluate(() => recordIdx)).toBe(before+1);
        await page.evaluate(() => { RECORD={...RECORD,cover:null}; mountTurntable(); });
        await page.locator('#ttJacketHit').click();
        await expect(page.locator('#jacketOverlay')).toBeVisible();
        await expect(page.locator('#jacketBigArt .jbig-title')).not.toBeEmpty();
        await page.keyboard.press('Escape');
        await page.setViewportSize({width:390,height:844});
        const mobile=await page.evaluate(() => {
            const machine=document.querySelector('.tt-machine').getBoundingClientRect(), info=document.querySelector('.tt-record-panel').getBoundingClientRect();
            return { below:info.top>machine.bottom, overflow:document.documentElement.scrollWidth-innerWidth, targets:[...document.querySelectorAll('.tt-workstation button')].map(b=>b.getBoundingClientRect().height) };
        });
        expect(mobile.below).toBe(true); expect(mobile.overflow).toBeLessThanOrEqual(1); mobile.targets.forEach(h=>expect(h).toBeGreaterThanOrEqual(44));
        await page.evaluate(() => { focusView='room'; applyFocusMode(true); focusUnitZoom(document.getElementById('ttStage')); });
        await expect(page.locator('.tt-record-panel')).toBeVisible();
        const zoom=await page.locator('#ttStage').boundingBox();
        expect(zoom.y).toBeGreaterThanOrEqual(0); expect(zoom.y+zoom.height).toBeLessThan(844);
    });
});
