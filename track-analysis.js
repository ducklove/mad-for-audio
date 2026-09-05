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
    const searchInput = host.querySelector("[data-analysis-search]");
    const filterInput = host.querySelector("[data-analysis-filter]");
    let latestJobs = [], shownBroadcasts = 12;
    const expanded = new Set();
    const activeStatuses = new Set(["recording", "queued", "running", "editing"]);
    const statusNames = {recording: "녹음 중", queued: "분석 대기", running: "분석 중", editing: "수정 중",
        error: "처리 중단", review: "확인 필요", done: "저장 완료", recorded: "원본 저장"};
    const needsReview = track => track.review || !track.title || !track.composer || !track.performer;
    const stamp = job => Date.parse(job.startedAt) || Number(job.createdAt || 0) * 1000;
    const dayOf = ms => ms ? new Date(ms + 9 * 3600000).toISOString().slice(0, 10) : "날짜 미확인";
    const clockOf = ms => ms ? new Date(ms).toLocaleTimeString("ko-KR", {timeZone: "Asia/Seoul", hour12: false, hour: "2-digit", minute: "2-digit"}) : "시간 미확인";
    function disclosure(cls, key, opened = false) {
        const node = el("details", "", cls);
        node.dataset.key = key; node.open = expanded.has(key) || opened;
        node.addEventListener("toggle", () => {
            if (!node.isConnected) return;
            if (node.open) expanded.add(key); else expanded.delete(key);
        });
        return node;
    }
    function broadcasts(jobs) {
        const groups = new Map();
        for (const job of jobs) {
            const time = stamp(job), date = dayOf(time);
            const known = job.program?.scheduleKnown && job.program?.title;
            const title = known ? job.program.title : job.name || "라디오 녹음";
            const station = known ? (job.name || "").split(" · ")[0] : "";
            // 편성이 없는 수동 녹음은 이름만으로 같은 방송이라고 단정하지 않는다.
            const key = known ? JSON.stringify([job.stationId || station, title, date, job.program.rerun]) : job.id;
            if (!groups.has(key)) groups.set(key, {key, title, station, date, time, jobs: []});
            const group = groups.get(key);
            group.time = Math.min(group.time, time); group.jobs.push(job);
        }
        return [...groups.values()].sort((a, b) => b.time - a.time).map(group => {
            group.jobs.sort((a, b) => stamp(a) - stamp(b));
            group.tracks = group.jobs.flatMap(job => (job.tracks || []).map(track => ({job, track})))
                .sort((a, b) => (stamp(a.job) + a.track.start * 1000) - (stamp(b.job) + b.track.start * 1000));
            group.review = group.tracks.filter(({track}) => needsReview(track)).length;
            group.errors = group.jobs.filter(job => job.status === "error").length;
            group.unresolved = group.jobs.reduce((n, job) => n + (job.unresolved || []).length, 0);
            group.active = group.jobs.some(job => activeStatuses.has(job.status));
            return group;
        });
    }
    for (const input of [searchInput, filterInput]) input.addEventListener("input", () => {
        shownBroadcasts = 12; render(latestJobs);
    });
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
        latestJobs = jobs;
        // 편집 중인 입력과 재생 중인 미리 듣기를 주기 갱신으로 날리지 않는다.
        if ((jobsEl.contains(document.activeElement) && document.activeElement.closest("form")) || [...jobsEl.querySelectorAll("audio")].some(a => !a.paused)) return;
        jobsEl.querySelectorAll("details").forEach(node => {
            if (node.open) expanded.add(node.dataset.key); else expanded.delete(node.dataset.key);
        });
        for (const url of previewURLs) URL.revokeObjectURL(url);
        previewURLs.clear();
        jobsEl.replaceChildren();
        const all = broadcasts(jobs), query = searchInput.value.trim().toLocaleLowerCase();
        const filtered = all.filter(group => {
            if (filterInput.value === "active" && !group.active) return false;
            if (filterInput.value === "review" && !(group.review || group.errors || group.unresolved || group.jobs.some(j => j.status === "review"))) return false;
            return !query || [group.title, group.station, group.date, ...group.tracks.flatMap(({track}) =>
                [track.title, track.composer, track.performer])].join(" ").toLocaleLowerCase().includes(query);
        });
        host.querySelector("[data-analysis-count]").textContent = `${all.length}개 방송 · ${all.reduce((n, g) => n + g.tracks.length, 0)}곡${jobs.length >= 50 ? " · 최근 녹음 50개 기준" : ""}`;
        for (const group of filtered.slice(0, shownBroadcasts)) {
            const card = disclosure("analysis-broadcast", "broadcast:" + group.key);
            const summary = el("summary", "", "analysis-broadcast-summary");
            const heading = el("div", "", "analysis-broadcast-heading");
            heading.append(el("span", `${group.date} · ${group.station || "직접 녹음"}`, "analysis-eyebrow"),
                el("strong", group.title, "analysis-broadcast-title"));
            const badges = el("div", "", "analysis-badges");
            badges.append(el("span", `${group.tracks.length}곡`, "analysis-badge"));
            if (group.active) {
                const live = group.jobs.find(j => j.status === "recording") || group.jobs.find(j => activeStatuses.has(j.status));
                badges.append(el("span", statusNames[live.status], "analysis-badge is-active"));
            }
            if (group.review) badges.append(el("span", `정보 확인 ${group.review}`, "analysis-badge is-review"));
            if (group.errors) badges.append(el("span", `처리 중단 ${group.errors}`, "analysis-badge is-review"));
            if (group.unresolved) badges.append(el("span", `미분리 ${group.unresolved}`, "analysis-badge is-review"));
            heading.append(badges); summary.append(heading); card.append(summary);
            const body = el("div", "", "analysis-broadcast-body");
            body.append(el("p", `${clockOf(group.time)}부터 녹음 · 원본 ${group.jobs.length}개 · 한국 시간`, "analysis-broadcast-meta"));
            const trackList = el("div", "", "analysis-track-list");
            group.tracks.forEach(({job, track}, index) => trackList.append(renderTrack(job, track, index + 1)));
            if (!group.tracks.length) trackList.append(el("p", group.active ? "곡을 준비하고 있습니다. 분석이 끝나면 여기에 표시됩니다." : "저장된 곡이 없습니다. 아래 녹음 파일에서 원본과 처리 상태를 확인하세요.", "analysis-empty"));
            body.append(trackList);
            const files = disclosure("analysis-files", "files:" + group.key);
            files.append(el("summary", `녹음 파일 및 분석 관리 · ${group.jobs.length}개`));
            group.jobs.forEach((job, index) => files.append(renderJob(job, index + 1)));
            body.append(files); card.append(body); jobsEl.append(card);
        }
        if (filtered.length > shownBroadcasts) jobsEl.append(button(`방송 더 보기 (${filtered.length - shownBroadcasts}개)`, () => {
            shownBroadcasts += 12; render(latestJobs);
        }));
        if (!filtered.length) jobsEl.append(el("p", jobs.length ? "조건에 맞는 방송이 없습니다." : "녹음한 방송이 아직 없습니다. 아래에서 예약 곡 분리나 PC 상시 녹음을 설정하세요.", "analysis-empty"));
    }
    function renderJob(job, number) {
        const details = disclosure("analysis-job", "job:" + job.id);
        details.append(el("summary", `원본 ${String(number).padStart(2, "0")} · ${clockOf(stamp(job))} · ${statusNames[job.status] || "상태 확인"}`));
        details.append(el("p", job.message || "처리 상태를 확인하세요."));
        details.append(el("p", `Gemini 전송 ${Math.ceil(job.cloudSeconds || 0)}초 / ${job.cloudCalls || 0}회`));
        if (["error", "review"].includes(job.status)) details.append(button("다시 분석", async () => {
            await request(`/jobs/${job.id}/retry`, {method: "POST"}); await refresh();
        }));
        if (["done", "review"].includes(job.status)) details.append(button("이 파일의 곡 ZIP 저장", () =>
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
        return details;
    }
    function renderTrack(job, track, number) {
        const row = disclosure("analysis-track", `track:${job.id}-${track.id}`);
        const summary = el("summary", "", "analysis-track-summary");
        const name = el("span", "", "analysis-track-name");
        name.append(el("strong", track.title || "곡명 미확인"),
            el("span", track.composer || "작곡가 미확인", "analysis-track-composer"),
            el("span", track.performer || "연주자 미확인", "analysis-track-performer"));
        if (needsReview(track)) name.append(el("span", "정보 확인 필요", "analysis-track-review"));
        const length = Math.max(0, Math.round(track.end - track.start));
        summary.append(el("span", String(number).padStart(2, "0"), "analysis-track-number"), name,
            el("span", `${Math.floor(length / 60)}:${String(length % 60).padStart(2, "0")}`, "analysis-track-length"));
        row.append(summary);
        const content = el("div", "", "analysis-track-content");
        content.append(el("p", `원본 ${clockOf(stamp(job))} · 파일 내 ${track.start.toFixed(1)}~${track.end.toFixed(1)}초`));
        content.append(el("p", track.source === "user" ? "직접 확인한 정보" : "자동 추출한 정보입니다. 소개 멘트와 대조해 곡명·연주자를 확인하세요."));
        if (track.evidence) content.append(el("blockquote", track.evidence));
        if (track.note) content.append(el("p", track.note, "analysis-warning"));
        const audio = el("audio"); audio.controls = true; audio.hidden = true;
        const path = `/jobs/${job.id}/files/track-${track.id}.flac`;
        content.append(button("곡 미리 듣기", () => download(path, "", audio)),
            button("곡 저장", () => download(path, `${track.id} ${track.title || "곡명 미확인"}.flac`)));
        if (job.duration) {
            for (const [label, point] of [["시작 경계 듣기", track.start], ["종료 경계 듣기", track.end]]) {
                content.append(button(label, () => download(`/jobs/${job.id}/preview?start=${Math.max(0, point - 10)}&end=${Math.min(job.duration, point + 10)}`, "", audio)));
            }
        }
        content.append(audio);
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
        content.append(form); row.append(content);
        return row;
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
