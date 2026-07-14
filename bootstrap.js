// 음반 카탈로그를 먼저 로딩한 뒤 전역 UI 스크립트를 실행한다.
// app.js는 HTML 인라인 onclick과 네이티브 셸에서 호출하는 전역 함수를 제공하므로
// ES module로 감싸지 않고, 데이터 준비 후 classic script로 주입한다.
(function () {
    const source = document.currentScript && document.currentScript.src;
    const version = source ? new URL(source, location.href).searchParams.get("v") : "";
    const assetUrl = (name) => version ? `${name}?v=${encodeURIComponent(version)}` : name;

    function validateCatalog(records) {
        if (!Array.isArray(records) || records.length === 0) return false;
        return records.every((record) =>
            record &&
            typeof record.title === "string" && record.title.length > 0 &&
            typeof record.composer === "string" && record.composer.length > 0 &&
            typeof record.performer === "string" && record.performer.length > 0 &&
            typeof record.credit === "string" && record.credit.length > 0 &&
            Array.isArray(record.tracks) && record.tracks.length > 0 &&
            record.tracks.every((track) =>
                track && typeof track.t === "string" && track.t.length > 0 &&
                typeof track.f === "string" && track.f.length > 0));
    }

    function loadApp() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = assetUrl("app.js");
            script.onload = resolve;
            script.onerror = () => reject(new Error("앱 스크립트를 불러오지 못했습니다"));
            document.body.appendChild(script);
        });
    }

    function showLoadError(error) {
        const station = document.getElementById("nowStation");
        const subtext = document.getElementById("playerSubtext");
        const chip = document.getElementById("audioStateChip");
        if (station) station.textContent = "음반 카탈로그 로드 실패";
        if (subtext) subtext.textContent = "페이지를 새로고침해 주세요. 오프라인이라면 한 번 온라인에서 실행해야 합니다.";
        if (chip) {
            chip.hidden = false;
            chip.className = "audio-state-chip st-err";
            chip.textContent = "오류";
        }
        console.error(error);
    }

    window.MFA_READY = fetch(assetUrl("records.json"), { credentials: "same-origin" })
        .then((response) => {
            if (!response.ok) throw new Error(`음반 카탈로그 응답 오류: ${response.status}`);
            return response.json();
        })
        .then((records) => {
            if (!validateCatalog(records)) throw new Error("음반 카탈로그 형식이 올바르지 않습니다");
            window.MFA_RECORDS = records;
            return loadApp();
        })
        .catch((error) => {
            showLoadError(error);
            throw error;
        });
})();
