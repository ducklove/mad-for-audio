// 오디오 엔진 모듈 — Web Audio 그래프, EQ 체인, 앰프 보이싱, 크랙클/히스, 오디오 상태 머신.
// 클래식 스크립트 — 전역 렉시컬 스코프를 공유한다. 로드 순서: store→skins→engine→deck→app.

// 오디오 그래프: source → gain(청취 볼륨) → 스피커, source → recDest(원음 레벨) → MediaRecorder, source → analyser(VU)
let audioCtx = null;
let gainNode = null;
let recDest = null;
let analyser = null;
let blendFilter = null;
let monoGain = null;
// 하이파이 랙 체인: EQ → 전압증폭관 → 톤 → 출력관 → 전원 새그 → 출력트랜스/스피커 부하
let eqNodes = null;
let ampDrive = null;
let ampShaper = null;
let ampBass = null;
let ampLowMid = null;
let ampMid = null;
let ampPresence = null;
let ampTreble = null;
let ampPowerDrive = null;
let ampPowerShaper = null;
let ampSag = null;
let ampTransformerHP = null;
let ampTransformerLP = null;
let ampDampingBass = null;
let ampDampingHigh = null;
let ampOut = null;
let crackleGain = null;
let crackleSrc = null;
let scratchGain = null;   // 바이닐 문지름(스크래치) 노이즈 — 드래그 세기에 비례해 게인이 올라간다
let scratchSrc = null;
let vuRaf = null;
let vuData = null;
let recorder = null;
let recStartMs = 0;
let recTimerId = null;
let recordingCount = 0;

function applyBlend() {
    // 하이블렌드: 고음을 깎아 약전계 잡음을 줄이는 효과 (MSE 경로에서만 실제 적용)
    if (blendFilter) blendFilter.frequency.value = blendOn ? 5000 : 20000;
}

function applyMono() {
    // 모노: 게인 노드 입력을 1채널로 강제해 다운믹스
    if (monoGain) {
        monoGain.channelCount = 1;
        monoGain.channelCountMode = monoOn ? "explicit" : "max";
    }
}

function applyEq() {
    if (!eqNodes) return;
    const g = eqState.gains[eqModelId];
    eqNodes.forEach((b, i) => { b.gain.value = eqState.on ? (g[i] || 0) : 0; });
}

// EQ 밴드를 현재 모델로 (재)구성해 monoGain→EQ→ampDrive로 연결한다.
// 크랙클·히스처럼 EQ 입력에 물리는 소스도 함께 재연결한다.
function buildEqChain() {
    if (!audioCtx || !monoGain || !ampDrive) return;
    try { monoGain.disconnect(); } catch (e) {}
    if (eqNodes) eqNodes.forEach((n) => { try { n.disconnect(); } catch (e) {} });
    if (crackleGain) { try { crackleGain.disconnect(); } catch (e) {} }
    if (scratchGain) { try { scratchGain.disconnect(); } catch (e) {} }
    if (hissGain) { try { hissGain.disconnect(); } catch (e) {} }
    const m = EQ_MODELS[eqModelId];
    eqNodes = m.freqs.map((f) => {
        const b = audioCtx.createBiquadFilter();
        b.type = "peaking";
        b.frequency.value = f;
        b.Q.value = m.q;
        return b;
    });
    let head = monoGain;
    eqNodes.forEach((b) => { head = head.connect(b); });
    head.connect(ampDrive);
    if (crackleGain) crackleGain.connect(eqNodes[0]);
    if (scratchGain) scratchGain.connect(eqNodes[0]);
    if (hissGain) hissGain.connect(eqNodes[0]);
    applyEq();
}

// 진공관 스테이지 전달함수. 양/음 반주기의 곡률 차이로 싱글엔디드의 짝수 배음과
// 푸시풀의 대칭적인 홀수 배음을 구분한다. 생기는 DC는 출력 트랜스 HP가 차단한다.
function valveCurve(stage) {
    if (!stage || !stage.k || stage.k <= 0) return null;
    const n = 4096;
    const c = new Float32Array(n);
    const kind = stage.kind || "pentode";
    const asym = Math.max(-.8, Math.min(.8, stage.asym || 0));
    const crossover = Math.max(0, Math.min(.025, stage.crossover || 0));
    const transfer = (mag, k) => {
        if (mag <= 0) return 0;
        if (kind === "triode") return (1 - Math.exp(-k * mag)) / (1 - Math.exp(-k));
        if (kind === "beam") return Math.atan(k * mag) / Math.atan(k);
        return Math.tanh(k * mag) / Math.tanh(k);
    };
    for (let i = 0; i < n; i++) {
        const x = i / (n - 1) * 2 - 1;
        const sign = x < 0 ? -1 : 1;
        let mag = Math.abs(x);
        // 클래스 AB 바이어스 전환부의 아주 작은 gm 노치. 정상 레벨에서는 거의 사라지고
        // 잔향과 저레벨 신호에서만 푸시풀 특유의 결을 남긴다.
        if (crossover > 0) {
            const loss = crossover * (1 - mag) * Math.exp(-mag * 18);
            mag = Math.max(0, mag - loss);
        }
        const shaped = transfer(mag, Math.max(.05, stage.k));
        // 싱글엔디드의 비대칭 전달은 signed 기본파에 같은 극성의 제곱항을 더해
        // 실제 2차 배음을 만든다. 이때 생기는 DC는 뒤의 출력 트랜스 HP가 차단한다.
        // 푸시풀 프로필의 asym은 매우 작으므로 짝수차가 상쇄되고 3차가 주로 남는다.
        c[i] = (sign * shaped + asym * shaped * shaped) / (1 + Math.abs(asym));
    }
    return c;
}

// 자동 검증과 설명서 수치 확인용 읽기 전용 진단 표면.
window.MFA_AmpDSP = Object.freeze({
    inspect(id) {
        const model = AMP_MODELS[id];
        const c = model && model.circuit;
        if (!c) return null;
        return {
            topology: c.topology,
            dampingFactor: c.damping.factor,
            sagRatio: c.sag.ratio,
            transformerBand: [c.transformer.low, c.transformer.high]
        };
    },
    sample(id, stageName, x) {
        const model = AMP_MODELS[id];
        const stage = model && model.circuit && model.circuit[stageName];
        const curve = valveCurve(stage);
        if (!curve) return x;
        const clamped = Math.max(-1, Math.min(1, x));
        const index = Math.round((clamped + 1) * .5 * (curve.length - 1));
        return curve[index];
    }
});

function setAudioParam(param, value, time) {
    if (!param) return;
    const now = audioCtx ? audioCtx.currentTime : 0;
    try {
        param.cancelScheduledValues(now);
        param.setTargetAtTime(value, now, time || .012);
    } catch (e) { param.value = value; }
}

function applyAmp() {
    if (!ampDrive) return;
    const m = AMP_MODELS[ampModelId];
    const circuit = m.circuit || {};
    const pre = circuit.pre || { drive: m.drive, k: m.k, asym: m.asym, kind: "pentode" };
    const power = circuit.power || { drive: 1, k: 0, asym: 0, kind: "pentode" };
    const sag = circuit.sag || { threshold: 0, knee: 0, ratio: 1, attack: .003, release: .08 };
    const transformer = circuit.transformer || { low: 10, lowQ: .707, high: 36000, highQ: .707 };
    const damping = circuit.damping || { factor: 80, bass: [70, 0, .8], high: [4500, 0] };

    setAudioParam(ampDrive.gain, pre.drive || 1);
    ampShaper.curve = valveCurve(pre);
    ampBass.frequency.value = m.bass[0];
    ampBass.gain.value = m.bass[1];
    const lowMid = m.lowMid || [280, 0, .8];
    ampLowMid.frequency.value = lowMid[0];
    ampLowMid.gain.value = lowMid[1];
    ampLowMid.Q.value = lowMid[2];
    ampMid.frequency.value = m.mid[0];
    ampMid.gain.value = m.mid[1];
    ampMid.Q.value = m.mid[2];
    const presence = m.presence || [3400, 0, .9];
    ampPresence.frequency.value = presence[0];
    ampPresence.gain.value = presence[1];
    ampPresence.Q.value = presence[2];
    ampTreble.frequency.value = m.treble[0];
    ampTreble.gain.value = m.treble[1];

    setAudioParam(ampPowerDrive.gain, power.drive || 1);
    ampPowerShaper.curve = valveCurve(power);
    ampSag.threshold.value = sag.threshold;
    ampSag.knee.value = sag.knee;
    ampSag.ratio.value = sag.ratio;
    ampSag.attack.value = sag.attack;
    ampSag.release.value = sag.release;
    ampTransformerHP.frequency.value = transformer.low;
    ampTransformerHP.Q.value = transformer.lowQ || .707;
    ampTransformerLP.frequency.value = transformer.high;
    ampTransformerLP.Q.value = transformer.highQ || .707;
    ampDampingBass.frequency.value = damping.bass[0];
    ampDampingBass.gain.value = damping.bass[1];
    ampDampingBass.Q.value = damping.bass[2];
    ampDampingHigh.frequency.value = damping.high[0];
    ampDampingHigh.gain.value = damping.high[1];
    setAudioParam(ampOut.gain, m.out);
}

function setVolumeLevel(v) {
    volumeLevel = Math.max(0, Math.min(1, v));
    if (gainNode) {
        gainNode.gain.value = volumeLevel * (phonoActive ? PHONO_GAIN : 1);
    } else {
        try { audio.volume = volumeLevel; } catch (e) {}
    }
    updateVolKnob();
}

function needleThump() {
    if (!audioCtx) return;
    try {
        const dur = 0.22;
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, Math.floor(sr * dur), sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            const t = i / sr;
            d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 28) * 0.6 + Math.sin(2 * Math.PI * 38 * t) * Math.exp(-t * 18) * 0.5;
        }
        const s = audioCtx.createBufferSource();
        s.buffer = buf;
        const g = audioCtx.createGain();
        g.gain.value = 0.22;
        s.connect(g);
        g.connect(eqNodes ? eqNodes[0] : audioCtx.destination);
        s.start();
    } catch (e) {}
}

function ensureCrackle() {
    if (!audioCtx || !crackleGain || crackleSrc) return;
    try {
        const dur = 3;
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        let dust = 0;
        for (let i = 0; i < d.length; i++) {
            let v = (Math.random() * 2 - 1) * 0.012;      // 표면 노이즈
            if (Math.random() < 0.00012) dust = 0.25 + Math.random() * 0.75;  // 먼지 팝
            if (dust > 0.001) { v += (Math.random() * 2 - 1) * dust; dust *= 0.72; }
            d[i] = v;
        }
        crackleSrc = audioCtx.createBufferSource();
        crackleSrc.buffer = buf;
        crackleSrc.loop = true;
        crackleSrc.connect(crackleGain);
        crackleSrc.start();
    } catch (e) { crackleSrc = null; }
}

// 스크래치 노이즈 — 회전 중인 판을 손으로 문지를 때의 마찰음.
// 거친 노이즈를 밴드패스(2.4kHz)로 걸러 "치직" 대역만 남긴다. 게인은 ttFrame이 드래그 세기로 구동.
function ensureScratch() {
    if (!audioCtx || !scratchGain || scratchSrc) return;
    try {
        const sr = audioCtx.sampleRate;
        const buf = audioCtx.createBuffer(1, sr * 2, sr);
        const d = buf.getChannelData(0);
        let burst = 0;
        for (let i = 0; i < d.length; i++) {
            let v = (Math.random() * 2 - 1) * 0.35;
            if (Math.random() < 0.004) burst = 0.5 + Math.random() * 0.5;   // 굵은 마찰 알갱이
            if (burst > 0.01) { v += (Math.random() * 2 - 1) * burst; burst *= 0.86; }
            d[i] = v;
        }
        scratchSrc = audioCtx.createBufferSource();
        scratchSrc.buffer = buf;
        scratchSrc.loop = true;
        const bp = audioCtx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400;
        bp.Q.value = 0.7;
        scratchSrc.connect(bp);
        bp.connect(scratchGain);
        scratchSrc.start();
    } catch (e) { scratchSrc = null; }
}

// WebKit(사파리·맥 앱 WKWebView)의 MediaElementSource는 크로스오리진 미디어에서
// CORS가 열려 있어도 무음을 내는 문제가 있다. 크롬 계열에서만 Web Audio 체인을 쓰고,
// 그 외에는 iOS처럼 네이티브 직결 경로로 소리를 보장한다 (음색·이펙트는 계기 표시만).
const SAFARI_LIKE = /AppleWebKit/i.test(navigator.userAgent) && !/Chrome|CriOS|Edg|OPR/i.test(navigator.userAgent);

function ensureAudioGraph() {
    if (SAFARI_LIKE) return false;
    if (audioCtx) return true;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx || !window.MediaRecorder) return false;

    try {
        audioCtx = new Ctx();
        const source = audioCtx.createMediaElementSource(audio);
        gainNode = audioCtx.createGain();
        recDest = audioCtx.createMediaStreamDestination();
        analyser = audioCtx.createAnalyser();
        // 31Hz부터 밴드별 스펙트럼을 분리할 수 있도록 충분한 FFT 해상도를 확보한다.
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.76;
        // BLEND(고음 감쇠)·MODE(모노 다운믹스) 스위치용 노드를 청취 경로에 삽입
        blendFilter = audioCtx.createBiquadFilter();
        blendFilter.type = "lowpass";
        monoGain = audioCtx.createGain();
        // 앰프: 전압 증폭단 → 5단 보이싱 → 출력관 → 정류/전원 새그 → OPT → 스피커 부하
        ampDrive = audioCtx.createGain();
        ampShaper = audioCtx.createWaveShaper();
        ampShaper.oversample = "4x";
        ampBass = audioCtx.createBiquadFilter();
        ampBass.type = "lowshelf";
        ampLowMid = audioCtx.createBiquadFilter();
        ampLowMid.type = "peaking";
        ampMid = audioCtx.createBiquadFilter();
        ampMid.type = "peaking";
        ampPresence = audioCtx.createBiquadFilter();
        ampPresence.type = "peaking";
        ampTreble = audioCtx.createBiquadFilter();
        ampTreble.type = "highshelf";
        ampPowerDrive = audioCtx.createGain();
        ampPowerShaper = audioCtx.createWaveShaper();
        ampPowerShaper.oversample = "4x";
        ampSag = audioCtx.createDynamicsCompressor();
        ampTransformerHP = audioCtx.createBiquadFilter();
        ampTransformerHP.type = "highpass";
        ampTransformerLP = audioCtx.createBiquadFilter();
        ampTransformerLP.type = "lowpass";
        ampDampingBass = audioCtx.createBiquadFilter();
        ampDampingBass.type = "peaking";
        ampDampingHigh = audioCtx.createBiquadFilter();
        ampDampingHigh.type = "highshelf";
        ampOut = audioCtx.createGain();
        source.connect(gainNode).connect(blendFilter).connect(monoGain);
        ampDrive.connect(ampShaper).connect(ampBass).connect(ampLowMid).connect(ampMid).connect(ampPresence).connect(ampTreble)
            .connect(ampPowerDrive).connect(ampPowerShaper).connect(ampSag).connect(ampTransformerHP).connect(ampTransformerLP)
            .connect(ampDampingBass).connect(ampDampingHigh).connect(ampOut).connect(audioCtx.destination);
        // 바이닐 크랙클 (포노 재생 시에만 게인이 올라간다) — EQ 앞에 섞어 앰프 음색까지 입힌다
        crackleGain = audioCtx.createGain();
        crackleGain.gain.value = 0;
        scratchGain = audioCtx.createGain();
        scratchGain.gain.value = 0;
        // EQ 밴드는 현재 모델(GE-5/GE-10)로 구성 — monoGain→EQ→ampDrive + 크랙클/히스 연결
        buildEqChain();
        source.connect(recDest);
        source.connect(analyser);
        applyBlend();
        applyMono();
        applyAmp();
        gainNode.gain.value = volumeLevel * (phonoActive ? PHONO_GAIN : 1);
        audio.volume = 1;
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (isPlaying) startVu();
        return true;
    } catch (error) {
        console.error(error);
        audioCtx = null;
        gainNode = null;
        recDest = null;
        analyser = null;
        blendFilter = null;
        monoGain = null;
        eqNodes = null;
        ampDrive = null;
        ampShaper = null;
        ampBass = null;
        ampLowMid = null;
        ampMid = null;
        ampPresence = null;
        ampTreble = null;
        ampPowerDrive = null;
        ampPowerShaper = null;
        ampSag = null;
        ampTransformerHP = null;
        ampTransformerLP = null;
        ampDampingBass = null;
        ampDampingHigh = null;
        ampOut = null;
        crackleGain = null;
        scratchGain = null;
        return false;
    }
}

function pickRecMime() {
    const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4;codecs=mp4a.40.2",
        "audio/mp4",
        "audio/ogg;codecs=opus"
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}


// ----- 오디오 상태 머신 -----
// idle | resolving | buffering | playing | blocked | error
// 상태 변경은 반드시 setAudioState로 — 표시는 audiostate 이벤트를 구독하는 쪽(app.js)이 담당한다.
let audioState = "idle";
let audioStateInfo = "";
function setAudioState(state, info) {
    info = info || "";
    if (audioState === state && audioStateInfo === info) return;
    audioState = state;
    audioStateInfo = info;
    document.dispatchEvent(new CustomEvent("audiostate", { detail: { state: state, info: info } }));
}
