const fs = require("fs");
const path = require("path");
const { chromium, webkit } = require("playwright");

const BASE = process.env.MFA_CAPTURE_BASE || "http://127.0.0.1:8147/";
const OUT = process.env.MFA_CAPTURE_OUT || "/tmp/mfa-rack-eval";
const BROWSER_NAME = process.env.MFA_CAPTURE_BROWSER || "chromium";
const BROWSER_TYPE = BROWSER_NAME === "webkit" ? webkit : chromium;
const PRESETS = (process.env.MFA_CAPTURE_PRESETS || "signature,black,silver").split(",").filter(Boolean);

async function forcePoweredAppearance(page) {
    await page.evaluate(() => {
        try {
            isPlaying = true;
            tunerWarm = 1;
            ampWarm = 1;
            tubeWarm = 1;
        } catch (error) {}
        document.querySelectorAll(".rack-column svg").forEach((svg) => {
            svg.querySelectorAll(".lzPowerDim, .meterDark").forEach((el) => { el.style.opacity = "0"; });
            svg.querySelectorAll(".lampGlow").forEach((el) => { el.style.opacity = el.dataset.lzOn || ".44"; });
            svg.querySelectorAll(".ampLamp").forEach((el) => { el.style.opacity = el.dataset.lzOn || ".68"; });
            svg.querySelectorAll(".ampLegend").forEach((el) => { el.style.opacity = el.dataset.lzOn || ".92"; });
            svg.querySelectorAll(".dialScale").forEach((el) => { el.style.opacity = ".95"; });
        });
    });
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const browser = await BROWSER_TYPE.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        deviceScaleFactor: 1,
        colorScheme: "dark",
        reducedMotion: "reduce",
        serviceWorkers: "block",
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => console.error("PAGEERROR", error.message));
    await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem("fmRadio.coachDone", "true");
        localStorage.setItem("fmRadio.lastStation", JSON.stringify("kbs1fm"));
        localStorage.setItem("fmRadio.record", JSON.stringify(0));
    });
    await page.goto(BASE + "index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(() => window.MFA_READY);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForSelector("#tunerStage svg", { timeout: 30000 });
    await page.evaluate(() => {
        document.body.className = "mode-rack";
        const player = document.querySelector(".hero-player-wrap");
        const canvas = document.querySelector(".vu-canvas");
        if (player) player.style.display = "none";
        if (canvas) canvas.style.display = "none";
    });

    for (const preset of PRESETS) {
        await page.evaluate((id) => applyRackPreset(id), preset);
        await page.waitForTimeout(500);
        await forcePoweredAppearance(page);
        const rack = page.locator(".rack-column");
        await rack.waitFor({ state: "visible" });
        const outPath = path.join(OUT, "rack-" + preset + ".png");
        await rack.screenshot({ path: outPath, animations: "disabled" });
        const box = await rack.boundingBox();
        console.log(preset, box && Math.round(box.width) + "x" + Math.round(box.height));
    }

    await browser.close();
    console.log("BROWSER", BROWSER_NAME, "OUT", OUT);
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
