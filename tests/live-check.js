// 실제 방송 스트림 연결 점검 (로컬 전용 — CI에서는 돌리지 않는다)
// 각 채널의 스트림 URL을 해석하고 플레이리스트 첫 응답까지 확인한다.
// 사용법: node live-check.js
const path = require("path");

// stations.js는 브라우저 전역(window)에 붙는 IIFE라 간단한 셈으로 로드한다
const fs = require("fs");
const src = fs.readFileSync(path.join(__dirname, "..", "stations.js"), "utf8");
const sandbox = { window: {} };
new Function("window", "fetch", "AbortSignal", src)(sandbox.window, fetch, AbortSignal);
const { stations, getStreamUrl } = sandbox.window.FMRadio;

const TIMEOUT_MS = 15000;

async function checkStation(station) {
    const t0 = Date.now();
    try {
        const url = await getStreamUrl(station);
        const res = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: { "user-agent": "Mozilla/5.0 (fm-radio live-check)" }
        });
        const body = await res.text();
        const ms = Date.now() - t0;
        const looksHls = body.includes("#EXTM3U");
        if (!res.ok) return { station, ok: false, note: `HTTP ${res.status}`, ms };
        if (url.includes(".m3u8") && !looksHls) return { station, ok: false, note: "m3u8 형식 아님", ms };
        return { station, ok: true, note: `${res.status} · ${looksHls ? "HLS OK" : "OK"}`, ms };
    } catch (error) {
        return { station, ok: false, note: String(error.message || error).slice(0, 60), ms: Date.now() - t0 };
    }
}

(async () => {
    console.log(`실스트림 점검 — ${stations.length}개 채널\n`);
    const results = await Promise.all(stations.map(checkStation));
    let fail = 0;
    for (const r of results) {
        const mark = r.ok ? "✅" : "❌";
        if (!r.ok) fail += 1;
        console.log(`${mark} ${r.station.name.padEnd(12)} ${String(r.ms).padStart(5)}ms  ${r.note}`);
    }
    console.log(`\n${results.length - fail}/${results.length} 정상`);
    process.exit(fail ? 1 : 0);
})();
