// 재생 코어 — index.html(본체)과 widget.html(미니 플레이어)이 공유한다.
// HLS(MSE)·네이티브 HLS(iOS Safari)·일반 파일 세 경로를 하나의 API로 감싸고,
// 치명 오류 복구(재시도 상한·백오프·recoverMediaError)와
// 파괴된 인스턴스의 늦은 이벤트 무시를 공통으로 처리한다.
(function () {
    const NET_RETRY_MAX = 3;

    // audio 엘리먼트에 url을 붙이고 재생을 시작한다.
    // 반환 핸들: { kind: "hls"|"native"|"direct"|"unsupported", hls, destroy() }
    // 콜백: onBlocked(자동재생 차단·재생 실패), onRetry(n, max), onFatal(data), onUnsupported()
    function attach(audio, url, cb) {
        cb = cb || {};
        const isHlsUrl = url.indexOf(".m3u8") !== -1;
        const handle = {
            kind: "direct",
            hls: null,
            destroyed: false,
            destroy() {
                handle.destroyed = true;
                if (handle.hls) {
                    handle.hls.destroy();
                    handle.hls = null;
                }
            }
        };

        if (isHlsUrl && typeof Hls !== "undefined" && Hls.isSupported()) {
            handle.kind = "hls";
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            handle.hls = hls;
            let netRetries = 0;
            let mediaRecovered = false;
            hls.loadSource(url);
            hls.attachMedia(audio);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                audio.play().catch(() => { if (cb.onBlocked) cb.onBlocked(); });
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (handle.destroyed || !data.fatal) return;
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR && netRetries < NET_RETRY_MAX) {
                    // 무한 재시도 대신 백오프를 두고 상한을 건다
                    netRetries += 1;
                    if (cb.onRetry) cb.onRetry(netRetries, NET_RETRY_MAX);
                    setTimeout(() => { if (!handle.destroyed) hls.startLoad(); }, 1000 * netRetries);
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
                    // 일시적 버퍼/디코딩 문제는 한 번 복구를 시도한다
                    mediaRecovered = true;
                    hls.recoverMediaError();
                } else {
                    handle.destroy();
                    if (cb.onFatal) cb.onFatal(data);
                }
            });
            return handle;
        }

        if (isHlsUrl && !audio.canPlayType("application/vnd.apple.mpegurl")) {
            handle.kind = "unsupported";
            if (cb.onUnsupported) cb.onUnsupported();
            return handle;
        }

        // 네이티브 HLS(사파리) 또는 일반 오디오 파일
        handle.kind = isHlsUrl ? "native" : "direct";
        audio.src = url;
        audio.play().catch(() => { if (cb.onBlocked) cb.onBlocked(); });
        return handle;
    }

    window.PlayerCore = { attach };
})();
