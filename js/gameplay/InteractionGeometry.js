/**
 * AdventureWedding — RC2.2.3 Part3A
 * Pure world-coordinate interaction geometry. No gameplay side effects.
 */
(function attachInteractionGeometry(global) {
    "use strict";

    const SQRT_HALF = Math.SQRT1_2;
    const DEFAULT_FACING_TOLERANCE_DEGREES = 45;
    const DEFAULT_NPC_RANGE = 100;
    const EMPTY_OPTIONS = Object.freeze({});

    const DIRECTION_VECTORS = Object.freeze({
        up: Object.freeze({ x: 0, y: -1 }),
        "up-right": Object.freeze({ x: SQRT_HALF, y: -SQRT_HALF }),
        right: Object.freeze({ x: 1, y: 0 }),
        "down-right": Object.freeze({ x: SQRT_HALF, y: SQRT_HALF }),
        down: Object.freeze({ x: 0, y: 1 }),
        "down-left": Object.freeze({ x: -SQRT_HALF, y: SQRT_HALF }),
        left: Object.freeze({ x: -1, y: 0 }),
        "up-left": Object.freeze({ x: -SQRT_HALF, y: -SQRT_HALF })
    });

    function isFiniteNumber(value) {
        return typeof value === "number" && Number.isFinite(value);
    }

    function hasValidWorldBounds(value) {
        return Boolean(value)
            && isFiniteNumber(value.x)
            && isFiniteNumber(value.y)
            && isFiniteNumber(value.width)
            && isFiniteNumber(value.height)
            && value.width >= 0
            && value.height >= 0;
    }

    function getPlayerInteractionPoint(player, out) {
        if (!hasValidWorldBounds(player)) return null;

        const point = out && typeof out === "object" ? out : {};
        point.x = player.x + player.width / 2;
        point.y = player.y + player.height;
        return point;
    }

    function distanceSquared(ax, ay, bx, by) {
        if (!isFiniteNumber(ax) || !isFiniteNumber(ay)
            || !isFiniteNumber(bx) || !isFiniteNumber(by)) return Infinity;
        const dx = bx - ax;
        const dy = by - ay;
        return dx * dx + dy * dy;
    }

    function isWithinInteractionRange(playerPoint, targetPoint, maxRange) {
        if (!playerPoint || !targetPoint || !isFiniteNumber(maxRange) || maxRange < 0) {
            return false;
        }

        return distanceSquared(
            playerPoint.x,
            playerPoint.y,
            targetPoint.x,
            targetPoint.y
        ) <= maxRange * maxRange;
    }

    function isPointInsideWorldRect(point, rect) {
        if (!point || !hasValidWorldBounds(rect)
            || !isFiniteNumber(point.x) || !isFiniteNumber(point.y)) {
            return false;
        }

        // Rectangle edges are inclusive so adjacent world triggers have stable boundaries.
        return point.x >= rect.x
            && point.x <= rect.x + rect.width
            && point.y >= rect.y
            && point.y <= rect.y + rect.height;
    }

    function isPlayerFacingPoint(player, targetX, targetY, options = EMPTY_OPTIONS) {
        if (!hasValidWorldBounds(player)
            || !isFiniteNumber(targetX) || !isFiniteNumber(targetY)) {
            return false;
        }

        const direction = player.direction8 || player.direction;
        const facing = DIRECTION_VECTORS[direction];
        if (!facing) return false;

        const originX = player.x + player.width / 2;
        const originY = player.y + player.height;
        const dx = targetX - originX;
        const dy = targetY - originY;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared === 0) return true;

        const toleranceDegrees = isFiniteNumber(options.toleranceDegrees)
            ? Math.max(0, Math.min(180, options.toleranceDegrees))
            : DEFAULT_FACING_TOLERANCE_DEGREES;
        const minimumDot = Math.cos(toleranceDegrees * Math.PI / 180);
        const inverseLength = 1 / Math.sqrt(lengthSquared);
        const dot = facing.x * dx * inverseLength + facing.y * dy * inverseLength;
        return dot >= minimumDot;
    }

    function canPlayerInteractWithNpc(player, npc, options = EMPTY_OPTIONS) {
        let reason = "eligible";
        let eligible = true;
        let rangeSquared = Infinity;

        if (!hasValidWorldBounds(player) || !hasValidWorldBounds(npc)
            || npc.valid === false || npc.enabled === false) {
            eligible = false;
            reason = "invalid-or-disabled";
        } else if (options.dialogueActive || npc.dialogueActive) {
            eligible = false;
            reason = "dialogue-active";
        } else if (typeof options.storyGuard === "function" && !options.storyGuard(player, npc)) {
            eligible = false;
            reason = "story-guard";
        } else if (options.storyGuard === false) {
            eligible = false;
            reason = "story-guard";
        } else {
            const playerX = player.x + player.width / 2;
            const playerY = player.y + player.height;
            const targetX = npc.x + npc.width / 2;
            const targetY = npc.y + npc.height;
            const maxRange = options.maxRange === undefined
                ? DEFAULT_NPC_RANGE
                : options.maxRange;

            rangeSquared = distanceSquared(playerX, playerY, targetX, targetY);
            if (!isFiniteNumber(maxRange) || maxRange < 0 || rangeSquared > maxRange * maxRange) {
                eligible = false;
                reason = "out-of-range";
            } else if (!isPlayerFacingPoint(player, targetX, targetY, options)) {
                eligible = false;
                reason = "not-facing";
            }
        }

        if (!options.diagnostics) return eligible;
        return Object.freeze({ eligible, reason, distanceSquared: rangeSquared });
    }

    global.AdventureWeddingInteractionGeometry = Object.freeze({
        DIRECTION_VECTORS,
        getPlayerInteractionPoint,
        isPlayerFacingPoint,
        distanceSquared,
        isWithinInteractionRange,
        isPointInsideWorldRect,
        canPlayerInteractWithNpc
    });
})(window);
