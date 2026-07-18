const { test, expect } = require("@playwright/test");
const { mockExternal, collectErrors } = require("./fixtures");

async function waitForApp(page) {
    await page.waitForFunction(() => Array.isArray(window.MFA_RECORDS));
    await page.evaluate(() => window.MFA_READY);
    await page.waitForSelector("#tunerStage svg");
}

test.describe("모델 런타임 리팩토링", () => {
    test.use({ viewport: { width: 1440, height: 1200 } });

    let errors;
    test.beforeEach(async ({ context, page }) => {
        await mockExternal(context);
        errors = collectErrors(page);
        await page.goto("/");
        await waitForApp(page);
    });

    test.afterEach(() => {
        expect(errors, "콘솔 오류·페이지 예외 없음").toEqual([]);
    });

    test("공통 모델 레지스트리가 기존 카탈로그와 안정 ID 계약을 보존", async ({ page }) => {
        const result = await page.evaluate(() => {
            const registry = window.MFA && window.MFA.models;
            const kinds = registry ? registry.kinds : [];
            const counts = Object.fromEntries(kinds.map((kind) => [kind, registry.list(kind).length]));
            const tuner = registry && registry.get("tuner", registry.defaultId("tuner"));
            const amp = registry && registry.get("amplifier", registry.defaultId("amplifier"));
            return {
                kinds,
                counts,
                tunerLabel: tuner && tuner.label,
                tunerControls: tuner && tuner.controls,
                ampHasAudioProfile: Boolean(amp && amp.audioProfile),
                compatibilityAlias: window.MFA_MODEL_REGISTRY === registry,
                stableIds: {
                    tsDialPtr: document.querySelectorAll("#tsDialPtr").length,
                    ampVolMark: document.querySelectorAll("#ampVolMark").length,
                    deckPlay: document.querySelectorAll("#deckBtnPlay").length
                }
            };
        });

        expect(result.kinds).toEqual(["tuner", "amplifier", "deck", "turntable", "timer"]);
        for (const count of Object.values(result.counts)) expect(count).toBeGreaterThan(0);
        expect(result.tunerLabel).toBeTruthy();
        expect(result.tunerControls).toContain("tsFreq");
        expect(result.ampHasAudioProfile).toBe(true);
        expect(result.compatibilityAlias).toBe(true);
        expect(result.stableIds.tsDialPtr).toBe(1);
        expect(result.stableIds.ampVolMark).toBe(1);
        expect(result.stableIds.deckPlay).toBe(1);
    });

    test("각 SVG의 공통 조명 defs는 문서 전체에서 고유", async ({ page }) => {
        const ids = await page.evaluate(() => {
            const all = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
            const scoped = all.filter((id) => /^mfa-lz-\d+-lz/.test(id));
            const legacyReferences = Array.from(document.querySelectorAll("svg *")).flatMap((el) =>
                Array.from(el.attributes || [])
                    .filter((attr) => /url\(#lz[A-Za-z]/.test(attr.value) || /^#lz[A-Za-z]/.test(attr.value))
                    .map((attr) => `${el.tagName}:${attr.name}=${attr.value}`));
            return {
                scoped,
                legacyShared: all.filter((id) => /^lz[A-Z]/.test(id)),
                legacyReferences,
                duplicates: scoped.filter((id, index) => scoped.indexOf(id) !== index),
                decoratedSvgs: document.querySelectorAll("svg[data-lz-lighting='1']").length
            };
        });

        expect(ids.decoratedSvgs).toBeGreaterThanOrEqual(4);
        expect(ids.scoped.length).toBeGreaterThan(20);
        expect(ids.legacyShared).toEqual([]);
        expect(ids.legacyReferences).toEqual([]);
        expect(ids.duplicates).toEqual([]);
    });

    test("스코프된 하드웨어 필터가 실제 SVG defs를 가리킨다", async ({ page }) => {
        const audit = async (kind, id) => page.evaluate(({ kind, id }) => {
            if (kind === "amp") { ampModelId = id; mountAmp(); }
            else { deckModelId = id; mountDeck(); }
            const svg = document.querySelector(kind === "amp" ? "#ampStage svg" : "#deckStage svg");
            const hardware = Array.from(svg.querySelectorAll(".lz-hardware-button,.lz-hardware-knob,.lz-hardware-switch"));
            const unresolved = hardware.flatMap((el) => {
                const match = el.style.filter.match(/url\(["']?#([^"')]+)["']?\)/);
                if (!match) return [`${el.tagName}.${el.classList.value}:missing-inline-filter`];
                const target = document.getElementById(match[1]);
                return target && target.ownerSVGElement === svg ? [] : [`${el.tagName}.${el.classList.value}:${match[1]}`];
            });
            const unresolvedFragments = Array.from(svg.querySelectorAll("*")).flatMap((el) =>
                Array.from(el.attributes || []).flatMap((attr) => {
                    const refs = Array.from(attr.value.matchAll(/url\(["']?#([^"')]+)["']?\)/g), (match) => match[1]);
                    return refs.filter((ref) => {
                        const target = document.getElementById(ref);
                        return !target || target.ownerSVGElement !== svg;
                    }).map((ref) => `${el.tagName}:${attr.name}=${ref}`);
                }));
            return {
                count: hardware.length,
                customKnobs: svg.querySelectorAll(".e303-cylinder-knob").length,
                unresolved,
                unresolvedFragments
            };
        }, { kind, id });

        const e303 = await audit("amp", "e303");
        const ctf1250 = await audit("deck", "ctf1250");
        expect(e303.customKnobs).toBeGreaterThanOrEqual(4);
        expect(ctf1250.count).toBeGreaterThanOrEqual(10);
        expect(e303.unresolved).toEqual([]);
        expect(ctf1250.unresolved).toEqual([]);
        expect(e303.unresolvedFragments).toEqual([]);
        expect(ctf1250.unresolvedFragments).toEqual([]);
    });

    test("애니메이션 스케줄러는 dirty·active 상태에서만 프레임을 유지", async ({ page }) => {
        const result = await page.evaluate(() => {
            let nextId = 0;
            let queued = null;
            let hidden = false;
            const fakeDocument = new EventTarget();
            Object.defineProperty(fakeDocument, "hidden", { get: () => hidden });
            const scheduler = window.MFA.createAnimationScheduler({
                document: fakeDocument,
                requestFrame(callback) { queued = callback; return ++nextId; },
                cancelFrame() { queued = null; }
            });
            let dirtyCalls = 0;
            scheduler.register("dirty", () => { dirtyCalls += 1; });
            queued(10);
            const stoppedAfterDirty = !scheduler.isRunning();
            scheduler.invalidate("dirty");
            queued(20);

            let active = true;
            let activeCalls = 0;
            scheduler.register("active", () => { activeCalls += 1; }, { dirty: false, isActive: () => active });
            queued(30);
            const runningWhileActive = scheduler.isRunning();
            active = false;
            queued(40);
            const stoppedWhenInactive = !scheduler.isRunning();

            scheduler.invalidate("dirty");
            hidden = true;
            fakeDocument.dispatchEvent(new Event("visibilitychange"));
            const stoppedWhenHidden = !scheduler.isRunning();
            scheduler.dispose();
            return { dirtyCalls, activeCalls, stoppedAfterDirty, runningWhileActive, stoppedWhenInactive, stoppedWhenHidden };
        });

        expect(result).toEqual({
            dirtyCalls: 2,
            activeCalls: 1,
            stoppedAfterDirty: true,
            runningWhileActive: true,
            stoppedWhenInactive: true,
            stoppedWhenHidden: true
        });
    });
});
