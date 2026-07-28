/* ======================================
   AdventureWedding
   Tokyo Story Controller
   Version 0.9.7.7
====================================== */

(function createTokyoStoryController(global) {

    const TokyoStoryState = Object.freeze({
        NOT_STARTED: "NOT_STARTED",
        FIRST_AVENUE_PENDING: "FIRST_AVENUE_PENDING",
        FIRST_AVENUE_RUNNING: "FIRST_AVENUE_RUNNING",
        SECOND_AVENUE_PENDING: "SECOND_AVENUE_PENDING",
        SECOND_AVENUE_RUNNING: "SECOND_AVENUE_RUNNING",
        SHRINE_COMPANION_PENDING: "SHRINE_COMPANION_PENDING",
        SHRINE_COMPANION_RUNNING: "SHRINE_COMPANION_RUNNING",
        PARTY_JOIN_RUNNING: "PARTY_JOIN_RUNNING",
        POST_JOIN_DIALOGUE_RUNNING: "POST_JOIN_DIALOGUE_RUNNING",
        ONE_DIAN_ZHANG_PENDING: "ONE_DIAN_ZHANG_PENDING",
        ONE_DIAN_ZHANG_RUNNING: "ONE_DIAN_ZHANG_RUNNING",
        SHRINE_WISH_PENDING: "SHRINE_WISH_PENDING",
        SHRINE_WISH_RUNNING: "SHRINE_WISH_RUNNING",
        TOKYO_STATION_PENDING: "TOKYO_STATION_PENDING",
        TOKYO_STATION_DIALOGUE_RUNNING: "TOKYO_STATION_DIALOGUE_RUNNING",
        TOKYO_ENDING_RUNNING: "TOKYO_ENDING_RUNNING",
        TOKYO_MEMORY_RUNNING: "TOKYO_MEMORY_RUNNING",
        CHAPTER_COMPLETE_RUNNING: "CHAPTER_COMPLETE_RUNNING",
        COMPLETE: "COMPLETE"
    });

    const allowedTransitions = Object.freeze({
        [TokyoStoryState.NOT_STARTED]: [TokyoStoryState.FIRST_AVENUE_PENDING],
        [TokyoStoryState.FIRST_AVENUE_PENDING]: [TokyoStoryState.FIRST_AVENUE_RUNNING],
        [TokyoStoryState.FIRST_AVENUE_RUNNING]: [TokyoStoryState.SECOND_AVENUE_PENDING],
        [TokyoStoryState.SECOND_AVENUE_PENDING]: [TokyoStoryState.SECOND_AVENUE_RUNNING],
        [TokyoStoryState.SECOND_AVENUE_RUNNING]: [TokyoStoryState.SHRINE_COMPANION_PENDING],
        [TokyoStoryState.SHRINE_COMPANION_PENDING]: [TokyoStoryState.SHRINE_COMPANION_RUNNING],
        [TokyoStoryState.SHRINE_COMPANION_RUNNING]: [TokyoStoryState.PARTY_JOIN_RUNNING],
        [TokyoStoryState.PARTY_JOIN_RUNNING]: [TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING],
        [TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING]: [TokyoStoryState.ONE_DIAN_ZHANG_PENDING],
        [TokyoStoryState.ONE_DIAN_ZHANG_PENDING]: [TokyoStoryState.ONE_DIAN_ZHANG_RUNNING],
        [TokyoStoryState.ONE_DIAN_ZHANG_RUNNING]: [TokyoStoryState.SHRINE_WISH_PENDING],
        [TokyoStoryState.SHRINE_WISH_PENDING]: [TokyoStoryState.SHRINE_WISH_RUNNING],
        [TokyoStoryState.SHRINE_WISH_RUNNING]: [TokyoStoryState.TOKYO_STATION_PENDING],
        [TokyoStoryState.TOKYO_STATION_PENDING]: [TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING],
        [TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING]: [TokyoStoryState.TOKYO_ENDING_RUNNING],
        [TokyoStoryState.TOKYO_ENDING_RUNNING]: [TokyoStoryState.TOKYO_MEMORY_RUNNING],
        [TokyoStoryState.TOKYO_MEMORY_RUNNING]: [TokyoStoryState.CHAPTER_COMPLETE_RUNNING],
        [TokyoStoryState.CHAPTER_COMPLETE_RUNNING]: [TokyoStoryState.COMPLETE],
        [TokyoStoryState.COMPLETE]: []
    });

    const order = Object.freeze([
        TokyoStoryState.NOT_STARTED,
        TokyoStoryState.FIRST_AVENUE_PENDING,
        TokyoStoryState.FIRST_AVENUE_RUNNING,
        TokyoStoryState.SECOND_AVENUE_PENDING,
        TokyoStoryState.SECOND_AVENUE_RUNNING,
        TokyoStoryState.SHRINE_COMPANION_PENDING,
        TokyoStoryState.SHRINE_COMPANION_RUNNING,
        TokyoStoryState.PARTY_JOIN_RUNNING,
        TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING,
        TokyoStoryState.ONE_DIAN_ZHANG_PENDING,
        TokyoStoryState.ONE_DIAN_ZHANG_RUNNING,
        TokyoStoryState.SHRINE_WISH_PENDING,
        TokyoStoryState.SHRINE_WISH_RUNNING,
        TokyoStoryState.TOKYO_STATION_PENDING,
        TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING,
        TokyoStoryState.TOKYO_ENDING_RUNNING,
        TokyoStoryState.TOKYO_MEMORY_RUNNING,
        TokyoStoryState.CHAPTER_COMPLETE_RUNNING,
        TokyoStoryState.COMPLETE
    ]);

    const safeSaveState = Object.freeze({
        [TokyoStoryState.FIRST_AVENUE_RUNNING]: TokyoStoryState.FIRST_AVENUE_PENDING,
        [TokyoStoryState.SECOND_AVENUE_RUNNING]: TokyoStoryState.SECOND_AVENUE_PENDING,
        [TokyoStoryState.SHRINE_COMPANION_RUNNING]: TokyoStoryState.SHRINE_COMPANION_PENDING,
        [TokyoStoryState.PARTY_JOIN_RUNNING]: TokyoStoryState.SHRINE_COMPANION_PENDING,
        [TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING]: TokyoStoryState.SHRINE_COMPANION_PENDING,
        [TokyoStoryState.ONE_DIAN_ZHANG_RUNNING]: TokyoStoryState.ONE_DIAN_ZHANG_PENDING,
        [TokyoStoryState.SHRINE_WISH_RUNNING]: TokyoStoryState.SHRINE_WISH_PENDING,
        [TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING]: TokyoStoryState.TOKYO_STATION_PENDING,
        [TokyoStoryState.TOKYO_ENDING_RUNNING]: TokyoStoryState.TOKYO_STATION_PENDING,
        [TokyoStoryState.TOKYO_MEMORY_RUNNING]: TokyoStoryState.TOKYO_STATION_PENDING,
        [TokyoStoryState.CHAPTER_COMPLETE_RUNNING]: TokyoStoryState.TOKYO_STATION_PENDING
    });

    let context = null;
    let state = TokyoStoryState.NOT_STARTED;
    let previousState = null;
    let triggers = {};
    let debugOverlay = false;
    let join = {
        index: 0,
        pause: 0
    };

    function isDevelopment() {

        return Boolean(context?.devMode?.());

    }

    function validState(value) {

        return Object.values(TokyoStoryState).includes(value);

    }

    function normalizeStateForSave(value = state) {

        return safeSaveState[value] || value;

    }

    function hasReached(targetState) {

        return order.indexOf(state) >= order.indexOf(targetState);

    }

    function isAllowedTransition(nextState) {

        return allowedTransitions[state]?.includes(nextState);

    }

    function transitionTo(nextState) {

        if (!validState(nextState)) return false;
        if (!isAllowedTransition(nextState)) {

            if (isDevelopment()) {

                console.error(`[TokyoStory] Invalid transition: ${state} -> ${nextState}`);

            }
            return false;

        }

        const oldState = state;
        previousState = oldState;
        context?.onExitState?.(oldState);
        state = nextState;
        context?.onStateChange?.(state, previousState);
        context?.onEnterState?.(state, previousState);
        save();
        return true;

    }

    function migrate(saveData = {}) {

        if (typeof saveData.tokyoStoryState === "string" && validState(saveData.tokyoStoryState)) {

            return normalizeStateForSave(saveData.tokyoStoryState);

        }

        if (Number.isInteger(saveData.tokyoStoryState)) {

            const legacyByNumber = [
                TokyoStoryState.NOT_STARTED,
                TokyoStoryState.FIRST_AVENUE_PENDING,
                TokyoStoryState.SECOND_AVENUE_PENDING,
                TokyoStoryState.SHRINE_COMPANION_PENDING,
                TokyoStoryState.SHRINE_COMPANION_PENDING,
                TokyoStoryState.ONE_DIAN_ZHANG_PENDING,
                TokyoStoryState.SHRINE_WISH_PENDING,
                TokyoStoryState.TOKYO_STATION_PENDING,
                TokyoStoryState.TOKYO_STATION_PENDING,
                TokyoStoryState.COMPLETE
            ];
            return legacyByNumber[saveData.tokyoStoryState] || TokyoStoryState.FIRST_AVENUE_PENDING;

        }

        if (saveData.chapter1Completed || saveData.tokyoChapterComplete) return TokyoStoryState.COMPLETE;
        if (saveData.tokyoStationCompleted) return TokyoStoryState.TOKYO_STATION_PENDING;
        if (saveData.tokyoShrineMemoryCompleted || saveData.shrineWishCompleted) return TokyoStoryState.TOKYO_STATION_PENDING;
        if (saveData.tokyoIttenchoMemoryCompleted || saveData.oneDianZhangCompleted) return TokyoStoryState.SHRINE_WISH_PENDING;
        if (saveData.tokyoCompanionsJoined || saveData.companionsJoined || saveData.tokyoCatJoinShopDialogueCompleted) return TokyoStoryState.ONE_DIAN_ZHANG_PENDING;
        if (saveData.shrineCompanionDialogueCompleted || saveData.tokyoHiddenCatsDiscovered) return TokyoStoryState.SHRINE_COMPANION_PENDING;
        if (saveData.secondAvenueDialogueCompleted || saveData.tokyoSakuraAvenueSecondDialogueCompleted) return TokyoStoryState.SHRINE_COMPANION_PENDING;
        if (saveData.firstAvenueDialogueCompleted || saveData.tokyoSakuraAvenueDialogueCompleted) return TokyoStoryState.SECOND_AVENUE_PENDING;
        return TokyoStoryState.FIRST_AVENUE_PENDING;

    }

    function save() {

        context?.saveTokyoState?.(normalizeStateForSave(state));

    }

    function load(saveData = {}) {

        state = migrate(saveData);
        previousState = null;
        context?.onStateChange?.(state, previousState);
        context?.onEnterState?.(state, previousState, { restoring: true });
        save();
        return state;

    }

    function enter() {

        if (state === TokyoStoryState.NOT_STARTED) {

            transitionTo(TokyoStoryState.FIRST_AVENUE_PENDING);

        } else {

            context?.onStateChange?.(state, previousState);
            context?.onEnterState?.(state, previousState, { restoring: true });

        }

    }

    function getActiveTrigger() {

        switch (state) {
            case TokyoStoryState.FIRST_AVENUE_PENDING:
                return triggers.firstAvenue;
            case TokyoStoryState.SECOND_AVENUE_PENDING:
                return triggers.secondAvenue;
            case TokyoStoryState.SHRINE_COMPANION_PENDING:
                return triggers.shrineCompanions;
            case TokyoStoryState.ONE_DIAN_ZHANG_PENDING:
                return triggers.oneDianZhang;
            case TokyoStoryState.SHRINE_WISH_PENDING:
                return triggers.shrineWish;
            case TokyoStoryState.TOKYO_STATION_PENDING:
                return triggers.tokyoStation;
            default:
                return null;
        }

    }

    function anchorNearTrigger(trigger) {

        const anchor = context?.getPlayerAnchor?.();
        const bounds = trigger?.bounds;
        if (!anchor || !bounds) return false;

        const distance = context?.distanceToBounds?.(anchor, bounds);
        if (typeof distance !== "number") {

            return anchor.x >= bounds.x
                && anchor.x <= bounds.x + bounds.width
                && anchor.y >= bounds.y
                && anchor.y <= bounds.y + bounds.height;

        }

        return distance <= (trigger.interactionDistance ?? 96);

    }

    function startTrigger(trigger) {

        if (!trigger || context?.isStoryBusy?.()) return false;

        if (trigger.id === "tokyo-first-avenue-dialogue" && transitionTo(TokyoStoryState.FIRST_AVENUE_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-first-avenue");
            return true;

        }

        if (trigger.id === "tokyo-second-avenue-dialogue" && transitionTo(TokyoStoryState.SECOND_AVENUE_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-second-avenue");
            return true;

        }

        if (trigger.id === "tokyo-shrine-companion-event" && transitionTo(TokyoStoryState.SHRINE_COMPANION_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-shrine-companion-intro");
            return true;

        }

        if (trigger.id === "tokyo-one-dian-zhang-event" && transitionTo(TokyoStoryState.ONE_DIAN_ZHANG_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-one-dian-zhang-event");
            return true;

        }

        if (trigger.id === "tokyo-shrine-wish" && transitionTo(TokyoStoryState.SHRINE_WISH_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-shrine-wish");
            return true;

        }

        if (trigger.id === "tokyo-station-departure" && transitionTo(TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING)) {

            context?.startTokyoDialogue?.("tokyo-station-departure");
            return true;

        }

        return false;

    }

    function interact() {

        const trigger = getActiveTrigger();
        if (!trigger || trigger.mode !== "interact") return false;
        if (!anchorNearTrigger(trigger)) return false;
        return startTrigger(trigger);

    }

    function updatePartyJoin(deltaTime) {

        const cats = context?.getCats?.() || [];
        const player = context?.getPlayer?.();
        const cat = cats[join.index];

        if (join.pause > 0) {

            join.pause = Math.max(0, join.pause - deltaTime);
            return;

        }

        if (!player || !cat) {

            context?.registerTokyoCompanion?.("tuotuo");
            context?.registerTokyoCompanion?.("dazhi");
            context?.resetFollowHistory?.(12);
            transitionTo(TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING);
            context?.startTokyoDialogue?.("tokyo-post-join");
            return;

        }

        const targetX = player.x + (join.index === 0 ? -34 : 34);
        const targetY = player.y + player.height + 10;
        const dx = targetX - cat.x;
        const dy = targetY - cat.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= 6) {

            cat.x = targetX;
            cat.y = targetY;
            cat.moving = false;
            context?.faceToward?.(cat, player);
            join.index += 1;
            join.pause = 0.3;
            return;

        }

        const speed = join.index === 0 ? 145 : 128;
        const step = Math.min(distance, speed * deltaTime);
        const horizontal = dx / distance;
        const vertical = dy / distance;
        const nextX = cat.x + horizontal * step;
        const nextY = cat.y + vertical * step;

        if (!context?.canActorMove?.(cat, nextX, nextY)) {

            cat.x = nextX;
            cat.y = nextY;

        } else {

            cat.x = nextX;
            cat.y = nextY;

        }

        cat.moving = true;
        cat.animationTime += deltaTime;
        context?.faceMovementDirection?.(cat, horizontal, vertical);

    }

    function update(deltaTime) {

        if (!context?.isTokyoScene?.()) return;

        if (state === TokyoStoryState.PARTY_JOIN_RUNNING) {

            updatePartyJoin(deltaTime);
            return;

        }

        const trigger = getActiveTrigger();
        if (!trigger || trigger.mode !== "auto") return;
        if (context?.isStoryBusy?.()) return;
        if (anchorNearTrigger(trigger)) startTrigger(trigger);

    }

    function onDialogueComplete(dialogueId) {

        if (state === TokyoStoryState.FIRST_AVENUE_RUNNING && dialogueId === "tokyo-first-avenue") {

            context?.restoreControl?.();
            transitionTo(TokyoStoryState.SECOND_AVENUE_PENDING);
            return true;

        }

        if (state === TokyoStoryState.SECOND_AVENUE_RUNNING && dialogueId === "tokyo-second-avenue") {

            context?.restoreControl?.();
            transitionTo(TokyoStoryState.SHRINE_COMPANION_PENDING);
            return true;

        }

        if (state === TokyoStoryState.SHRINE_COMPANION_RUNNING && dialogueId === "tokyo-shrine-companion-intro") {

            transitionTo(TokyoStoryState.PARTY_JOIN_RUNNING);
            return true;

        }

        if (state === TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING && dialogueId === "tokyo-post-join") {

            context?.restoreControl?.();
            transitionTo(TokyoStoryState.ONE_DIAN_ZHANG_PENDING);
            return true;

        }

        if (state === TokyoStoryState.ONE_DIAN_ZHANG_RUNNING && dialogueId === "tokyo-one-dian-zhang-event") {

            context?.restoreControl?.();
            transitionTo(TokyoStoryState.SHRINE_WISH_PENDING);
            return true;

        }

        if (state === TokyoStoryState.SHRINE_WISH_RUNNING && dialogueId === "tokyo-shrine-wish") {

            context?.restoreControl?.();
            transitionTo(TokyoStoryState.TOKYO_STATION_PENDING);
            return true;

        }

        if (state === TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING && dialogueId === "tokyo-station-departure") {

            transitionTo(TokyoStoryState.TOKYO_ENDING_RUNNING);
            context?.startTokyoEnding?.();
            return true;

        }

        return false;

    }

    function onCutsceneComplete(cutsceneId) {

        if (state === TokyoStoryState.TOKYO_ENDING_RUNNING && cutsceneId === "tokyo-ending-cg") {

            transitionTo(TokyoStoryState.TOKYO_MEMORY_RUNNING);
            context?.showTokyoMemory?.();
            return true;

        }

        if (state === TokyoStoryState.TOKYO_MEMORY_RUNNING && cutsceneId === "tokyo-memory") {

            transitionTo(TokyoStoryState.CHAPTER_COMPLETE_RUNNING);
            context?.showTokyoChapterComplete?.();
            return true;

        }

        if (state === TokyoStoryState.CHAPTER_COMPLETE_RUNNING && cutsceneId === "tokyo-chapter-complete") {

            transitionTo(TokyoStoryState.COMPLETE);
            context?.startSydney?.();
            return true;

        }

        return false;

    }

    function getState() {

        return state;

    }

    function getPreviousState() {

        return previousState;

    }

    function setDebugOverlay(enabled) {

        debugOverlay = Boolean(enabled);

    }

    function isDebugOverlayEnabled() {

        return debugOverlay;

    }

    function getStatus() {

        const trigger = getActiveTrigger();
        const anchor = context?.getPlayerAnchor?.() || null;
        const dialogue = context?.getDialogueStatus?.() || {};
        const cutscene = context?.getCutsceneStatus?.() || {};

        return {
            state,
            previousState,
            activeTriggerId: trigger?.id ?? null,
            playerAnchor: anchor,
            triggerBounds: trigger?.bounds ?? null,
            triggerMode: trigger?.mode ?? null,
            triggerConditionsPass: trigger ? anchorNearTrigger(trigger) : false,
            distanceToTrigger: trigger ? context?.distanceToBounds?.(anchor, trigger.bounds) ?? null : null,
            dialogue,
            cutscene,
            controlsLocked: Boolean(context?.controlsLocked?.()),
            companions: context?.getCompanionIds?.() || [],
            followHistoryLength: context?.getFollowHistoryLength?.() ?? 0,
            indicatorsVisible: context?.getIndicatorsVisible?.() ?? 0
        };

    }

    function repairTokyoStory() {

        const report = {
            state,
            activeTriggerId: getActiveTrigger()?.id ?? null,
            duplicateCompanionsRemoved: false,
            controlsRestored: false,
            catsPlaced: false
        };

        context?.closeOrphanedTokyoOverlays?.();
        report.duplicateCompanionsRemoved = Boolean(context?.dedupeTokyoCompanions?.());
        context?.placeCatsForTokyoState?.(state);
        report.catsPlaced = true;

        if (![
            TokyoStoryState.FIRST_AVENUE_RUNNING,
            TokyoStoryState.SECOND_AVENUE_RUNNING,
            TokyoStoryState.SHRINE_COMPANION_RUNNING,
            TokyoStoryState.PARTY_JOIN_RUNNING,
            TokyoStoryState.POST_JOIN_DIALOGUE_RUNNING,
            TokyoStoryState.ONE_DIAN_ZHANG_RUNNING,
            TokyoStoryState.SHRINE_WISH_RUNNING,
            TokyoStoryState.TOKYO_STATION_DIALOGUE_RUNNING,
            TokyoStoryState.TOKYO_ENDING_RUNNING,
            TokyoStoryState.TOKYO_MEMORY_RUNNING,
            TokyoStoryState.CHAPTER_COMPLETE_RUNNING
        ].includes(state)) {

            context?.restoreControl?.();
            report.controlsRestored = true;

        }

        return report;

    }

    function destroy() {

        context = null;
        triggers = {};
        state = TokyoStoryState.NOT_STARTED;
        previousState = null;
        join = { index: 0, pause: 0 };

    }

    function init(nextContext) {

        context = nextContext;
        triggers = context?.getTriggers?.() || {};
        return api;

    }

    const api = {
        init,
        enter,
        update,
        interact,
        onDialogueComplete,
        onCutsceneComplete,
        getState,
        getPreviousState,
        getActiveTrigger,
        save,
        load,
        destroy,
        hasReached,
        normalizeStateForSave,
        setDebugOverlay,
        isDebugOverlayEnabled,
        getStatus,
        repairTokyoStory
    };

    global.TokyoStoryState = TokyoStoryState;
    global.TokyoStoryController = api;

})(window);
