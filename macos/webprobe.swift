// LP 무음 진단용 일회성 프로브 — 배포 페이지를 WKWebView(맥 앱과 동일 엔진)로 열어
// 1번 음반 1번 트랙을 재생시키고 audio 엘리먼트 상태를 주기적으로 출력한다.
// 실행: xcrun swiftc -parse-as-library webprobe.swift -o /tmp/webprobe -framework Cocoa -framework WebKit && /tmp/webprobe

import Cocoa
import WebKit

let LOG = "/tmp/madprobe.log"
func plog(_ msg: String) {
    let line = msg + "\n"
    if let h = FileHandle(forWritingAtPath: LOG) { h.seekToEndOfFile(); h.write(line.data(using: .utf8)!); h.closeFile() }
    else { try? line.write(toFile: LOG, atomically: true, encoding: .utf8) }
    print(msg)
}

@MainActor
final class Probe: NSObject, WKNavigationDelegate {
    var web: WKWebView!
    var polls = 0

    func start() {
        let cfg = WKWebViewConfiguration()
        cfg.mediaTypesRequiringUserActionForPlayback = []
        cfg.websiteDataStore = .nonPersistent()   // 캐시 없는 깨끗한 로드
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: 900, height: 700), configuration: cfg)
        if CommandLine.arguments.contains("--safari-ua") {
            web.customUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15"
            plog("UA: safari")
        } else {
            plog("UA: default(WKWebView)")
        }
        web.navigationDelegate = self
        // 창에 붙지 않은 웹뷰는 미디어가 서스펜드된다 — 실제 앱처럼 창에 부착
        let win = NSWindow(contentRect: NSRect(x: 40, y: 40, width: 900, height: 700),
                           styleMask: [.titled], backing: .buffered, defer: false)
        win.contentView = web
        win.orderFrontRegardless()
        objc_setAssociatedObject(self, "probeWindow", win, .OBJC_ASSOCIATION_RETAIN)
        var req = URLRequest(url: URL(string: "https://ducklove.github.io/mad-for-audio/?view=rack&probe=1")!)
        req.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        web.load(req)
    }

    func webView(_ w: WKWebView, didFinish navigation: WKNavigation!) {
        let boot = """
        (() => {
          if (typeof playPhonoTrack !== 'function') return 'no-app';
          try { setRecord(0); } catch (e) {}
          playPhonoTrack(0);
          window.__fetchStat = 'pending';
          const MP3 = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/43/JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg/JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg.mp3';
          window.__a1 = new Audio(); __a1.src = MP3; __a1.play().catch(e => { window.__e1 = String(e).slice(0,40); });
          window.__a2 = document.createElement('audio'); __a2.crossOrigin = 'anonymous'; __a2.src = MP3; __a2.play().catch(e => { window.__e2 = String(e).slice(0,40); });
          window.__a3 = new Audio('data:audio/wav;base64,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'); __a3.loop = true; __a3.play().catch(e => { window.__e3 = String(e).slice(0,40); });
          fetch('https://upload.wikimedia.org/wikipedia/commons/transcoded/4/43/JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg/JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg.mp3', {method:'HEAD'})
            .then(r => { window.__fetchStat = 'HTTP ' + r.status; })
            .catch(e => { window.__fetchStat = 'ERR ' + e; });
          return 'started CAN_OGG=' + (typeof CAN_OGG !== 'undefined' ? CAN_OGG : '?')
            + ' canOggType="' + audio.canPlayType('audio/ogg; codecs="vorbis"') + '"'
            + ' SAFARI_LIKE=' + (typeof SAFARI_LIKE !== 'undefined' ? SAFARI_LIKE : '?');
        })()
        """
        w.evaluateJavaScript(boot) { r, e in plog("BOOT: \(String(describing: r ?? "?"))") }

        Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { _ in
            Task { @MainActor in
                self.polls += 1
                let js = """
                JSON.stringify({src: audio.src.slice(-70), err: audio.error ? audio.error.code : 0,
                  rs: audio.readyState, t: Math.round(audio.currentTime * 10) / 10,
                  paused: audio.paused, fetchStat: window.__fetchStat,
                  a1: __a1.readyState + '/' + Math.round(__a1.currentTime*10) + (window.__e1 ? '/' + __e1 : ''),
                  a2: __a2.readyState + '/' + Math.round(__a2.currentTime*10) + (window.__e2 ? '/' + __e2 : ''),
                  a3: __a3.readyState + '/' + Math.round(__a3.currentTime*10) + (window.__e3 ? '/' + __e3 : ''), state: (typeof audioState !== 'undefined' ? audioState : '?'),
                  vol: audio.volume, muted: audio.muted})
                """
                self.web.evaluateJavaScript(js) { r, e in
                    plog("POLL\(self.polls): \(String(describing: r ?? "?"))")
                    if self.polls >= 7 { exit(0) }
                }
            }
        }
    }

    func webView(_ w: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        plog("NAV FAIL: \(error.localizedDescription)")
        exit(1)
    }
}

@main
@MainActor
struct Main {
    static func main() {
        let app = NSApplication.shared
        let probe = Probe()
        probe.start()
        _ = probe
        app.run()
    }
}
