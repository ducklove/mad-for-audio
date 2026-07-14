// shell.html(최상위 프레임)에만 주입되는 브리지 — 위젯/랙 iframe에는 노출되지 않는다.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("trayBridge", {
    // 위젯/랙의 재생 상태(fmRadio:*)를 메인 프로세스로 올린다
    sendState(message) {
        ipcRenderer.send("widget-state", message);
    },
    // 현재 보기(tuner|system)를 알려 창 크기를 맞추게 한다
    sendView(view) {
        ipcRenderer.send("widget-view", view);
    },
    // 슬림 바에서 '펼치기' — 전체 플레이어로 복귀 요청
    requestFull() {
        ipcRenderer.send("widget-request-full");
    },
    // 메인 프로세스 → 셸 명령(fmRadio:* 재생 명령 / trayMode / setView)
    onCommand(callback) {
        ipcRenderer.on("widget-command", (_event, message) => callback(message));
    }
});
