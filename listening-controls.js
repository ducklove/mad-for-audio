// 재생 안내의 DOM·이벤트 수명주기. 기기와 재생 정책은 app.js가 제공한다.
(function (global) {
    "use strict";
    function mountListeningControls({ read, activate }) {
        const panel = document.getElementById("listeningPanel");
        const title = document.getElementById("listeningTitle");
        const hint = document.getElementById("listeningHint");
        const button = document.getElementById("listeningStart");
        if (!panel || !button) return null;
        const text = (element, value) => {
            if (element.textContent !== value) element.textContent = value;
        };
        function render() {
            const view = read();
            text(title, view.title);
            text(hint, view.hint);
            text(button, view.action);
            button.disabled = false;
            panel.dataset.state = view.state;
        }
        function onClick() { activate(); render(); }
        button.addEventListener("click", onClick);
        document.addEventListener("audiostate", render);
        // 기기 조작 안내·소스 전환도 같은 표시에 반영한다. 랙 전체의 프레임 변이는 관찰하지 않는다.
        const observer = new MutationObserver(render);
        ["nowStation", "playerSubtext"].forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element, { childList: true, subtree: true, characterData: true });
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        render();
        return Object.freeze({
            render,
            destroy() {
                observer.disconnect();
                button.removeEventListener("click", onClick);
                document.removeEventListener("audiostate", render);
            }
        });
    }
    global.MFA = global.MFA || {};
    global.MFA.mountListeningControls = mountListeningControls;
})(window);
