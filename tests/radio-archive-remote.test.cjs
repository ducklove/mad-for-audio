const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require.resolve('../radio-archive-client.js'), 'utf8');
const remote = 'https://ducklove.duckdns.org/radio-archive';
const id = '11111111-1111-4111-8111-111111111111';
function fixture(initial = {}, globals = {}) {
    const saved = new Map(Object.entries(initial));
    const requests = [];
    const context = vm.createContext({ URL, AbortSignal, console,
        localStorage: { getItem: k => saved.get(k), setItem: (k,v) => saved.set(k,v), removeItem: k => saved.delete(k) },
        fetch: async (url, options) => {
            requests.push({url, options});
            const data = url.endsWith('/pair') ? {clientId:id,token:'t'.repeat(54),expiresAt:Date.now()/1000+3600,scope:'albums:read audio:read'}
                : url.endsWith('/albums') ? {version:1,albums:[]}
                : {path:'/player/audio/'+'a'.repeat(43),expiresIn:600};
            return {ok:true,json:async()=>data};
        }, ...globals });
    vm.runInContext(source, context);
    return {api: context.RadioArchiveClient, context, saved, requests};
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('remote pairing persists endpoint and media requests remain at that endpoint after reload', async () => {
    const f = fixture({}, {MFA_ARCHIVE_PAIR_TICKET:'p'.repeat(43), MFA_ARCHIVE_SERVER_URL:remote});
    f.api.init({onRecords:()=>{}, onStatus:()=>{}});
    await settle();
    assert.equal(f.requests[0].url, remote+'/player/pair');
    assert.equal(f.requests[1].url, remote+'/player/albums');
    assert.equal(f.context.MFA_ARCHIVE_PAIR_TICKET, undefined);
    assert.equal(f.context.MFA_ARCHIVE_SERVER_URL, undefined);
    const connection = JSON.parse(f.saved.get('fmRadio.archiveClient'));
    assert.equal(connection.serverUrl, remote);
    const next = fixture(Object.fromEntries(f.saved));
    next.api.init({onRecords:()=>{}, onStatus:()=>{}});
    await settle();
    const url = await next.api.audioUrl({host:'radio-archive',archiveAlbumId:id,archivePosition:0,id});
    assert.equal(url, remote+'/player/audio/'+'a'.repeat(43));
    assert.ok(next.requests.every(r=>r.url.startsWith(remote+'/')));
    assert.ok(next.requests.every(r=>r.options.credentials==='omit' && r.options.redirect==='error'));
    next.api.disconnect();
    await assert.rejects(()=>next.api.audioUrl({host:'radio-archive',archiveAlbumId:id,archivePosition:0,id}));
});

test('bad server endpoints never receive a pairing credential; existing local connection remains compatible', async () => {
    for (const base of ['http://public.example','https://u:p@audio.example','https://audio.example/?token=x','https://audio.example/#token','javascript:alert(1)']) {
        const f=fixture({}, {MFA_ARCHIVE_PAIR_TICKET:'p'.repeat(43), MFA_ARCHIVE_SERVER_URL:base});
        f.api.init({onRecords:()=>{}, onStatus:()=>{}});await settle();assert.equal(f.requests.length,0);
    }
    const f=fixture({'fmRadio.archiveClient':JSON.stringify({token:'old-local-token'})});
    f.api.init({onRecords:()=>{}, onStatus:()=>{}});await settle();
    assert.equal(f.requests[0].url,'http://127.0.0.1:8766/player/albums');
});
