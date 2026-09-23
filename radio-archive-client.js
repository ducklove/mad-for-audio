/* Radio Archive의 읽기 전용 음반 연결. 음원과 관리 토큰은 앱 저장소에 복사하지 않는다. */
(function (root) {
    'use strict';
    const PUBLIC_BASE = 'https://ducklove.duckdns.org/radio-archive';
    const LOCAL_BASE = 'http://127.0.0.1:8766';
    function serverBase(value = LOCAL_BASE) {
        const url = new URL(value);
        if (url.username || url.password || url.search || url.hash || !/^(?:\/[A-Za-z0-9_-]+)*\/?$/.test(url.pathname)
            || (url.protocol !== 'https:' && url.origin !== LOCAL_BASE)) {
            throw Error('방송 보관함 서버 주소는 HTTPS 주소여야 합니다.');
        }
        return url.origin + url.pathname.replace(/\/$/, '');
    }
    const KEY = 'fmRadio.archiveClient';
    const CACHE = 'fmRadio.archiveAlbums.v2';
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const text = (value, fallback = '') => typeof value === 'string' ? value.slice(0, 2000) : fallback;
    function recordsFromAlbums(data) {
        if (!data || data.version !== 1 || !Array.isArray(data.albums)) throw Error('방송 음반 목록 형식이 올바르지 않습니다.');
        return data.albums.slice(0, 500).map(album => {
            if (!album || !uuid.test(album.id) || !['lp', 'cassette', 'collection'].includes(album.medium)
                || !Array.isArray(album.tracks) || !album.tracks.length || album.tracks.length > 100) throw Error('방송 음반 정보가 올바르지 않습니다.');
            const positions = new Set();
            const tracks = album.tracks.map(track => {
                if (!track || !uuid.test(track.versionId) || !Number.isInteger(track.position) || track.position < 0
                    || positions.has(track.position) || !['A', 'B'].includes(track.side)
                    || !Number.isFinite(track.durationSeconds) || track.durationSeconds <= 0) throw Error('방송 곡 버전 정보가 올바르지 않습니다.');
                positions.add(track.position);
                return { id: track.versionId, t: text(track.title, '곡명 미확인'), f: 'radio-archive/'+album.id+'/'+track.position,
                    host: 'radio-archive', archiveAlbumId: album.id, archivePosition: track.position, side: track.side,
                    durationSeconds: track.durationSeconds, sizeBytes: track.sizeBytes, review: track.review === true, available: track.available !== false,
                    composer: text(track.composer), performer: text(track.performer), program: text(track.program) };
            });
            const summary = (key, missing) => [...new Set(tracks.map(t => t[key]).filter(Boolean))].join(' / ').slice(0, 500) || missing;
            const sides = [...new Set(tracks.map(track => track.side))];
            return { id: 'radio-archive/'+album.id, archive: true, archiveBroadcast: album.category === 'broadcast-music', archiveAlbumId: album.id, archiveAllTracks: tracks,
                archiveSides: sides, side: sides[0], tracks: tracks.filter(track => track.side === sides[0]),
                title: text(album.title, '방송 음반'), composer: summary('composer', '작곡가 미확인'),
                performer: summary('performer', '연주자 미확인'), credit: 'Radio Archive · 서버에 보관된 음원',
                genre: '기타', boomboxOnly: album.medium === 'cassette', gapSeconds: Number.isFinite(album.gapSeconds) ? Math.min(30, Math.max(0,album.gapSeconds)) : 2,
                bwv: 'RADIO ARCHIVE', jacketBg: '#d6ceb8', accent: '#35493b', labelBg: '#d6ceb8',
                jTitle: text(album.title, '방송 음반'), jSub1: 'RADIO ARCHIVE', jSub2: album.medium === 'cassette' ? 'CASSETTE' : 'PERSONAL COLLECTION',
                labelBig: 'ARCHIVE', labelTitle: 'RADIO COLLECTION', labelArtist: 'PRIVATE LIBRARY' };
        });
    }
    function broadcastsFromData(data) {
        if (!data || data.version !== 1 || !Array.isArray(data.broadcasts)) throw Error('방송 원본 목록 형식이 올바르지 않습니다.');
        return data.broadcasts.slice(0,1000).map(item => {
            if (!uuid.test(item.id) || !Number.isFinite(item.durationSeconds) || item.durationSeconds <= 0) throw Error('방송 정보가 올바르지 않습니다.');
            const original=recordsFromAlbums({version:1,albums:[item.original]})[0];
            if(original.archiveAllTracks.length!==1)throw Error('방송 원본 정보가 올바르지 않습니다.');
            return {id:item.id,title:text(item.title,'방송 녹음'),program:text(item.program),stationId:text(item.stationId),
                startedAt:text(item.startedAt),durationSeconds:item.durationSeconds,original:original.archiveAllTracks[0],
                musicAlbumId:uuid.test(item.musicAlbumId)?item.musicAlbumId:null,musicTrackCount:Number(item.musicTrackCount)||0};
        });
    }
    let connection = null, notify = () => {}, receive = () => {}, receiveBroadcasts = () => {}, initialized = false, connectionEpoch = 0, onConnection = () => {};
    const audioCache = new Map();
    function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
    function status(message) { notify(message); }
    async function request(path, options = {}, bearer, base = serverBase(connection?.serverUrl || LOCAL_BASE)) {
        let response;
        try {
            response = await fetch(base+path, { ...options, redirect: 'error', cache: 'no-store', credentials: 'omit',
                headers: { ...options.headers, ...((bearer || connection?.token) ? {Authorization: 'Bearer '+(bearer || connection.token)} : {}) },
                signal: options.signal || AbortSignal.timeout(30000) });
        } catch (_) { throw Error('Radio Archive에 연결하지 못했습니다. 서버와 인터넷 연결을 확인하세요.'); }
        if (!response.ok) {
            if (response.status === 401) throw Error(connection?.public ? '방송 보관함의 공개 재생이 중지되었습니다.' : '방송 음반 연결이 만료되었거나 해제되었습니다. Radio Archive에서 다시 연결하세요.');
            const body = await response.json().catch(() => ({}));
            const error=Error(body.detail || '방송 음반 요청을 처리하지 못했습니다.');error.status=response.status;throw error;
        }
        return response.json();
    }
    async function refresh() {
        if (!connection) { connection = {serverUrl: PUBLIC_BASE, public: true};onConnection(connection); }
        const requestedConnection = connection;
        const [data,broadcastData] = await Promise.all([request('/player/albums'),request('/player/broadcasts').catch(error=>{
            if(error.status===404)return {version:1,broadcasts:[]};throw error;
        })]);
        // 연결 해제·교체 뒤 늦게 도착한 목록이 개인 음반과 저장된 캐시를 되살리면 안 된다.
        if (connection !== requestedConnection) return [];
        const records = recordsFromAlbums(data);
        const broadcasts=broadcastsFromData(broadcastData);
        localStorage.setItem(CACHE, JSON.stringify(data));
        receive(records);receiveBroadcasts(broadcasts);status(`방송 원본 ${broadcasts.length}건 · 방송 음반 ${records.filter(r=>r.archiveBroadcast).length}개 · 서버 연결됨`);
        return records;
    }
    async function connect(ticket, serverUrl) {
        const base = serverBase(serverUrl || LOCAL_BASE);
        if (!/^[A-Za-z0-9_-]{40,100}$/.test(ticket || '')) throw Error('플레이어 연결 링크 형식이 올바르지 않습니다.');
        const epoch = ++connectionEpoch;
        const pair = await request('/player/pair', { method: 'POST' }, ticket, base);
        if (epoch !== connectionEpoch) return [];
        if (!uuid.test(pair.clientId) || typeof pair.token !== 'string' || pair.token.length < 32
            || pair.token.length > 200 || !Number.isFinite(pair.expiresAt) || pair.expiresAt*1000<=Date.now()
            || pair.scope !== 'albums:read audio:read') throw Error('읽기 전용 연결을 확인하지 못했습니다.');
        connection = { ...pair, serverUrl: base };audioCache.clear();localStorage.setItem(KEY, JSON.stringify(connection));onConnection(connection);
        return refresh();
    }
    function disconnect() {
        connectionEpoch += 1;
        connection = null;audioCache.clear();localStorage.removeItem(KEY);localStorage.removeItem(CACHE);
        receive([]);receiveBroadcasts([]);status('이 앱의 방송 음반 연결을 지웠습니다. 서버에서 연결 해제하면 발급한 재생 주소도 만료됩니다.');
    }
    async function audioUrl(track, signal) {
        if (!connection) throw Error('Radio Archive 관리 화면에서 다시 연결하세요.');
        if (!track || track.host !== 'radio-archive' || !uuid.test(track.archiveAlbumId)
            || !Number.isInteger(track.archivePosition)) throw Error('방송 곡 연결 정보가 올바르지 않습니다.');
        const currentConnection=connection;
        const ticket = await request(`/player/albums/${track.archiveAlbumId}/tickets/${track.archivePosition}`, { method: 'POST', signal });
        if(connection!==currentConnection)throw Error('플레이어 연결이 바뀌었습니다. 곡을 다시 선택하세요.');
        if (!/^\/player\/audio\/[A-Za-z0-9_-]{40,100}$/.test(ticket.path)) throw Error('음원 주소를 확인하지 못했습니다.');
        const url=serverBase(currentConnection.serverUrl || LOCAL_BASE)+ticket.path;
        audioCache.set(track.id,{url,expires:Date.now()+Math.max(0,Number(ticket.expiresIn)||0)*1000});
        return url;
    }
    function cachedAudioUrl(track) { const cached=audioCache.get(track?.id);return cached&&cached.expires>Date.now()+15000?cached.url:''; }
    function invalidateAudioUrl(track) { audioCache.delete(track?.id); }
    function init(options) {
        if (initialized) return;initialized = true;
        receive = options.onRecords;receiveBroadcasts=options.onBroadcasts || (()=>{});notify = options.onStatus;connection = read(KEY);onConnection = options.onConnection || (() => {});
        const ticket = root.MFA_ARCHIVE_PAIR_TICKET;delete root.MFA_ARCHIVE_PAIR_TICKET;
        const serverUrl = root.MFA_ARCHIVE_SERVER_URL;delete root.MFA_ARCHIVE_SERVER_URL;
        if (ticket) { status('읽기 전용 방송 음반 연결 중입니다.');void connect(ticket, serverUrl).catch(error => status(error.message)); }
        else {
            if (!connection?.serverUrl || [LOCAL_BASE,PUBLIC_BASE].includes(connection.serverUrl)) {
                connection = {serverUrl: PUBLIC_BASE, public: true};
                localStorage.setItem(KEY, JSON.stringify(connection));
            }
            onConnection(connection);
            try { const cached = read(CACHE);if (cached) receive(recordsFromAlbums(cached)); } catch (_) {}
            status('방송 음반 서버를 확인합니다.');void refresh().catch(error => status(error.message));
        }
    }
    const api = { serverBase, recordsFromAlbums, broadcastsFromData, init, refresh, disconnect, audioUrl, cachedAudioUrl, invalidateAudioUrl };
    root.RadioArchiveClient = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
