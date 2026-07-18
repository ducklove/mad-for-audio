/*
 * Windows tray shell bridge.
 *
 * The radio app keeps ownership of playback and volume state. This module only
 * validates the embedding parent, translates fmRadio:* messages into commands,
 * and publishes state snapshots back to that parent.
 */

function inactiveBridge() {
    let destroyed = false;
    return Object.freeze({
        active: false,
        broadcast() { return false; },
        destroy() { destroyed = true; },
        inspect() { return Object.freeze({ active: false, destroyed }); }
    });
}

export function mountTrayBridge(options = {}) {
    const hostWindow = options.hostWindow;
    const media = options.media;
    const readState = options.readState;
    const canSelectStation = options.canSelectStation;
    const selectStation = options.selectStation;
    const togglePlayback = options.togglePlayback;
    const setVolume = options.setVolume;

    if (!hostWindow || typeof readState !== "function") {
        throw new TypeError("Tray bridge requires a host window and state reader");
    }

    const params = new URLSearchParams(hostWindow.location.search);
    if (params.get("chrome") !== "tray" || hostWindow.parent === hostWindow) {
        return inactiveBridge();
    }

    const parentWindow = hostWindow.parent;
    const electronShell = /Electron/i.test(hostWindow.navigator.userAgent);
    let parentOrigin = null;
    try {
        if (hostWindow.document.referrer) {
            parentOrigin = new URL(hostWindow.document.referrer).origin;
        }
    } catch (error) {}

    // Electron's file:// shell has the opaque "null" origin. Keep that narrow
    // exception, but never trust a referrer-less ordinary web embedder.
    if ((!parentOrigin || parentOrigin === "null") && electronShell) parentOrigin = "null";
    const postTargetOrigin = parentOrigin && parentOrigin !== "null" ? parentOrigin : "*";
    const mediaEvents = ["playing", "pause", "ended", "emptied"];
    let destroyed = false;

    function trustedMessage(event) {
        return !destroyed && Boolean(parentOrigin) &&
            event.source === parentWindow && event.origin === parentOrigin;
    }

    function broadcast(type = "fmRadio:state") {
        if (destroyed) return false;
        try {
            const state = readState() || {};
            parentWindow.postMessage({
                type,
                mode: "radio",
                station: state.stationId || null,
                stationName: String(state.stationName || "").trim(),
                playing: Boolean(state.playing),
                loading: false,
                volume: Math.round(Math.max(0, Math.min(1, Number(state.volume) || 0)) * 100)
            }, postTargetOrigin);
            return true;
        } catch (error) {
            hostWindow.console.error(error);
            return false;
        }
    }

    function onMediaState() {
        broadcast();
    }

    function onMessage(event) {
        if (!trustedMessage(event)) return;
        const data = event.data;
        if (!data || typeof data.type !== "string" || !data.type.startsWith("fmRadio:")) return;

        const state = readState() || {};
        const validStation = data.station && typeof canSelectStation === "function" && canSelectStation(data.station);
        switch (data.type) {
            case "fmRadio:play":
                if (validStation && typeof selectStation === "function") selectStation(data.station);
                else if (!state.playing && typeof togglePlayback === "function") togglePlayback();
                break;
            case "fmRadio:pause":
                if (state.playing && typeof togglePlayback === "function") togglePlayback();
                break;
            case "fmRadio:toggle":
                if (typeof togglePlayback === "function") togglePlayback();
                break;
            case "fmRadio:setStation":
                if (validStation && typeof selectStation === "function") selectStation(data.station);
                break;
            case "fmRadio:setVolume":
                if (typeof data.value === "number" && Number.isFinite(data.value) &&
                    data.value >= 0 && data.value <= 100 && typeof setVolume === "function") {
                    setVolume(data.value / 100);
                    broadcast();
                }
                break;
            case "fmRadio:getState":
                broadcast();
                break;
        }
    }

    mediaEvents.forEach((name) => media?.addEventListener(name, onMediaState));
    hostWindow.addEventListener("message", onMessage);
    broadcast("fmRadio:ready");

    return Object.freeze({
        active: true,
        broadcast,
        destroy() {
            if (destroyed) return;
            destroyed = true;
            mediaEvents.forEach((name) => media?.removeEventListener(name, onMediaState));
            hostWindow.removeEventListener("message", onMessage);
        },
        inspect() {
            return Object.freeze({ active: true, destroyed, parentOrigin, postTargetOrigin });
        }
    });
}
