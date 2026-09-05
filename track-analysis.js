/* 예약 녹음의 PC 후처리. API 비밀키는 PC에만 저장하며 이 파일은 연결 코드만 사용한다. */
(function () {
    "use strict";
    const BASE = "http://127.0.0.1:8766";
    const KEY = "fmRadio.trackAnalysis";
    const pairingTicket = new URLSearchParams(location.hash.slice(1)).get("pc-analysis-pair");
    if (pairingTicket !== null) history.replaceState(null, "", location.pathname + location.search);
    let config = {};
    try { config = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}
    const pending = new Map();
    const completed = new Set();
    const previewURLs = new Set();
    let sending = false, refreshing = false, connected = false, available = false, metadataReviewAvailable = false;
    const host = document.getElementById("trackAnalysisPanel");
    if (!host) return;
    const el = (tag, text, cls) => {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (cls) node.className = cls;
        return node;
    };
    const message = host.querySelector("[data-analysis-status]");
    const jobsEl = host.querySelector("[data-analysis-jobs]");
    const tokenInput = host.querySelector("[data-analysis-token]");
    const enabledInput = host.querySelector("[data-analysis-enabled]");
    const cloudInput = host.querySelector("[data-analysis-cloud]");
    const capInput = host.querySelector("[data-analysis-cap]");
    tokenInput.value = config.token || "";
    enabledInput.checked = config.enabled === true;
    cloudInput.checked = config.cloudFallback !== false;
    capInput.value = Number.isInteger(config.maxCloudSeconds) ? config.maxCloudSeconds / 60 : 10;
    function setAvailable(value) {
        available = value;
        // 연결 코드는 이 기기에만 저장된다. 연결했던 PC는 오프라인 안내도 남긴다.
        host.hidden = !available && !config.token && pairingTicket === null;
        [enabledInput, cloudInput, capInput].forEach(input => { input.disabled = !available; });
        document.querySelectorAll("[data-analysis-res]").forEach(button => { button.hidden = !available; });
    }
    setAvailable(false);
    if (config.token) message.textContent = "PC 분석 서비스 연결 확인 중…";
    function save() {
        config = {token: tokenInput.value.trim(), enabled: enabledInput.checked,
            cloudFallback: cloudInput.checked, maxCloudSeconds: Math.max(0, Math.min(60, Number(capInput.value) || 0)) * 60};
        try { localStorage.setItem(KEY, JSON.stringify(config)); } catch (_) {}
    }
    [enabledInput, cloudInput, capInput].forEach(input => input.addEventListener("change", save));
    function options() {
        if (!available) return null;
        return {enabled: true, cloudFallback: config.cloudFallback !== false,
            maxCloudSeconds: Number.isInteger(config.maxCloudSeconds) ? config.maxCloudSeconds : 600};
    }
    async function request(path, init = {}) {
        if (!config.token) throw new Error("PC 분석 서비스의 연결 코드를 입력하세요. 원본 녹음은 보관됩니다.");
        let response;
        try {
            response = await fetch(BASE + path, {...init, headers: {
                ...init.headers, Authorization: "Bearer " + config.token
            }, signal: AbortSignal.timeout(init.body instanceof Blob ? 900000 : 120000)});
        } catch (_) {
            throw new Error("PC 분석 서비스 연결 끊김 · 15초마다 다시 연결합니다. 계속 연결되지 않으면 PC 분석 서비스를 실행하고 로컬 네트워크 접근 허용을 확인하세요.");
        }
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const error = new Error(typeof data.detail === "string" ? data.detail : "PC 분석 요청에 실패했습니다.");
            error.status = response.status;
            throw error;
        }
        return response;
    }
    async function download(path, name, preview) {
        const blob = await (await request(path)).blob();
        const url = URL.createObjectURL(blob);
        if (preview) {
            if (preview.dataset.blobUrl) { URL.revokeObjectURL(preview.dataset.blobUrl); previewURLs.delete(preview.dataset.blobUrl); }
            preview.dataset.blobUrl = url;
            previewURLs.add(url);
            preview.src = url;
            preview.hidden = false;
            await preview.play().catch(() => {});
        } else {
            const link = el("a");
            link.href = url; link.download = name;
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
    }
    function button(text, action) {
        const node = el("button", text, "res-btn");
        node.type = "button";
        node.addEventListener("click", async () => {
            node.disabled = true;
            try { await action(); } catch (error) { message.textContent = error.message; }
            finally { node.disabled = false; }
        });
        return node;
    }
    function field(form, label, key, value, numeric) {
        const wrap = el("label", label);
        const input = el("input");
        input.name = key; input.value = value || (numeric ? 0 : "");
        input.type = numeric ? "number" : "text";
        if (numeric) { input.min = "0"; input.step = "0.001"; input.required = true; }
        else input.maxLength = 500;
        wrap.append(input); form.append(wrap);
        return input;
    }
    function render(jobs) {
        // 편집 중인 입력과 재생 중인 미리 듣기를 주기 갱신으로 날리지 않는다.
        if (jobsEl.contains(document.activeElement) || [...jobsEl.querySelectorAll("audio")].some(a => !a.paused)) return;
        const opened = new Set([...jobsEl.querySelectorAll("details[open]")].map(d => d.dataset.key));
        for (const url of previewURLs) URL.revokeObjectURL(url);
        previewURLs.clear();
        jobsEl.replaceChildren();
        for (const job of jobs.slice(0, 50)) {
            const details = el("details", "", "analysis-job");
            details.dataset.key = job.id; details.open = opened.has(job.id);
            details.append(el("summary", `${job.name} · ${job.message}`));
            const started = job.startedAt ? new Date(job.startedAt).toLocaleString("ko-KR") : "";
            details.append(el("p", `${started} · Gemini 전송 ${Math.ceil(job.cloudSeconds || 0)}초 / ${job.cloudCalls || 0}회`));
            if (["error", "review"].includes(job.status)) details.append(button("다시 분석", async () => {
                await request(`/jobs/${job.id}/retry`, {method: "POST"}); await refresh();
            }));
            if (["done", "review"].includes(job.status)) details.append(button("전체 곡 ZIP 저장", () =>
                download(`/jobs/${job.id}/archive`, `${job.name}-분리된-곡.zip`)));
            if (metadataReviewAvailable && ["done", "review"].includes(job.status) && job.tracks?.length) details.append(button("곡 정보만 재검토", async () => {
                await request(`/jobs/${job.id}/metadata`, {method: "POST"}); await refresh();
            }));
            if (job.metadataNotice) details.append(el("p", job.metadataNotice, "analysis-warning"));
            if (job.source === "server-recorder" && job.status !== "recording") details.append(button("녹음 원본 저장", () =>
                download(`/jobs/${job.id}/files/original`, `${job.name}.m4a`)));
            if (job.recordingNote) details.append(el("p", job.recordingNote));
            for (const part of job.unresolved || []) details.append(el("p",
                `${part.start.toFixed(1)}~${part.end.toFixed(1)}초 미분리 · ${part.reason}`, "analysis-warning"));
            for (const track of job.tracks || []) {
                const row = el("details", "", "analysis-track");
                row.dataset.key = `${job.id}-${track.id}`; row.open = opened.has(row.dataset.key);
                row.append(el("summary", `${track.id}. ${track.title || "곡명 미확인"} · ${track.composer || "작곡가 미확인"} · ${track.performer || "연주자 미확인"}${track.review ? " · 확인 필요" : ""}`));
                row.append(el("p", `${track.start.toFixed(1)}~${track.end.toFixed(1)}초 · ${track.source === "user" ? "직접 확인" : track.source === "gemini-review" ? "Gemini 참고 정보" : track.source === "transcript-review" ? "멘트 전사에서 추출 · 인명 표기 확인 필요" : "로컬 분석"}`));
                if (track.evidence) row.append(el("blockquote", track.evidence));
                if (track.note) row.append(el("p", track.note, "analysis-warning"));
                const audio = el("audio"); audio.controls = true; audio.hidden = true;
                const path = `/jobs/${job.id}/files/track-${track.id}.flac`;
                row.append(button("곡 미리 듣기", () => download(path, "", audio)),
                    button("곡 저장", () => download(path, `${track.id} ${track.title || "곡명 미확인"}.flac`)));
                if (job.duration) {
                    for (const [label, point] of [["시작 경계 듣기", track.start], ["종료 경계 듣기", track.end]]) {
                        row.append(button(label, () => download(`/jobs/${job.id}/preview?start=${Math.max(0, point - 10)}&end=${Math.min(job.duration, point + 10)}`, "", audio)));
                    }
                }
                row.append(audio);
                const form = el("form", "", "analysis-edit");
                field(form, "곡명", "title", track.title);
                field(form, "작곡가", "composer", track.composer);
                field(form, "연주자·지휘자·악단", "performer", track.performer);
                field(form, "시작(초)", "start", track.start, true);
                field(form, "종료(초)", "end", track.end, true);
                const submit = el("button", "수정·확인 후 저장", "res-btn"); submit.type = "submit"; form.append(submit);
                form.addEventListener("submit", async event => {
                    event.preventDefault(); submit.disabled = true;
                    try {
                        const data = Object.fromEntries(new FormData(form));
                        await request(`/jobs/${job.id}/tracks/${track.id}`, {method: "POST",
                            headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)});
                        submit.blur(); await refresh(); message.textContent = "곡 파일과 태그를 수정했습니다.";
                    } catch (error) { message.textContent = error.message; }
                    finally { submit.disabled = false; }
                });
                row.append(form); details.append(row);
            }
            jobsEl.append(details);
        }
        if (!jobs.length) jobsEl.append(el("p", "자동 분리를 켠 예약 녹음이 끝나면 이곳에 곡이 표시됩니다."));
    }
    async function refresh() {
        if (refreshing || !config.token) return;
        refreshing = true;
        try {
            const health = await (await request("/health")).json();
            metadataReviewAvailable = health.metadataReview === true;
            connected = true;
            setAvailable(health.localConfigured === true);
            message.textContent = `${health.localConfigured ? "PC 분석 서비스 연결됨" : "PC 모델 설치가 필요합니다"} · ${health.geminiConfigured ? (health.geminiProvider === "openrouter" ? "OpenRouter · Gemini 보완 사용 가능" : "Gemini 보완 사용 가능") : "Gemini 키 미등록 · 로컬 분석 사용"}${pending.size ? ` · 전송 대기 ${pending.size}건` : ""}`;
            render(await (await request("/jobs")).json());
            if (health.serverRecorder) await refreshRecorder();
        } catch (error) { connected = false; setAvailable(false); message.textContent = error.message; }
        finally { refreshing = false; }
        if (connected) void flush();
    }
    async function flush() {
        if (sending || !available || !config.token || !pending.size) return;
        sending = true;
        try {
            for (const [id, record] of pending) {
                try {
                    let exists = false;
                    try { await request(`/jobs/${id}`); exists = true; }
                    catch (error) { if (error.status !== 404) throw error; }
                    if (exists) { pending.delete(id); completed.add(id); continue; }
                    await request(`/jobs/${id}`, {method: "PUT", headers: {
                        "Content-Type": "application/octet-stream",
                        "X-MFA-Meta": encodeURIComponent(JSON.stringify({stationName: record.stationName,
                            startedAt: record.startedAt, options: record.trackAnalysis}))
                    }, body: record.blob});
                    pending.delete(id); completed.add(id);
                } catch (error) { message.textContent = `${error.message} · 원본 보관, 전송 대기 ${pending.size}건`; break; }
            }
        } finally { sending = false; }
    }
    function register(record) {
        if (!record.trackAnalysis?.enabled || !record.analysisId || completed.has(record.analysisId)) return;
        pending.set(record.analysisId, record);
        message.textContent = `곡 분리 전송 대기 ${pending.size}건 · 원본 녹음은 보관됩니다.`;
        void flush();
    }
    host.querySelector("[data-analysis-connect]").addEventListener("click", () => { save(); void refresh(); });
    host.querySelector("[data-analysis-refresh]").addEventListener("click", () => void refresh());
    window.MFA_TrackAnalysis = Object.freeze({register, options,
        isAvailable: () => available,
        forNewReservation: () => available && config.enabled ? options() : null});
    // 연결이 꺼져 있어도 다음 앱 실행 시 IndexedDB의 원본에서 재전송한다.
    setInterval(() => { if (config.token) void refresh(); }, 15000);
    async function pairPC() {
        // 이 파일 뒤에 bootstrap.js가 MFA_READY를 만든다. 첫 방문의 느린 로딩도 기다린다.
        if (document.readyState === "loading") {
            await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, {once: true}));
        }
        await window.MFA_READY;
        if (typeof window.openSchedule === "function") window.openSchedule();
        if (typeof window.schedSetView === "function") window.schedSetView("res");
        host.open = true;
        message.textContent = "이 PC의 분석 서버를 연결하는 중…";
        try {
            if (!/^[A-Za-z0-9_-]{43}$/.test(pairingTicket)) throw new Error("PC 연결 링크가 올바르지 않습니다.");
            const response = await fetch(BASE + "/pair", {method: "POST",
                headers: {Authorization: "Bearer " + pairingTicket}, signal: AbortSignal.timeout(30000)});
            if (!response.ok) throw new Error("PC 연결 링크가 만료됐거나 사용할 수 없습니다. PC 연결 도구를 다시 실행하세요.");
            const data = await response.json();
            if (typeof data.token !== "string" || data.token.length < 32) throw new Error("PC 연결 응답이 올바르지 않습니다.");
            tokenInput.value = data.token;
            save();
            await refresh();
        } catch (error) {
            message.textContent = error instanceof TypeError ? "PC 연결 실패: 서버 실행과 브라우저의 로컬 네트워크 접근 허용을 확인하세요." : error.message;
        }
    }
    if (pairingTicket !== null) void pairPC();
    else if (config.token) void refresh();

    const recorderPanel = host.querySelector("[data-recorder-panel]");
    const recorderForm = host.querySelector("[data-recorder-form]");
    const recorderMessage = host.querySelector("[data-recorder-status]");
    const recorderRules = host.querySelector("[data-recorder-rules]");
    const control = name => host.querySelector(`[data-recorder-${name}]`);
    let recorderData = null;
    const hhmm = minute => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    const minuteOf = value => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
    function fillRecorder(rule) {
        for (const option of control("channels").options) option.selected = option.value === rule.stationId;
        control("start").value = hhmm(rule.startMinute);
        control("end").value = hhmm(rule.endMinute);
        control("programs").value = rule.programs.join("\n");
        control("mode").value = rule.splitTracks ? "tracks" : "original";
        control("reruns").checked = rule.excludeReruns;
        control("cloud").checked = rule.cloudFallback;
        control("cap").value = rule.maxCloudSeconds / 60;
        control("segment").value = rule.segmentMinutes;
        for (const input of control("days").querySelectorAll("input")) input.checked = rule.weekdays.includes(Number(input.value));
    }
    async function refreshRecorder() {
        try {
            const data = await (await request("/recorder")).json();
            if (!recorderData) {
                for (const channel of data.channels) {
                    const option = el("option", channel.name + (channel.rerunSupported ? "" : " · 재방 구분 미지원"));
                    option.value = channel.id; option.selected = channel.id === "kbs1fm";
                    control("channels").append(option);
                }
                ["월", "화", "수", "목", "금", "토", "일"].forEach((day, index) => {
                    const label = el("label", day), input = el("input");
                    input.type = "checkbox"; input.value = index; input.checked = true;
                    label.prepend(input); control("days").append(label);
                });
                if (data.rules.length) fillRecorder(data.rules[0]);
            }
            recorderData = data;
            recorderPanel.hidden = false;
            recorderMessage.textContent = `PC 녹음 설정 ${data.rules.length}개 · 분석 대기 ${data.queuedJobs}건 · 여유 ${(data.freeBytes / 1024 ** 3).toFixed(1)}GB`;
            recorderRules.replaceChildren();
            for (const rule of data.rules) {
                const channel = data.channels.find(c => c.id === rule.stationId);
                const row = el("div", "", "recorder-rule");
                row.append(el("p", `${channel.name} · ${rule.enabled ? "켜짐" : "꺼짐"} · ${hhmm(rule.startMinute)}–${hhmm(rule.endMinute)} · ${rule.splitTracks ? "곡 분리" : "원본만"}`));
                row.append(el("p", data.runtime[rule.stationId]?.message || "녹음 대기"));
                row.append(button("설정 불러오기", () => fillRecorder(rule)));
                row.append(button(rule.enabled ? "서버 녹음 끄기" : "서버 녹음 켜기", async () => {
                    await saveRecorder(data.rules.map(r => r.stationId === rule.stationId ? {...r, enabled: !r.enabled} : r));
                }));
                row.append(button("녹음 설정 삭제", () => saveRecorder(data.rules.filter(r => r.stationId !== rule.stationId))));
                recorderRules.append(row);
            }
        } catch (error) { recorderMessage.textContent = error.message; }
    }
    async function saveRecorder(rules) {
        await request("/recorder", {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({rules})});
        await refreshRecorder();
        await refresh();
    }
    recorderForm?.addEventListener("submit", async event => {
        event.preventDefault();
        if (!recorderData || !available) return;
        const submit = recorderForm.querySelector("button[type=submit]");
        submit.disabled = true;
        try {
            const selected = [...control("channels").selectedOptions].map(option => option.value);
            const weekdays = [...control("days").querySelectorAll("input:checked")].map(input => Number(input.value));
            const rule = {enabled: true, startMinute: minuteOf(control("start").value), endMinute: minuteOf(control("end").value),
                weekdays, programs: control("programs").value.split("\n").map(value => value.trim()).filter(Boolean),
                splitTracks: control("mode").value === "tracks", excludeReruns: control("reruns").checked,
                cloudFallback: control("cloud").checked, maxCloudSeconds: Number(control("cap").value) * 60,
                segmentMinutes: Number(control("segment").value)};
            await saveRecorder([...recorderData.rules.filter(r => !selected.includes(r.stationId)), ...selected.map(stationId => ({...rule, stationId}))]);
        } catch (error) { recorderMessage.textContent = error.message; }
        finally { submit.disabled = false; }
    });
})();
