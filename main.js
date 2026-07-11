/* ======================================
   AdventureWedding
   Version 0.6.1
====================================== */

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

gameCtx.imageSmoothingEnabled = false;

let width = 0;
let height = 0;

function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    gameCtx.imageSmoothingEnabled = false;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* ===========================
   Stars
=========================== */

const stars = [];

function createStars() {

    stars.length = 0;

    for (let i = 0; i < 180; i++) {

        stars.push({

            x: Math.random() * width,
            y: Math.random() * height,

            radius: Math.random() * 1.8 + 0.3,

            alpha: Math.random(),

            speed: 0.01 + Math.random() * 0.03

        });

    }

}

createStars();

/* ===========================
   Sakura
=========================== */

const petals = [];

function createPetals() {

    petals.length = 0;

    for (let i = 0; i < 55; i++) {

        petals.push({

            x: Math.random() * width,

            y: Math.random() * height,

            layer: Math.floor(Math.random() * 3),

            size: 5 + Math.random() * 8,

            speedY: 0.3 + Math.random() * 0.9,

            angle: Math.random() * Math.PI * 2,

            sway: 0.2 + Math.random() * 0.45,

            swaySpeed: 0.008 + Math.random() * 0.018,

            rotate: Math.random() * Math.PI * 2,

            rotateSpeed: 0.004 + Math.random() * 0.014

        });

    }

}

createPetals();

/* ===========================
   Draw Background
=========================== */

function drawBackground() {

    const gradient = ctx.createLinearGradient(0,0,0,height);

    gradient.addColorStop(0,"#04111d");
    gradient.addColorStop(1,"#15324d");

    ctx.fillStyle = gradient;

    ctx.fillRect(0,0,width,height);

}

/* ===========================
   Draw Stars
=========================== */

function drawStars(){

    stars.forEach(star=>{

        star.alpha += star.speed;

        const brightness = (Math.sin(star.alpha)+1)/2;

        ctx.beginPath();

        ctx.arc(

            star.x,

            star.y,

            star.radius,

            0,

            Math.PI*2

        );

        ctx.fillStyle = `rgba(255,255,255,${brightness})`;

        ctx.fill();

    });

}

/* ===========================
   Draw Sakura
=========================== */

function drawPetals(){

    petals.slice().sort((a,b)=>a.layer-b.layer).forEach(p=>{

        const depth = 0.55 + p.layer * 0.25;

        p.y += p.speedY * depth;

        p.angle += p.swaySpeed;

        p.rotate += p.rotateSpeed * depth;

        p.x += Math.sin(p.angle) * p.sway * depth;

        if(p.y > height + 30){

            p.y = -20;

            p.x = Math.random() * width;

        }

        ctx.save();

        ctx.translate(p.x,p.y);

        ctx.rotate(p.rotate);

        ctx.globalAlpha = 0.38 + p.layer * 0.2;

        ctx.fillStyle = "#ffd2e4";

        for(let petal=0;petal<5;petal++){

            ctx.save();

            ctx.rotate((Math.PI*2/5)*petal);

            ctx.beginPath();

            ctx.ellipse(

                0,

                -p.size * 0.45,

                p.size * 0.43,

                p.size * 0.65,

                0,

                0,

                Math.PI*2

            );

            ctx.fill();

            ctx.restore();

        }

        ctx.globalAlpha = 0.75 + p.layer * 0.08;

        ctx.fillStyle = "#e98cad";

        ctx.beginPath();

        ctx.arc(0,0,p.size*0.24,0,Math.PI*2);

        ctx.fill();

        ctx.restore();

    });

}
/* ===========================
   Animation Loop
=========================== */

function animate(){

    drawBackground();

    drawStars();

    drawPetals();

    requestAnimationFrame(animate);

}

animate();

/* ===========================
   UI
=========================== */

const startButton = document.getElementById("startButton");

const dialog = document.getElementById("dialog");

const titleScreen = document.getElementById("titleScreen");

const gameDialogue = document.getElementById("gameDialogue");
const gameDialogueName = document.querySelector(".gameDialogueName");
const gameDialogueText = document.querySelector(".gameDialogueText");
const gameDialogueContinue = document.querySelector(".gameDialogueContinue");

let gameStarted = false;

const player = {
    x: 0,
    y: 0,
    width: 24,
    height: 24,
    speed: 240,
    sprintMultiplier: 1.8,
    direction: "down",
    moving: false
};

const playerSprite = new Image();
playerSprite.src = "assets/player-mori-sprite-sheet-32x48.png?v=2";

const le = {
    x: 1950,
    y: 820,
    width: 24,
    height: 24,
    direction: "down",
    moving: false,
    animationTime: 0,
    visible: true
};

const leSprite = new Image();
leSprite.src = "assets/player-le-sprite-sheet-32x48.png?v=1";

const DEBUG_COLLISIONS = false;

const collisionRects = [
    { x: 920, y: 0, width: 920, height: 440 },
    { x: 1980, y: 0, width: 560, height: 420 },
    { x: 0, y: 860, width: 1460, height: 520 },
    { x: 0, y: 0, width: 650, height: 580 },
    { x: 1650, y: 760, width: 150, height: 860 },
    { x: 2200, y: 760, width: 150, height: 860 },
    { x: 0, y: 1800, width: 1130, height: 444 },
    { x: 1640, y: 1800, width: 1164, height: 444 }
];

const walkableZones = [
    { x: 700, y: 420, width: 1160, height: 420 },
    { x: 1740, y: 420, width: 560, height: 1220 },
    { x: 0, y: 1380, width: 1540, height: 360 },
    { x: 1130, y: 1800, width: 510, height: 444 }
];

const meetingState = {
    triggered: false,
    dialogueOpen: false,
    pageIndex: 0,
    characterIndex: 0,
    typeTimer: 0,
    pageComplete: false
};

const meetingDialoguePages = [
    {
        speaker: "乐乐",
        text: "终于见到你了，\n我是乐乐。"
    },
    {
        speaker: "森",
        text: "很高兴见到你，\n我是森。\n希望我们在日本玩得开心。"
    }
];

const TOKYO_WORLD_PROMPT = "Warm 16-bit top-down Tokyo spring neighborhood: Tokyo Station entrance at the top center, park and pond at upper left, shrine at upper right, shopping street on the left, sakura avenue on the right, road and crosswalk below, and a river with wooden bridges along the bottom. Use dense handcrafted pixel-art detail, clear walkable stone paths, no labels, no UI, and no NPCs.";
const STORY_MAP_SCALE = 2;
const PLAYER_RENDER_WIDTH = 64;
const PLAYER_RENDER_HEIGHT = 96;
const SAKURA_AVENUE_BOUNDS = {
    x: 1740,
    y: 220,
    width: 460,
    height: 1400
};

const exteriorMap = new Image();
exteriorMap.src = "assets/tokyo-story-map.png";

let playerAnimationTime = 0;

const pressedKeys = new Set();

const directionByKey = {
    KeyW: "up",
    ArrowUp: "up",
    KeyS: "down",
    ArrowDown: "down",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right"
};

const TILE_SIZE = 64;

const Tile = {
    GRASS: 0,
    STONE_PATH: 1,
    SAKURA_ROAD: 2,
    PLAZA: 3,
    TREE: 4,
    SAKURA_TREE: 5,
    FLOWER_BED: 6,
    BUSH: 7,
    FENCE: 8,
    LAMP: 9,
    BENCH: 10,
    SIGN: 11,
    STATION: 12,
    SHOP: 13,
    CAFE: 14,
    CONVENIENCE: 15,
    VENDING: 16,
    TORII: 17,
    SHRINE: 18,
    LANTERN: 19,
    STAIRS: 20,
    PRAYER_GROUND: 21,
    POND: 22,
    POND_EDGE: 23,
    WOOD_BRIDGE: 24,
    SHOPPING_STREET: 25,
    SUBWAY_ENTRANCE: 26,
    HIGH_RISE: 27,
    UTILITY_POLE: 28,
    CROSSWALK: 29
};

const MAP_COLUMNS = 50;
const MAP_ROWS = 30;

function createTokyoMap() {

    const map = Array.from(
        { length: MAP_ROWS },
        () => Array(MAP_COLUMNS).fill(Tile.GRASS)
    );

    const fillTiles = (x, y, columns, rows, tile) => {

        for (let row = y; row < y + rows; row++) {

            for (let column = x; column < x + columns; column++) {

                map[row][column] = tile;

            }

        }

    };

    // Tokyo Station plaza and the central sakura avenue.
    fillTiles(18, 2, 12, 9, Tile.PLAZA);
    fillTiles(20, 2, 8, 4, Tile.HIGH_RISE);
    fillTiles(21, 6, 6, 1, Tile.STAIRS);
    fillTiles(22, 7, 4, 2, Tile.SUBWAY_ENTRANCE);
    fillTiles(2, 14, 28, 4, Tile.SAKURA_ROAD);
    fillTiles(22, 14, 3, 4, Tile.CROSSWALK);

    // Shopping street, including a cafe and convenience store.
    fillTiles(30, 10, 15, 14, Tile.SHOPPING_STREET);
    fillTiles(32, 11, 3, 3, Tile.SHOP);
    fillTiles(37, 11, 3, 3, Tile.CAFE);
    fillTiles(42, 11, 3, 3, Tile.CONVENIENCE);
    fillTiles(32, 19, 3, 3, Tile.SHOP);
    fillTiles(37, 19, 3, 3, Tile.CAFE);
    fillTiles(42, 19, 3, 3, Tile.SHOP);

    // Shrine precinct in the north-west.
    fillTiles(3, 3, 12, 9, Tile.PRAYER_GROUND);
    fillTiles(6, 3, 6, 3, Tile.SHRINE);
    fillTiles(7, 6, 4, 1, Tile.STAIRS);
    fillTiles(7, 8, 4, 1, Tile.TORII);

    // Park, pond and river in the southern half of the map.
    fillTiles(3, 21, 15, 7, Tile.GRASS);
    fillTiles(3, 24, 4, 1, Tile.STONE_PATH);
    fillTiles(14, 24, 4, 1, Tile.STONE_PATH);
    fillTiles(7, 23, 7, 4, Tile.POND);
    fillTiles(6, 22, 9, 1, Tile.POND_EDGE);
    fillTiles(6, 27, 9, 1, Tile.POND_EDGE);
    fillTiles(9, 23, 2, 4, Tile.WOOD_BRIDGE);
    fillTiles(0, 29, MAP_COLUMNS, 1, Tile.POND);
    fillTiles(21, 29, 5, 1, Tile.WOOD_BRIDGE);

    [
        [3, 13, Tile.LAMP], [6, 13, Tile.SAKURA_TREE], [10, 13, Tile.SAKURA_TREE],
        [14, 13, Tile.SAKURA_TREE], [18, 13, Tile.SAKURA_TREE], [22, 13, Tile.SAKURA_TREE],
        [26, 13, Tile.SAKURA_TREE], [29, 13, Tile.LAMP], [5, 18, Tile.LAMP],
        [9, 18, Tile.BENCH], [15, 18, Tile.BENCH], [21, 18, Tile.LAMP],
        [27, 18, Tile.BENCH], [31, 15, Tile.VENDING], [35, 15, Tile.SIGN],
        [40, 15, Tile.VENDING], [44, 15, Tile.SIGN], [31, 18, Tile.LAMP],
        [45, 18, Tile.LAMP], [5, 7, Tile.LANTERN], [12, 7, Tile.LANTERN],
        [5, 10, Tile.LANTERN], [12, 10, Tile.LANTERN], [4, 22, Tile.TREE],
        [16, 22, Tile.TREE], [4, 26, Tile.TREE], [16, 26, Tile.TREE],
        [6, 21, Tile.FLOWER_BED], [15, 21, Tile.FLOWER_BED], [5, 28, Tile.FENCE],
        [6, 28, Tile.FENCE], [7, 28, Tile.FENCE], [13, 28, Tile.FENCE],
        [14, 28, Tile.FENCE], [15, 28, Tile.FENCE], [17, 24, Tile.BENCH],
        [29, 9, Tile.SIGN], [30, 9, Tile.FLOWER_BED], [31, 9, Tile.FLOWER_BED],
        [3, 22, Tile.BUSH], [17, 23, Tile.BUSH], [4, 25, Tile.BUSH], [16, 25, Tile.BUSH],
        [1, 15, Tile.UTILITY_POLE], [28, 12, Tile.UTILITY_POLE], [46, 16, Tile.UTILITY_POLE]
    ].forEach(([column, row, tile]) => {

        map[row][column] = tile;

    });

    return map;

}

const tokyoMap = createTokyoMap();

const sakuraTreeLocations = tokyoMap.flatMap((row, rowIndex) =>
    row.flatMap((tile, columnIndex) =>
        tile === Tile.SAKURA_TREE ? [{ x: columnIndex * TILE_SIZE, y: rowIndex * TILE_SIZE }] : []
    )
);

const worldPetals = Array.from({ length: 70 }, () => ({
    x: Math.random() * MAP_COLUMNS * TILE_SIZE,
    y: Math.random() * MAP_ROWS * TILE_SIZE,
    size: 2 + Math.random() * 3,
    drift: 8 + Math.random() * 16,
    fall: 10 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2
}));

const birds = [
    { x: 1120, y: 760, speed: 16, phase: 0.2 },
    { x: 1200, y: 790, speed: 16, phase: 0.8 },
    { x: 1280, y: 740, speed: 16, phase: 1.4 }
];

let windTime = 0;

const solidTiles = new Set([
    Tile.TREE, Tile.SAKURA_TREE, Tile.FLOWER_BED, Tile.BUSH, Tile.FENCE,
    Tile.BENCH, Tile.SIGN, Tile.STATION, Tile.SHOP, Tile.CAFE,
    Tile.CONVENIENCE, Tile.VENDING, Tile.TORII, Tile.SHRINE, Tile.LANTERN,
    Tile.POND, Tile.POND_EDGE, Tile.SUBWAY_ENTRANCE, Tile.HIGH_RISE
]);

const camera = {
    x: 0,
    y: 0,
    smoothing: 0.16,
    zoom: 1
};

const cameraIntro = {
    active: false,
    elapsed: 0,
    overviewDuration: 1.2,
    transitionDuration: 1.8
};

function getWorldWidth() {

    return exteriorMap.naturalWidth
        ? exteriorMap.naturalWidth * STORY_MAP_SCALE
        : MAP_COLUMNS * TILE_SIZE;

}

function getWorldHeight() {

    return exteriorMap.naturalHeight
        ? exteriorMap.naturalHeight * STORY_MAP_SCALE
        : MAP_ROWS * TILE_SIZE;

}

function isBlockedTile(x, y) {

    const column = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    const tile = tokyoMap[row]?.[column];

    return solidTiles.has(tile);

}

function canMoveTo(x, y) {

    const right = x + player.width - 1;
    const bottom = y + player.height - 1;

    return !isBlockedTile(x, y)
        && !isBlockedTile(right, y)
        && !isBlockedTile(x, bottom)
        && !isBlockedTile(right, bottom);

}

function rectanglesOverlap(first, second) {

    return first.x < second.x + second.width
        && first.x + first.width > second.x
        && first.y < second.y + second.height
        && first.y + first.height > second.y;

}

function canMoveOnOfficialMap(x, y) {

    const destination = { x, y, width: player.width, height: player.height };

    return !collisionRects.some(rect => rectanglesOverlap(destination, rect));

}

function faceToward(actor, target) {

    const horizontal = target.x - actor.x;
    const vertical = target.y - actor.y;

    if (Math.abs(horizontal) > Math.abs(vertical)) {

        actor.direction = horizontal >= 0 ? "right" : "left";

    } else {

        actor.direction = vertical >= 0 ? "down" : "up";

    }

}

function openMeetingDialogue() {

    meetingState.triggered = true;
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    player.moving = false;
    faceToward(player, le);
    faceToward(le, player);
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function setDialoguePage(pageIndex) {

    const page = meetingDialoguePages[pageIndex];

    meetingState.pageIndex = pageIndex;
    meetingState.characterIndex = 0;
    meetingState.typeTimer = 0;
    meetingState.pageComplete = false;
    gameDialogueName.textContent = page.speaker;
    gameDialogueText.textContent = "";
    gameDialogueContinue.classList.add("hidden");

}

function updateDialogueTypewriter(deltaTime) {

    if (!meetingState.dialogueOpen || meetingState.pageComplete) return;

    const page = meetingDialoguePages[meetingState.pageIndex];

    meetingState.typeTimer += deltaTime * 1000;

    while (meetingState.characterIndex < page.text.length) {

        const character = page.text[meetingState.characterIndex];
        const delay = /[，。]/.test(character) ? 95 : 40;

        if (meetingState.typeTimer < delay) return;

        meetingState.typeTimer -= delay;
        meetingState.characterIndex++;
        gameDialogueText.textContent = page.text.slice(0, meetingState.characterIndex);

    }

    meetingState.pageComplete = true;
    gameDialogueContinue.classList.remove("hidden");

}

function advanceMeetingDialogue() {

    if (!meetingState.dialogueOpen) return;

    const page = meetingDialoguePages[meetingState.pageIndex];

    if (!meetingState.pageComplete) {

        meetingState.characterIndex = page.text.length;
        meetingState.pageComplete = true;
        gameDialogueText.textContent = page.text;
        gameDialogueContinue.classList.remove("hidden");
        return;

    }

    if (meetingState.pageIndex < meetingDialoguePages.length - 1) {

        setDialoguePage(meetingState.pageIndex + 1);
        return;

    }

    closeMeetingDialogue();

}

function closeMeetingDialogue() {

    if (!meetingState.dialogueOpen) return;

    meetingState.dialogueOpen = false;
    gameDialogue.classList.add("hidden");
    gameDialogueContinue.classList.add("hidden");

}

function checkFirstMeeting() {

    if (meetingState.triggered || cameraIntro.active) return;

    const distance = Math.hypot(player.x - le.x, player.y - le.y);

    if (distance <= 100) openMeetingDialogue();

}

function drawCollisionDebug() {

    if (!DEBUG_COLLISIONS) return;

    gameCtx.fillStyle = "rgba(232, 74, 74, 0.28)";
    collisionRects.forEach(rect => gameCtx.fillRect(rect.x, rect.y, rect.width, rect.height));

    gameCtx.fillStyle = "rgba(91, 196, 117, 0.2)";
    walkableZones.forEach(zone => gameCtx.fillRect(zone.x, zone.y, zone.width, zone.height));

}

function spawnPlayer() {

    player.x = 1940;
    player.y = 1020;
    player.moving = false;

    centerCameraOnPlayer();

}

function centerCameraOnPlayer() {

    const maxX = Math.max(0, getWorldWidth() - gameCanvas.width);
    const maxY = Math.max(0, getWorldHeight() - gameCanvas.height);

    camera.x = Math.max(0, Math.min(player.x + player.width / 2 - gameCanvas.width / 2, maxX));
    camera.y = Math.max(0, Math.min(player.y + player.height / 2 - gameCanvas.height / 2, maxY));
    camera.zoom = 1;

}

function startCameraIntro() {

    const overviewZoom = Math.min(
        (gameCanvas.width - 48) / getWorldWidth(),
        (gameCanvas.height - 48) / getWorldHeight()
    );

    camera.x = (getWorldWidth() - gameCanvas.width) / 2;
    camera.y = (getWorldHeight() - gameCanvas.height) / 2;
    camera.zoom = overviewZoom;
    cameraIntro.active = true;
    cameraIntro.elapsed = 0;

}

function updateCamera(deltaTime) {

    const maxX = Math.max(0, getWorldWidth() - gameCanvas.width);
    const maxY = Math.max(0, getWorldHeight() - gameCanvas.height);
    const targetX = Math.max(0, Math.min(player.x + player.width / 2 - gameCanvas.width / 2, maxX));
    const targetY = Math.max(0, Math.min(player.y + player.height / 2 - gameCanvas.height / 2, maxY));
    const followAmount = 1 - Math.pow(1 - camera.smoothing, deltaTime * 60);

    if (cameraIntro.active || meetingState.dialogueOpen) {

        cameraIntro.elapsed += deltaTime;

        const overviewZoom = Math.min(
            (gameCanvas.width - 48) / getWorldWidth(),
            (gameCanvas.height - 48) / getWorldHeight()
        );
        const overviewX = (getWorldWidth() - gameCanvas.width) / 2;
        const overviewY = (getWorldHeight() - gameCanvas.height) / 2;

        if (cameraIntro.elapsed > cameraIntro.overviewDuration) {

            const progress = Math.min(
                1,
                (cameraIntro.elapsed - cameraIntro.overviewDuration) / cameraIntro.transitionDuration
            );
            const ease = progress * progress * (3 - 2 * progress);

            camera.x = overviewX + (targetX - overviewX) * ease;
            camera.y = overviewY + (targetY - overviewY) * ease;
            camera.zoom = overviewZoom + (1 - overviewZoom) * ease;

            if (progress === 1) cameraIntro.active = false;

        }

        return;

    }

    camera.x += (targetX - camera.x) * followAmount;
    camera.y += (targetY - camera.y) * followAmount;
    camera.zoom += (1 - camera.zoom) * followAmount;

}

function tileNoise(column, row, offset) {

    return (column * 19 + row * 37 + offset * 13) % 13;

}

function drawGrassTile(x, y, column, row) {

    gameCtx.fillStyle = "#91ad6d";
    gameCtx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    for (let detail = 0; detail < 4; detail++) {

        const px = 8 + tileNoise(column, row, detail) * 4;
        const py = 8 + tileNoise(row, column, detail + 4) * 3;

        gameCtx.fillStyle = detail % 2 ? "#7f9e61" : "#b7c983";
        gameCtx.fillRect(x + px, y + py, 4, 8);

    }

}

function drawStoneTile(x, y, column, row, color = "#cab99b") {

    gameCtx.fillStyle = color;
    gameCtx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    gameCtx.fillStyle = "#a99c8d";

    for (let brickRow = 0; brickRow < 4; brickRow++) {

        const yOffset = brickRow * 16;
        const stagger = (brickRow + column + row) % 2 ? 8 : 0;

        for (let brick = -1; brick < 5; brick++) {

            const xOffset = brick * 16 + stagger;

            gameCtx.fillRect(x + xOffset + 2, y + yOffset + 6, 12, 2);
            gameCtx.fillRect(x + xOffset + 12, y + yOffset + 2, 2, 12);

        }

    }

}

function drawSakuraRoadTile(x, y, column, row) {

    gameCtx.fillStyle = "#66666a";
    gameCtx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    gameCtx.fillStyle = "#cbc0af";
    gameCtx.fillRect(x, y + 4, TILE_SIZE, 4);
    gameCtx.fillRect(x, y + 56, TILE_SIZE, 4);

    gameCtx.fillStyle = "#8a8585";
    gameCtx.fillRect(x, y + 28, TILE_SIZE, 4);

    for (let petal = 0; petal < 3; petal++) {

        const px = 8 + tileNoise(column, row, petal) * 4;
        const py = 10 + tileNoise(row, column, petal + 6) * 3;

        gameCtx.fillStyle = petal % 2 ? "#f3bdc8" : "#e894ad";
        gameCtx.fillRect(x + px, y + py, 4, 4);

    }

}

function drawWaterTile(x, y, column, row) {

    gameCtx.fillStyle = "#79b8c1";
    gameCtx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    gameCtx.fillStyle = "#b4d9d2";

    for (let ripple = 0; ripple < 3; ripple++) {

        const px = 4 + tileNoise(column, row, ripple) * 4;
        const py = 8 + tileNoise(row, column, ripple + 8) * 3;

        gameCtx.fillRect(x + px, y + py, 12, 4);

    }

}

function drawTree(x, y, sakura = false) {

    drawGrassTile(x, y, Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
    gameCtx.fillStyle = "rgba(58, 70, 52, 0.26)";
    gameCtx.fillRect(x + 12, y + 44, 40, 12);
    gameCtx.fillStyle = "#6f736c";
    gameCtx.fillRect(x + 8, y + 48, 48, 8);
    gameCtx.fillStyle = "#c1b99f";
    gameCtx.fillRect(x + 12, y + 44, 40, 8);
    gameCtx.fillStyle = "#80533a";
    gameCtx.fillRect(x + 28, y + 36, 8, 20);
    gameCtx.fillStyle = sakura ? "#c97997" : "#3e754b";
    gameCtx.fillRect(x + 12, y + 16, 40, 28);
    gameCtx.fillRect(x + 20, y + 8, 24, 40);
    gameCtx.fillStyle = sakura ? "#efa9bf" : "#64a55e";
    gameCtx.fillRect(x + 16, y + 20, 12, 16);
    gameCtx.fillRect(x + 36, y + 16, 12, 16);
    gameCtx.fillRect(x + 28, y + 8, 12, 16);
    gameCtx.fillStyle = sakura ? "#ffd0dc" : "#8dbe6b";
    gameCtx.fillRect(x + 24, y + 24, 12, 12);

}

function drawBuilding(x, y, type) {

    drawStoneTile(x, y, Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE), "#bfae95");
    gameCtx.fillStyle = "rgba(67, 54, 49, 0.2)";
    gameCtx.fillRect(x + 12, y + 52, 48, 8);

    const styles = {
        [Tile.STATION]: ["#a66f4f", "#ead1a0", "#5b4a4b"],
        [Tile.SHOP]: ["#b86c55", "#f3c37d", "#67474b"],
        [Tile.CAFE]: ["#9e6d58", "#f0d7ac", "#62474a"],
        [Tile.CONVENIENCE]: ["#618a77", "#f4deb1", "#4c5a58"],
        [Tile.SHRINE]: ["#9f4e3d", "#e8bc77", "#5d302d"]
    };
    const [roof, awning, wall] = styles[type];

    gameCtx.fillStyle = roof;
    gameCtx.fillRect(x + 4, y + 8, 56, 16);
    gameCtx.fillStyle = awning;
    gameCtx.fillRect(x + 8, y + 24, 48, 8);
    gameCtx.fillStyle = wall;
    gameCtx.fillRect(x + 12, y + 32, 40, 24);
    gameCtx.fillStyle = "#f5dda7";
    gameCtx.fillRect(x + 28, y + 40, 8, 16);
    gameCtx.fillStyle = "#534e55";
    gameCtx.fillRect(x + 16, y + 40, 8, 8);
    gameCtx.fillRect(x + 40, y + 40, 8, 8);

}

function drawLandmarkTile(tile, x, y, column, row) {

    switch (tile) {
        case Tile.GRASS:
            drawGrassTile(x, y, column, row);
            break;
        case Tile.STONE_PATH:
        case Tile.PLAZA:
        case Tile.SHOPPING_STREET:
        case Tile.PRAYER_GROUND:
            drawStoneTile(x, y, column, row, tile === Tile.PRAYER_GROUND ? "#c6b08e" : "#cab99b");
            break;
        case Tile.STAIRS:
            drawStoneTile(x, y, column, row, "#c6b08e");
            gameCtx.fillStyle = "#9e8a70";
            for (let step = 0; step < 4; step++) gameCtx.fillRect(x, y + step * 16 + 8, TILE_SIZE, 4);
            break;
        case Tile.SAKURA_ROAD:
            drawSakuraRoadTile(x, y, column, row);
            break;
        case Tile.CROSSWALK:
            drawSakuraRoadTile(x, y, column, row);
            gameCtx.fillStyle = "#efe4d2";
            for (let stripe = 0; stripe < 4; stripe++) {
                gameCtx.fillRect(x + stripe * 16 + 3, y + 6, 8, 52);
            }
            break;
        case Tile.POND:
            drawWaterTile(x, y, column, row);
            break;
        case Tile.POND_EDGE:
            drawGrassTile(x, y, column, row);
            gameCtx.fillStyle = "#c5b594";
            gameCtx.fillRect(x, y + 48, TILE_SIZE, 16);
            break;
        case Tile.WOOD_BRIDGE:
            drawWaterTile(x, y, column, row);
            gameCtx.fillStyle = "#9b6945";
            gameCtx.fillRect(x + 8, y, 48, TILE_SIZE);
            gameCtx.fillStyle = "#d1a36d";
            for (let plank = 0; plank < 4; plank++) gameCtx.fillRect(x + 8, y + plank * 16 + 4, 48, 4);
            break;
        case Tile.TREE:
            drawTree(x, y);
            break;
        case Tile.SAKURA_TREE:
            drawTree(x, y, true);
            break;
        case Tile.FLOWER_BED:
            drawGrassTile(x, y, column, row);
            gameCtx.fillStyle = "#9b6a4a";
            gameCtx.fillRect(x + 8, y + 12, 48, 40);
            ["#f4d06f", "#ef8da4", "#fff1bb"].forEach((color, index) => {
                gameCtx.fillStyle = color;
                gameCtx.fillRect(x + 16 + index * 12, y + 24, 8, 8);
                gameCtx.fillRect(x + 20 + index * 12, y + 20, 4, 16);
            });
            break;
        case Tile.BUSH:
            drawGrassTile(x, y, column, row);
            gameCtx.fillStyle = "#527d4d";
            gameCtx.fillRect(x + 8, y + 24, 48, 24);
            gameCtx.fillStyle = "#76a45f";
            gameCtx.fillRect(x + 16, y + 16, 16, 16);
            gameCtx.fillRect(x + 36, y + 20, 12, 16);
            break;
        case Tile.FENCE:
            drawGrassTile(x, y, column, row);
            gameCtx.fillStyle = "#8e6547";
            gameCtx.fillRect(x, y + 28, TILE_SIZE, 8);
            gameCtx.fillRect(x + 12, y + 16, 8, 32);
            gameCtx.fillRect(x + 44, y + 16, 8, 32);
            break;
        case Tile.LAMP:
            drawStoneTile(x, y, column, row);
            gameCtx.fillStyle = "#5f5551";
            gameCtx.fillRect(x + 28, y + 20, 8, 36);
            gameCtx.fillStyle = "#f6d68a";
            gameCtx.fillRect(x + 20, y + 12, 24, 12);
            break;
        case Tile.BENCH:
            drawStoneTile(x, y, column, row);
            gameCtx.fillStyle = "#875b3c";
            gameCtx.fillRect(x + 12, y + 24, 40, 8);
            gameCtx.fillRect(x + 16, y + 36, 8, 16);
            gameCtx.fillRect(x + 40, y + 36, 8, 16);
            break;
        case Tile.SIGN:
            drawStoneTile(x, y, column, row);
            gameCtx.fillStyle = "#6f4a35";
            gameCtx.fillRect(x + 28, y + 24, 8, 32);
            gameCtx.fillStyle = "#d9b86a";
            gameCtx.fillRect(x + 12, y + 12, 40, 16);
            break;
        case Tile.STATION:
        case Tile.SHOP:
        case Tile.CAFE:
        case Tile.CONVENIENCE:
        case Tile.SHRINE:
            drawBuilding(x, y, tile);
            break;
        case Tile.HIGH_RISE:
            drawStoneTile(x, y, column, row, "#bfae95");
            gameCtx.fillStyle = "#5f7181";
            gameCtx.fillRect(x + 8, y + 4, 48, 56);
            gameCtx.fillStyle = "#9fc0c4";
            for (let floor = 0; floor < 3; floor++) {
                for (let window = 0; window < 3; window++) {
                    gameCtx.fillRect(x + 16 + window * 12, y + 12 + floor * 14, 8, 8);
                }
            }
            gameCtx.fillStyle = "#c7815f";
            gameCtx.fillRect(x + 4, y + 4, 56, 8);
            break;
        case Tile.SUBWAY_ENTRANCE:
            drawStoneTile(x, y, column, row, "#c8b999");
            gameCtx.fillStyle = "#64767a";
            gameCtx.fillRect(x + 8, y + 24, 48, 28);
            gameCtx.fillStyle = "#d66a55";
            gameCtx.fillRect(x + 8, y + 16, 48, 8);
            gameCtx.fillStyle = "#f4deb1";
            gameCtx.fillRect(x + 16, y + 28, 8, 12);
            gameCtx.fillRect(x + 40, y + 28, 8, 12);
            gameCtx.fillStyle = "#3d4b52";
            gameCtx.fillRect(x + 28, y + 28, 8, 24);
            break;
        case Tile.VENDING:
            drawStoneTile(x, y, column, row);
            gameCtx.fillStyle = "#6094a0";
            gameCtx.fillRect(x + 16, y + 8, 32, 48);
            gameCtx.fillStyle = "#e7dfbd";
            gameCtx.fillRect(x + 20, y + 16, 24, 12);
            gameCtx.fillStyle = "#b86a58";
            gameCtx.fillRect(x + 24, y + 36, 16, 8);
            break;
        case Tile.TORII:
            drawStoneTile(x, y, column, row, "#c6b08e");
            gameCtx.fillStyle = "#c4513b";
            gameCtx.fillRect(x + 8, y + 12, 48, 8);
            gameCtx.fillRect(x + 16, y + 16, 8, 40);
            gameCtx.fillRect(x + 40, y + 16, 8, 40);
            break;
        case Tile.LANTERN:
            drawStoneTile(x, y, column, row, "#c6b08e");
            gameCtx.fillStyle = "#7d6a58";
            gameCtx.fillRect(x + 24, y + 16, 16, 32);
            gameCtx.fillStyle = "#f4d188";
            gameCtx.fillRect(x + 20, y + 20, 24, 16);
            break;
        case Tile.UTILITY_POLE:
            drawStoneTile(x, y, column, row);
            gameCtx.fillStyle = "#5b4b45";
            gameCtx.fillRect(x + 28, y + 8, 8, 52);
            gameCtx.fillRect(x + 12, y + 16, 40, 4);
            gameCtx.fillStyle = "#8f7e6f";
            gameCtx.fillRect(x + 16, y + 12, 4, 12);
            gameCtx.fillRect(x + 44, y + 12, 4, 12);
            break;
        default:
            drawGrassTile(x, y, column, row);
    }

}

function updateWorldAtmosphere(deltaTime) {

    windTime += deltaTime;

    worldPetals.forEach(petal => {

        petal.y += petal.fall * deltaTime;
        petal.x += (petal.drift + Math.sin(windTime * 1.5 + petal.phase) * 8) * deltaTime;

        if (petal.y > getWorldHeight()) petal.y = -8;
        if (petal.x > getWorldWidth()) petal.x = -8;

    });

    birds.forEach(bird => {

        bird.x += bird.speed * deltaTime;

        if (bird.x > getWorldWidth()) bird.x = -16;

    });

}

function drawWorldAtmosphere() {

    if (!(exteriorMap.complete && exteriorMap.naturalWidth)) sakuraTreeLocations.forEach((tree, index) => {

        const sway = Math.sin(windTime * 1.4 + index) * 3;

        gameCtx.fillStyle = "rgba(246, 190, 204, 0.75)";
        gameCtx.fillRect(tree.x + 18 + sway, tree.y + 8, 4, 4);
        gameCtx.fillRect(tree.x + 44 + sway, tree.y + 24, 4, 4);

    });

    worldPetals.forEach(petal => {

        gameCtx.fillStyle = "rgba(244, 177, 197, 0.75)";
        gameCtx.fillRect(petal.x, petal.y, petal.size, petal.size);

    });

    birds.forEach(bird => {

        const wing = Math.sin(windTime * 8 + bird.phase) > 0 ? -3 : 3;

        gameCtx.strokeStyle = "#5d5650";
        gameCtx.lineWidth = 2;
        gameCtx.beginPath();
        gameCtx.moveTo(bird.x - 4, bird.y);
        gameCtx.lineTo(bird.x, bird.y + wing);
        gameCtx.lineTo(bird.x + 4, bird.y);
        gameCtx.stroke();

    });

}

function drawPlayer() {

    const directionRows = { down: 0, up: 1, left: 2, right: 3 };
    const frame = player.moving ? Math.floor(playerAnimationTime / 0.14) % 4 : 0;
    const row = directionRows[player.direction];

    if (playerSprite.complete && playerSprite.naturalWidth) {

        gameCtx.drawImage(
            playerSprite,
            frame * 32,
            row * 48,
            32,
            48,
            player.x + (player.width - PLAYER_RENDER_WIDTH) / 2,
            player.y + player.height - PLAYER_RENDER_HEIGHT,
            PLAYER_RENDER_WIDTH,
            PLAYER_RENDER_HEIGHT
        );

        return;

    }

    gameCtx.fillStyle = "#ffffff";
    gameCtx.fillRect(player.x, player.y, player.width, player.height);

}

function drawLe() {

    if (!le.visible) return;

    const directionRows = { down: 0, up: 1, left: 2, right: 3 };
    const frame = le.moving ? Math.floor(le.animationTime / 0.14) % 4 : 0;
    const row = directionRows[le.direction];

    if (leSprite.complete && leSprite.naturalWidth) {

        gameCtx.drawImage(
            leSprite,
            frame * 32,
            row * 48,
            32,
            48,
            le.x + (le.width - PLAYER_RENDER_WIDTH) / 2,
            le.y + le.height - PLAYER_RENDER_HEIGHT,
            PLAYER_RENDER_WIDTH,
            PLAYER_RENDER_HEIGHT
        );

    }

}

function drawGame() {

    gameCtx.fillStyle = "#91ad6d";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameCtx.save();
    gameCtx.translate(gameCanvas.width / 2, gameCanvas.height / 2);
    gameCtx.scale(camera.zoom, camera.zoom);
    gameCtx.translate(-camera.x - gameCanvas.width / 2, -camera.y - gameCanvas.height / 2);

    if (exteriorMap.complete && exteriorMap.naturalWidth) {

        gameCtx.drawImage(exteriorMap, 0, 0, getWorldWidth(), getWorldHeight());

    } else {

        tokyoMap.forEach((row, rowIndex) => {

            row.forEach((tile, columnIndex) => {

                drawLandmarkTile(
                    tile,
                    columnIndex * TILE_SIZE,
                    rowIndex * TILE_SIZE,
                    columnIndex,
                    rowIndex
                );

            });

        });

    }

    drawCollisionDebug();
    drawWorldAtmosphere();
    drawLe();
    drawPlayer();

    gameCtx.restore();

}

function updatePlayer(deltaTime) {

    if (cameraIntro.active) {

        player.moving = false;
        return;

    }

    let horizontal = 0;
    let vertical = 0;

    if (pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft")) horizontal -= 1;
    if (pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) horizontal += 1;
    if (pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp")) vertical -= 1;
    if (pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) vertical += 1;

    player.moving = horizontal !== 0 || vertical !== 0;

    if (horizontal && vertical) {

        horizontal *= Math.SQRT1_2;
        vertical *= Math.SQRT1_2;

    }

    const isSprinting = pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight");
    const movementSpeed = player.speed * (isSprinting ? player.sprintMultiplier : 1);

    const destinationX = Math.max(
        0,
        Math.min(player.x + horizontal * movementSpeed * deltaTime, getWorldWidth() - player.width)
    );
    const destinationY = Math.max(
        0,
        Math.min(player.y + vertical * movementSpeed * deltaTime, getWorldHeight() - player.height)
    );

    const canMove = exteriorMap.complete && exteriorMap.naturalWidth
        ? canMoveOnOfficialMap(destinationX, destinationY)
        : canMoveTo(destinationX, destinationY);

    if (canMove) {

        player.x = destinationX;
        player.y = destinationY;

    }

}

let previousGameTime = 0;

function gameLoop(timestamp) {

    const deltaTime = Math.min((timestamp - previousGameTime) / 1000, 0.1);
    previousGameTime = timestamp;

    updatePlayer(deltaTime);
    checkFirstMeeting();
    updateDialogueTypewriter(deltaTime);
    updateWorldAtmosphere(deltaTime);

    if (player.moving) playerAnimationTime += deltaTime;

    updateCamera(deltaTime);
    drawGame();

    requestAnimationFrame(gameLoop);

}

startButton.addEventListener("click",()=>{

    if (gameStarted) return;

    gameStarted = true;
    titleScreen.classList.add("hidden");
    dialog.classList.add("hidden");
    gameCanvas.classList.remove("hidden");
    spawnPlayer();
    startCameraIntro();
    previousGameTime = performance.now();
    requestAnimationFrame(gameLoop);

});

window.addEventListener("keydown", event => {

    if (meetingState.dialogueOpen) {

        if (event.code === "Enter" || event.code === "Space") {

            event.preventDefault();
            advanceMeetingDialogue();

        }

        return;

    }

    if (!gameStarted) return;

    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(event.code)) {

        event.preventDefault();
        pressedKeys.add(event.code);

        if (directionByKey[event.code]) {

            player.direction = directionByKey[event.code];

        }

    }

});

gameDialogue.addEventListener("click", advanceMeetingDialogue);

window.addEventListener("keyup", event => {

    pressedKeys.delete(event.code);

});

window.addEventListener("blur", () => pressedKeys.clear());

/* ===========================
   Rebuild on Resize
=========================== */

window.addEventListener("resize",()=>{

    resizeCanvas();

    createStars();

    createPetals();

    if (gameStarted) {

        spawnPlayer();
        drawGame();

    }

});
