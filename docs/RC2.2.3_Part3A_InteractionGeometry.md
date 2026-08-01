# RC2.2.3 Part3A — Interaction Geometry

## Authoritative player coordinate source

The sole player state is `player` in `main.js`. Its `x` and `y` values are the
top-left of its collision box in world coordinates. Movement writes directly
to this object after the existing collision checks.

## Authoritative collision bounds

The player collision box is `{ x, y, width, height }`, currently 24 × 24 world
pixels. The visual sprite is rendered at 64 × 96 pixels and is horizontally
centered above the collision box with both rectangles sharing the same bottom
edge. Interaction geometry uses only the collision box.

## Interaction-point calculation

`getPlayerInteractionPoint(player, out?)` returns the collision-box feet:
`x + width / 2`, `y + height`. Passing `out` reuses an existing point object.

## Direction identifiers

The authoritative facing field is `player.direction8`. Existing identifiers
are `up`, `up-right`, `right`, `down-right`, `down`, `down-left`, `left`, and
`up-left`. Idle movement does not overwrite it, so the last valid facing is
retained. `player.direction` and `player.renderDirection` remain the existing
four-direction animation fields.

## Direction vector mapping

`DIRECTION_VECTORS` is an immutable map of the eight identifiers to immutable,
normalized world-coordinate vectors. Positive X is right and positive Y is
down. Diagonals use `Math.SQRT1_2` components.

## Facing tolerance

`isPlayerFacingPoint` uses a normalized dot product. Its default tolerance is
45 degrees and callers may supply `options.toleranceDegrees` from 0–180.

## World-coordinate contract

All helpers accept world coordinates only. They do not read the camera,
canvas, viewport, CSS, DOM coordinates, or `STORY_MAP_SCALE`. Rectangle edges
are inclusive. Invalid points, negative ranges, and invalid rectangles fail
safely.

## Keyboard/mobile parity

Keyboard and mobile D-pad presses both map through `directionByKey` and call
`facePlayerFromInputKey`. Continuous and diagonal facing continues through the
shared `updatePlayer` → `faceMovementDirection` path. Speed, acceleration,
deceleration, joystick/D-pad sensitivity, and animation timing are unchanged.

## Files changed

- `js/gameplay/InteractionGeometry.js`
- `main.js`
- `index.html`
- `docs/RC2.2.3_Part3A_InteractionGeometry.md`

## Tests performed

- Cardinal and diagonal facing acceptance cases.
- Idle retains the prior left-facing identifier.
- In-range and out-of-range squared-distance cases.
- Collision-box bottom-center interaction point.
- Inclusive rectangle edge behavior and invalid rectangle rejection.
- Pure NPC eligibility, disabled/dialogue/story guards, and diagnostics.
- Equivalent keyboard and mobile direction mapping.
- Syntax checks, `git diff --check`, and searches for loops, timers, duplicate
  player state, and camera/screen coordinate use.

## Known limitations

Part3A does not connect NPCs or story points to these APIs. The default NPC
range is 100 world pixels, but Part3B callers should choose the final range per
NPC. Physical-device movement regression remains a release QA responsibility.

## APIs prepared for Part3B

- `getPlayerInteractionPoint(player, out?)`
- `isPlayerFacingPoint(player, targetX, targetY, options?)`
- `distanceSquared(ax, ay, bx, by)`
- `isWithinInteractionRange(playerPoint, targetPoint, maxRange)`
- `isPointInsideWorldRect(point, rect)`
- `canPlayerInteractWithNpc(player, npc, options?)`
