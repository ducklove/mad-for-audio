// Mad for Audio — macOS 메뉴바 상주 앱
// 메뉴바 아이콘 클릭 → 드래그로 옮길 수 있는 플로팅 패널로 하이파이 랙이 열린다.
// 패널을 닫아도 웹뷰는 살아 있으므로 라디오는 계속 재생된다.
// 재생 중에 닫으면 슬림 '간편 플레이어 바'로 자동 축소된다 (리로드 없이 — 소리 유지).
// 빌드: ./build.sh  (Xcode 프로젝트 불필요 — swiftc 단일 파일)

import Cocoa
import WebKit
import ServiceManagement

// 랙 뷰 고정 (?view=rack — 저장된 보기 모드보다 우선)
let APP_URL = URL(string: "https://ducklove.github.io/mad-for-audio/?view=rack")!
let FULL_SIZE = NSSize(width: 440, height: 780)
let BAR_SIZE = NSSize(width: 440, height: 104)   // 상단 드래그 스트립 + 슬림 플레이 바

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate {
    var statusItem: NSStatusItem!
    var panel: NSPanel!
    var webView: WKWebView!
    var barMode = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        // 웹뷰 — 앱이 사는 동안 유지된다 (오디오의 심장)
        let cfg = WKWebViewConfiguration()
        cfg.mediaTypesRequiringUserActionForPlayback = []   // 대기 선국 자동 연결 등 프로그램적 재생 허용
        cfg.allowsAirPlayForMediaPlayback = true
        webView = WKWebView(frame: NSRect(origin: .zero, size: FULL_SIZE), configuration: cfg)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = false
        webView.load(URLRequest(url: APP_URL))

        // 플로팅 패널 — 투명 타이틀바(상단 스트립)를 잡고 드래그해 옮긴다
        panel = NSPanel(contentRect: NSRect(origin: .zero, size: FULL_SIZE),
                        styleMask: [.titled, .fullSizeContentView, .nonactivatingPanel],
                        backing: .buffered, defer: false)
        panel.title = "Mad for Audio"
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isMovableByWindowBackground = true
        panel.level = .floating                    // 다른 창 위에 뜬다
        panel.isReleasedWhenClosed = false
        panel.hidesOnDeactivate = false
        panel.standardWindowButton(.miniaturizeButton)?.isHidden = true
        panel.standardWindowButton(.zoomButton)?.isHidden = true
        panel.contentView = webView
        panel.delegate = self

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            button.image = NSImage(systemSymbolName: "radio.fill", accessibilityDescription: "Mad for Audio")
                ?? NSImage(systemSymbolName: "antenna.radiowaves.left.and.right", accessibilityDescription: "Mad for Audio")
            button.action = #selector(statusClicked(_:))
            button.target = self
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }
    }

    // ----- 메뉴바 버튼: 좌클릭 = 열기/축소/닫기, 우클릭 = 메뉴 -----
    @objc func statusClicked(_ sender: NSStatusBarButton) {
        if NSApp.currentEvent?.type == .rightMouseUp {
            showMenu()
            return
        }
        if !panel.isVisible {
            showFull(anchorToStatusItem: true)
        } else if barMode {
            showFull(anchorToStatusItem: false)     // 바 → 랙 복귀 (지금 자리 유지)
        } else {
            // 랙이 열려 있음: 재생 중이면 바로 숨기지 않고 간편 바로 축소한다
            webView.evaluateJavaScript("(typeof isPlaying !== 'undefined' && isPlaying) ? 1 : 0") { [weak self] result, _ in
                Task { @MainActor in
                    guard let self else { return }
                    if let n = result as? Int, n == 1 {
                        self.enterBarMode()
                    } else {
                        self.panel.orderOut(nil)
                    }
                }
            }
        }
    }

    func showFull(anchorToStatusItem: Bool) {
        barMode = false
        webView.evaluateJavaScript("if (typeof setPopupBarMode === 'function') setPopupBarMode(false);", completionHandler: nil)
        var frame: NSRect
        if anchorToStatusItem || !panel.isVisible {
            frame = anchoredFrame(size: FULL_SIZE)
        } else {
            // 바 → 랙: 상단 모서리를 고정한 채 아래로 펼친다
            let f = panel.frame
            frame = NSRect(x: f.minX, y: f.maxY - FULL_SIZE.height, width: FULL_SIZE.width, height: FULL_SIZE.height)
            frame = clampToScreen(frame)
        }
        panel.setFrame(frame, display: true, animate: panel.isVisible)
        panel.makeKeyAndOrderFront(nil)
    }

    func enterBarMode() {
        barMode = true
        webView.evaluateJavaScript("if (typeof setPopupBarMode === 'function') setPopupBarMode(true);", completionHandler: nil)
        let f = panel.frame
        var frame = NSRect(x: f.minX, y: f.maxY - BAR_SIZE.height, width: BAR_SIZE.width, height: BAR_SIZE.height)
        frame = clampToScreen(frame)
        panel.setFrame(frame, display: true, animate: true)
    }

    // 상태바 아이콘 아래에 배치
    func anchoredFrame(size: NSSize) -> NSRect {
        guard let btnWindow = statusItem.button?.window else {
            return NSRect(origin: NSPoint(x: 200, y: 200), size: size)
        }
        let b = btnWindow.frame
        let frame = NSRect(x: b.midX - size.width / 2, y: b.minY - size.height - 6,
                           width: size.width, height: size.height)
        return clampToScreen(frame)
    }

    func clampToScreen(_ frame: NSRect) -> NSRect {
        guard let screen = statusItem.button?.window?.screen ?? NSScreen.main else { return frame }
        var f = frame
        let v = screen.visibleFrame
        f.origin.x = min(max(f.origin.x, v.minX + 8), v.maxX - f.width - 8)
        f.origin.y = min(max(f.origin.y, v.minY + 8), v.maxY - f.height - 8)
        return f
    }

    // 닫기 버튼(신호등) → 완전히 숨긴다 (소리는 계속)
    func windowShouldClose(_ sender: NSWindow) -> Bool {
        panel.orderOut(nil)
        return false
    }

    func showMenu() {
        let menu = NSMenu()
        menu.addItem(withTitle: panel.isVisible && !barMode ? "랙 닫기" : "랙 열기",
                     action: #selector(menuToggleRack), keyEquivalent: "").target = self
        let bar = NSMenuItem(title: "간편 플레이어 바", action: #selector(menuToggleBar), keyEquivalent: "")
        bar.target = self
        bar.state = (panel.isVisible && barMode) ? .on : .off
        menu.addItem(bar)
        menu.addItem(withTitle: "창 숨기기", action: #selector(menuHide), keyEquivalent: "").target = self
        menu.addItem(.separator())
        menu.addItem(withTitle: "새로고침", action: #selector(menuReload), keyEquivalent: "r").target = self
        menu.addItem(withTitle: "브라우저에서 열기", action: #selector(menuOpenBrowser), keyEquivalent: "").target = self
        menu.addItem(.separator())
        let login = NSMenuItem(title: "로그인 시 자동 시작", action: #selector(menuLoginItem), keyEquivalent: "")
        login.target = self
        login.state = (SMAppService.mainApp.status == .enabled) ? .on : .off
        menu.addItem(login)
        menu.addItem(.separator())
        menu.addItem(withTitle: "Mad for Audio 종료", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        statusItem.menu = menu
        statusItem.button?.performClick(nil)
        statusItem.menu = nil
    }

    @objc func menuToggleRack() {
        if panel.isVisible && !barMode {
            panel.orderOut(nil)
        } else {
            showFull(anchorToStatusItem: !panel.isVisible)
        }
    }

    @objc func menuToggleBar() {
        if panel.isVisible && barMode {
            showFull(anchorToStatusItem: false)
        } else {
            if !panel.isVisible {
                panel.setFrame(anchoredFrame(size: BAR_SIZE), display: false)
                panel.makeKeyAndOrderFront(nil)
            }
            enterBarMode()
        }
    }

    @objc func menuHide() { panel.orderOut(nil) }
    @objc func menuReload() { webView.reloadFromOrigin() }   // 캐시 무시 — 배포 직후에도 새 코드를 받는다
    @objc func menuOpenBrowser() { NSWorkspace.shared.open(APP_URL) }

    @objc func menuLoginItem() {
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            NSSound.beep()
        }
    }

    // 로드(새로고침 포함)가 끝나면 현재 모드를 페이지에 다시 주입한다
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        let on = barMode ? "true" : "false"
        webView.evaluateJavaScript("if (typeof setPopupBarMode === 'function') setPopupBarMode(\(on));", completionHandler: nil)
    }

    // ----- 내비게이션 정책: 플레이어 페이지에 머문다 -----
    // 다른 페이지로의 이동은 기본 브라우저로 — 창 안에서 페이지를 떠나면 재생이 끊기기 때문.
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard navigationAction.navigationType == .linkActivated,
              let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        let path = url.path
        let isPlayerPage = url.host == APP_URL.host &&
            (path.hasSuffix("/mad-for-audio/") || path.hasSuffix("/index.html"))
        if isPlayerPage {
            decisionHandler(.allow)
        } else {
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel)
        }
    }

    // window.open → 기본 브라우저로
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            NSWorkspace.shared.open(url)
        }
        return nil
    }
}

@main
@MainActor
struct Main {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.accessory)   // 독 아이콘 없음 — 메뉴바에만 산다
        app.run()
    }
}
