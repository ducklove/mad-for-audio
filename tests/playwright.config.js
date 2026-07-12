// FM 라디오 테스트 설정 — 저장소 루트를 정적 서빙하고 크로미움으로 검증한다.
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: __dirname,
    testMatch: "**/*.spec.js",
    timeout: 60000,
    retries: 1,
    reporter: [["list"]],
    use: {
        baseURL: "http://127.0.0.1:8123/",
        launchOptions: { args: ["--autoplay-policy=no-user-gesture-required"] },
    },
    webServer: {
        command: "npx http-server .. -p 8123 -s -c-1",
        url: "http://127.0.0.1:8123/index.html",
        reuseExistingServer: true,
    },
});
