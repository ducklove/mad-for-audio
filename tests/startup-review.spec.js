const { test, expect } = require('@playwright/test');
const { mockExternal, MOCK_STREAM_URL } = require('./fixtures');

test.describe('첫 재생 UX와 연결 취소', () => {
    // 서비스워커를 거치는 요청은 Playwright route가 가로채지 못한다.
    // 이 테스트는 요청 지연을 제어하며, 오프라인 SW는 별도 회귀에서 검사한다.
    test.use({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        await page.goto('/');
        await page.evaluate(() => window.MFA_READY);
    });

    async function nativeFixture(page, browserName) {
        if (browserName === 'webkit') await page.evaluate(() => {
            FMRadio.stations.forEach(station => {
                station.type = 'direct';
                station.streamUrl = location.origin + '/tests/.stream/sample.mp3';
            });
        });
    }

    test('기본 랙에서 첫 화면 버튼 한 번으로 실제 재생하고 키보드로 멈춘다', async ({ page, browserName }) => {
        await nativeFixture(page, browserName);
        const start = page.locator('#listeningStart');
        await expect(start).toBeInViewport();
        await expect(start).toBeEnabled();
        await expect(page.locator('#btnRes')).toBeHidden();
        await expect(page.locator('#audioStateChip')).toBeHidden();
        expect(await page.evaluate(() => ({ playing: isPlaying, src: audio.getAttribute('src') })))
            .toEqual({ playing: false, src: null });
        await start.click();
        await page.waitForFunction(() => isPlaying && audio.currentTime > .2);
        if (browserName === 'chromium') {
            await expect.poll(() => page.evaluate(() => audioCtx.state)).toBe('running');
            await expect.poll(() => page.evaluate(() => gainNode.gain.value)).toBeGreaterThan(0);
            await expect.poll(() => page.evaluate(() => {
                const values = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(values);
                return values.some(value => Math.abs(value) > .001);
            })).toBe(true);
        }
        await expect(start).toHaveText('일시정지');
        await start.press('Enter');
        await expect.poll(() => page.evaluate(() => audio.paused && !isPlaying)).toBe(true);
    });

    test('모바일과 저장된 채널에서도 첫 재생 안내가 보인다', async ({ page, browserName }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => localStorage.setItem('fmRadio.lastStation', JSON.stringify('kbs2fm')));
        await page.reload();
        await page.evaluate(() => window.MFA_READY);
        await nativeFixture(page, browserName);
        await expect(page.locator('#listeningStart')).toBeInViewport();
        await expect(page.locator('#listeningTitle')).toHaveText('KBS 2FM');
        await page.locator('#listeningStart').click();
        await page.waitForFunction(() => isPlaying && audio.currentTime > .2);
        expect(await page.evaluate(() => currentStation.id)).toBe('kbs2fm');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });

    for (const cancel of ['버튼', '튜너 전원']) {
        test(`주소 조회 중 ${cancel} 취소 뒤 늦은 응답이 소리를 되살리지 않는다`, async ({ page, context }) => {
            let release;
            const pending = new Promise(resolve => { release = resolve; });
            let requested = false;
            // 공용 방송사 모킹과 분리한 주소를 써 WebKit의 요청 캐시에도 경합을 재현한다.
            await page.evaluate(() => {
                FMRadio.stations[0].type = 'kbs-api';
                FMRadio.stations[0].apiUrl = location.origin + '/tests/pending-station.json';
            });
            await context.route('**/pending-station.json', async route => {
                requested = true;
                await pending;
                await route.fulfill({ json: { channel_item: [{ service_url: MOCK_STREAM_URL }] } });
            });
            await page.locator('#listeningStart').click();
            await expect.poll(() => requested).toBe(true);
            await expect(page.locator('#listeningStart')).toHaveText('연결 취소');
            if (cancel === '버튼') await page.locator('#listeningStart').click();
            else await page.evaluate(() => setTunerPower(false));
            release();
            await page.waitForTimeout(300);
            expect(await page.evaluate(() => ({ state: audioState, paused: audio.paused, loaded: streamLoaded, player: !!player })))
                .toEqual({ state: 'idle', paused: true, loaded: false, player: false });
        });
    }

    test('중단된 AudioContext는 재생 버튼 클릭으로 다시 실행된다', async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium', 'Web Audio 그래프를 사용하는 Chromium 검증');
        await page.locator('#listeningStart').click();
        await page.waitForFunction(() => isPlaying);
        await page.locator('#listeningStart').click();
        await page.evaluate(() => audioCtx.suspend());
        await page.locator('#listeningStart').click();
        await page.waitForFunction(() => isPlaying && audioCtx.state === 'running');
    });
});

test('부팅 복구: 카탈로그 무응답을 8초로 제한하고 라디오를 사용할 수 있다', async ({ context, page }) => {
    await mockExternal(context);
    await page.route('**/records.json*', () => {});
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#listeningStart')).toBeEnabled({ timeout: 12000 });
    expect(await page.evaluate(() => MFA_BOOTSTRAP.catalog.status)).toBe('degraded');
    await page.locator('#listeningStart').click();
    await page.waitForFunction(() => isPlaying && audio.currentTime > .2);
});

test('부팅 복구: 본체 파일 실패를 표시하고 다시 불러오기 버튼을 제공한다', async ({ context, page }) => {
    await mockExternal(context);
    await page.route('**/app.js*', route => route.abort());
    await page.goto('/');
    await expect(page.locator('#listeningTitle')).toHaveText('오디오를 불러오지 못했습니다');
    await expect(page.locator('#listeningStart')).toBeEnabled();
    await expect(page.locator('#listeningStart')).toHaveText('다시 불러오기');
});

test('모달을 닫자마자 옮긴 EQ 포커스를 다음 프레임이 빼앗지 않는다', async ({ context, page }) => {
    await mockExternal(context);
    await page.goto('/');
    await page.evaluate(() => window.MFA_READY);
    await page.getByRole('button', { name: '⚙ 오디오 구성', exact: true }).click();
    await page.getByRole('button', { name: 'YAMAHA GE-5 · 10밴드', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.locator('#eqHit0').focus();
    await page.locator('#eqHit0').press('ArrowUp');
    await page.waitForTimeout(100);
    await expect(page.locator('#eqHit0')).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.locator('#eqHit0')).toHaveAttribute('aria-valuenow', '2');
});
