/**
 * AdventureWedding — RC2.2.1 Part 1B
 * File: js/prologue/ChatTimeline.js
 *
 * Data-driven chat prologue timeline.
 * - Loads data/prologue.json
 * - Renders messages sequentially
 * - Supports reduced motion, skip, cancellation and clean teardown
 * - Dispatches lifecycle events
 * - Does not create requestAnimationFrame or setInterval loops
 */

(function attachChatTimeline(global) {
    "use strict";

    const DEFAULTS = Object.freeze({
        dataUrl: "data/prologue.json?v=final-test-006",
        rootSelector: "#chatPrologue",
        listSelector: "[data-chat-list]",
        typingSelector: "[data-chat-typing]",
        skipSelector: "[data-chat-skip]",
        activeClass: "is-active",
        visibleClass: "is-visible",
        leavingClass: "is-leaving",
        completedClass: "is-complete",
        fallbackMessageDelay: 720,
        fallbackTypingDuration: 540,
        fallbackFadeDuration: 320,
        fallbackEndHold: 700
    });

    function isValidTiming(value) {
        return typeof value === "number" && Number.isFinite(value) && value >= 0;
    }

    function resolveTiming(...candidates) {
        return candidates.find(isValidTiming);
    }

    function normaliseOptionalTiming(value) {
        return isValidTiming(value) ? value : NaN;
    }

    function wait(ms, signal) {
        const duration = Math.max(0, Number(ms) || 0);

        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new DOMException("Timeline aborted", "AbortError"));
                return;
            }

            const timerId = window.setTimeout(resolve, duration);

            signal?.addEventListener(
                "abort",
                () => {
                    window.clearTimeout(timerId);
                    reject(new DOMException("Timeline aborted", "AbortError"));
                },
                { once: true }
            );
        });
    }

    function normaliseMessage(rawMessage, index) {
        const sender = String(
            rawMessage?.sender ??
            rawMessage?.from ??
            rawMessage?.speaker ??
            "system"
        ).trim();

        const text = String(
            rawMessage?.text ??
            rawMessage?.content ??
            rawMessage?.message ??
            ""
        ).trim();

        return {
            id: String(rawMessage?.id ?? `prologue-message-${index + 1}`),
            sender,
            text,
            side: rawMessage?.side === "right" || sender.toLowerCase() === "mori"
                ? "right"
                : rawMessage?.side === "center" || sender.toLowerCase() === "system"
                    ? "center"
                    : "left",
            avatar: rawMessage?.avatar ? String(rawMessage.avatar) : "",
            timestamp: rawMessage?.timestamp ? String(rawMessage.timestamp) : "",
            delayBefore: normaliseOptionalTiming(
                rawMessage?.delayBefore ?? rawMessage?.delay
            ),
            typingDuration: normaliseOptionalTiming(rawMessage?.typingDuration),
            holdAfter: normaliseOptionalTiming(rawMessage?.holdAfter)
        };
    }

    class ChatTimeline {
        constructor(options = {}) {
            this.options = { ...DEFAULTS, ...options };

            this.root = this.resolveElement(
                options.root ?? this.options.rootSelector,
                "chat prologue root"
            );

            this.list = this.resolveElement(
                options.list ?? this.options.listSelector,
                "chat message list",
                this.root
            );

            this.typing = this.resolveOptionalElement(
                options.typing ?? this.options.typingSelector,
                this.root
            );

            this.skipButton = this.resolveOptionalElement(
                options.skipButton ?? this.options.skipSelector,
                this.root
            );

            this.abortController = null;
            this.data = null;
            this.state = "idle";
            this.currentIndex = -1;
            this.skipRequested = false;
            this.destroyed = false;

            this.onSkipClick = this.onSkipClick.bind(this);
            this.skipButton?.addEventListener("click", this.onSkipClick);
        }

        resolveElement(target, label, scope = document) {
            const element = typeof target === "string"
                ? scope.querySelector(target)
                : target;

            if (!(element instanceof Element)) {
                throw new Error(`[ChatTimeline] Missing ${label}.`);
            }

            return element;
        }

        resolveOptionalElement(target, scope = document) {
            if (!target) return null;

            const element = typeof target === "string"
                ? scope.querySelector(target)
                : target;

            return element instanceof Element ? element : null;
        }

        async load() {
            this.assertUsable();

            if (this.data) return this.data;

            const response = await fetch(this.options.dataUrl, {
                cache: "no-store",
                signal: this.abortController?.signal
            });

            if (!response.ok) {
                throw new Error(
                    `[ChatTimeline] Failed to load ${this.options.dataUrl}: ${response.status}`
                );
            }

            const rawData = await response.json();
            const rawMessages = Array.isArray(rawData)
                ? rawData
                : rawData.messages;

            if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
                throw new Error("[ChatTimeline] prologue.json contains no messages.");
            }

            const timingCandidate = rawData.timing ?? rawData.settings;
            const timing = timingCandidate && typeof timingCandidate === "object"
                ? timingCandidate
                : {};
            const transition = rawData.transition ?? rawData.next ?? {};

            this.data = {
                id: String(rawData.id ?? "rc2.2.1-chat-prologue"),
                version: String(rawData.version ?? "RC2.2.1"),
                messages: rawMessages.map(normaliseMessage),
                timing: {
                    messageDelay: resolveTiming(
                        this.options.messageDelay,
                        timing.messageDelay,
                        timing.defaultMessageDelay,
                        rawData.messageDelay,
                        rawData.defaultMessageDelay,
                        this.options.fallbackMessageDelay
                    ),
                    typingDuration: resolveTiming(
                        this.options.typingDuration,
                        timing.typingDuration,
                        timing.defaultTypingDuration,
                        rawData.typingDuration,
                        rawData.defaultTypingDuration,
                        this.options.fallbackTypingDuration
                    ),
                    fadeDuration: resolveTiming(
                        this.options.fadeDuration,
                        this.options.fadeOutDuration,
                        timing.fadeDuration,
                        timing.fadeOutDuration,
                        rawData.fadeDuration,
                        rawData.fadeOutDuration,
                        this.options.fallbackFadeDuration
                    ),
                    endHold: resolveTiming(
                        this.options.endHold,
                        this.options.finishDelay,
                        timing.endHold,
                        timing.finalHold,
                        timing.finishDelay,
                        rawData.endHold,
                        rawData.finalHold,
                        rawData.finishDelay,
                        this.options.fallbackEndHold
                    )
                },
                nextScene: String(
                    rawData.nextScene ??
                    transition.scene ??
                    transition.nextScene ??
                    "tokyoChapterCard"
                )
            };

            return this.data;
        }

        async start() {
            this.assertUsable();

            if (this.state === "playing") return;
            if (this.state === "complete") this.reset();

            this.abortController?.abort();
            this.abortController = new AbortController();
            this.skipRequested = false;
            this.state = "loading";

            try {
                const data = await this.load();

                this.state = "playing";
                this.root.hidden = false;
                this.root.classList.add(this.options.activeClass);
                this.root.classList.remove(
                    this.options.leavingClass,
                    this.options.completedClass
                );

                this.dispatch("chat-timeline:start", {
                    id: data.id,
                    version: data.version,
                    messageCount: data.messages.length
                });

                const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

                for (let index = 0; index < data.messages.length; index += 1) {
                    if (this.skipRequested) break;

                    this.currentIndex = index;
                    const message = data.messages[index];

                    const delayBefore = Number.isFinite(message.delayBefore)
                        ? message.delayBefore
                        : data.timing.messageDelay;

                    const typingDuration = Number.isFinite(message.typingDuration)
                        ? message.typingDuration
                        : data.timing.typingDuration;

                    await wait(delayBefore, this.abortController.signal);
                    if (this.skipRequested) break;

                    await this.showTyping(message, typingDuration);
                    if (this.skipRequested) break;

                    this.appendMessage(message, index);

                    if (Number.isFinite(message.holdAfter) && message.holdAfter > 0) {
                        await wait(message.holdAfter, this.abortController.signal);
                    }
                }

                if (this.skipRequested) {
                    this.renderAllRemaining();
                }

                await wait(data.timing.endHold, this.abortController.signal);

                await this.finish();
            } catch (error) {
                if (error?.name === "AbortError") return;

                this.state = "error";
                this.hideTyping();

                this.dispatch("chat-timeline:error", {
                    error,
                    message: error instanceof Error ? error.message : String(error)
                });

                throw error;
            }
        }

        async showTyping(message, duration) {
            if (!this.typing || duration <= 0) return;

            this.typing.dataset.sender = message.sender;
            this.typing.dataset.side = message.side;
            this.typing.setAttribute("aria-label", `${message.sender}正在输入`);

            const avatarLabel = this.typing.querySelector(".chatTypingAvatar span");
            if (avatarLabel) {
                avatarLabel.textContent = message.sender.slice(0, 1);
            }

            this.typing.hidden = false;
            this.typing.classList.add(this.options.visibleClass);

            this.typing.scrollIntoView({
                block: "end",
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
            });

            await wait(duration, this.abortController.signal);
            this.hideTyping();
        }

        hideTyping() {
            if (!this.typing) return;

            this.typing.classList.remove(this.options.visibleClass);
            this.typing.hidden = true;
            this.typing.setAttribute("aria-label", "对方正在输入");
            delete this.typing.dataset.sender;
            delete this.typing.dataset.side;
        }

        appendMessage(message, index, { immediate = false } = {}) {
            if (!message.text) return;

            const article = document.createElement("article");
            article.className = "chatMessage";
            article.dataset.messageId = message.id;
            article.dataset.sender = message.sender;
            article.dataset.side = message.side;
            article.dataset.index = String(index);

            if (immediate) article.classList.add(this.options.visibleClass);

            if (message.avatar) {
                const avatar = document.createElement("img");
                avatar.className = "chatMessageAvatar";
                avatar.src = message.avatar;
                avatar.alt = "";
                avatar.decoding = "async";
                article.appendChild(avatar);
            }

            const bubble = document.createElement("div");
            bubble.className = "chatMessageBubble";

            const sender = document.createElement("p");
            sender.className = "chatMessageSender";
            sender.textContent = message.sender;

            const text = document.createElement("p");
            text.className = "chatMessageText";
            text.textContent = message.text;

            bubble.append(sender, text);

            if (message.timestamp) {
                const timestamp = document.createElement("time");
                timestamp.className = "chatMessageTime";
                timestamp.textContent = message.timestamp;
                bubble.appendChild(timestamp);
            }

            article.appendChild(bubble);
            this.list.appendChild(article);

            if (!immediate) {
                requestAnimationFrame(() => {
                    article.classList.add(this.options.visibleClass);
                });
            }

            article.scrollIntoView({
                block: "end",
                behavior: immediate ? "auto" : "smooth"
            });

            this.dispatch("chat-timeline:message", {
                index,
                message
            });
        }

        renderAllRemaining() {
            this.hideTyping();

            const renderedIds = new Set(
                Array.from(this.list.querySelectorAll("[data-message-id]"))
                    .map(element => element.dataset.messageId)
            );

            this.data.messages.forEach((message, index) => {
                if (!renderedIds.has(message.id)) {
                    this.appendMessage(message, index, { immediate: true });
                }
            });
        }

        skip() {
            if (this.state !== "playing" && this.state !== "loading") return;

            this.skipRequested = true;
            this.abortController?.abort();

            this.renderAllRemaining();

            // Use a fresh signal so finish() can still perform its transition.
            this.abortController = new AbortController();
            void this.finish();
        }

        onSkipClick(event) {
            event.preventDefault();
            this.skip();
        }

        async finish() {
            if (this.state === "complete" || this.destroyed) return;

            this.state = "finishing";
            this.hideTyping();
            this.root.classList.add(this.options.leavingClass);

            const reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            await wait(
                reduceMotion ? 0 : this.data.timing.fadeDuration,
                this.abortController?.signal
            );

            this.root.classList.remove(
                this.options.activeClass,
                this.options.leavingClass
            );
            this.root.classList.add(this.options.completedClass);
            this.root.hidden = true;
            this.state = "complete";

            const detail = {
                id: this.data.id,
                nextScene: this.data.nextScene
            };

            this.dispatch("chat-timeline:complete", detail);

            if (typeof this.options.onComplete === "function") {
                this.options.onComplete(detail);
            }
        }

        reset() {
            this.abortController?.abort();
            this.abortController = null;
            this.state = "idle";
            this.currentIndex = -1;
            this.skipRequested = false;

            this.hideTyping();
            this.list.replaceChildren();

            this.root.hidden = true;
            this.root.classList.remove(
                this.options.activeClass,
                this.options.visibleClass,
                this.options.leavingClass,
                this.options.completedClass
            );
        }

        destroy() {
            if (this.destroyed) return;

            this.abortController?.abort();
            this.skipButton?.removeEventListener("click", this.onSkipClick);
            this.reset();
            this.destroyed = true;
            this.state = "destroyed";
        }

        dispatch(type, detail) {
            this.root.dispatchEvent(
                new CustomEvent(type, {
                    bubbles: true,
                    detail
                })
            );
        }

        assertUsable() {
            if (this.destroyed) {
                throw new Error("[ChatTimeline] Instance has been destroyed.");
            }
        }
    }

    global.ChatTimeline = ChatTimeline;
})(window);
