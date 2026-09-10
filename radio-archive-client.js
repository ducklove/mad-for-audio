/* Radio Archive의 읽기 전용 음반 연결. 음원과 관리 토큰은 앱 저장소에 복사하지 않는다. */
(function (root) {
    'use strict';
    const BASE = 'http://127.0.0.1:8766';
    const KEY = 'fmRadio.archiveClient';
    const CACHE = 'fmRadio.archiveAlbums';
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
                    durationSeconds: track.durationSeconds, sizeBytes: track.sizeBytes, review: track.review === true,
                    composer: text(track.composer), performer: text(track.performer), program: text(track.program) };
            });
            const summary = (key, missing) => [...new Set(tracks.map(t => t[key]).filter(Boolean))].join(' / ').slice(0, 500) || missing;
            const sides = [...new Set(tracks.map(track => track.side))];
            return { id: 'radio-archive/'+album.id, archive: true, archiveAlbumId: album.id, archiveAllTracks: tracks,
                archiveSides: sides, side: sides[0], tracks: tracks.filter(track => track.side === sides[0]),
                title: text(album.title, '방송 음반'), composer: summary('composer', '작곡가 미확인'),
                performer: summary('performer', '연주자 미확인'), credit: 'Radio Archive · 서버에 보관된 음원',
                genre: '기타', boomboxOnly: album.medium === 'cassette', gapSeconds: Number.isFinite(album.gapSeconds) ? Math.min(30, Math.max(0,album.gapSeconds)) : 2,
                bwv: 'RADIO ARCHIVE', jacketBg: '#d6ceb8', accent: '#35493b', labelBg: '#d6ceb8',
                jTitle: text(album.title, '방송 음반'), jSub1: 'RADIO ARCHIVE', jSub2: album.medium === 'cassette' ? 'CASSETTE' : 'PERSONAL COLLECTION',
                labelBig: 'ARCHIVE', labelTitle: 'RADIO COLLECTION', labelArtist: 'PRIVATE LIBRARY' };
        });
    }
    let connection = null, notify = () => {}, receive = () => {}, initialized = false, connectionEpoch = 0;
    const audioCache = new Map();
    function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
    function status(message) { notify(message); }
    async function request(path, options = {}, bearer) {
        let response;
        try {
            response = await fetch(BASE+path, { ...options, redirect: 'error', cache: 'no-store', credentials: 'omit',
                headers: { ...options.headers, Authorization: 'Bearer '+(bearer || connection?.token || '') },
                signal: options.signal || AbortSignal.timeout(30000) });
        } catch (_) { throw Error('이 PC의 Radio Archive에 연결하지 못했습니다. 서버 실행과 브라우저의 로컬 네트워크 접근을 확인하세요.'); }
        if (!response.ok) {
            if (response.status === 401) throw Error('방송 음반 연결이 만료되었거나 해제되었습니다. Radio Archive에서 다시 연결하세요.');
            const body = await response.json().catch(() => ({}));
            throw Error(body.detail || '방송 음반 요청을 처리하지 못했습니다.');
        }
        return response.json();
    }
    async function refresh() {
        if (!connection) throw Error('Radio Archive 관리 화면에서 플레이어 연결 링크를 열어 주세요.');
        const requestedConnection = connection;
        const data = await request('/player/albums');
        // 연결 해제·교체 뒤 늦게 도착한 목록이 개인 음반과 저장된 캐시를 되살리면 안 된다.
        if (connection !== requestedConnection) return [];
        const records = recordsFromAlbums(data);
        localStorage.setItem(CACHE, JSON.stringify(data));
        receive(records);status(`내 방송 음반 ${records.length}장 연결됨 · 파일은 서버에서 재생합니다.`);
        return records;
    }
    async function connect(ticket) {
        if (!/^[A-Za-z0-9_-]{40,100}$/.test(ticket || '')) throw Error('플레이어 연결 링크 형식이 올바르지 않습니다.');
        const epoch = ++connectionEpoch;
        const pair = await request('/player/pair', { method: 'POST' }, ticket);
        if (epoch !== connectionEpoch) return [];
        if (!uuid.test(pair.clientId) || typeof pair.token !== 'string' || pair.token.length < 32
            || pair.token.length > 200 || !Number.isFinite(pair.expiresAt) || pair.expiresAt*1000<=Date.now()
            || pair.scope !== 'albums:read audio:read') throw Error('읽기 전용 연결을 확인하지 못했습니다.');
        connection = pair;audioCache.clear();localStorage.setItem(KEY, JSON.stringify(pair));
        return refresh();
    }
    function disconnect() {
        connectionEpoch += 1;
        connection = null;audioCache.clear();localStorage.removeItem(KEY);localStorage.removeItem(CACHE);
        receive([]);status('이 앱의 방송 음반 연결을 지웠습니다. 서버에서 연결 해제하면 발급한 재생 주소도 만료됩니다.');
    }
    async function audioUrl(track, signal) {
        if (!connection) throw Error('Radio Archive 관리 화면에서 다시 연결하세요.');
        if (!track || track.host !== 'radio-archive' || !uuid.test(track.archiveAlbumId)
            || !Number.isInteger(track.archivePosition)) throw Error('방송 곡 연결 정보가 올바르지 않습니다.');
        const currentConnection=connection;
        const ticket = await request(`/player/albums/${track.archiveAlbumId}/tickets/${track.archivePosition}`, { method: 'POST', signal });
        if(connection!==currentConnection)throw Error('플레이어 연결이 바뀌었습니다. 곡을 다시 선택하세요.');
        if (!/^\/player\/audio\/[A-Za-z0-9_-]{40,100}$/.test(ticket.path)) throw Error('음원 주소를 확인하지 못했습니다.');
        const url=BASE+ticket.path;
        audioCache.set(track.id,{url,expires:Date.now()+Math.max(0,Number(ticket.expiresIn)||0)*1000});
        return url;
    }
    function cachedAudioUrl(track) { const cached=audioCache.get(track?.id);return cached&&cached.expires>Date.now()+15000?cached.url:''; }
    function invalidateAudioUrl(track) { audioCache.delete(track?.id); }
    function init(options) {
        if (initialized) return;initialized = true;
        receive = options.onRecords;notify = options.onStatus;connection = read(KEY);
        const ticket = root.MFA_ARCHIVE_PAIR_TICKET;delete root.MFA_ARCHIVE_PAIR_TICKET;
        if (ticket) { status('읽기 전용 방송 음반 연결 중입니다.');void connect(ticket).catch(error => status(error.message)); }
        else if (connection) {
            try { const cached = read(CACHE);if (cached) receive(recordsFromAlbums(cached)); } catch (_) {}
            status('이 PC의 방송 음반 서버를 확인합니다.');void refresh().catch(error => status(error.message));
        } else status('Radio Archive 관리 화면의 ‘mad-for-audio에서 듣기’에서 연결할 수 있습니다.');
    }
    const api = { recordsFromAlbums, init, refresh, disconnect, audioUrl, cachedAudioUrl, invalidateAudioUrl };
    root.RadioArchiveClient = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window === 'undefined' ? globalThis : window);
