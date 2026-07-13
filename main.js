/* ======================================
   AdventureWedding
   Version 0.8.0 — Chapter 2: Sydney
====================================== */

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const gameViewport = document.getElementById("gameViewport");
const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

gameCtx.imageSmoothingEnabled = false;

let width = 0;
let height = 0;

const gameViewportState = {
    width: 960,
    height: 540,
    cssWidth: 960,
    cssHeight: 540,
    dpr: 1,
    isMobile: false,
    portrait: false
};

let lastGameViewportKey = "";

function resizeGameViewport() {

    const availableWidth = Math.max(1, window.innerWidth);
    const availableHeight = Math.max(1, window.innerHeight);
    const isMobile = navigator.maxTouchPoints > 0
        || window.matchMedia("(any-pointer: coarse), (max-width: 900px)").matches;
    const portrait = availableHeight > availableWidth;
    const internalWidth = isMobile && portrait ? 540 : 960;
    const internalHeight = isMobile && portrait ? 960 : 540;
    const scale = Math.min(availableWidth / internalWidth, availableHeight / internalHeight);
    const cssWidth = Math.max(1, Math.round(internalWidth * scale));
    const cssHeight = Math.max(1, Math.round(internalHeight * scale));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const viewportKey = [internalWidth, internalHeight, cssWidth, cssHeight, dpr, isMobile, portrait].join(":");

    gameViewportState.width = internalWidth;
    gameViewportState.height = internalHeight;
    gameViewportState.cssWidth = cssWidth;
    gameViewportState.cssHeight = cssHeight;
    gameViewportState.dpr = dpr;
    gameViewportState.isMobile = isMobile;
    gameViewportState.portrait = portrait;

    if (viewportKey === lastGameViewportKey) return;

    lastGameViewportKey = viewportKey;
    gameCanvas.width = Math.round(internalWidth * dpr);
    gameCanvas.height = Math.round(internalHeight * dpr);
    gameCanvas.style.width = `${cssWidth}px`;
    gameCanvas.style.height = `${cssHeight}px`;
    gameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gameCtx.imageSmoothingEnabled = false;

}

function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    resizeGameViewport();

}

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

let titleAnimationRunning = true;

function animate(){

    if (!titleAnimationRunning) return;

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
const chapterLocation = document.getElementById("chapterLocation");
const mobileControls = document.getElementById("mobileControls");
const characterPanel = document.getElementById("characterPanel");
const characterMenuButton = document.getElementById("characterMenuButton");

const gameDialogue = document.getElementById("gameDialogue");
const gameDialogueName = document.querySelector(".gameDialogueName");
const gameDialogueText = document.querySelector(".gameDialogueText");
const gameDialogueContinue = document.querySelector(".gameDialogueContinue");

let gameStarted = false;
let characterPanelOpen = false;

const portraitSources = [
    "assets/portraits/mori-portrait.png?v=0.7.1",
    "assets/portraits/lele-portrait.png?v=0.7.1",
    "assets/portraits/tuotuo-portrait.png?v=0.7.1b",
    "assets/portraits/dazhi-portrait.png?v=0.8.0-dazhi3"
];

portraitSources.forEach(source => {

    const portrait = new Image();
    portrait.src = source;

});

document.querySelectorAll(".characterPortrait img").forEach(image => {

    image.addEventListener("error", () => image.parentElement.classList.add("portraitFallback"));

});

function refreshMobileControlMode() {

    const enabled = navigator.maxTouchPoints > 0
        || window.matchMedia("(any-pointer: coarse), (max-width: 900px)").matches;

    document.body.classList.toggle("touchMode", enabled);
    mobileControls.classList.toggle("isTouchMode", enabled);

}

function isTypingInField(target) {

    return target instanceof HTMLElement
        && (target.matches("input, textarea, select") || target.isContentEditable);

}

function setCharacterPanelOpen(open) {

    if (meetingState.dialogueOpen || !gameStarted || gameState !== GameState.TOKYO) return;

    characterPanelOpen = open;
    characterPanel.classList.toggle("hidden", !open);
    characterMenuButton.textContent = open ? "关闭" : "人物";
    characterMenuButton.setAttribute("aria-label", open ? "关闭人物面板" : "打开人物面板");
    characterMenuButton.setAttribute("aria-expanded", String(open));

    if (open) {

        pressedKeys.clear();
        clearMobileControls();
        player.moving = false;
        le.moving = false;
        cats.forEach(cat => cat.moving = false);

    }

}

function toggleCharacterPanel() {

    setCharacterPanelOpen(!characterPanelOpen);

}

refreshMobileControlMode();

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
playerSprite.src = "assets/characters/mori/mori-sprite-sheet.png?v=0.7.1";

const playerFallbackSprite = new Image();
playerFallbackSprite.src = "assets/player-mori-sprite-sheet-32x48.png?v=2";
playerSprite.addEventListener("error", () => console.warn("[AdventureWedding] Mori character asset could not load; using the existing sprite fallback."), { once: true });

const le = {
    x: 1950,
    y: 820,
    width: 24,
    height: 24,
    direction: "down",
    moving: false,
    animationTime: 0,
    visible: true,
    companion: false
};

const leSprite = new Image();
leSprite.src = "assets/characters/lele/lele-sprite-sheet.png?v=0.7.1";

const leFallbackSprite = new Image();
leFallbackSprite.src = "assets/player-le-sprite-sheet-32x48.png?v=1";
leSprite.addEventListener("error", () => console.warn("[AdventureWedding] Lele character asset could not load; using the existing sprite fallback."), { once: true });

const catSprites = {
    tuotuo: new Image(),
    dazhi: new Image()
};
catSprites.tuotuo.src = "assets/characters/tuotuo/tuotuo-sprite-sheet.png?v=0.7.1b";
catSprites.dazhi.src = "assets/characters/dazhi/dazhi-sprite-sheet.png?v=0.8.0-dazhi3";
Object.entries(catSprites).forEach(([id, image]) => {
    image.addEventListener("error", () => console.warn(`[AdventureWedding] ${id} character asset could not load; using the existing sprite fallback.`), { once: true });
});

const catFallbackSpriteSheet = new Image();
catFallbackSpriteSheet.src = "assets/cat-companions-pixel.png?v=1";

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

let activeDialoguePages = meetingDialoguePages;
let dialoguePurpose = "meeting";

const moriPositionHistory = [];

const interactables = [
    {
        id: "bench",
        x: 1930, y: 700, width: 90, height: 70,
        pages: [
            { speaker: "乐乐", text: "东京有很多这样的公园。\n以前我喜欢一个人坐在这里。" },
            { speaker: "森", text: "以后。\n就不是一个人了。" }
        ],
        completed: false
    },
    {
        id: "vending",
        x: 1280, y: 1300, width: 80, height: 80,
        pages: [
            { speaker: "乐乐", text: "日本的自动售货机，\n什么都有。" },
            { speaker: "森", text: "真的吗？" },
            { speaker: "乐乐", text: "以后慢慢带你发现。" }
        ],
        completed: false
    },
    {
        id: "shrine",
        x: 2080, y: 520, width: 140, height: 110,
        pages: [
            { speaker: "乐乐", text: "来东京的人。\n都会来这里。" },
            { speaker: "森", text: "那我们也许个愿吧。" },
            { speaker: "乐乐", text: "好。" }
        ],
        completed: false,
        pauseAfter: 3
    }
];

let nearbyInteractable = null;

const sakuraAvenueMoment = {
    x: 1810,
    y: 900,
    width: 360,
    height: 640,
    active: false,
    discovered: false
};

const hiddenCatEvent = {
    x: 1855,
    y: 600,
    width: 96,
    height: 72,
    discovered: false,
    pages: [
        { speaker: "坨坨", text: "喵~" },
        { speaker: "大痣", text: "喵呜……" },
        { speaker: "乐乐", text: "咦？\n坨坨？\n大痣？\n你们怎么会在东京？" },
        { speaker: "森", text: "它们认识你？" },
        { speaker: "乐乐", text: "嗯。\n它们一直都是我的家人。" },
        { speaker: "森", text: "看来。\n今天真的很幸运。" }
    ]
};

const cats = [
    {
        id: "tuotuo", name: "坨坨", x: 1870, y: 622, width: 22, height: 18,
        collar: "#d9524f", marking: "#d9d7ce", direction: "down",
        following: false, moving: false, animationTime: 0, behaviour: "idle", behaviourTime: 0
    },
    {
        id: "dazhi", name: "大痣", x: 1902, y: 629, width: 22, height: 18,
        collar: "#8855a6", marking: "#77757a", direction: "down",
        following: false, moving: false, animationTime: 0, behaviour: "idle", behaviourTime: 0
    }
];

// Kept data-only for this build: it unlocks with the cats without adding a new UI.
const characterAlbum = {
    tuotuo: { unlocked: false, description: "面冷心热的贴心喵。" },
    dazhi: { unlocked: false, description: "神经大条的暖暖喵。" }
};

const achievements = {
    walkingTogether: { unlocked: false, name: "与你同行" }
};

let nearbyCatEvent = false;
let activeInteraction = null;
let gameplayPauseRemaining = 0;

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

const sydneyMap = new Image();
sydneyMap.src = "assets/maps/sydney-harbour-lookout.png?v=0.8.0";

const SYDNEY_WORLD_WIDTH = 1920;
const SYDNEY_WORLD_HEIGHT = 1080;
const GameState = Object.freeze({
    TOKYO: "tokyo",
    TOKYO_STATION_CUTSCENE: "tokyoStationCutscene",
    CHAPTER_TRANSITION: "chapterTransition",
    SYDNEY_LOOKOUT: "sydneyLookout",
    SYDNEY: "sydney"
});

let currentChapter = "tokyo";
let gameState = GameState.TOKYO;

let playerAnimationTime = 0;

const pressedKeys = new Set();
const activeControlPointers = new Map();

const mobileControlKeys = {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    sprint: "ShiftLeft"
};

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

const stationDepartureZone = { x: 1080, y: 390, width: 520, height: 260 };
let nearbyStation = false;
const chapterTransition = {
    active: false,
    completed: false,
    phase: "idle",
    elapsed: 0,
    petalPhase: 0,
    partyTargets: [
        { actor: player, x: 1325, y: 365 },
        { actor: le, x: 1275, y: 395 },
        { actor: null, x: 1228, y: 425 },
        { actor: null, x: 1195, y: 425 }
    ]
};

function getWorldWidth() {

    if (currentChapter === "sydney") return SYDNEY_WORLD_WIDTH;

    return exteriorMap.naturalWidth
        ? exteriorMap.naturalWidth * STORY_MAP_SCALE
        : MAP_COLUMNS * TILE_SIZE;

}

function getWorldHeight() {

    if (currentChapter === "sydney") return SYDNEY_WORLD_HEIGHT;

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

    return canActorMoveOnOfficialMap(player, x, y);

}

function canActorMoveOnOfficialMap(actor, x, y) {

    if (currentChapter === "sydney") return true;

    const destination = { x, y, width: actor.width, height: actor.height };

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
    clearMobileControls();
    player.moving = false;
    faceToward(player, le);
    faceToward(le, player);
    activeDialoguePages = meetingDialoguePages;
    dialoguePurpose = "meeting";
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function setDialoguePage(pageIndex) {

    const page = activeDialoguePages[pageIndex];

    meetingState.pageIndex = pageIndex;
    meetingState.characterIndex = 0;
    meetingState.typeTimer = 0;
    meetingState.pageComplete = false;
    gameDialogueName.textContent = page.speaker;
    gameDialogue.dataset.speaker = page.speaker;
    gameDialogueText.textContent = "";
    gameDialogueContinue.classList.add("hidden");

}

function updateDialogueTypewriter(deltaTime) {

    if (!meetingState.dialogueOpen || meetingState.pageComplete) return;

    const page = activeDialoguePages[meetingState.pageIndex];

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

    const page = activeDialoguePages[meetingState.pageIndex];

    if (!meetingState.pageComplete) {

        meetingState.characterIndex = page.text.length;
        meetingState.pageComplete = true;
        gameDialogueText.textContent = page.text;
        gameDialogueContinue.classList.remove("hidden");
        return;

    }

    if (meetingState.pageIndex < activeDialoguePages.length - 1) {

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

    if (dialoguePurpose === "meeting") le.companion = true;

    if (dialoguePurpose === "interaction" && activeInteraction) {

        activeInteraction.completed = true;

        if (activeInteraction.pauseAfter) {

            gameplayPauseRemaining = activeInteraction.pauseAfter;

        }

    }

    if (dialoguePurpose === "cats") {

        hiddenCatEvent.discovered = true;
        cats.forEach(cat => cat.following = true);
        characterAlbum.tuotuo.unlocked = true;
        characterAlbum.dazhi.unlocked = true;
        achievements.walkingTogether.unlocked = true;

    }

    if (dialoguePurpose === "station") {

        // The cutscene walks the party from their current positions into the station.
        startSydneyTransition();

    }

    if (dialoguePurpose === "sydney") {

        gameState = GameState.SYDNEY_LOOKOUT;

    }

    activeInteraction = null;

}

function openInteractionDialogue(interactable) {

    activeDialoguePages = interactable.pages;
    dialoguePurpose = "interaction";
    activeInteraction = interactable;
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function openCatDialogue() {

    activeDialoguePages = hiddenCatEvent.pages;
    dialoguePurpose = "cats";
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function checkFirstMeeting() {

    if (meetingState.triggered || cameraIntro.active) return;

    const distance = Math.hypot(player.x - le.x, player.y - le.y);

    if (distance <= 100) openMeetingDialogue();

}

function partyHasAllCompanions() {

    return le.companion && cats.every(cat => cat.following);

}

function tokyoStoryComplete() {

    return meetingState.triggered
        && le.companion
        && interactables.find(item => item.id === "vending")?.completed
        && interactables.find(item => item.id === "bench")?.completed
        && interactables.find(item => item.id === "shrine")?.completed
        && sakuraAvenueMoment.discovered
        && hiddenCatEvent.discovered
        && partyHasAllCompanions();

}

function updateNearbyStation() {

    if (!tokyoStoryComplete() || meetingState.dialogueOpen || chapterTransition.completed) {

        nearbyStation = false;
        return;

    }

    const closestX = Math.max(stationDepartureZone.x, Math.min(player.x, stationDepartureZone.x + stationDepartureZone.width));
    const closestY = Math.max(stationDepartureZone.y, Math.min(player.y, stationDepartureZone.y + stationDepartureZone.height));
    nearbyStation = Math.hypot(player.x - closestX, player.y - closestY) <= 110;

}

function playerIsAtStation() {

    return player.x >= stationDepartureZone.x
        && player.x <= stationDepartureZone.x + stationDepartureZone.width
        && player.y >= stationDepartureZone.y
        && player.y <= stationDepartureZone.y + stationDepartureZone.height;

}

function startSydneyTransition() {

    if (chapterTransition.active || chapterTransition.completed || currentChapter !== "tokyo") return;

    chapterTransition.active = true;
    gameState = GameState.CHAPTER_TRANSITION;
    chapterTransition.phase = "walk";
    chapterTransition.elapsed = 0;
    chapterTransition.petalPhase = 0;
    chapterTransition.partyTargets[2].actor = cats[0];
    chapterTransition.partyTargets[3].actor = cats[1];
    pressedKeys.clear();
    clearMobileControls();

}

function openTokyoStationDialogue() {

    if (!nearbyStation || gameState !== GameState.TOKYO) return;

    activeDialoguePages = [
        { speaker: "乐乐", text: "今天。\n真的很开心。" },
        { speaker: "森", text: "我也是。\n谢谢你陪我一起走过东京。" },
        { speaker: "乐乐", text: "东京。\n有很多属于我的回忆。" },
        { speaker: "森", text: "那接下来，\n让我带你去看看我的城市。" },
        { speaker: "乐乐", text: "你的城市？" },
        { speaker: "森", text: "嗯。\n我已经在悉尼生活了十六年。\n那里，也是我的家。" },
        { speaker: "乐乐", text: "好呀。\n那以后，\n就请你带着我一起探索悉尼吧。" },
        { speaker: "坨坨", text: "喵～" },
        { speaker: "大痣", text: "喵呜～" },
        { speaker: "森", text: "当然。\n还有你们两个。" },
        { speaker: "乐乐", text: "一家人，\n一起出发。" }
    ];
    dialoguePurpose = "station";
    gameState = GameState.TOKYO_STATION_CUTSCENE;
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function moveActorIntoStation(actor, target, deltaTime, speed) {

    const dx = target.x - actor.x;
    const dy = target.y - actor.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 4) {

        actor.x = target.x;
        actor.y = target.y;
        actor.moving = false;
        return true;

    }

    const step = Math.min(distance, speed * deltaTime);
    actor.x += dx / distance * step;
    actor.y += dy / distance * step;
    actor.moving = true;
    faceToward(actor, target);
    return false;

}

function startSydneyDialogue() {

    activeDialoguePages = [
        { speaker: "森", text: "欢迎来到悉尼。\n这里，是我生活了十六年的地方。" },
        { speaker: "乐乐", text: "原来……\n这就是你每天看到的风景。" },
        { speaker: "森", text: "从今天开始。\n我想把这里的一切。\n都慢慢介绍给你。" },
        { speaker: "乐乐", text: "那以后。\n请多多指教。" },
        { speaker: "坨坨", text: "喵～" },
        { speaker: "大痣", text: "喵呜～" },
        { speaker: "森", text: "欢迎回家。" }
    ];
    dialoguePurpose = "sydney";
    gameState = GameState.SYDNEY_LOOKOUT;
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function spawnSydneyParty() {

    currentChapter = "sydney";
    gameState = GameState.SYDNEY_LOOKOUT;
    chapterLocation.textContent = "悉尼 · 海港之夜";
    player.x = 875;
    player.y = 755;
    le.x = 830;
    le.y = 785;
    cats[0].x = 790;
    cats[0].y = 820;
    cats[1].x = 750;
    cats[1].y = 825;
    player.direction = "up";
    le.direction = "up";
    cats.forEach(cat => cat.direction = "up");
    moriPositionHistory.length = 0;
    for (let index = 0; index < 80; index++) moriPositionHistory.push({ x: player.x, y: player.y + index * 2 });
    centerCameraOnPlayer();

}

function updateChapterTransition(deltaTime) {

    if (!chapterTransition.active) return;

    chapterTransition.elapsed += deltaTime;
    chapterTransition.petalPhase += deltaTime;

    if (chapterTransition.phase === "walk") {

        const arrived = chapterTransition.partyTargets
            .map((target, index) => moveActorIntoStation(target.actor, target, deltaTime, index < 2 ? 118 : 100))
            .every(Boolean);

        if (arrived) {

            chapterTransition.phase = "fadeTokyo";
            chapterTransition.elapsed = 0;

        }

        return;

    }

    if (chapterTransition.phase === "fadeTokyo" && chapterTransition.elapsed >= 1.8) {

        chapterTransition.phase = "chapterOne";
        chapterTransition.elapsed = 0;
        return;

    }

    if (chapterTransition.phase === "chapterOne" && chapterTransition.elapsed >= 2.1) {

        chapterTransition.phase = "chapterTwo";
        chapterTransition.elapsed = 0;
        return;

    }

    if (chapterTransition.phase === "chapterTwo" && chapterTransition.elapsed >= 2.1) {

        spawnSydneyParty();
        chapterTransition.phase = "arrive";
        chapterTransition.elapsed = 0;
        return;

    }

    if (chapterTransition.phase === "arrive" && chapterTransition.elapsed >= 1.25) {

        chapterTransition.phase = "dialogue";
        chapterTransition.active = false;
        chapterTransition.completed = true;
        startSydneyDialogue();

    }

}

function updateNearbyInteractable() {

    if (meetingState.dialogueOpen || !le.companion) {

        nearbyInteractable = null;
        return;

    }

    nearbyInteractable = interactables
        .filter(item => !item.completed)
        .map(item => ({ item, distance: Math.hypot(player.x - item.x, player.y - item.y) }))
        .filter(entry => entry.distance <= 100)
        .sort((first, second) => first.distance - second.distance)[0]?.item || null;

}

function playerIsInsideZone(zone) {

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    return playerCenterX >= zone.x
        && playerCenterX <= zone.x + zone.width
        && playerCenterY >= zone.y
        && playerCenterY <= zone.y + zone.height;

}

function updateSakuraAvenueMoment() {

    if (!le.companion || cameraIntro.active) return;

    const insideAvenue = playerIsInsideZone(sakuraAvenueMoment);

    sakuraAvenueMoment.active = insideAvenue;

    if (insideAvenue && !sakuraAvenueMoment.discovered) {

        sakuraAvenueMoment.discovered = true;

        for (let index = 0; index < 28; index++) {

            worldPetals.push({
                x: sakuraAvenueMoment.x + Math.random() * sakuraAvenueMoment.width,
                y: sakuraAvenueMoment.y + Math.random() * sakuraAvenueMoment.height,
                size: 2 + Math.random() * 3,
                drift: 8 + Math.random() * 16,
                fall: 10 + Math.random() * 18,
                phase: Math.random() * Math.PI * 2
            });

        }

    }

}

function updateNearbyCatEvent() {

    if (hiddenCatEvent.discovered || meetingState.dialogueOpen || !le.companion) {

        nearbyCatEvent = false;
        return;

    }

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const closestX = Math.max(hiddenCatEvent.x, Math.min(playerCenterX, hiddenCatEvent.x + hiddenCatEvent.width));
    const closestY = Math.max(hiddenCatEvent.y, Math.min(playerCenterY, hiddenCatEvent.y + hiddenCatEvent.height));
    nearbyCatEvent = Math.hypot(playerCenterX - closestX, playerCenterY - closestY) <= 118;

}

function tryInteraction() {

    if (nearbyStation && !meetingState.dialogueOpen && !cameraIntro.active) {

        openTokyoStationDialogue();

    } else if (nearbyInteractable && !meetingState.dialogueOpen && !cameraIntro.active) {

        openInteractionDialogue(nearbyInteractable);

    } else if (nearbyCatEvent && !meetingState.dialogueOpen && !cameraIntro.active) {

        openCatDialogue();

    }

}

function updateLeCompanion(deltaTime) {

    if (!le.companion || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active) {

        le.moving = false;
        return;

    }

    const delayedPoint = moriPositionHistory[Math.max(0, moriPositionHistory.length - 14)];

    if (!delayedPoint) return;

    const distance = Math.hypot(delayedPoint.x - le.x, delayedPoint.y - le.y);

    if (distance > 240) {

        le.x = delayedPoint.x;
        le.y = delayedPoint.y;
        le.moving = false;
        return;

    }

    if (distance < 46) {

        le.moving = false;
        return;

    }

    const horizontal = (delayedPoint.x - le.x) / distance;
    const vertical = (delayedPoint.y - le.y) / distance;
    const speed = sakuraAvenueMoment.active ? 160 : 190;
    const nextX = Math.max(0, Math.min(le.x + horizontal * speed * deltaTime, getWorldWidth() - le.width));
    const nextY = Math.max(0, Math.min(le.y + vertical * speed * deltaTime, getWorldHeight() - le.height));

    if (canMoveOnOfficialMap(nextX, nextY)) {

        le.x = nextX;
        le.y = nextY;

    }

    le.moving = true;
    le.animationTime += deltaTime;
    faceToward(le, delayedPoint);

}

function drawInteractionPrompt() {

    if ((!nearbyInteractable && !nearbyCatEvent && !nearbyStation) || meetingState.dialogueOpen) return;

    const mobilePrompt = mobileControls.classList.contains("isTouchMode");
    const promptText = nearbyStation
        ? (mobilePrompt ? "点击 A 进入东京站" : "按 E 进入东京站")
        : nearbyCatEvent
        ? (mobilePrompt ? "发现了什么…… 点击 A 互动" : "发现了什么…… 按 E 互动")
        : (mobilePrompt ? "点击 A 互动" : "按 E / 点击互动");
    const promptWidth = nearbyStation ? 156 : nearbyCatEvent ? 164 : 112;

    gameCtx.fillStyle = "rgba(10, 20, 38, 0.86)";
    gameCtx.fillRect(player.x - 44, player.y - 58, promptWidth, 28);
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "14px Fusion Pixel 12px Monospaced JP";
    gameCtx.fillText(promptText, player.x - 38, player.y - 39);

}

function updateCatCompanion(cat, index, deltaTime) {

    if (!cat.following || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active) {

        cat.moving = false;
        cat.animationTime += deltaTime;
        return;

    }

    cat.animationTime += deltaTime;

    if (cat.behaviourTime > 0) {

        cat.behaviourTime -= deltaTime;
        cat.moving = false;
        return;

    }

    const delayedPoint = moriPositionHistory[Math.max(0, moriPositionHistory.length - 24 - index * 10)];

    if (!delayedPoint) return;

    const distance = Math.hypot(delayedPoint.x - cat.x, delayedPoint.y - cat.y);

    if (distance > 190) {

        cat.x = delayedPoint.x;
        cat.y = delayedPoint.y;
        cat.moving = false;
        return;

    }

    if (distance < 32) {

        const restingBehaviours = ["sit", "groom", "idle"];
        cat.behaviour = restingBehaviours[Math.floor(Math.random() * restingBehaviours.length)];
        cat.behaviourTime = 0.35 + Math.random() * 0.65;
        cat.moving = false;
        return;

    }

    cat.behaviour = Math.random() < 0.025 ? "run" : "walk";
    const speed = cat.behaviour === "run" ? 275 : 190;
    const horizontal = (delayedPoint.x - cat.x) / distance;
    const vertical = (delayedPoint.y - cat.y) / distance;
    const nextX = Math.max(0, Math.min(cat.x + horizontal * speed * deltaTime, getWorldWidth() - cat.width));
    const nextY = Math.max(0, Math.min(cat.y + vertical * speed * deltaTime, getWorldHeight() - cat.height));

    if (canActorMoveOnOfficialMap(cat, nextX, nextY)) {

        cat.x = nextX;
        cat.y = nextY;

    }

    cat.moving = true;
    faceToward(cat, delayedPoint);

}

function updateCatCompanions(deltaTime) {

    cats.forEach((cat, index) => updateCatCompanion(cat, index, deltaTime));

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

    const targetZoom = getCameraFollowZoom();
    const visibleWidth = gameViewportState.width / targetZoom;
    const visibleHeight = gameViewportState.height / targetZoom;
    const portraitOffsetY = gameViewportState.isMobile && gameViewportState.portrait ? 110 : 0;
    const maxX = Math.max(0, getWorldWidth() - visibleWidth);
    const maxY = Math.max(0, getWorldHeight() - visibleHeight);

    camera.x = Math.max(0, Math.min(player.x + player.width / 2 - visibleWidth / 2, maxX));
    camera.y = Math.max(0, Math.min(player.y + player.height / 2 + portraitOffsetY - visibleHeight / 2, maxY));
    camera.zoom = targetZoom;

}

function getCameraFollowZoom() {

    if (!gameViewportState.isMobile) return 1;

    return gameViewportState.portrait ? 0.76 : 0.92;

}

function getCameraTarget(zoom = getCameraFollowZoom()) {

    const visibleWidth = gameViewportState.width / zoom;
    const visibleHeight = gameViewportState.height / zoom;
    const portraitOffsetY = gameViewportState.isMobile && gameViewportState.portrait ? 110 : 0;
    const maxX = Math.max(0, getWorldWidth() - visibleWidth);
    const maxY = Math.max(0, getWorldHeight() - visibleHeight);

    return {
        x: Math.max(0, Math.min(player.x + player.width / 2 - visibleWidth / 2, maxX)),
        y: Math.max(0, Math.min(player.y + player.height / 2 + portraitOffsetY - visibleHeight / 2, maxY))
    };

}

function clampCameraToWorld() {

    const visibleWidth = gameViewportState.width / camera.zoom;
    const visibleHeight = gameViewportState.height / camera.zoom;
    const maxX = Math.max(0, getWorldWidth() - visibleWidth);
    const maxY = Math.max(0, getWorldHeight() - visibleHeight);

    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));

}

function startCameraIntro() {

    const overviewZoom = Math.min(
        (gameViewportState.width - 48) / getWorldWidth(),
        (gameViewportState.height - 48) / getWorldHeight()
    );

    camera.x = Math.max(0, (getWorldWidth() - gameViewportState.width / overviewZoom) / 2);
    camera.y = Math.max(0, (getWorldHeight() - gameViewportState.height / overviewZoom) / 2);
    camera.zoom = overviewZoom;
    cameraIntro.active = true;
    cameraIntro.elapsed = 0;

}

function updateCamera(deltaTime) {

    const followZoom = getCameraFollowZoom();
    const target = getCameraTarget(followZoom);
    const followAmount = 1 - Math.pow(1 - camera.smoothing, deltaTime * 60);

    if (characterPanelOpen) return;

    if (cameraIntro.active) {

        cameraIntro.elapsed += deltaTime;

        const overviewZoom = Math.min(
            (gameViewportState.width - 48) / getWorldWidth(),
            (gameViewportState.height - 48) / getWorldHeight()
        );
        const overviewX = Math.max(0, (getWorldWidth() - gameViewportState.width / overviewZoom) / 2);
        const overviewY = Math.max(0, (getWorldHeight() - gameViewportState.height / overviewZoom) / 2);

        if (cameraIntro.elapsed > cameraIntro.overviewDuration) {

            const progress = Math.min(
                1,
                (cameraIntro.elapsed - cameraIntro.overviewDuration) / cameraIntro.transitionDuration
            );
            const ease = progress * progress * (3 - 2 * progress);

            camera.x = overviewX + (target.x - overviewX) * ease;
            camera.y = overviewY + (target.y - overviewY) * ease;
            camera.zoom = overviewZoom + (followZoom - overviewZoom) * ease;

            if (progress === 1) cameraIntro.active = false;

        }

        return;

    }

    camera.x += (target.x - camera.x) * followAmount;
    camera.y += (target.y - camera.y) * followAmount;
    camera.zoom += (followZoom - camera.zoom) * followAmount;

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

    if (currentChapter === "sydney") {

        // Gentle harbour glints retain the stillness of the Sydney night scene.
        gameCtx.fillStyle = "rgba(178, 222, 255, 0.34)";
        for (let index = 0; index < 14; index++) {

            const x = 390 + index * 86 + Math.sin(windTime * 1.6 + index) * 12;
            const y = 520 + (index % 4) * 54;
            gameCtx.fillRect(x, y, 18, 2);

        }

        return;

    }

    const hasOfficialMap = exteriorMap.complete && exteriorMap.naturalWidth;

    if (!hasOfficialMap) sakuraTreeLocations.forEach((tree, index) => {

        const sway = Math.sin(windTime * 1.4 + index) * 3;

        gameCtx.fillStyle = "rgba(246, 190, 204, 0.75)";
        gameCtx.fillRect(tree.x + 18 + sway, tree.y + 8, 4, 4);
        gameCtx.fillRect(tree.x + 44 + sway, tree.y + 24, 4, 4);

    });

    if (hasOfficialMap) {

        // A few low-opacity highlights make the painted cherry canopies feel
        // gently windblown without covering or redesigning the map artwork.
        [
            { x: 1830, y: 940 }, { x: 2110, y: 1050 }, { x: 1860, y: 1350 },
            { x: 2380, y: 1190 }, { x: 420, y: 420 }, { x: 2500, y: 400 }
        ].forEach((tree, index) => {

            const sway = Math.sin(windTime * 1.35 + index * 1.7) * 5;
            gameCtx.fillStyle = "rgba(255, 209, 225, 0.45)";
            gameCtx.fillRect(tree.x + sway, tree.y, 5, 3);
            gameCtx.fillRect(tree.x + 18 + sway, tree.y + 13, 3, 4);

        });

        // Small shifting highlights bring the river to life while leaving its
        // original pixel-art texture clearly visible.
        gameCtx.fillStyle = "rgba(202, 239, 255, 0.28)";
        for (let index = 0; index < 14; index++) {

            const shimmerX = 320 + index * 165 + Math.sin(windTime * 1.6 + index) * 16;
            const shimmerY = 1930 + (index % 3) * 42;
            gameCtx.fillRect(shimmerX, shimmerY, 26, 3);

        }

    }

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

    const activeSprite = playerSprite.complete && playerSprite.naturalWidth
        ? playerSprite
        : playerFallbackSprite;

    if (activeSprite.complete && activeSprite.naturalWidth) {

        gameCtx.drawImage(
            activeSprite,
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

    const activeSprite = leSprite.complete && leSprite.naturalWidth
        ? leSprite
        : leFallbackSprite;

    if (activeSprite.complete && activeSprite.naturalWidth) {

        gameCtx.drawImage(
            activeSprite,
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

function drawCat(cat) {

    const x = Math.round(cat.x - 7);
    const y = Math.round(cat.y - 27);
    const blink = Math.sin(cat.animationTime * 2.6 + (cat.id === "dazhi" ? 1 : 0)) > 0.96;
    const tailWag = Math.round(Math.sin(cat.animationTime * 5 + (cat.id === "dazhi" ? 1 : 0)) * 3);
    const grooming = cat.behaviour === "groom" && Math.sin(cat.animationTime * 9) > 0;

    const catSprite = catSprites[cat.id];

    if (catSprite.complete && catSprite.naturalWidth) {

        const bob = cat.behaviour === "run" ? Math.sin(cat.animationTime * 12) * 2 : 0;
        const directionRows = { down: 4, up: 3, left: 1, right: 2 };
        const stateRow = cat.behaviour === "sit" || cat.behaviour === "groom"
            ? 5
            : directionRows[cat.direction] ?? 0;
        const frame = cat.moving ? Math.floor(cat.animationTime / 0.16) % 4 : 0;

        gameCtx.fillStyle = "rgba(26, 31, 39, 0.25)";
        gameCtx.fillRect(cat.x - 8, cat.y + cat.height - 3, 34, 5);
        gameCtx.drawImage(
            catSprite,
            frame * 32, stateRow * 32, 32, 32,
            Math.round(cat.x - 16), Math.round(cat.y - 34 + bob), 56, 56
        );

        if (cat.id === "dazhi") {

            gameCtx.fillStyle = "#fff4e5";
            gameCtx.fillRect(Math.round(cat.x + 26), Math.round(cat.y + 13 + bob), 4, 4);

        }

        return;

    }

    if (catFallbackSpriteSheet.complete && catFallbackSpriteSheet.naturalWidth) {

        const sourceX = cat.id === "tuotuo" ? 370 : 990;
        gameCtx.drawImage(catFallbackSpriteSheet, sourceX, 170, 420, 510, cat.x - 4, cat.y - 27, 30, 36);
        return;

    }

    // Animated tail and ears give the small companions a distinctly feline idle.
    gameCtx.fillStyle = "#5f5d61";
    gameCtx.fillRect(x - 4 + tailWag, y + 22, 7, 5);
    gameCtx.fillRect(x - 7 + tailWag, y + 18, 5, 7);
    gameCtx.fillStyle = "#d8d5cf";
    gameCtx.fillRect(x + 4, y + 8, 24, 20);
    gameCtx.fillStyle = "#59575b";
    gameCtx.fillRect(x + 6, y + 3, 7, 9);
    gameCtx.fillRect(x + 22, y + 3, 7, 9);
    gameCtx.fillRect(x + 6, y + 8, 22, 13);
    gameCtx.fillStyle = "#c7c4bd";
    gameCtx.fillRect(x + 10, y + 12, 14, 14);
    gameCtx.fillStyle = cat.marking;
    gameCtx.fillRect(x + 10, y + 8, 5, 8);
    gameCtx.fillRect(x + 21, y + 8, 4, 7);
    gameCtx.fillRect(x + 4, y + 20, 5, 6);
    gameCtx.fillRect(x + 25, y + 20, 5, 6);
    gameCtx.fillStyle = blink ? "#454348" : "#79a56e";
    gameCtx.fillRect(x + 12, y + 14, 3, blink ? 1 : 3);
    gameCtx.fillRect(x + 21, y + 14, 3, blink ? 1 : 3);
    gameCtx.fillStyle = "#d98b8b";
    gameCtx.fillRect(x + 17, y + 18, 3, 2);
    gameCtx.fillStyle = cat.collar;
    gameCtx.fillRect(x + 10, y + 24, 14, 3);

    if (cat.id === "tuotuo") {

        gameCtx.fillStyle = "#e9bd4e";
        gameCtx.fillRect(x + 16, y + 27, 4, 4);

    } else {

        gameCtx.fillStyle = "#9b6ac0";
        gameCtx.fillRect(x + 12, y + 26, 4, 4);
        gameCtx.fillRect(x + 20, y + 26, 4, 4);

    }

    if (grooming) {

        gameCtx.fillStyle = "#d8d5cf";
        gameCtx.fillRect(x + 26, y + 14, 5, 8);

    }

}

function drawTransitionPetals() {

    gameCtx.fillStyle = "rgba(247, 177, 202, 0.9)";

    for (let index = 0; index < 32; index++) {

        const x = (index * 89 + chapterTransition.petalPhase * (22 + index % 5 * 8)) % gameViewportState.width;
        const y = (index * 47 + chapterTransition.petalPhase * (30 + index % 4 * 9)) % gameViewportState.height;
        const size = 2 + index % 3;
        gameCtx.fillRect(Math.round(x), Math.round(y), size, size);

    }

}

function drawChapterCard(title, subtitle, detail) {

    const cardWidth = Math.min(520, gameViewportState.width - 64);
    const cardHeight = 210;
    const cardX = Math.round((gameViewportState.width - cardWidth) / 2);
    const cardY = Math.round((gameViewportState.height - cardHeight) / 2);

    gameCtx.fillStyle = "#061326";
    gameCtx.fillRect(cardX, cardY, cardWidth, cardHeight);
    gameCtx.strokeStyle = "#d9ae5e";
    gameCtx.lineWidth = 4;
    gameCtx.strokeRect(cardX + 3, cardY + 3, cardWidth - 6, cardHeight - 6);
    gameCtx.fillStyle = "#f6d78c";
    gameCtx.textAlign = "center";
    gameCtx.font = "22px Fusion Pixel, monospace";
    gameCtx.fillText(title, gameViewportState.width / 2, cardY + 58);
    gameCtx.fillStyle = "#ffffff";
    gameCtx.font = "38px Fusion Pixel, monospace";
    gameCtx.fillText(subtitle, gameViewportState.width / 2, cardY + 116);
    gameCtx.fillStyle = "#f1c86a";
    gameCtx.font = "20px Fusion Pixel, monospace";
    gameCtx.fillText(detail, gameViewportState.width / 2, cardY + 163);
    gameCtx.textAlign = "left";

}

function drawChapterTransitionOverlay() {

    if (!chapterTransition.active) return;

    const phase = chapterTransition.phase;

    if (phase === "fadeTokyo") {

        gameCtx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, chapterTransition.elapsed / 1.8)})`;
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
        drawTransitionPetals();
        return;

    }

    if (phase === "chapterOne" || phase === "chapterTwo") {

        gameCtx.fillStyle = "#02060d";
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
        if (phase === "chapterOne") drawChapterCard("Chapter 1", "东京", "Completed");
        else drawChapterCard("Chapter 2", "Sydney", "悉尼");
        return;

    }

    if (phase === "arrive") {

        gameCtx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, 1 - chapterTransition.elapsed / 1.25)})`;
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    }

}

const fireworks = [];
let fireworkCooldown = 0;
const fireworkColors = ["#f4a3ca", "#f6ce72", "#fff2d1", "#bd9bea"];

function updateSydneyFireworks(deltaTime) {

    if (gameState !== GameState.SYDNEY_LOOKOUT) return;

    fireworkCooldown -= deltaTime;
    if (fireworkCooldown <= 0 && fireworks.length < 120) {

        const originX = 0.15 + Math.random() * 0.7;
        const originY = 0.12 + Math.random() * 0.22;
        const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
        for (let index = 0; index < 22; index++) {

            const angle = Math.PI * 2 * index / 22;
            const speed = 28 + Math.random() * 38;
            fireworks.push({ x: originX, y: originY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.8 + Math.random() * 0.45, maxLife: 1.2, color });

        }
        fireworkCooldown = 0.72 + Math.random() * 0.65;

    }

    for (let index = fireworks.length - 1; index >= 0; index--) {

        const particle = fireworks[index];
        particle.life -= deltaTime;
        particle.x += particle.vx * deltaTime / gameViewportState.width;
        particle.y += particle.vy * deltaTime / gameViewportState.height;
        particle.vy += 35 * deltaTime;
        if (particle.life <= 0) fireworks.splice(index, 1);

    }

}

function drawSydneyLookout() {

    gameCtx.fillStyle = "#030916";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    if (sydneyMap.complete && sydneyMap.naturalWidth) {

        const sourceHeight = Math.min(665, sydneyMap.naturalHeight);
        const sourceWidth = sydneyMap.naturalWidth;
        const scale = gameViewportState.portrait
            ? Math.max(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight)
            : Math.min(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight);
        const drawWidth = sourceWidth * scale;
        const drawHeight = sourceHeight * scale;
        const drawX = (gameViewportState.width - drawWidth) / 2;
        const drawY = (gameViewportState.height - drawHeight) / 2;
        gameCtx.drawImage(sydneyMap, 0, 0, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);

    }

    fireworks.forEach(particle => {

        gameCtx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        gameCtx.fillStyle = particle.color;
        gameCtx.fillRect(Math.round(particle.x * gameViewportState.width), Math.round(particle.y * gameViewportState.height), 3, 3);

    });
    gameCtx.globalAlpha = 1;

}

function drawGame() {

    if (gameState === GameState.SYDNEY_LOOKOUT) {

        drawSydneyLookout();
        drawChapterTransitionOverlay();
        return;

    }

    gameCtx.fillStyle = "#91ad6d";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    gameCtx.save();
    gameCtx.scale(camera.zoom, camera.zoom);
    gameCtx.translate(-Math.round(camera.x), -Math.round(camera.y));

    if (currentChapter === "sydney" && sydneyMap.complete && sydneyMap.naturalWidth) {

        gameCtx.drawImage(sydneyMap, 0, 0, getWorldWidth(), getWorldHeight());

    } else if (exteriorMap.complete && exteriorMap.naturalWidth) {

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

    if (currentChapter === "tokyo") drawCollisionDebug();
    drawWorldAtmosphere();

    [
        { y: player.y + player.height, draw: drawPlayer },
        { y: le.y + le.height, draw: drawLe },
        ...cats.filter(cat => hiddenCatEvent.discovered || !cat.following).map(cat => ({ y: cat.y + cat.height, draw: () => drawCat(cat) }))
    ].sort((first, second) => first.y - second.y).forEach(character => character.draw());

    drawInteractionPrompt();

    gameCtx.restore();

    drawChapterTransitionOverlay();

}

function updatePlayer(deltaTime) {

    if (cameraIntro.active || meetingState.dialogueOpen || characterPanelOpen || gameplayPauseRemaining > 0 || chapterTransition.active || gameState !== GameState.TOKYO) {

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

    const canMove = currentChapter === "sydney"
        || (exteriorMap.complete && exteriorMap.naturalWidth
            ? canMoveOnOfficialMap(destinationX, destinationY)
            : canMoveTo(destinationX, destinationY));

    if (canMove) {

        player.x = destinationX;
        player.y = destinationY;

    }

}

let previousGameTime = 0;

function gameLoop(timestamp) {

    const deltaTime = Math.min((timestamp - previousGameTime) / 1000, 0.1);
    previousGameTime = timestamp;

    if (gameplayPauseRemaining > 0) gameplayPauseRemaining = Math.max(0, gameplayPauseRemaining - deltaTime);

    updateChapterTransition(deltaTime);
    updatePlayer(deltaTime);
    if (currentChapter === "tokyo") checkFirstMeeting();
    moriPositionHistory.push({ x: player.x, y: player.y });

    if (moriPositionHistory.length > 180) moriPositionHistory.shift();

    updateLeCompanion(deltaTime);
    if (currentChapter === "tokyo") {

        updateNearbyInteractable();
        updateNearbyCatEvent();
        updateSakuraAvenueMoment();
        updateNearbyStation();

    } else {

        nearbyInteractable = null;
        nearbyCatEvent = false;
        nearbyStation = false;

    }
    updateCatCompanions(deltaTime);
    updateDialogueTypewriter(deltaTime);
    updateWorldAtmosphere(deltaTime);
    updateSydneyFireworks(deltaTime);
    mobileControls.classList.toggle("isDialogueOpen", meetingState.dialogueOpen);

    if (player.moving) playerAnimationTime += deltaTime;

    updateCamera(deltaTime);
    drawGame();

    requestAnimationFrame(gameLoop);

}

startButton.addEventListener("click",()=>{

    if (gameStarted) return;

    gameStarted = true;
    titleAnimationRunning = false;
    titleScreen.classList.add("hidden");
    dialog.classList.add("hidden");
    gameViewport.classList.remove("hidden");
    chapterLocation.classList.remove("hidden");
    characterMenuButton.classList.remove("hidden");
    mobileControls.classList.remove("hidden");
    spawnPlayer();
    startCameraIntro();
    previousGameTime = performance.now();
    requestAnimationFrame(gameLoop);

});

characterMenuButton.addEventListener("pointerdown", event => {

    event.preventDefault();
    toggleCharacterPanel();

});

function triggerMobileAction() {

    if (meetingState.dialogueOpen) {

        advanceMeetingDialogue();
        return;

    }

    if (!gameStarted || characterPanelOpen || cameraIntro.active) return;

    if (nearbyInteractable || nearbyCatEvent || nearbyStation) tryInteraction();

}

function releaseMobileControl(pointerId) {

    const control = activeControlPointers.get(pointerId);

    if (!control) return;

    activeControlPointers.delete(pointerId);

    const key = mobileControlKeys[control];

    if (key && ![...activeControlPointers.values()].includes(control)) {

        pressedKeys.delete(key);

    }

}

function clearMobileControls() {

    activeControlPointers.clear();
    Object.values(mobileControlKeys).forEach(key => pressedKeys.delete(key));
    mobileControls.querySelectorAll(".isPressed").forEach(button => button.classList.remove("isPressed"));

}

mobileControls.querySelectorAll("button[data-control]").forEach(button => {

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        const control = button.dataset.control;

        if (control === "action") {

            triggerMobileAction();
            button.classList.add("isPressed");
            return;

        }

        if (!gameStarted || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active) return;

        activeControlPointers.set(event.pointerId, control);
        pressedKeys.add(mobileControlKeys[control]);
        button.classList.add("isPressed");

        if (directionByKey[mobileControlKeys[control]]) {

            player.direction = directionByKey[mobileControlKeys[control]];

        }

    });

    const release = event => {

        event.preventDefault();
        releaseMobileControl(event.pointerId);
        button.classList.remove("isPressed");
    };

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
    button.addEventListener("contextmenu", event => event.preventDefault());
    button.addEventListener("dragstart", event => event.preventDefault());

});

window.addEventListener("keydown", event => {

    if (event.code === "Escape" && characterPanelOpen) {

        event.preventDefault();
        setCharacterPanelOpen(false);
        return;

    }

    if (meetingState.dialogueOpen) {

        if (event.code === "Enter" || event.code === "Space") {

            event.preventDefault();
            advanceMeetingDialogue();

        }

        return;

    }

    if (!gameStarted) return;

    if (event.code === "KeyB" && !isTypingInField(event.target)) {

        event.preventDefault();
        toggleCharacterPanel();
        return;

    }

    if (characterPanelOpen) return;

    if ((event.code === "KeyE" || event.code === "Enter" || event.code === "Space") && (nearbyInteractable || nearbyCatEvent || nearbyStation)) {

        event.preventDefault();
        tryInteraction();
        return;

    }

    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(event.code)) {

        event.preventDefault();
        pressedKeys.add(event.code);

        if (directionByKey[event.code]) {

            player.direction = directionByKey[event.code];

        }

    }

});

gameDialogue.addEventListener("click", advanceMeetingDialogue);
gameCanvas.addEventListener("click", tryInteraction);

window.addEventListener("keyup", event => {

    pressedKeys.delete(event.code);

});

window.addEventListener("blur", () => {

    pressedKeys.clear();
    clearMobileControls();

});

/* ===========================
   Rebuild on Resize
=========================== */

window.addEventListener("resize",()=>{

    resizeCanvas();
    refreshMobileControlMode();

    createStars();

    createPetals();

    if (gameStarted) {

        clampCameraToWorld();
        drawGame();

    }

});
