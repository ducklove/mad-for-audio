// 배포 패키지의 자산·실행과 설치 이미지 무결성을 검사한다. CI의 독립 프로필에서 실행한다.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {execFileSync} = require("node:child_process");
const asar = require("@electron/asar");
const {_electron: electron} = require("../tests/node_modules/playwright");
const version = require("./package.json").version;
const dist = path.join(__dirname, "dist");

async function main() {
    const windows = process.platform === "win32";
    const roots = windows ? [path.join(dist, "win-unpacked")] :
        [path.join(dist, "mac-arm64", "Mad for Audio.app", "Contents"), path.join(dist, "mac", "Mad for Audio.app", "Contents")];
    for (const root of roots) {
        const resources = path.join(root, windows ? "resources" : "Resources");
        const entries = asar.listPackage(path.join(resources, "app.asar"));
        assert(entries.length > 0);
        assert(entries.every(entry => ["/main.js", "/preload.js", "/shell.html", "/package.json"].includes(entry.replaceAll("\\", "/"))), "앱 외 파일이 패키지에 포함됐습니다.");
        for (const asset of ["widget.html", "turntable.html", "records.json", "stations.js", "player-core.js", "icons/icon-512.png"]) {
            assert(fs.statSync(path.join(resources, "web", asset)).size > 0, asset);
        }
    }
    const root = windows ? (process.env.MFA_INSTALL_PATH || roots[0]) : roots[process.arch === "arm64" ? 0 : 1];
    const executablePath = windows ? path.join(root, "Mad for Audio.exe") : path.join(root, "MacOS", "Mad for Audio");
    const app = await electron.launch({executablePath, timeout: 60000});
    try {
        const window = await app.firstWindow();
        await window.frameLocator("#widgetFrame").locator("#btnPlay").waitFor({state: "visible", timeout: 30000});
        const stationCount = await window.frameLocator("#widgetFrame").locator("#stationSelect option").count();
        assert(stationCount > 5, "방송 채널이 로드되지 않았습니다.");
        assert.equal(await app.evaluate(({app}) => app.isPackaged), true);
        assert.equal(await app.evaluate(({app}) => app.getVersion()), version);
    } finally {
        await app.close();
    }
    const artifacts = fs.readdirSync(dist).filter(name => name.startsWith("MadForAudio-") && name.includes(version) && /\.(exe|dmg)$/.test(name));
    assert.equal(artifacts.length, windows ? 1 : 2);
    const hashes = [];
    for (const name of artifacts) {
        const file = path.join(dist, name);
        assert(fs.statSync(file).size > 30 * 1024 * 1024);
        if (!windows) execFileSync("hdiutil", ["verify", file], {stdio: "inherit"});
        hashes.push(crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") + "  " + name);
    }
    fs.writeFileSync(path.join(dist, `SHA256SUMS-${process.platform}.txt`), hashes.join("\n") + "\n");
    fs.writeFileSync(path.join(dist, `verification-${process.platform}.json`), JSON.stringify({version, platform: process.platform, runtimeArchitecture: process.arch, artifacts, packagedAppStarted: true, assetsChecked: true}, null, 2));
    console.log("설치 파일·앱 실행·자산 검증 완료:", artifacts.join(", "));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
