/* AdventureWedding — AudioManager
   RC2.2 Wedding Music Edition

   SFX playback remains disabled. Chapter music uses owner-supplied music files,
   single-track crossfades, chapter-level routing, and light Memory Album ducking.
*/

(function () {
    "use strict";

    const DEFAULT_SETTINGS = {
        master: 0.90,
        bgm: 0.60,
        ambient: 0.45,
        sfx: 0.85,
        muted: {
            bgm: false,
            ambient: false,
            sfx: false
        }
    };

    const DEFAULT_BGM_FADE_MS = 750;
    const DEFAULT_AMBIENT_FADE_MS = 400;
    const MUSIC_ENABLED_STORAGE_KEY = "adventureWedding.musicEnabled";
    const MEMORY_DUCK_FACTOR = 0.707;
    const BUFFER_CACHE_LIMIT = 32;
    const MAX_ACTIVE_SFX = 8;
    const SFX_ENABLED = false;
    const DEV_WARNINGS = true;
    const CORE_SFX_IDS = [
        "pressStart",
        "uiMove",
        "uiConfirm",
        "uiBack",
        "dialogueNext",
        "interactionPrompt",
        "albumOpen",
        "albumPage",
        "albumClose",
        "memoryUnlock",
        "chapterComplete",
        "cgFadeIn",
        "cgFadeOut",
        "tuotuoVoice",
        "dazhiVoice",
        "blueWorksVinyl"
    ];

    const sfxLimits = {
        dialogueNext: 2,
        uiConfirm: 2,
        uiMove: 2,
        uiBack: 2,
        tuotuoVoice: 1,
        dazhiVoice: 1,
        blueWorksVinyl: 1,
        chapterComplete: 1
    };

    const sfxThrottleMs = {
        dialogueNext: 80
    };

    const sfxDefaultVolumes = {
        dialogueNext: 0.78,
        moriVoice: 0.72,
        leleVoice: 0.74,
        tuotuoVoice: 0.52,
        dazhiVoice: 0.54,
        uiMove: 0.56,
        uiConfirm: 0.64,
        uiBack: 0.54,
        pressStart: 0.68,
        menuOpen: 0.58,
        menuClose: 0.56,
        objectInspect: 0.62,
        npcInteraction: 0.66,
        memoryUnlock: 0.74,
        chapterComplete: 0.82,
        albumOpen: 0.64,
        albumClose: 0.6,
        albumPage: 0.55,
        photoAdded: 0.58,
        cgFadeIn: 0.56,
        cgFadeOut: 0.42,
        blueWorksVinyl: 0.5
    };

    const state = {
        context: null,
        unlocked: false,
        initialized: false,
        masterGain: null,
        categoryGains: {
            bgm: null,
            ambient: null,
            sfx: null
        },
        settings: {
            master: DEFAULT_SETTINGS.master,
            bgm: DEFAULT_SETTINGS.bgm,
            ambient: DEFAULT_SETTINGS.ambient,
            sfx: DEFAULT_SETTINGS.sfx,
            muted: { ...DEFAULT_SETTINGS.muted }
        },
        decodedBuffers: new Map(),
        pendingLoads: new Map(),
        missingWarnings: new Set(),
        failedAssets: new Map(),
        loadingState: "idle",
        lastAudioError: "",
        musicEnabled: true,
        currentBGM: null,
        bgmSource: null,
        activeBGMSources: new Set(),
        bgmRequestId: 0,
        bgmStartedAt: 0,
        bgmOffset: 0,
        currentAmbient: null,
        ambientSource: null,
        activeSFX: new Map(),
        lastSFXAt: new Map(),
        lastPickedAsset: new Map(),
        lastScene: null,
        pausedByVisibility: false,
        foregroundGestureRecoveryPending: false,
        resumePromise: null,
        memoryStack: [],
        memoryDuckDepth: 0,
        duckReasons: new Map(),
        unlockListenersAttached: false,
        lastPlayedSFX: null
    };

    function loadMusicPreference() {
        try {
            const stored = localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY);
            if (stored === "false") state.musicEnabled = false;
            if (stored === "true") state.musicEnabled = true;
        } catch {
            state.musicEnabled = true;
        }
    }

    function saveMusicPreference() {
        try {
            localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, state.musicEnabled ? "true" : "false");
        } catch {
            // Private browsing or storage restrictions should not break audio.
        }
    }

    function createContext() {
        if (state.context) return state.context;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;

        state.context = new AudioContextClass();
        state.masterGain = state.context.createGain();
        state.categoryGains.bgm = state.context.createGain();
        state.categoryGains.ambient = state.context.createGain();
        state.categoryGains.sfx = state.context.createGain();

        state.categoryGains.bgm.connect(state.masterGain);
        state.categoryGains.ambient.connect(state.masterGain);
        state.categoryGains.sfx.connect(state.masterGain);
        state.masterGain.connect(state.context.destination);
        updateAllGainValues();
        return state.context;
    }

    function clamp01(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return 0;
        return Math.max(0, Math.min(1, number));
    }

    function warnMissing(category, id) {
        const key = `${category}:${id}`;
        if (state.missingWarnings.has(key)) return;
        state.missingWarnings.add(key);
        if (DEV_WARNINGS && console?.debug) {
            console.debug(`[AudioManager] Missing audio asset: ${key}`);
        }
    }

    function recordFailedAsset(category, id, url, error, meta = {}) {
        const key = `${category}:${id}:${url}`;
        state.lastAudioError = error?.message || String(error || "unknown");
        if (state.failedAssets.has(key)) return;
        state.failedAssets.set(key, {
            category,
            id,
            url,
            status: meta.status ?? null,
            contentType: meta.contentType ?? "",
            contextState: state.context?.state ?? "missing",
            error: error?.message || String(error || "unknown")
        });
        if (DEV_WARNINGS && console?.warn) {
            console.warn(`[Audio] Failed to load "${id}": ${url}`, {
                assetId: id,
                url,
                httpStatus: meta.status ?? null,
                contentType: meta.contentType ?? "",
                contextState: state.context?.state ?? "missing",
                error
            });
        }
    }

    function getBGMConfig(id) {
        if (!id) return null;
        const config = window.MUSIC?.[id] || null;
        if (config?.src) return config;
        return null;
    }

    function getCurrentBGMTitle() {
        const config = getBGMConfig(state.currentBGM);
        if (!config) return "";
        return config.artist ? `${config.title} — ${config.artist}` : config.title || config.id || state.currentBGM;
    }

    function currentBGMLoaded() {
        const config = getBGMConfig(state.currentBGM);
        return Boolean(config?.src && state.decodedBuffers.has(`bgm:${config.src}`));
    }

    function getAsset(category, id) {
        if (!id) return null;
        if (category === "bgm") {
            const bgmConfig = getBGMConfig(id);
            if (bgmConfig?.src) return bgmConfig.src;
            warnMissing(category, id);
            return null;
        }
        const asset = window.AUDIO_ASSETS?.[category]?.[id] || null;
        if (!asset) warnMissing(category, id);
        return asset;
    }

    function pickAsset(category, id) {
        const asset = getAsset(category, id);
        if (Array.isArray(asset)) {
            if (!asset.length) {
                warnMissing(category, id);
                return null;
            }
            if (asset.length === 1) return asset[0];
            const last = state.lastPickedAsset.get(`${category}:${id}`);
            const choices = asset.filter(candidate => candidate !== last);
            const picked = choices[Math.floor(Math.random() * choices.length)];
            state.lastPickedAsset.set(`${category}:${id}`, picked);
            return picked;
        }
        return asset;
    }

    async function fetchAudioArrayBuffer(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}`);
                error.__audioMeta = {
                    status: response.status,
                    contentType: response.headers?.get?.("content-type") || ""
                };
                throw error;
            }
            return {
                arrayBuffer: await response.arrayBuffer(),
                status: response.status,
                contentType: response.headers?.get?.("content-type") || ""
            };
        } catch (fetchError) {
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open("GET", url, true);
                request.responseType = "arraybuffer";
                request.onload = () => {
                    if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
                        resolve({
                            arrayBuffer: request.response,
                            status: request.status || 200,
                            contentType: request.getResponseHeader("Content-Type") || ""
                        });
                    } else {
                        const error = new Error(`HTTP ${request.status}`);
                        error.__audioMeta = {
                            status: request.status,
                            contentType: request.getResponseHeader("Content-Type") || ""
                        };
                        reject(error);
                    }
                };
                request.onerror = () => {
                    const error = new Error(fetchError?.message || "network error");
                    error.__audioMeta = fetchError?.__audioMeta || {};
                    reject(error);
                };
                request.send();
            });
        }
    }

    function gainSet(gainNode, value, fadeMs = 0) {
        if (!gainNode || !state.context) return;
        const target = clamp01(value);
        const now = state.context.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        if (fadeMs > 0) {
            gainNode.gain.linearRampToValueAtTime(target, now + fadeMs / 1000);
        } else {
            gainNode.gain.setValueAtTime(target, now);
        }
    }

    function categoryOutputVolume(category) {
        if (category === "bgm" && !state.musicEnabled) return 0;
        return state.settings.muted[category] ? 0 : state.settings[category];
    }

    function bgmDuckFactor() {
        if (!state.duckReasons.size) return 1;
        return Math.min(...Array.from(state.duckReasons.values()).map(value => clamp01(value)));
    }

    function bgmOutputVolume() {
        return categoryOutputVolume("bgm") * bgmDuckFactor();
    }

    function updateAllGainValues() {
        if (!state.masterGain) return;
        gainSet(state.masterGain, state.settings.master);
        gainSet(state.categoryGains.bgm, bgmOutputVolume());
        gainSet(state.categoryGains.ambient, categoryOutputVolume("ambient"));
        gainSet(state.categoryGains.sfx, categoryOutputVolume("sfx"));
    }

    function attachUnlockListeners() {
        if (state.unlockListenersAttached) return;
        state.unlockListenersAttached = true;
        ["pointerdown", "touchend", "keydown"].forEach(type => {
            window.addEventListener(type, unlockFromGesture, { passive: true, capture: true });
        });
    }

    function detachUnlockListeners() {
        if (!state.unlockListenersAttached) return;
        state.unlockListenersAttached = false;
        ["pointerdown", "touchend", "keydown"].forEach(type => {
            window.removeEventListener(type, unlockFromGesture, { capture: true });
        });
    }

    function unlockFromGesture() {
        void AudioManager.unlock({ fromGesture: true });
    }

    async function playSilentUnlockBuffer() {
        const context = createContext();
        if (!context) return false;
        const buffer = context.createBuffer(1, 1, Math.max(8000, context.sampleRate));
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(state.masterGain);
        source.start(0);
        return true;
    }

    function releaseSource(source, fadeMs = 0) {
        if (!source || !state.context) return;
        const gain = source.__gainNode;
        if (gain) gainSet(gain, 0, fadeMs);
        const stopDelay = Math.max(0.02, fadeMs / 1000 + 0.04);
        try {
            source.stop(state.context.currentTime + stopDelay);
        } catch {
            // Stopping an already-ended source is harmless.
        }
    }

    function createLoopSource(buffer, category, volume = 1, offset = 0, loop = true) {
        if (!state.context || !buffer) return null;
        const source = state.context.createBufferSource();
        const gain = state.context.createGain();
        source.buffer = buffer;
        source.loop = loop;
        gain.gain.value = clamp01(volume);
        source.connect(gain);
        gain.connect(state.categoryGains[category]);
        source.__gainNode = gain;
        source.__offset = offset;
        source.__startedAt = state.context.currentTime - offset;
        source.__category = category;
        return source;
    }

    async function loadBuffer(category, id, explicitAsset = null) {
        const asset = explicitAsset || getAsset(category, id);
        if (!asset || !state.context) return null;
        const cacheKey = `${category}:${asset}`;
        if (state.decodedBuffers.has(cacheKey)) return state.decodedBuffers.get(cacheKey);
        if (state.pendingLoads.has(cacheKey)) return state.pendingLoads.get(cacheKey);

        state.loadingState = `loading:${category}:${id}`;
        const loadPromise = fetchAudioArrayBuffer(asset)
            .then(payload => state.context.decodeAudioData(payload.arrayBuffer).catch(error => {
                error.__audioMeta = {
                    status: payload.status,
                    contentType: payload.contentType,
                    decode: true
                };
                throw error;
            }))
            .then(buffer => {
                state.decodedBuffers.set(cacheKey, buffer);
                state.pendingLoads.delete(cacheKey);
                state.loadingState = state.pendingLoads.size ? "loading" : "idle";
                trimBufferCache();
                return buffer;
            })
            .catch(error => {
                state.pendingLoads.delete(cacheKey);
                state.loadingState = state.pendingLoads.size ? "loading" : "idle";
                recordFailedAsset(category, id, asset, error, error?.__audioMeta || {});
                return null;
            });

        state.pendingLoads.set(cacheKey, loadPromise);
        return loadPromise;
    }

    function trimBufferCache() {
        while (state.decodedBuffers.size > BUFFER_CACHE_LIMIT) {
            const firstKey = state.decodedBuffers.keys().next().value;
            state.decodedBuffers.delete(firstKey);
        }
    }

    function getBGMPosition() {
        if (!state.context || !state.bgmSource) return state.bgmOffset || 0;
        const bufferDuration = state.bgmSource.buffer?.duration || 0;
        if (!bufferDuration) return 0;
        const elapsed = state.context.currentTime - state.bgmStartedAt;
        if (!state.bgmSource.loop) return Math.min(elapsed, bufferDuration);
        const loopStart = state.bgmSource.loopStart || 0;
        const loopEnd = state.bgmSource.loopEnd || bufferDuration;
        const loopLength = Math.max(0.01, loopEnd - loopStart);
        if (elapsed < loopEnd) return elapsed;
        return loopStart + ((elapsed - loopStart) % loopLength);
    }

    async function playBGM(id, options = {}) {
        if (!id) {
            AudioManager.stopBGM(options);
            return;
        }
        const previousId = state.currentBGM;
        state.currentBGM = id;
        if (!state.musicEnabled || state.settings.muted.bgm) {
            state.bgmRequestId += 1;
            if (state.bgmSource) releaseSource(state.bgmSource, options.fadeOutMs ?? DEFAULT_BGM_FADE_MS);
            state.bgmSource = null;
            return;
        }
        if (!state.unlocked) {
            return;
        }
        if (previousId === id && state.bgmSource && !options.restart) return;
        const requestId = ++state.bgmRequestId;
        const previous = state.bgmSource;
        if (previous) releaseSource(previous, options.fadeOutMs ?? DEFAULT_BGM_FADE_MS);

        state.currentBGM = id;
        const bgmConfig = getBGMConfig(id);
        const buffer = await loadBuffer("bgm", id, bgmConfig?.src);
        if (!buffer || state.currentBGM !== id || !state.unlocked || requestId !== state.bgmRequestId) return;

        const offset = options.resumePosition ? Math.min(options.resumePosition, buffer.duration - 0.01) : 0;
        const shouldLoop = options.loop ?? bgmConfig?.loop ?? true;
        const source = createLoopSource(buffer, "bgm", 0, offset, shouldLoop);
        if (!source) return;
        if (shouldLoop && Number.isFinite(bgmConfig?.loopStartSeconds) && Number.isFinite(bgmConfig?.loopEndSeconds)) {
            source.loopStart = Math.max(0, bgmConfig.loopStartSeconds);
            source.loopEnd = Math.min(buffer.duration, bgmConfig.loopEndSeconds);
        }
        state.bgmSource = source;
        state.activeBGMSources.add(source);
        state.bgmStartedAt = state.context.currentTime - offset;
        state.bgmOffset = offset;
        source.onended = () => {
            state.activeBGMSources.delete(source);
            if (state.bgmSource === source) state.bgmSource = null;
        };
        try {
            source.start(0, offset);
            gainSet(source.__gainNode, 1, options.fadeInMs ?? DEFAULT_BGM_FADE_MS);
        } catch {
            state.bgmSource = null;
        }
    }

    function stopBGM(options = {}) {
        state.bgmRequestId += 1;
        if (state.bgmSource) releaseSource(state.bgmSource, options.fadeOutMs ?? DEFAULT_BGM_FADE_MS);
        state.bgmSource = null;
        state.currentBGM = null;
        state.bgmOffset = 0;
    }

    async function playAmbient(id, options = {}) {
        if (!id) {
            AudioManager.stopAmbient(options);
            return;
        }
        if (!state.unlocked) {
            state.currentAmbient = id;
            return;
        }
        if (state.currentAmbient === id && state.ambientSource && !options.restart) return;
        if (state.ambientSource) releaseSource(state.ambientSource, options.fadeOutMs ?? DEFAULT_AMBIENT_FADE_MS);

        state.currentAmbient = id;
        const buffer = await loadBuffer("ambient", id);
        if (!buffer || state.currentAmbient !== id || !state.unlocked) return;

        const source = createLoopSource(buffer, "ambient", 0, 0, options.loop !== false);
        if (!source) return;
        state.ambientSource = source;
        source.onended = () => {
            if (state.ambientSource === source) state.ambientSource = null;
        };
        try {
            source.start(0);
            gainSet(source.__gainNode, 1, options.fadeInMs ?? DEFAULT_AMBIENT_FADE_MS);
        } catch {
            state.ambientSource = null;
        }
    }

    function stopAmbient(options = {}) {
        if (state.ambientSource) releaseSource(state.ambientSource, options.fadeOutMs ?? DEFAULT_AMBIENT_FADE_MS);
        state.ambientSource = null;
        state.currentAmbient = null;
    }

    async function playSFX(id, options = {}) {
        // RC2.2 keeps every sound effect muted while preserving the audio API.
        if (!SFX_ENABLED) return false;
        return playSFXInternal(id, options);
    }

    async function playSFXInternal(id, options = {}) {
        if (!id) return;
        if (!state.unlocked) {
            AudioManager.unlock();
            return;
        }
        if (totalActiveSFXCount() >= MAX_ACTIVE_SFX) return;
        const nowMs = performance.now();
        const throttle = sfxThrottleMs[id] || options.throttleMs || 0;
        const last = state.lastSFXAt.get(id) || 0;
        if (throttle && nowMs - last < throttle) return;

        const active = state.activeSFX.get(id) || new Set();
        const limit = options.limit || sfxLimits[id] || 4;
        if (active.size >= limit) return;

        const asset = pickAsset("sfx", id);
        if (!asset) return;
        const buffer = await loadBuffer("sfx", id, asset);
        if (!buffer || !state.unlocked) return;
        if (totalActiveSFXCount() >= MAX_ACTIVE_SFX) return;

        const source = state.context.createBufferSource();
        const gain = state.context.createGain();
        source.buffer = buffer;
        gain.gain.value = clamp01(options.volume ?? sfxDefaultVolumes[id] ?? 1);
        source.connect(gain);
        gain.connect(state.categoryGains.sfx);
        active.add(source);
        state.activeSFX.set(id, active);
        state.lastSFXAt.set(id, nowMs);
        source.onended = () => {
            active.delete(source);
            if (!active.size) state.activeSFX.delete(id);
        };
        try {
            source.start(0);
            state.lastPlayedSFX = id;
        } catch {
            active.delete(source);
        }
    }

    function pauseAll() {
        if (!state.context || state.context.state === "closed") return;
        state.bgmOffset = getBGMPosition();
        state.bgmRequestId += 1;
        if (state.bgmSource) {
            const source = state.bgmSource;
            state.bgmSource = null;
            try { source.stop(0); } catch {}
        }
        void state.context.suspend?.();
    }

    async function resumeAllInternal(options = {}) {
        if (!state.context || !state.unlocked || state.context.state === "closed") return false;

        try {
            if (state.context.state !== "running") {
                await state.context.resume?.();
            }
        } catch (error) {
            state.pausedByVisibility = true;
            attachUnlockListeners();
            if (DEV_WARNINGS && console?.debug) {
                console.debug("[Audio] Resume deferred until the next user gesture.", error);
            }
            return false;
        }

        if (state.context.state !== "running") {
            state.pausedByVisibility = true;
            attachUnlockListeners();
            return false;
        }

        state.pausedByVisibility = false;

        if (options.forceBGMRestart && state.currentBGM) {
            state.bgmOffset = getBGMPosition();
            if (state.bgmSource) {
                const source = state.bgmSource;
                state.bgmSource = null;
                try { source.stop(0); } catch {}
            }
        }

        if (state.currentBGM && !state.bgmSource && state.musicEnabled && !state.settings.muted.bgm) {
            await playBGM(state.currentBGM, {
                resumePosition: state.bgmOffset || 0,
                fadeInMs: 180
            });
        }

        if (!state.foregroundGestureRecoveryPending) {
            detachUnlockListeners();
        }
        return true;
    }

    function resumeAll(options = {}) {
        if (state.resumePromise) {
            if (options.forceBGMRestart) {
                return state.resumePromise.then(() => resumeAll(options));
            }
            return state.resumePromise;
        }

        state.resumePromise = resumeAllInternal(options).finally(() => {
            state.resumePromise = null;
        });

        return state.resumePromise;
    }

    function resumeCurrentBGM(options = {}) {
        if (!state.currentBGM || state.bgmSource || !state.unlocked || !state.musicEnabled || state.settings.muted.bgm) return false;
        playBGM(state.currentBGM, {
            resumePosition: state.bgmOffset || 0,
            fadeInMs: options.fadeInMs ?? 260
        });
        return true;
    }

    function applySceneAudio(sceneId) {
        if (!sceneId || state.lastScene === sceneId) return;
        state.lastScene = sceneId;
        const scene = window.SCENE_AUDIO?.[sceneId] || {};
        if (scene.preserve) return;
        if (scene.preload) AudioManager.preloadGroup(scene.preload);
        if (scene.bgm) playBGM(scene.bgm);
        else stopBGM({ fadeOutMs: scene.fadeOutMs ?? DEFAULT_BGM_FADE_MS });
        if (scene.ambient) playAmbient(scene.ambient);
        else stopAmbient();
    }

    function applyBGMDuck(fadeMs = 450) {
        gainSet(state.categoryGains.bgm, bgmOutputVolume(), fadeMs);
    }

    function duck(reason = "default", amount = MEMORY_DUCK_FACTOR, fadeMs = 450) {
        state.duckReasons.set(String(reason), clamp01(amount));
        applyBGMDuck(fadeMs);
    }

    function unduck(reason = "default", fadeMs = 450) {
        state.duckReasons.delete(String(reason));
        applyBGMDuck(fadeMs);
    }

    function beginMemory(id, explicitOverride = null, options = {}) {
        if (options.duck) {
            state.memoryDuckDepth += 1;
            duck(`memory:${id || "album"}`, options.duckAmount ?? MEMORY_DUCK_FACTOR);
            return;
        }
        const override = explicitOverride || window.MEMORY_AUDIO_OVERRIDES?.[id];
        if (!override) return;
        state.memoryStack.push({
            bgm: state.currentBGM,
            position: getBGMPosition()
        });
        playBGM(override, { restart: false });
    }

    function endMemory(id, explicitOverride = null, options = {}) {
        if (options.duck) {
            state.memoryDuckDepth = Math.max(0, state.memoryDuckDepth - 1);
            unduck(`memory:${id || "album"}`);
            return;
        }
        const override = explicitOverride || window.MEMORY_AUDIO_OVERRIDES?.[id];
        if (!override) return;
        const previous = state.memoryStack.pop();
        if (previous?.bgm) {
            playBGM(previous.bgm, { resumePosition: previous.position || 0 });
        } else {
            stopBGM();
        }
    }

    function preloadGroup(groupId) {
        if (!state.unlocked) return Promise.resolve([]);
        const group = window.AUDIO_PRELOAD_GROUPS?.[groupId] || [];
        const loads = [];
        group.forEach(([category, id]) => {
            if (category === "sfx" && !SFX_ENABLED) return;
            const loadCategory = category === "music" ? "bgm" : category;
            const asset = getAsset(loadCategory, id);
            if (Array.isArray(asset)) {
                asset.forEach(path => loads.push(loadBuffer(loadCategory, id, path)));
            } else {
                loads.push(loadBuffer(loadCategory, id, asset));
            }
        });
        return Promise.all(loads);
    }

    function handleVisibilityHidden() {
        if (!state.context || state.context.state === "closed") return;
        state.pausedByVisibility = state.pausedByVisibility
            || Boolean(state.currentBGM || state.currentAmbient || totalActiveSFXCount());
        state.foregroundGestureRecoveryPending = Boolean(state.currentBGM);
        if (state.foregroundGestureRecoveryPending) attachUnlockListeners();
        pauseAll();
    }

    async function handleVisibilityVisible() {
        if (!state.context) return;
        if (state.context.state === "closed") {
            state.context = null;
            state.unlocked = false;
            state.bgmSource = null;
            state.ambientSource = null;
            attachUnlockListeners();
            return;
        }
        const forceBGMRestart = Boolean(
            state.foregroundGestureRecoveryPending
            && state.currentBGM
            && state.musicEnabled
            && !state.settings.muted.bgm
        );
        if (!state.pausedByVisibility && state.context.state === "running" && !forceBGMRestart) return;

        // iOS Safari can keep a stale AudioBufferSourceNode after returning to
        // the page. Recreate the active BGM source once instead of trusting the
        // old node, while retaining gesture recovery if autoplay is blocked.
        if (forceBGMRestart) state.foregroundGestureRecoveryPending = false;
        const resumed = await resumeAll({ forceBGMRestart });
        if (resumed) {
            state.foregroundGestureRecoveryPending = false;
            detachUnlockListeners();
        } else if (state.currentBGM && state.musicEnabled) {
            state.foregroundGestureRecoveryPending = true;
            attachUnlockListeners();
        }
    }

    function totalActiveSFXCount() {
        let total = 0;
        state.activeSFX.forEach(set => { total += set.size; });
        return total;
    }

    const AudioManager = {
        init() {
            if (state.initialized) return;
            state.initialized = true;
            loadMusicPreference();
            attachUnlockListeners();
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "hidden") handleVisibilityHidden();
                else handleVisibilityVisible();
            });
            window.addEventListener("blur", handleVisibilityHidden);
            window.addEventListener("pagehide", handleVisibilityHidden);
            window.addEventListener("pageshow", handleVisibilityVisible);
            window.addEventListener("focus", handleVisibilityVisible);
        },

        async unlock(options = {}) {
            if (state.unlocked) {
                const forceBGMRestart = Boolean(
                    options.fromGesture && state.foregroundGestureRecoveryPending
                );
                if (forceBGMRestart) {
                    state.foregroundGestureRecoveryPending = false;
                }
                const resumed = await resumeAll({ forceBGMRestart });
                if (!resumed && forceBGMRestart) {
                    state.foregroundGestureRecoveryPending = true;
                    attachUnlockListeners();
                }
                return resumed;
            }
            const context = createContext();
            if (!context) return false;
            try {
                if (context.state !== "running") await context.resume();
                await playSilentUnlockBuffer();
                if (context.state !== "running") {
                    state.unlocked = false;
                    attachUnlockListeners();
                    return false;
                }
                state.unlocked = true;
                state.foregroundGestureRecoveryPending = false;
                detachUnlockListeners();
                AudioManager.preloadGroup("core-ui");
                if (state.lastScene) {
                    const scene = state.lastScene;
                    state.lastScene = null;
                    applySceneAudio(scene);
                }
                resumeCurrentBGM({ fadeInMs: 260 });
                return true;
            } catch (error) {
                state.unlocked = false;
                attachUnlockListeners();
                if (DEV_WARNINGS && console?.warn) {
                    console.warn("[Audio] Unlock failed; waiting for the next user gesture.", {
                        contextState: context.state,
                        error
                    });
                }
                return false;
            }
        },

        playBGM,
        play: playBGM,
        stopBGM,
        stop: stopBGM,
        playAmbient,
        stopAmbient,
        playSFX,
        pauseAll,
        pause: pauseAll,
        resumeAll,
        resume: resumeAll,
        resumeCurrentBGM,
        applySceneAudio,
        beginMemory,
        endMemory,
        duck,
        unduck,
        preloadGroup,

        async testAsset(id) {
            const asset = getAsset("sfx", id);
            const url = Array.isArray(asset) ? asset[0] : asset;
            const result = {
                id,
                url: url || null,
                registered: Boolean(url),
                fetched: false,
                decoded: false,
                duration: 0,
                playable: false,
                error: null
            };
            if (!url) {
                result.error = "not registered";
                return result;
            }
            const context = createContext();
            if (!context) {
                result.error = "AudioContext missing";
                return result;
            }
            try {
                const buffer = await loadBuffer("sfx", id, url);
                result.fetched = Boolean(buffer);
                result.decoded = Boolean(buffer);
                result.duration = buffer?.duration || 0;
                result.playable = Boolean(buffer && state.unlocked && context.state === "running");
            } catch (error) {
                result.error = error?.message || String(error);
            }
            return result;
        },

        async testCoreSFX() {
            const results = {};
            for (const id of CORE_SFX_IDS) {
                results[id] = await AudioManager.testAsset(id);
            }
            return results;
        },

        setMasterVolume(value) {
            state.settings.master = clamp01(value);
            gainSet(state.masterGain, state.settings.master);
        },

        setVolume(value) {
            AudioManager.setMasterVolume(value);
        },

        fadeTo(categoryOrValue, valueOrFadeMs = DEFAULT_BGM_FADE_MS, fadeMs = DEFAULT_BGM_FADE_MS) {
            if (typeof categoryOrValue !== "string") {
                state.settings.master = clamp01(categoryOrValue);
                gainSet(state.masterGain, state.settings.master, valueOrFadeMs);
                return;
            }
            const category = categoryOrValue;
            const value = valueOrFadeMs;
            if (category === "master") {
                state.settings.master = clamp01(value);
                gainSet(state.masterGain, state.settings.master, fadeMs);
                return;
            }
            if (!["bgm", "ambient", "sfx"].includes(category)) return;
            state.settings[category] = clamp01(value);
            gainSet(
                state.categoryGains[category],
                category === "bgm" ? bgmOutputVolume() : categoryOutputVolume(category),
                fadeMs
            );
        },

        setCategoryVolume(category, value) {
            if (!["bgm", "ambient", "sfx"].includes(category)) return;
            state.settings[category] = clamp01(value);
            gainSet(
                state.categoryGains[category],
                category === "bgm" ? bgmOutputVolume() : categoryOutputVolume(category)
            );
        },

        muteCategory(category, muted) {
            if (!["bgm", "ambient", "sfx"].includes(category)) return;
            state.settings.muted[category] = Boolean(muted);
            gainSet(
                state.categoryGains[category],
                category === "bgm" ? bgmOutputVolume() : categoryOutputVolume(category)
            );
            if (category === "bgm" && !muted && state.currentBGM && state.unlocked && !state.bgmSource) {
                playBGM(state.currentBGM, { resumePosition: state.bgmOffset || 0, fadeInMs: 220 });
            }
        },

        setMusicEnabled(enabled) {
            state.musicEnabled = Boolean(enabled);
            saveMusicPreference();
            applyBGMDuck(220);
            if (!state.musicEnabled) {
                state.bgmRequestId += 1;
                state.bgmOffset = getBGMPosition();
                if (state.bgmSource) releaseSource(state.bgmSource, DEFAULT_BGM_FADE_MS);
                state.bgmSource = null;
            } else if (state.currentBGM && state.unlocked && !state.bgmSource) {
                playBGM(state.currentBGM, { resumePosition: state.bgmOffset || 0, fadeInMs: 260 });
            }
        },

        async restartMusic() {
            state.musicEnabled = true;
            saveMusicPreference();
            applyBGMDuck(0);

            const unlocked = await AudioManager.unlock({ fromGesture: true });
            if (!unlocked) return false;

            return resumeAll({ forceBGMRestart: true });
        },

        isMusicEnabled() {
            return state.musicEnabled;
        },

        isUnlocked() {
            return state.unlocked;
        },

        getCurrentTrackId() {
            return state.currentBGM;
        },

        getBGMPosition,

        destroy() {
            stopBGM({ fadeOutMs: 0 });
            stopAmbient({ fadeOutMs: 0 });
            state.activeSFX.forEach(set => set.forEach(source => {
                try { source.stop(); } catch {}
            }));
            state.activeSFX.clear();
            state.activeBGMSources.clear();
            detachUnlockListeners();
            if (state.context && state.context.state !== "closed") state.context.close();
            state.context = null;
            state.unlocked = false;
            state.foregroundGestureRecoveryPending = false;
            state.resumePromise = null;
            state.initialized = false;
        },

        getStatus() {
            return {
                initialized: state.initialized,
                unlocked: state.unlocked,
                contextState: state.context?.state || "missing",
                musicEnabled: state.musicEnabled,
                currentBGM: state.currentBGM,
                currentTrackId: state.currentBGM,
                currentTrackTitle: getCurrentBGMTitle(),
                currentTrackLoaded: currentBGMLoaded(),
                currentAmbient: state.currentAmbient,
                playbackTime: getBGMPosition(),
                loop: Boolean(state.bgmSource?.loop),
                loopStart: state.bgmSource?.loopStart || 0,
                loopEnd: state.bgmSource?.loopEnd || 0,
                bgmVolume: state.settings.bgm,
                effectiveBGMVolume: bgmOutputVolume(),
                ambientVolume: state.settings.ambient,
                sfxVolume: state.settings.sfx,
                sfxEnabled: SFX_ENABLED,
                masterVolume: state.settings.master,
                masterMuted: false,
                bgmMuted: state.settings.muted.bgm,
                sfxMuted: state.settings.muted.sfx,
                duckingState: Array.from(state.duckReasons.entries()).map(([reason, amount]) => ({ reason, amount })),
                loadingState: state.loadingState,
                lastAudioError: state.lastAudioError,
                activePlaybackInstanceCount: state.activeBGMSources.size + totalActiveSFXCount() + (state.ambientSource ? 1 : 0),
                activeBGMSourceCount: state.activeBGMSources.size,
                activeSFXCount: totalActiveSFXCount(),
                decodedBufferCount: state.decodedBuffers.size,
                loadedBuffers: state.decodedBuffers.size,
                failedAssetCount: state.failedAssets.size,
                failedAssets: Array.from(state.failedAssets.values()),
                lastPlayedSFX: state.lastPlayedSFX
            };
        }
    };

    Object.defineProperties(AudioManager, {
        initialized: { get: () => state.initialized },
        unlocked: { get: () => state.unlocked },
        context: { get: () => state.context },
        masterVolume: { get: () => state.settings.master },
        bgmVolume: { get: () => state.settings.bgm },
        sfxVolume: { get: () => state.settings.sfx },
        masterMuted: { get: () => false },
        bgmMuted: { get: () => state.settings.muted.bgm },
        sfxMuted: { get: () => state.settings.muted.sfx },
        currentTrackId: { get: () => state.currentBGM },
        musicEnabled: { get: () => state.musicEnabled },
        loadedBuffers: { get: () => state.decodedBuffers.size },
        failedAssets: { get: () => Array.from(state.failedAssets.values()) },
        lastPlayedSFX: { get: () => state.lastPlayedSFX }
    });

    window.AudioManager = AudioManager;
    window.getAudioStatus = () => ({
        initialized: AudioManager.initialized,
        unlocked: AudioManager.unlocked,
        contextState: AudioManager.context?.state ?? "missing",
        musicEnabled: AudioManager.musicEnabled,
        currentTrackId: AudioManager.currentTrackId,
        currentTrackTitle: AudioManager.getStatus().currentTrackTitle,
        currentTrackLoaded: AudioManager.getStatus().currentTrackLoaded,
        playbackTime: AudioManager.getBGMPosition?.() ?? 0,
        masterVolume: AudioManager.masterVolume,
        bgmVolume: AudioManager.bgmVolume,
        sfxVolume: AudioManager.sfxVolume,
        sfxEnabled: SFX_ENABLED,
        masterMuted: AudioManager.masterMuted,
        bgmMuted: AudioManager.bgmMuted,
        sfxMuted: AudioManager.sfxMuted,
        loadedBuffers: AudioManager.loadedBuffers,
        failedAssets: AudioManager.failedAssets,
        fullStatus: AudioManager.getStatus(),
        lastPlayedSFX: AudioManager.lastPlayedSFX
    });
    window.testCoreSFX = () => AudioManager.testCoreSFX();
})();
