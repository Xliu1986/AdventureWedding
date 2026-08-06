/**
 * AdventureWedding — RC2.2.1 Part 1E
 * File: js/prologue/ChatPrologueBridge.js
 *
 * Connects ChatTimeline to the existing game scene controller without
 * owning or duplicating the Tokyo chapter implementation.
 *
 * Public API:
 *   window.AdventureWeddingChatPrologue.start()
 *   window.AdventureWeddingChatPrologue.skip()
 *   window.AdventureWeddingChatPrologue.reset()
 *   window.AdventureWeddingChatPrologue.destroy()
 *   window.AdventureWeddingChatPrologue.getState()
 *
 * Events:
 *   adventure-wedding:scene-request
 *     detail: { scene, source }
 */

(function attachChatPrologueBridge(global) {
    "use strict";

    const DEFAULTS = Object.freeze({
        rootSelector: "#chatPrologue",
        nextScene: "tokyoChapterCard",
        sceneRequestEvent: "adventure-wedding:scene-request",
        source: "chatPrologue"
    });

    let options = { ...DEFAULTS };
    let timeline = null;
    let root = null;
    let initialized = false;
    let destroyed = false;
    let startPromise = null;
    let completionHandled = false;

    function resolveRoot() {
        if (root instanceof Element) return root;

        root = document.querySelector(options.rootSelector);

        if (!(root instanceof Element)) {
            throw new Error(
                `[ChatPrologueBridge] Missing root: ${options.rootSelector}`
            );
        }

        return root;
    }

    function ensureTimelineConstructor() {
        if (typeof global.ChatTimeline !== "function") {
            throw new Error(
                "[ChatPrologueBridge] ChatTimeline.js must load before ChatPrologueBridge.js."
            );
        }
    }

    function requestScene(sceneName) {
        const scene = String(sceneName || options.nextScene);

        document.dispatchEvent(
            new CustomEvent(options.sceneRequestEvent, {
                bubbles: false,
                detail: {
                    scene,
                    source: options.source
                }
            })
        );
    }

    function onTimelineComplete(event) {
        if (completionHandled || destroyed) return;
        completionHandled = true;

        const requestedScene =
            event?.detail?.nextScene ||
            timeline?.data?.nextScene ||
            options.nextScene;

        requestScene(requestedScene);
    }

    function onTimelineError(event) {
        if (destroyed) return;

        console.error(
            "[ChatPrologueBridge] Chat timeline failed.",
            event?.detail ?? event
        );

        // Do not trap the player on a broken prologue.
        if (!completionHandled) {
            completionHandled = true;
            requestScene(options.nextScene);
        }
    }

    function initialize(customOptions = {}) {
        if (destroyed) {
            throw new Error(
                "[ChatPrologueBridge] Cannot initialize after destroy()."
            );
        }

        options = { ...options, ...customOptions };

        if (initialized) return timeline;

        ensureTimelineConstructor();
        const prologueRoot = resolveRoot();

        prologueRoot.addEventListener(
            "chat-timeline:complete",
            onTimelineComplete
        );

        prologueRoot.addEventListener(
            "chat-timeline:error",
            onTimelineError
        );

        timeline = new global.ChatTimeline({
            root: prologueRoot,
            dataUrl: customOptions.dataUrl ?? "data/prologue.json?v=final-test-006",
            onComplete: null
        });

        initialized = true;
        return timeline;
    }

    async function start(customOptions = {}) {
        if (destroyed) {
            throw new Error(
                "[ChatPrologueBridge] Cannot start after destroy()."
            );
        }

        if (startPromise) return startPromise;

        const instance = initialize(customOptions);
        completionHandled = false;

        startPromise = Promise.resolve()
            .then(() => instance.start())
            .catch((error) => {
                if (error?.name === "AbortError") return;

                console.error(
                    "[ChatPrologueBridge] Unable to start chat prologue.",
                    error
                );

                if (!completionHandled) {
                    completionHandled = true;
                    requestScene(options.nextScene);
                }
            })
            .finally(() => {
                startPromise = null;
            });

        return startPromise;
    }

    function skip() {
        if (!timeline || destroyed) return;
        timeline.skip();
    }

    function reset() {
        if (destroyed) return;

        startPromise = null;
        completionHandled = false;
        timeline?.reset();
    }

    function destroy() {
        if (destroyed) return;

        if (root instanceof Element) {
            root.removeEventListener(
                "chat-timeline:complete",
                onTimelineComplete
            );

            root.removeEventListener(
                "chat-timeline:error",
                onTimelineError
            );
        }

        timeline?.destroy();

        timeline = null;
        root = null;
        startPromise = null;
        completionHandled = false;
        initialized = false;
        destroyed = true;
    }

    function getState() {
        return Object.freeze({
            initialized,
            destroyed,
            timelineState: timeline?.state ?? "uninitialized",
            completionHandled,
            running: Boolean(startPromise)
        });
    }

    global.AdventureWeddingChatPrologue = Object.freeze({
        initialize,
        start,
        skip,
        reset,
        destroy,
        getState
    });
})(window);
