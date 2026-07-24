/* AdventureWedding — AudioManager
   Build v0.9.6.3.1 Companion Voice Timbre Correction

   This file intentionally contains no approved music. It provides the shared
   architecture so future chapters can add assets without scene-local audio.
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

    const DEFAULT_BGM_FADE_MS = 600;
    const DEFAULT_AMBIENT_FADE_MS = 400;
    const BUFFER_CACHE_LIMIT = 32;
    const MAX_ACTIVE_SFX = 8;
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
        currentBGM: null,
        bgmSource: null,
        bgmStartedAt: 0,
        bgmOffset: 0,
        currentAmbient: null,
        ambientSource: null,
        activeSFX: new Map(),
        lastSFXAt: new Map(),
        lastPickedAsset: new Map(),
        lastScene: null,
        pausedByVisibility: false,
        memoryStack: [],
        unlockListenersAttached: false,
        lastPlayedSFX: null
    };

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

    function getAsset(category, id) {
        if (!id) return null;
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
        return state.settings.muted[category] ? 0 : state.settings[category];
    }

    function updateAllGainValues() {
        if (!state.masterGain) return;
        gainSet(state.masterGain, state.settings.master);
        gainSet(state.categoryGains.bgm, categoryOutputVolume("bgm"));
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
        AudioManager.unlock();
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
        return source;
    }

    async function loadBuffer(category, id, explicitAsset = null) {
        const asset = explicitAsset || getAsset(category, id);
        if (!asset || !state.context) return null;
        const cacheKey = `${category}:${id}:${asset}`;
        if (state.decodedBuffers.has(cacheKey)) return state.decodedBuffers.get(cacheKey);
        if (state.pendingLoads.has(cacheKey)) return state.pendingLoads.get(cacheKey);

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
                trimBufferCache();
                return buffer;
            })
            .catch(error => {
                state.pendingLoads.delete(cacheKey);
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
        return (state.context.currentTime - state.bgmStartedAt) % bufferDuration;
    }

    async function playBGM(id, options = {}) {
        if (!id) {
            AudioManager.stopBGM(options);
            return;
        }
        if (!state.unlocked) {
            state.currentBGM = id;
            return;
        }
        if (state.currentBGM === id && state.bgmSource && !options.restart) return;
        const previous = state.bgmSource;
        if (previous) releaseSource(previous, options.fadeOutMs ?? DEFAULT_BGM_FADE_MS);

        state.currentBGM = id;
        const buffer = await loadBuffer("bgm", id);
        if (!buffer || state.currentBGM !== id || !state.unlocked) return;

        const offset = options.resumePosition ? Math.min(options.resumePosition, buffer.duration - 0.01) : 0;
        const source = createLoopSource(buffer, "bgm", 0, offset, options.loop !== false);
        if (!source) return;
        state.bgmSource = source;
        state.bgmStartedAt = state.context.currentTime - offset;
        state.bgmOffset = offset;
        source.onended = () => {
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
        state.context.suspend?.();
    }

    function resumeAll() {
        if (!state.context || !state.unlocked || state.context.state === "closed") return;
        state.context.resume?.();
    }

    function applySceneAudio(sceneId) {
        if (!sceneId || state.lastScene === sceneId) return;
        state.lastScene = sceneId;
        const scene = window.SCENE_AUDIO?.[sceneId] || {};
        if (scene.preserve) return;
        if (scene.preload) AudioManager.preloadGroup(scene.preload);
        if (scene.bgm) playBGM(scene.bgm);
        else stopBGM();
        if (scene.ambient) playAmbient(scene.ambient);
        else stopAmbient();
    }

    function beginMemory(id, explicitOverride = null) {
        const override = explicitOverride || window.MEMORY_AUDIO_OVERRIDES?.[id];
        if (!override) return;
        state.memoryStack.push({
            bgm: state.currentBGM,
            position: getBGMPosition()
        });
        playBGM(override, { restart: false });
    }

    function endMemory(id, explicitOverride = null) {
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
            const asset = getAsset(category, id);
            if (Array.isArray(asset)) {
                asset.forEach(path => loads.push(loadBuffer(category, id, path)));
            } else {
                loads.push(loadBuffer(category, id, asset));
            }
        });
        return Promise.all(loads);
    }

    function handleVisibilityHidden() {
        if (!state.context || state.context.state !== "running") return;
        state.pausedByVisibility = Boolean(state.currentBGM || state.currentAmbient || totalActiveSFXCount());
        pauseAll();
    }

    function handleVisibilityVisible() {
        if (!state.pausedByVisibility) return;
        state.pausedByVisibility = false;
        resumeAll();
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
            attachUnlockListeners();
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "hidden") handleVisibilityHidden();
                else handleVisibilityVisible();
            });
            window.addEventListener("pagehide", handleVisibilityHidden);
            window.addEventListener("pageshow", handleVisibilityVisible);
        },

        async unlock() {
            if (state.unlocked) return true;
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
                detachUnlockListeners();
                AudioManager.preloadGroup("core-ui");
                if (state.lastScene) {
                    const scene = state.lastScene;
                    state.lastScene = null;
                    applySceneAudio(scene);
                }
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
        stopBGM,
        playAmbient,
        stopAmbient,
        playSFX,
        pauseAll,
        resumeAll,
        applySceneAudio,
        beginMemory,
        endMemory,
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

        setCategoryVolume(category, value) {
            if (!["bgm", "ambient", "sfx"].includes(category)) return;
            state.settings[category] = clamp01(value);
            gainSet(state.categoryGains[category], categoryOutputVolume(category));
        },

        muteCategory(category, muted) {
            if (!["bgm", "ambient", "sfx"].includes(category)) return;
            state.settings.muted[category] = Boolean(muted);
            gainSet(state.categoryGains[category], categoryOutputVolume(category));
        },

        destroy() {
            stopBGM({ fadeOutMs: 0 });
            stopAmbient({ fadeOutMs: 0 });
            state.activeSFX.forEach(set => set.forEach(source => {
                try { source.stop(); } catch {}
            }));
            state.activeSFX.clear();
            detachUnlockListeners();
            if (state.context && state.context.state !== "closed") state.context.close();
            state.context = null;
            state.unlocked = false;
            state.initialized = false;
        },

        getStatus() {
            return {
                initialized: state.initialized,
                unlocked: state.unlocked,
                contextState: state.context?.state || "missing",
                currentBGM: state.currentBGM,
                currentAmbient: state.currentAmbient,
                bgmVolume: state.settings.bgm,
                ambientVolume: state.settings.ambient,
                sfxVolume: state.settings.sfx,
                masterVolume: state.settings.master,
                masterMuted: false,
                sfxMuted: state.settings.muted.sfx,
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
        sfxVolume: { get: () => state.settings.sfx },
        masterMuted: { get: () => false },
        sfxMuted: { get: () => state.settings.muted.sfx },
        loadedBuffers: { get: () => state.decodedBuffers.size },
        failedAssets: { get: () => Array.from(state.failedAssets.values()) },
        lastPlayedSFX: { get: () => state.lastPlayedSFX }
    });

    window.AudioManager = AudioManager;
    window.getAudioStatus = () => ({
        initialized: AudioManager.initialized,
        unlocked: AudioManager.unlocked,
        contextState: AudioManager.context?.state ?? "missing",
        masterVolume: AudioManager.masterVolume,
        sfxVolume: AudioManager.sfxVolume,
        masterMuted: AudioManager.masterMuted,
        sfxMuted: AudioManager.sfxMuted,
        loadedBuffers: AudioManager.loadedBuffers,
        failedAssets: AudioManager.failedAssets,
        lastPlayedSFX: AudioManager.lastPlayedSFX
    });
    window.testCoreSFX = () => AudioManager.testCoreSFX();
})();
