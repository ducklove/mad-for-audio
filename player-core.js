// 재생 코어 — index.html(본체)과 widget.html(미니 플레이어)이 공유한다.
// HLS(MSE)·네이티브 HLS(iOS Safari)·일반 파일 세 경로를 하나의 API로 감싸고,
// 치명 오류 복구(지수 백오프·주소 재해석·recoverMediaError), 오류 없이 멈추는
// 정지(stall) 감시, 파괴된 인스턴스의 늦은 이벤트 무시를 공통으로 처리한다.
(function () {
    // 연속 장애 한 번의 재접속 예산 — 1·2·4·8·16·30초(합 약 1분).
    // 3회·6초로는 WiFi 로밍·절전 복귀·회선 순단(10초 이상)을 넘기지 못하고 그대로
    // 죽었다. 라이브 방송의 재개는 이어듣기가 아니라 재접속이므로 오래 기다려도
    // 잃을 것이 없다.
    const RETRY_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000, 30000];
    const NET_RETRY_MAX = RETRY_BACKOFF_MS.length;
    // 오류 없이 조용히 멈추는 정지. 라이브 엣지 이탈·버퍼 홀에서는 fatal이 오지
    // 않아 그대로 두면 '버퍼링' 표시에 영원히 고착된다. 진행이 이만큼 멈추면
    // 장애로 보고 재접속을 건다.
    const STALL_TIMEOUT_MS = 20000;
    const STALL_POLL_MS = 2000;

    const activeHandleByAudio = new WeakMap();
    let handleSeq = 0;

    // audio 엘리먼트에 url을 붙이고 재생을 시작한다.
    // 반환 핸들: { kind: "hls"|"native"|"direct"|"unsupported", hls, reconnect(), destroy() }
    // 콜백: onBlocked(자동재생 차단·재생 실패), onRetry(n, max, reason),
    //       onReconnect({reason, url, renewed, attempt}), onFatal(data), onError(data), onUnsupported()
    // cb.resolveUrl: () => Promise<string> — 재접속 때 스트림 주소를 새로 받아 온다.
    //   방송사 서명 URL은 시간이 지나면 만료되므로 같은 주소로 다시 붙으면
    //   401/403으로 재시도 예산만 태운다.
    // cb.stallMs: 정지 감시 임계값. 0이면 감시하지 않는다 (자체 워치독이 있는 호출부용).
    // cb.hlsConfig: hls.js 생성 옵션 오버라이드 (예: 예약 녹음 수신기의 버퍼 정책)
    function attach(audio, url, cb) {
        cb = cb || {};
        const previous = activeHandleByAudio.get(audio);
        if (previous) previous.destroy();
        const isHlsUrl = url.indexOf(".m3u8") !== -1;
        const generation = ++handleSeq;
        const resolveUrl = typeof cb.resolveUrl === "function" ? cb.resolveUrl : null;
        const stallMs = cb.stallMs === undefined ? STALL_TIMEOUT_MS : cb.stallMs;
        let currentUrl = url;
        let retryTimer = null;
        let stallTimer = null;
        let netRetries = 0;
        let mediaRecovered = false;
        let progressAt = Date.now();
        let progressTime = -1;
        const mediaListeners = [];
        const handle = {
            generation,
            kind: "direct",
            hls: null,
            destroyed: false,
            isCurrent() {
                return !handle.destroyed && activeHandleByAudio.get(audio) === handle;
            },
            // 바깥에서 아는 복구 신호(네트워크 복귀 등)로 예산을 되돌리고 즉시 다시 붙는다.
            reconnect(reason) {
                if (!handle.isCurrent() || handle.kind === "unsupported") return false;
                clearRetry();
                netRetries = 0;
                mediaRecovered = false;
                relinkFresh(reason || "manual");
                return true;
            },
            inspect() {
                return {
                    kind: handle.kind,
                    url: currentUrl,
                    retries: netRetries,
                    maxRetries: NET_RETRY_MAX,
                    destroyed: handle.destroyed
                };
            },
            destroy() {
                if (handle.destroyed) return;
                handle.destroyed = true;
                clearRetry();
                if (stallTimer !== null) {
                    clearInterval(stallTimer);
                    stallTimer = null;
                }
                mediaListeners.forEach(([name, listener]) => audio.removeEventListener(name, listener));
                mediaListeners.length = 0;
                if (handle.hls) {
                    handle.hls.destroy();
                    handle.hls = null;
                }
                if (activeHandleByAudio.get(audio) === handle) activeHandleByAudio.delete(audio);
            }
        };
        activeHandleByAudio.set(audio, handle);

        function whenCurrent(fn) {
            return function () {
                if (!handle.isCurrent()) return;
                return fn.apply(null, arguments);
            };
        }

        function listen(name, fn) {
            const listener = whenCurrent(fn);
            mediaListeners.push([name, listener]);
            audio.addEventListener(name, listener);
        }

        function clearRetry() {
            if (retryTimer !== null) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
        }

        function mediaTime() {
            const t = audio.currentTime;
            return typeof t === "number" && isFinite(t) ? t : -1;
        }

        function noteProgress() {
            progressAt = Date.now();
            progressTime = mediaTime();
        }

        // 재시도 상한은 플레이어 수명 전체가 아니라 연속 장애 한 번의 예산이다.
        // 정상 데이터가 다시 흐르면 다음 독립 장애를 복구할 수 있게 충전한다.
        function recoverBudget() {
            clearRetry();
            netRetries = 0;
            mediaRecovered = false;
            noteProgress();
        }

        function budgetLeft() {
            return netRetries < NET_RETRY_MAX;
        }

        function fail(data) {
            handle.destroy();
            if (cb.onFatal) cb.onFatal(data);
        }

        // 백오프를 두고 재접속을 예약한다. 예산이 남아 있을 때만 호출한다.
        function scheduleRetry(reason) {
            if (retryTimer !== null || !budgetLeft()) return;
            netRetries += 1;
            const wait = RETRY_BACKOFF_MS[Math.min(netRetries, RETRY_BACKOFF_MS.length) - 1];
            if (cb.onRetry) cb.onRetry(netRetries, NET_RETRY_MAX, reason);
            retryTimer = setTimeout(() => {
                retryTimer = null;
                relinkFresh(reason);
            }, wait);
        }

        // 재접속은 항상 '주소부터 다시'. resolveUrl이 없거나 실패하면 마지막 주소로
        // 되돌아가고, 그래도 실패하면 다음 백오프에서 또 시도한다.
        function relinkFresh(reason) {
            if (!handle.isCurrent()) return;
            if (!resolveUrl) {
                relink(currentUrl, reason);
                return;
            }
            let pending = null;
            try {
                pending = resolveUrl();
            } catch (error) {
                relink(currentUrl, reason);
                return;
            }
            Promise.resolve(pending).then((fresh) => {
                if (!handle.isCurrent()) return;
                relink(typeof fresh === "string" && fresh ? fresh : currentUrl, reason);
            }, () => {
                if (!handle.isCurrent()) return;
                relink(currentUrl, reason);
            });
        }

        function relink(nextUrl, reason) {
            if (!handle.isCurrent()) return;
            const renewed = nextUrl !== currentUrl;
            currentUrl = nextUrl;
            noteProgress();
            if (cb.onReconnect) cb.onReconnect({ reason, url: nextUrl, renewed, attempt: netRetries });
            if (handle.kind === "hls" && handle.hls) {
                // 주소가 바뀌었으면 loadSource가 매니페스트부터 다시 받는다(autoStartLoad가
                // 이어서 로딩을 재개). 같은 주소면 멈춰 있는 로더만 다시 굴린다.
                if (renewed) handle.hls.loadSource(nextUrl);
                else handle.hls.startLoad();
                return;
            }
            // 네이티브 HLS·일반 파일: 요소에 주소를 다시 물린다.
            try {
                audio.src = nextUrl;
                audio.load();
            } catch (error) { /* 다음 백오프에서 다시 시도한다 */ }
            audio.play().catch(() => {
                if (handle.isCurrent() && cb.onBlocked) cb.onBlocked();
            });
        }

        function startStallWatch() {
            if (!stallMs || stallTimer !== null) return;
            noteProgress();
            stallTimer = setInterval(() => {
                if (!handle.isCurrent()) return;
                // 사용자가 멈춘 것·끝난 것은 정지가 아니다. 재접속을 기다리는 동안도 세지 않는다.
                if (audio.paused || audio.ended || retryTimer !== null) {
                    noteProgress();
                    return;
                }
                const t = mediaTime();
                if (t < 0 || t > progressTime + 0.05) {
                    progressAt = Date.now();
                    progressTime = t;
                    return;
                }
                if (Date.now() - progressAt < stallMs) return;
                noteProgress();
                if (budgetLeft()) scheduleRetry("stall");
                else fail({ type: "stall", details: "stallTimeout", fatal: true });
            }, STALL_POLL_MS);
        }

        // 미디어가 실제로 흐르면 정지 감시를 물리고 예산을 되돌린다.
        listen("playing", recoverBudget);
        listen("timeupdate", noteProgress);

        // 네이티브 HLS와 일반 파일도 HLS.js와 같은 오류 계약으로 수렴한다.
        // 공유 audio 요소에서 이전 핸들의 늦은 이벤트가 와도 isCurrent()가 폐기한다.
        listen("error", () => {
            if (handle.kind === "hls") return; // HLS.js ERROR가 복구/재시도 정책을 단독 소유한다
            if (handle.kind === "unsupported") return; // 재생 자체가 불가능하다 — 재시도는 의미가 없다
            // 네이티브 경로(사파리·맥 앱)도 재접속 예산을 갖는다 — 예전에는 첫 오류
            // 한 번으로 그대로 죽어 WKWebView에 복구 수단이 아예 없었다.
            if (budgetLeft()) {
                scheduleRetry("media");
                return;
            }
            handle.destroy();
            if (cb.onError) cb.onError({
                kind: handle.kind,
                mediaError: audio.error || null,
                url: currentUrl
            });
        });

        if (isHlsUrl && typeof Hls !== "undefined" && Hls.isSupported()) {
            handle.kind = "hls";
            // lowLatencyMode는 라이브 엣지에 바짝 붙어 재생해 불안정한 회선에서 버퍼
            // 고갈이 잦다. 라디오 청취에 이득이 거의 없어 기본값을 끔으로 둔다.
            const hls = new Hls(Object.assign({ enableWorker: true, lowLatencyMode: false }, cb.hlsConfig || {}));
            handle.hls = hls;
            hls.loadSource(url);
            hls.attachMedia(audio);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (!handle.isCurrent()) return;
                // 매니페스트가 읽혔다고 예산을 채우지는 않는다 — 만료된 세션은 매니페스트만
                // 통과하고 세그먼트에서 막히는 일이 흔해, 여기서 충전하면 무한 재시도가 된다.
                noteProgress();
                audio.play().catch(() => {
                    if (handle.isCurrent() && cb.onBlocked) cb.onBlocked();
                });
            });
            hls.on(Hls.Events.FRAG_BUFFERED, recoverBudget);
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!handle.isCurrent() || !data.fatal) return;
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR && budgetLeft()) {
                    scheduleRetry("network");
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
                    // 일시적 버퍼/디코딩 문제는 한 번 복구를 시도한다
                    mediaRecovered = true;
                    hls.recoverMediaError();
                } else {
                    fail(data);
                }
            });
            startStallWatch();
            return handle;
        }

        if (isHlsUrl && !audio.canPlayType("application/vnd.apple.mpegurl")) {
            handle.kind = "unsupported";
            if (handle.isCurrent() && cb.onUnsupported) cb.onUnsupported();
            return handle;
        }

        // 네이티브 HLS(사파리) 또는 일반 오디오 파일
        handle.kind = isHlsUrl ? "native" : "direct";
        audio.src = url;
        audio.play().catch(() => {
            if (handle.isCurrent() && cb.onBlocked) cb.onBlocked();
        });
        startStallWatch();
        return handle;
    }

    window.PlayerCore = { attach };
})();
