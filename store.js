// 저장소 모듈 — localStorage JSON 헬퍼 + 녹음 IndexedDB.
// 클래식 스크립트 — 전역 렉시컬 스코프를 공유한다. 로드 순서: store→skins→engine→deck→app.

let recDb = null;

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(error);
    }
}

function openRecordingDb() {
    if (!window.indexedDB) return;
    try {
        const request = indexedDB.open("fm-radio", 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore("recordings", { keyPath: "id", autoIncrement: true });
        };
        request.onsuccess = () => {
            recDb = request.result;
            restoreRecordings();
            updateRecordingsNote();
        };
        request.onerror = () => {
            console.error(request.error);
        };
    } catch (error) {
        console.error(error);
    }
}

function idbAddRecording(record) {
    return new Promise((resolve) => {
        try {
            const request = recDb
                .transaction("recordings", "readwrite")
                .objectStore("recordings")
                .add(record);
            request.onsuccess = () => resolve({ ok: true, id: request.result });
            request.onerror = () => resolve({ ok: false, error: request.error });
        } catch (error) {
            resolve({ ok: false, error });
        }
    });
}

async function persistRecording(record) {
    if (!recDb) return null;
    const direct = await idbAddRecording(record);
    if (direct.ok) return direct.id;
    // 일부 WebKit(사파리 사생활 보호·임시 세션)은 Blob/File을 IDB에 못 담는다.
    // ArrayBuffer로 풀어 저장하고 복원 시 Blob으로 되살린다.
    try {
        const buf = await record.blob.arrayBuffer();
        const flat = { ...record, blob: null, blobBuf: buf, blobType: record.blob.type || record.type || "" };
        const retry = await idbAddRecording(flat);
        if (!retry.ok) console.error("녹음 저장 실패:", retry.error);
        return retry.ok ? retry.id : null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function deleteRecording(dbId) {
    if (!recDb || dbId == null) return;
    try {
        recDb.transaction("recordings", "readwrite").objectStore("recordings").delete(dbId);
    } catch (error) {
        console.error(error);
    }
}

function restoreRecordings() {
    try {
        const request = recDb.transaction("recordings").objectStore("recordings").getAll();
        request.onsuccess = () => {
            for (const saved of request.result) {
                const rec = { ...saved, dbId: saved.id };
                // ArrayBuffer 폴백으로 저장된 녹음은 Blob으로 되살린다
                if (!rec.blob && rec.blobBuf) rec.blob = new Blob([rec.blobBuf], { type: rec.blobType || rec.type || "audio/webm" });
                addRecordingItem(rec);
            }
        };
    } catch (error) {
        console.error(error);
    }
}
