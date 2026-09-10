const { test, expect } = require('@playwright/test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('프록시 인증서 갱신은 기존 연결을 닫지 않고 적용하며 읽기 실패 때 기존 인증서를 유지한다', () => {
    let revision = '첫 인증서', fail = false, tick, creates = 0;
    const applied = [], paths = [];
    const server = { listen() {}, setSecureContext(tls) { applied.push(tls); } };
    const fakeFs = { readFileSync(file) { paths.push(file); if (fail) throw Object.assign(Error(), { code: 'EACCES' }); return revision + file; } };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'mbc-proxy.js'), 'utf8'), {
        require(name) {
            if (name === 'fs') return fakeFs;
            if (name === 'https') return { createServer() { creates++; return server; } };
            if (name === 'http') return { createServer() { throw Error('HTTPS에서 HTTP로 후퇴하면 안 됩니다'); } };
            throw Error(name);
        },
        process: { env: {} }, console: { log() {}, warn() {} }, URL,
        setInterval(callback) { tick = callback; return { unref() {} }; }
    });
    expect(paths.every(file => file.startsWith('/etc/letsencrypt/live/ducklove.duckdns.org/'))).toBe(true);
    tick();expect(applied).toHaveLength(0);
    revision = '갱신 인증서';tick();expect(applied).toHaveLength(1);
    fail = true;tick();expect(applied).toHaveLength(1);
    expect(creates).toBe(1);
});
