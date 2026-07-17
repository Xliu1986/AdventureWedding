/* ======================================
   AdventureWedding
   Version 0.8.7 — Longnan Town Memories
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
const openingPrologue = document.getElementById("openingPrologue");

let gameStarted = false;
let characterPanelOpen = false;

// The single canonical location for every playable-character visual.
const CHARACTERS = window.CHARACTERS;
if (!CHARACTERS) throw new Error("Missing canonical data/characters.js manifest.");

const portraitSources = Object.values(CHARACTERS)
    .map(character => character.portrait)
    .filter(Boolean);

portraitSources.forEach(source => {

    const portrait = new Image();
    portrait.src = source;

});

// Every visible character portrait is resolved from the canonical manifest.
document.documentElement.style.setProperty("--portrait-mori", `url("${CHARACTERS.mori.portrait}")`);
document.documentElement.style.setProperty("--portrait-lele", `url("${CHARACTERS.lele.portrait}")`);
document.documentElement.style.setProperty("--portrait-tuotuo", `url("${CHARACTERS.tuotuo.portrait}")`);
document.documentElement.style.setProperty("--portrait-dazhi", `url("${CHARACTERS.dazhi.portrait}")`);

document.querySelectorAll("[data-character-portrait]").forEach(image => {

    const character = CHARACTERS[image.dataset.characterPortrait];
    if (character?.portrait) image.src = character.portrait;

});

function beginGameplay() {

    openingPrologue.classList.add("hidden");
    gameViewport.classList.remove("hidden");
    chapterLocation.classList.remove("hidden");
    characterMenuButton.classList.remove("hidden");
    mobileControls.classList.remove("hidden");
    spawnPlayer();
    startCameraIntro();
    previousGameTime = performance.now();
    requestAnimationFrame(gameLoop);

}

function playOpeningPrologue() {

    const lines = [...openingPrologue.querySelectorAll(".openingLine")];
    openingPrologue.classList.remove("hidden", "showCharacters");
    lines.forEach(line => line.classList.remove("isVisible", "isLeaving"));

    let index = 0;
    const showNextLine = () => {

        if (index >= lines.length) {

            openingPrologue.classList.add("showCharacters");
            window.setTimeout(beginGameplay, 1200);
            return;

        }

        const line = lines[index++];
        line.classList.add("isVisible");
        window.setTimeout(() => {

            line.classList.add("isLeaving");
            window.setTimeout(showNextLine, 380);

        }, 950);

    };

    showNextLine();

}

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

    if (meetingState.dialogueOpen || !gameStarted || ![GameState.TOKYO, GameState.SYDNEY, GameState.COLES].includes(gameState)) return;

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
playerSprite.src = CHARACTERS.mori.sprite;

const playerFallbackSprite = new Image();
playerFallbackSprite.src = CHARACTERS.mori.sprite;

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
leSprite.src = CHARACTERS.lele.sprite;

const leFallbackSprite = new Image();
leFallbackSprite.src = CHARACTERS.lele.sprite;

const catSpriteSheets = {
    tuotuo: new Image(),
    dazhi: new Image()
};
catSpriteSheets.tuotuo.src = CHARACTERS.tuotuo.sprite;
catSpriteSheets.dazhi.src = CHARACTERS.dazhi.sprite;

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
    },
    {
        // The central ramen storefront on the Tokyo shopping street.
        id: "ittencho",
        x: 840, y: 1320, width: 150, height: 82,
        prompt: "一点张",
        pages: [
            { speaker: "森", text: "这家看起来不错啊！名字也很有意思：一点张。\n有没有感觉很熟悉 ：）" },
            { speaker: "乐乐", text: "哈哈哈，我要分享给张欣！" },
            { speaker: "森", text: "（偷笑）向我们的好朋友张欣致敬～～感谢她促成了这段奇妙的旅程～～" },
            { speaker: "坨坨，大痣", text: "谢谢喵～" }
        ],
        repeatable: true,
        completed: false
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

// Story memories are intentionally lightweight: unlocking one records it for
// the future album without introducing inventory or reward mechanics.
const memoryAlbum = {
    longnanBridgePiaozi: { unlocked: false, title: "桥上的瓢子" }
};

let nearbyCatEvent = false;
let activeInteraction = null;
let gameplayPauseRemaining = 0;
const storyFlags = {
    gansuPiaozi: false,
    sydneyCooking: false,
    sydneySeaside: false,
    tasmaniaAdventure: false,
    sydneyChapterComplete: false,
    longnanChapterStarted: false,
    longnanMemoryAlbumViewed: false
};
let activeColesInspectable = null;

const piaoziState = {
    introSeen: false,
    completed: false,
    nearby: false
};

// A quiet side display immediately to the left of the snacks shelf.
const piaoziIntroZone = { x: 1208, y: 206, width: 46, height: 32 };

const colesInspectables = [
    { id: "vegetables", x: 282, y: 724, completed: false, pages: [{ speaker: "森", text: "有很多不同种类的蔬菜\n肉类那边也很丰富。" }, { speaker: "乐乐", text: "正好可以让你尝尝\n乐乐的三板斧 ： P" }] },
    { id: "bread", x: 588, y: 236, completed: false, pages: [{ speaker: "森", text: "好香。" }, { speaker: "乐乐", text: "澳洲人很喜欢每天买新鲜面包。" }] },
    { id: "milk", x: 1108, y: 238, completed: false, pages: [{ speaker: "乐乐", text: "牛奶好多。" }, { speaker: "森", text: "哈哈。\n第一次来我也挑了好久。" }] },
    { id: "snacks", x: 1270, y: 240, completed: false, pages: [{ speaker: "森", text: "这个包装挺可爱的。" }, { speaker: "乐乐", text: "每个都想买回家尝尝。" }] },
    { id: "checkout", x: 1160, y: 584, completed: false, pages: [{ speaker: "森", text: "今天看来客人不是很多。" }, { speaker: "乐乐", text: "那我们可以好好的在这里\n溜达溜达。" }] }
];
let nearbyColesInspectable = null;

const piaoziIntroPages = [
    { speaker: "森", text: "这个好可爱，\n是白草莓么？" },
    { speaker: "坨坨", text: "No 喵！" },
    { speaker: "乐乐", text: "嘿嘿。\n这是我家乡甘肃陇南特有的一种天然浆果。\n初夏成熟。\n是一种只有在我们当地才能吃到的天然美味。\n也是陪伴我成长的重要回忆。" },
    { speaker: "大痣", text: "喵呜～" },
    { speaker: "森", text: "原来是这样。\n我看到你的很多作品，\n都和瓢子有关。\n希望以后，\n可以去你的家乡，\n亲口尝尝它。" },
    { speaker: "乐乐", text: "一定会的。\n到时候，\n我带你回家。\n一起去摘真正的瓢子。" },
    { speaker: "坨坨", text: "喵～" },
    { speaker: "大痣", text: "喵喵～" }
];

const sydneyLifeSequence = [
    { id: "sydneyCooking", cg: "sydneyCooking", flag: "sydneyCooking", hold: 0.8, pages: [
        { speaker: "乐乐", text: "嘿嘿，\n今天晚餐超级丰富！" },
        { speaker: "森", text: "原来一起做饭，\n比想象中还开心。" },
        { speaker: "乐乐", text: "你也有帮忙呀。" },
        { speaker: "森", text: "以后，\n我负责洗碗。" },
        { speaker: "坨坨", text: "喵～" },
        { speaker: "大痣", text: "喵呜～" }
    ] },
    { id: "sydneySeaside", cg: "sydneyWatchingTheSea", flag: "sydneySeaside", hold: 1, pages: [
        { speaker: "森", text: "和你在一起，\n去哪里都很开心！" },
        { speaker: "乐乐", text: "以后，\n还有很多地方，\n我们一起去。" },
        { speaker: "坨坨", text: "喵～" },
        { speaker: "大痣", text: "喵喵～" }
    ] },
    { id: "tasmaniaAdventure", cg: "tasmaniaAdventure", flag: "tasmaniaAdventure", hold: 0.8, pages: [
        { speaker: "森", text: "澳洲还有很多地方，\n想带你去。" },
        { speaker: "乐乐", text: "那以后，\n我们一个一个地方，\n慢慢去看。" },
        { speaker: "森", text: "和你在一起，\n去哪里都很漂亮。" },
        { speaker: "坨坨", text: "喵～" },
        { speaker: "大痣", text: "喵呜～" }
    ] }
];
const sydneyAirportPages = [
    { speaker: "森", text: "在悉尼的这些日子，\n好像一下子就过去了。" },
    { speaker: "乐乐", text: "因为每天，\n都过得很开心呀。" },
    { speaker: "森", text: "这就是我在这座城市的故事与经历" },
    { speaker: "森", text: "下一站，\n轮到你带我回家了。" },
    { speaker: "乐乐", text: "好呀。\n这次，\n我带你去看看我长大的地方。" },
    { speaker: "坨坨", text: "回家喵～" },
    { speaker: "大痣", text: "喵呜～" },
    { speaker: "森", text: "走吧。\n去甘肃陇南。" }
];
const longnanOpeningPages = [
    { speaker: "乐乐", text: "欢迎来到陇南。\n这里，\n是我长大的地方。" },
    { speaker: "森", text: "终于来了。" },
    { speaker: "森", text: "这里和我想象中的，\n很不一样。" },
    { speaker: "乐乐", text: "走吧。\n我带你们回家。" },
    { speaker: "坨坨", text: "回家喵～" },
    { speaker: "大痣", text: "喵呜～" }
];
let sydneyLifeIndex = -1;
let longnanTitleTimer = 0;
let longnanSequenceTimer = 0;
let longnanCGIndex = -1;
let nearbyLongnanInteraction = null;
let nearbyLongnanExit = false;
let nearbyLongnanMemoryAlbum = false;
const longnanLookoutPages = [
    { speaker: "乐乐", text: "欢迎来到陇南。\n这里，\n就是我长大的地方。" },
    { speaker: "森", text: "真漂亮。\n难怪，\n你的作品里，\n总会出现这些山。" }
];
const longnanHometownPages = [
    { speaker: "森", text: "哇，这就是你长大的地方吗？" },
    { speaker: "乐乐", text: "是的，这就是我的家乡，一个承载我所有童年记忆的地方，有陪着我长大的F4，酸甜的瓢子，还有别的地方吃不到的“三层楼”还有坨坨宝和痣宝～" },
    { speaker: "坨坨", text: "喵～💗" },
    { speaker: "大痣", text: "喵呜～💗" }
];
const longnanLookoutRailing = { id: "railing", x: 740, y: 345, text: "远眺乐乐的家", completed: false };
const longnanTownMemories = [
    { id: "schoolEntrance", label: "学校门口", x: 748, y: 330, repeatable: true, pages: [{ speaker: "乐乐", text: "我可是重点中学的尖子生哦。" }] },
    { id: "bridgeFlood", label: "桥上的回忆", x: 718, y: 570, repeatable: true, pages: [{ speaker: "乐乐", text: "当年大暴雨，\n大到这条路被大水淹没了呢！" }] },
    { id: "roadMemory", label: "路边的回忆", x: 1040, y: 405, repeatable: true, pages: [{ speaker: "乐乐", text: "每天在家就能看到学校。" }] },
    { id: "busStop", label: "公交站", x: 1025, y: 700, repeatable: true, pages: [{ speaker: "乐乐", text: "这里的变化好大啊～" }] }
];
const longnanTownPiaozi = {
    id: "bridgePiaozi",
    label: "查看瓢子",
    x: 732,
    y: 620,
    memoryId: "longnanBridgePiaozi",
    repeatable: true,
    pages: [
        { speaker: "乐乐", text: "看，在我们这里，\n野生的瓢子都会当天被人采摘，\n然后装盒售卖。" },
        { speaker: "乐乐", text: "放几天瓢子就会烂掉，\n所以这是一种赏味期限十分短暂的\n美味小浆果。" },
        { speaker: "森", text: "要不是认识了你，\n我可能都不会有机会吃到\n这么特别的东西～" },
        { speaker: "乐乐", text: "所以命运是个奇妙的东西，\n让我们在东京相识，\n在悉尼相知，\n在陇南相伴。" },
        { speaker: "乐乐", text: "相信以后，\n我们还会去更多的地方，\n一起体验不一样的人生💗" },
        { speaker: "坨坨", text: "我也要一起喵～" },
        { speaker: "大痣", text: "我也是喵呜～" },
        { speaker: "森，乐乐", text: "（笑）" }
    ]
};
const longnanMemoryAlbumTrigger = { x: 768, y: 915, radius: 96 };
const longnanCGSequence = [
    { id: "longnanChildhoodDrawing", pages: [{ speaker: "乐乐", text: "小时候，\n我最喜欢画这些山。" }] },
    { id: "longnanPiaozi", pages: [{ speaker: "乐乐", text: "第一次摘到瓢子，\n也是在这里。" }] },
    { id: "longnanTogether", pages: [{ speaker: "森", text: "原来，\n这里，\n就是你的世界。" }] },
    { id: "longnanSunset", pages: [{ speaker: "森", text: "谢谢你，\n带我回来。" }, { speaker: "乐乐", text: "谢谢你，\n一直陪着我。" }] }
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

const sydneyMap = new Image();
sydneyMap.src = "assets/maps/sydney-harbour-lookout.png?v=0.8.0";

const sydneyExplorationMap = new Image();
sydneyExplorationMap.src = "assets/sydney/sydney-harbour-night.png?v=0.8.0";

const colesInteriorMap = new Image();
colesInteriorMap.src = "assets/maps/coles-interior-v0.8.2.png?v=0.8.2";

const longnanLookoutPixelMap = new Image();
longnanLookoutPixelMap.src = "assets/maps/longnan-lookout-pixel.png?v=0.8.6";

const longnanChildhoodTownPixelMap = new Image();
longnanChildhoodTownPixelMap.src = "assets/maps/longnan/longnan-town.png?v=0.8.7";

const piaoziStoryCG = new Image();
piaoziStoryCG.src = "assets/cg/coles-piaozi-story.png?v=0.8.3";

// Every future real-photo CG belongs in assets/cg/source/ (the approved photo)
// and assets/cg/pixel/ (its faithful pixel-art rendering). The source photo is
// never altered by this runtime; this table only plays approved pixel CG files.
const storyCGs = {
    colesPiaozi: {
        src: "assets/cg/coles-piaozi-story.png?v=0.8.3",
        image: piaoziStoryCG,
        focalX: 0.54,
        focalY: 0.42,
        // The current legacy file includes an authored dialogue area at its base.
        // Crop it so the live JRPG dialogue UI remains the single text layer.
        sourceHeight: 602
    },
    sydneyCooking: {
        src: "assets/cg/sydney/cg-cooking-together.png",
        focalX: 0.55,
        focalY: 0.42,
        sourceHeight: 941,
        // This approved image includes its own authored JRPG dialogue panel.
        // On iPhone keep the complete composition rather than cropping it.
        mobileDisplay: "contain"
    },
    sydneyWatchingTheSea: {
        src: "assets/cg/sydney/cg-seaside-jump.png",
        focalX: 0.51,
        focalY: 0.45,
        sourceHeight: 1024,
        mobileDisplay: "contain"
    },
    tasmaniaAdventure: {
        src: "assets/cg/sydney/cg-tasmania-trip.png",
        focalX: 0.53,
        focalY: 0.47,
        sourceHeight: 941,
        mobileDisplay: "contain"
    },
    sydneyAirport: {
        // Approved airport departure CG: preserved as supplied.
        src: "assets/cg/sydney/cg-sydney-airport.png",
        focalX: 0.5,
        focalY: 0.48,
        sourceHeight: 941,
        mobileDisplay: "contain"
    },
    longnanHometownView: {
        src: "assets/cg/longnan/cg-kangxian-hometown.png?v=0.8.6",
        focalX: 0.5,
        focalY: 0.48,
        mobileDisplay: "contain"
    },
    longnanChildhoodDrawing: {
        src: "assets/cg/longnan/cg-lele-childhood-drawing.png?v=0.8.6",
        focalX: 0.5,
        focalY: 0.46
    },
    longnanPiaozi: {
        src: "assets/cg/longnan/cg-piaozi-berries.png?v=0.8.6",
        focalX: 0.5,
        focalY: 0.48
    },
    longnanTogether: {
        src: "assets/cg/longnan/cg-mori-lele-longnan.png?v=0.8.6",
        focalX: 0.5,
        focalY: 0.46
    },
    longnanSunset: {
        image: longnanLookoutPixelMap,
        focalX: 0.5,
        focalY: 0.42
    },
    longnanMemoryAlbum: {
        src: "assets/cg/memory-album/longnan-piaozi.png?v=0.8.7",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        autoCloseAfter: 2.4
    }
};

const storyCGOverlay = {
    active: false,
    id: null,
    config: null,
    phase: "idle",
    opacity: 0,
    revealDelay: 0,
    dialogue: null,
    dialoguePurpose: "",
    dialogueStarted: false,
    onComplete: null
};

function preloadStoryCGs() {

    Object.values(storyCGs).forEach(config => {

        if (!config.image && config.src) {

            config.image = new Image();
            config.image.src = config.src;

        }

    });

}

preloadStoryCGs();

const SYDNEY_WORLD_WIDTH = 1920;
const SYDNEY_WORLD_HEIGHT = 1080;
const COLES_WORLD_WIDTH = 1536;
const COLES_WORLD_HEIGHT = 1024;
const LONGNAN_LOOKOUT_WIDTH = 1624;
const LONGNAN_LOOKOUT_HEIGHT = 969;
const LONGNAN_TOWN_WIDTH = 1536;
const LONGNAN_TOWN_HEIGHT = 1024;
// The supplied town artwork is treated as a compact memory route. Only these
// connected street-level paths are walkable; every building mass, school
// interior, sports ground and river area remains blocked.
const longnanTownWalkableZones = [
    { x: 0, y: 346, width: 1536, height: 116 }, // upper road
    { x: 650, y: 280, width: 236, height: 110 }, // school frontage only
    { x: 666, y: 450, width: 104, height: 286 }, // central bridge
    { x: 0, y: 654, width: 1536, height: 82 }, // riverside paths
    { x: 0, y: 736, width: 1536, height: 226 } // lower road / bus stop
];
const GameState = Object.freeze({
    TOKYO: "tokyo",
    TOKYO_STATION_CUTSCENE: "tokyoStationCutscene",
    CHAPTER_TRANSITION: "chapterTransition",
    SYDNEY_LOOKOUT: "sydneyLookout",
    SYDNEY: "sydney",
    TRANSITION_TO_COLES: "transitionToColes",
    TRANSITION_TO_SYDNEY: "transitionToSydney",
    COLES: "coles",
    SYDNEY_MEMORY: "sydneyMemory",
    SYDNEY_AIRPORT: "sydneyAirport",
    LONGNAN_TITLE: "longnanTitle",
    LONGNAN_INTRO: "longnanIntro",
    LONGNAN_LOOKOUT: "longnanLookout",
    LONGNAN_TOWN: "longnanTown",
    LONGNAN_MEMORY_ALBUM: "longnanMemoryAlbum",
    LONGNAN_CG: "longnanCG",
    LONGNAN_COMPLETE: "longnanComplete",
    WEDDING_INTRO: "weddingIntro"
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

// Scene exits are intentionally explicit: this keeps exploration player-led on
// both desktop and touch devices.
const sydneyToColesExit = { x: 790, y: 900, width: 280, height: 150 };
const colesToSydneyExit = { x: 600, y: 760, width: 330, height: 180 };
// Sydney is a single lookout tableau. The stone terrace is walkable; water,
// gardens and stairs remain outside the playable space.
const sydneyLookoutWalkableZone = { x: 118, y: 738, width: 1684, height: 270 };
let nearbySceneExit = null;
const sceneTransition = { active: false, phase: "idle", target: null, elapsed: 0 };

const colesCollisionRects = [
    { x: 0, y: 0, width: COLES_WORLD_WIDTH, height: 62 },
    { x: 0, y: 0, width: 64, height: COLES_WORLD_HEIGHT },
    { x: 1470, y: 0, width: 66, height: COLES_WORLD_HEIGHT },
    { x: 0, y: 742, width: 590, height: 282 },
    { x: 944, y: 742, width: 592, height: 282 },
    { x: 228, y: 96, width: 230, height: 112 },
    { x: 498, y: 72, width: 182, height: 150 },
    { x: 698, y: 72, width: 482, height: 148 },
    { x: 1280, y: 74, width: 184, height: 144 },
    { x: 72, y: 170, width: 88, height: 420 },
    { x: 314, y: 264, width: 150, height: 206 },
    { x: 478, y: 224, width: 140, height: 158 },
    { x: 876, y: 258, width: 126, height: 302 },
    { x: 1016, y: 258, width: 126, height: 274 },
    { x: 1176, y: 276, width: 290, height: 286 },
    { x: 160, y: 480, width: 264, height: 224 },
    { x: 480, y: 484, width: 282, height: 232 },
    { x: 1118, y: 610, width: 340, height: 114 }
];

function getWorldWidth() {

    if (currentChapter === "sydney") return SYDNEY_WORLD_WIDTH;
    if (currentChapter === "coles") return COLES_WORLD_WIDTH;
    if (currentChapter === "longnanLookout") return LONGNAN_LOOKOUT_WIDTH;
    if (currentChapter === "longnanTown") return LONGNAN_TOWN_WIDTH;

    return exteriorMap.naturalWidth
        ? exteriorMap.naturalWidth * STORY_MAP_SCALE
        : MAP_COLUMNS * TILE_SIZE;

}

function getWorldHeight() {

    if (currentChapter === "sydney") return SYDNEY_WORLD_HEIGHT;
    if (currentChapter === "coles") return COLES_WORLD_HEIGHT;
    if (currentChapter === "longnanLookout") return LONGNAN_LOOKOUT_HEIGHT;
    if (currentChapter === "longnanTown") return LONGNAN_TOWN_HEIGHT;

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

    if (currentChapter === "longnanLookout") {

        const centerX = x + actor.width / 2;
        const centerY = y + actor.height / 2;
        return Math.pow((centerX - 812) / 490, 2) + Math.pow((centerY - 610) / 250, 2) <= 1;

    }

    if (currentChapter === "longnanTown") {

        const centerX = x + actor.width / 2;
        const centerY = y + actor.height / 2;
        return longnanTownWalkableZones.some(zone =>
            centerX >= zone.x && centerX <= zone.x + zone.width
            && centerY >= zone.y && centerY <= zone.y + zone.height
        );

    }

    const destination = { x, y, width: actor.width, height: actor.height };

    if (currentChapter === "coles") {

        return !colesCollisionRects.some(rect => rectanglesOverlap(destination, rect));

    }

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

function faceMovementDirection(actor, horizontal, vertical) {

    if (!horizontal && !vertical) return;

    if (Math.abs(horizontal) > Math.abs(vertical)) {

        actor.direction = horizontal > 0 ? "right" : "left";

    } else {

        actor.direction = vertical > 0 ? "down" : "up";

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

        if (!activeInteraction.repeatable) activeInteraction.completed = true;

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

        gameState = GameState.SYDNEY;

    }

    if (dialoguePurpose === "piaoziIntro") {

        hideStoryCG();
        storyCGOverlay.onComplete = () => {
            piaoziState.completed = true;
            piaoziState.nearby = false;
            storyFlags.gansuPiaozi = true;
            faceToward(le, piaoziIntroZone);
            faceToward(player, piaoziIntroZone);
            cats.forEach(cat => {
                cat.behaviour = "sit";
                cat.behaviourTime = 1;
            });
            gameplayPauseRemaining = 1;
        };

    }

    if (dialoguePurpose === "sydneyLife") finishSydneyLifeScene();

    if (dialoguePurpose === "sydneyAirport") {

        storyCGOverlay.onComplete = startLongnanTitle;
        storyCGOverlay.phase = "endingHold";
        storyCGOverlay.revealDelay = 1;

    }

    if (dialoguePurpose === "longnanHometown") {

        storyCGOverlay.phase = "endingHold";
        storyCGOverlay.revealDelay = 0.45;

    }

    if (dialoguePurpose === "longnanCG") {

        storyCGOverlay.onComplete = () => {

            longnanCGIndex += 1;
            playLongnanCG();

        };
        storyCGOverlay.phase = "endingHold";
        storyCGOverlay.revealDelay = 0.8;

    }

    if (dialoguePurpose === "longnanMemory" && activeInteraction) {

        if (!activeInteraction.repeatable) activeInteraction.completed = true;

    }

    if (dialoguePurpose === "longnanPiaozi" && activeInteraction) {

        if (activeInteraction.memoryId && memoryAlbum[activeInteraction.memoryId]) {

            memoryAlbum[activeInteraction.memoryId].unlocked = true;

        }

    }

    if (dialoguePurpose === "weddingIntro") {

        gameplayPauseRemaining = 1;
        chapterLocation.classList.add("hidden");

    }

    if (dialoguePurpose === "colesInspect" && activeColesInspectable) activeColesInspectable.completed = true;

    activeInteraction = null;
    activeColesInspectable = null;

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

function openPiaoziDialogue(pages, purpose) {

    activeDialoguePages = pages;
    dialoguePurpose = purpose;
    meetingState.dialogueOpen = true;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    setDialoguePage(0);
    gameDialogue.classList.remove("hidden");

}

function startPiaoziStoryCG() {

    if (storyCGOverlay.active || piaoziState.completed) return;
    piaoziState.introSeen = true;
    showStoryCG({
        id: "colesPiaozi",
        dialogue: piaoziIntroPages,
        dialoguePurpose: "piaoziIntro",
        revealDelay: 0.65
    });

}

function startSydneyLifeSequence() {

    if (!storyFlags.gansuPiaozi || storyFlags.sydneyChapterComplete || storyCGOverlay.active) return;
    sydneyLifeIndex = 0;
    characterMenuButton.classList.add("hidden");
    chapterLocation.classList.add("hidden");
    playSydneyLifeScene();

}

function playSydneyLifeScene() {

    const scene = sydneyLifeSequence[sydneyLifeIndex];
    if (!scene) {

        startSydneyAirportSequence();
        return;

    }

    gameState = GameState.SYDNEY_MEMORY;
    showStoryCG({ id: scene.cg, dialogue: scene.pages, dialoguePurpose: "sydneyLife", revealDelay: 0.55 });

}

function finishSydneyLifeScene() {

    const scene = sydneyLifeSequence[sydneyLifeIndex];
    if (!scene) return;
    storyFlags[scene.flag] = true;
    storyCGOverlay.onComplete = () => {

        sydneyLifeIndex += 1;
        playSydneyLifeScene();

    };
    storyCGOverlay.phase = "endingHold";
    storyCGOverlay.revealDelay = scene.hold;

}

function startSydneyAirportSequence() {

    gameState = GameState.SYDNEY_AIRPORT;
    showStoryCG({ id: "sydneyAirport", dialogue: sydneyAirportPages, dialoguePurpose: "sydneyAirport", revealDelay: 0.7 });

}

function startLongnanTitle() {

    storyFlags.sydneyChapterComplete = true;
    gameState = GameState.LONGNAN_TITLE;
    longnanTitleTimer = 0;

}

function startLongnanOpening() {

    currentChapter = "longnanLookout";
    gameState = GameState.LONGNAN_LOOKOUT;
    storyFlags.longnanChapterStarted = true;
    chapterLocation.textContent = "甘肃 · 陇南";
    chapterLocation.classList.remove("hidden");
    player.x = 812;
    player.y = 640;
    le.x = 770;
    le.y = 668;
    cats[0].x = 734;
    cats[0].y = 684;
    cats[1].x = 704;
    cats[1].y = 690;
    seedPartyHistory();
    centerCameraOnPlayer();
    openPiaoziDialogue(longnanLookoutPages, "longnanLookoutIntro");

}

function enterLongnanTown() {

    if (sceneTransition.active) return;
    sceneTransition.active = true;
    sceneTransition.phase = "fadeOut";
    sceneTransition.target = "longnanTown";
    sceneTransition.elapsed = 0;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);

}

function placePartyInLongnanTown() {

    currentChapter = "longnanTown";
    gameState = GameState.LONGNAN_TOWN;
    chapterLocation.textContent = "陇南 · 童年小镇";
    le.x = 712;
    le.y = 694;
    player.x = 752;
    player.y = 704;
    cats[0].x = 680;
    cats[0].y = 710;
    cats[1].x = 648;
    cats[1].y = 716;
    seedPartyHistory();
    centerCameraOnPlayer();

}

function startLongnanCGSequence() {

    if (storyCGOverlay.active) return;
    longnanCGIndex = 0;
    playLongnanCG();

}

function playLongnanCG() {

    const scene = longnanCGSequence[longnanCGIndex];
    if (!scene) {

        gameState = GameState.LONGNAN_COMPLETE;
        longnanSequenceTimer = 0;
        return;

    }
    gameState = GameState.LONGNAN_CG;
    showStoryCG({ id: scene.id, dialogue: scene.pages, dialoguePurpose: "longnanCG", revealDelay: 0.5 });

}

function showStoryCG({ id, image, dialogue = null, dialoguePurpose = "storyCG", onComplete = null, revealDelay = 0.35 }) {

    const config = storyCGs[id] || (image ? { image, focalX: 0.5, focalY: 0.5 } : null);
    if (storyCGOverlay.active || !config) return false;

    storyCGOverlay.active = true;
    storyCGOverlay.id = id || "custom";
    storyCGOverlay.config = config;
    storyCGOverlay.phase = "fadeIn";
    storyCGOverlay.opacity = 0;
    storyCGOverlay.revealDelay = revealDelay;
    storyCGOverlay.dialogue = dialogue;
    storyCGOverlay.dialoguePurpose = dialoguePurpose;
    storyCGOverlay.dialogueStarted = false;
    storyCGOverlay.onComplete = onComplete;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    return true;

}

function hideStoryCG() {

    if (!storyCGOverlay.active || storyCGOverlay.phase === "fadeOut") return;
    storyCGOverlay.phase = "fadeOut";

}

function updateStoryCG(deltaTime) {

    if (!storyCGOverlay.active) return;

    if (storyCGOverlay.phase === "fadeIn") {

        storyCGOverlay.opacity = Math.min(1, storyCGOverlay.opacity + deltaTime / 0.4);
        if (storyCGOverlay.opacity < 1) return;
        storyCGOverlay.phase = "hold";

    }

    if (storyCGOverlay.phase === "hold" && !storyCGOverlay.dialogueStarted) {

        storyCGOverlay.revealDelay = Math.max(0, storyCGOverlay.revealDelay - deltaTime);
        if (storyCGOverlay.revealDelay === 0) {

            storyCGOverlay.dialogueStarted = true;
            if (storyCGOverlay.dialogue?.length) {

                openPiaoziDialogue(storyCGOverlay.dialogue, storyCGOverlay.dialoguePurpose);

            } else if (storyCGOverlay.config?.placeholder || storyCGOverlay.config?.autoCloseAfter) {

                storyCGOverlay.phase = "endingHold";
                storyCGOverlay.revealDelay = storyCGOverlay.config.autoCloseAfter || 1.8;

            }

        }

    }

    if (storyCGOverlay.phase === "endingHold") {

        storyCGOverlay.revealDelay = Math.max(0, storyCGOverlay.revealDelay - deltaTime);
        if (storyCGOverlay.revealDelay === 0) hideStoryCG();

    }

    if (storyCGOverlay.phase === "fadeOut") {

        storyCGOverlay.opacity = Math.max(0, storyCGOverlay.opacity - deltaTime / 0.4);
        if (storyCGOverlay.opacity > 0) return;

        const onComplete = storyCGOverlay.onComplete;
        storyCGOverlay.active = false;
        storyCGOverlay.id = null;
        storyCGOverlay.config = null;
        storyCGOverlay.phase = "idle";
        storyCGOverlay.dialogue = null;
        storyCGOverlay.onComplete = null;
        if (onComplete) onComplete();

    }

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
        .filter(item => item.repeatable || !item.completed)
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

function updateNearbySceneExit() {

    nearbySceneExit = null;
    if (meetingState.dialogueOpen || sceneTransition.active) return;

    const exit = gameState === GameState.SYDNEY
        ? sydneyToColesExit
        : gameState === GameState.COLES ? colesToSydneyExit : null;

    if (!exit) return;

    const closestX = Math.max(exit.x, Math.min(player.x + player.width / 2, exit.x + exit.width));
    const closestY = Math.max(exit.y, Math.min(player.y + player.height / 2, exit.y + exit.height));
    if (Math.hypot(player.x + player.width / 2 - closestX, player.y + player.height / 2 - closestY) <= 100) {

        nearbySceneExit = gameState === GameState.SYDNEY
            ? "coles"
            : (storyFlags.gansuPiaozi && !storyFlags.sydneyChapterComplete ? "sydneyLife" : "sydney");

    }

}

function updateNearbyPiaozi() {

    piaoziState.nearby = false;
    if (currentChapter !== "coles" || meetingState.dialogueOpen || piaoziState.completed) return;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const closestX = Math.max(piaoziIntroZone.x, Math.min(playerCenterX, piaoziIntroZone.x + piaoziIntroZone.width));
    const closestY = Math.max(piaoziIntroZone.y, Math.min(playerCenterY, piaoziIntroZone.y + piaoziIntroZone.height));
    if (Math.hypot(playerCenterX - closestX, playerCenterY - closestY) <= 92) piaoziState.nearby = true;

}

function updateNearbyColesInspectable() {

    nearbyColesInspectable = null;
    if (currentChapter !== "coles" || meetingState.dialogueOpen) return;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    nearbyColesInspectable = colesInspectables
        .filter(item => !item.completed)
        .map(item => ({ item, distance: Math.hypot(playerCenterX - item.x, playerCenterY - item.y) }))
        .filter(entry => entry.distance <= 86)
        .sort((first, second) => first.distance - second.distance)[0]?.item || null;

}

function updateNearbyLongnan() {

    nearbyLongnanInteraction = null;
    nearbyLongnanExit = false;
    nearbyLongnanMemoryAlbum = false;
    if (meetingState.dialogueOpen || storyCGOverlay.active) return;
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    if (gameState === GameState.LONGNAN_LOOKOUT) {

        nearbyLongnanExit = centerY < 420 && Math.abs(centerX - 812) < 105;
        if (!longnanLookoutRailing.completed && Math.hypot(centerX - longnanLookoutRailing.x, centerY - longnanLookoutRailing.y) < 110) nearbyLongnanInteraction = longnanLookoutRailing;

    } else if (gameState === GameState.LONGNAN_TOWN) {

        const candidates = [...longnanTownMemories, longnanTownPiaozi]
            .filter(item => item.repeatable || !item.completed)
            .map(item => ({ item, distance: Math.hypot(centerX - item.x, centerY - item.y) }))
            .filter(entry => entry.distance < 115)
            .sort((a, b) => a.distance - b.distance)[0]?.item || null;
        nearbyLongnanInteraction = candidates;
        nearbyLongnanMemoryAlbum = Math.hypot(
            centerX - longnanMemoryAlbumTrigger.x,
            centerY - longnanMemoryAlbumTrigger.y
        ) <= longnanMemoryAlbumTrigger.radius;

    }

}

function seedPartyHistory() {

    moriPositionHistory.length = 0;
    for (let index = 0; index < 90; index++) {

        moriPositionHistory.push({ x: player.x, y: player.y + index * 1.5 });

    }

}

function placePartyInColes() {

    currentChapter = "coles";
    gameState = GameState.COLES;
    chapterLocation.textContent = "悉尼 · Coles 超市";
    player.x = 760;
    player.y = 800;
    le.x = 720;
    le.y = 826;
    cats[0].x = 686;
    cats[0].y = 846;
    cats[1].x = 652;
    cats[1].y = 850;
    player.direction = "up";
    le.direction = "up";
    cats.forEach(cat => cat.direction = "up");
    seedPartyHistory();
    centerCameraOnPlayer();

}

function placePartyInSydney() {

    currentChapter = "sydney";
    gameState = GameState.SYDNEY;
    chapterLocation.textContent = "悉尼 · 海港之夜";
    player.x = 920;
    player.y = 850;
    le.x = 880;
    le.y = 880;
    cats[0].x = 842;
    cats[0].y = 896;
    cats[1].x = 808;
    cats[1].y = 900;
    player.direction = "up";
    le.direction = "up";
    cats.forEach(cat => cat.direction = "up");
    seedPartyHistory();
    centerCameraOnPlayer();

}

function startSceneTransition(target) {

    if (sceneTransition.active || !target) return;
    sceneTransition.active = true;
    sceneTransition.phase = "fadeOut";
    sceneTransition.target = target;
    sceneTransition.elapsed = 0;
    gameState = target === "coles" ? GameState.TRANSITION_TO_COLES : GameState.TRANSITION_TO_SYDNEY;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);

}

function updateSceneTransition(deltaTime) {

    if (!sceneTransition.active) return;
    sceneTransition.elapsed += deltaTime;

    if (sceneTransition.phase === "fadeOut" && sceneTransition.elapsed >= 1) {

        if (sceneTransition.target === "coles") placePartyInColes();
        else if (sceneTransition.target === "longnanTown") placePartyInLongnanTown();
        else placePartyInSydney();
        sceneTransition.phase = "fadeIn";
        sceneTransition.elapsed = 0;

    } else if (sceneTransition.phase === "fadeIn" && sceneTransition.elapsed >= 1) {

        sceneTransition.active = false;
        sceneTransition.phase = "idle";
        sceneTransition.target = null;
        sceneTransition.elapsed = 0;

    }

}

function tryInteraction() {

    if (nearbyLongnanInteraction?.id === "railing") {

        showStoryCG({
            id: "longnanHometownView",
            dialogue: longnanHometownPages,
            dialoguePurpose: "longnanHometown",
            revealDelay: 0.35
        });

    } else if (nearbyLongnanMemoryAlbum) {

        gameState = GameState.LONGNAN_MEMORY_ALBUM;
        showStoryCG({
            id: "longnanMemoryAlbum",
            dialoguePurpose: "longnanMemoryAlbum",
            revealDelay: 1.35,
            onComplete: () => {
                storyFlags.longnanMemoryAlbumViewed = true;
                gameState = GameState.LONGNAN_TOWN;
            }
        });

    } else if (nearbyLongnanExit) {

        enterLongnanTown();

    } else if (nearbyLongnanInteraction) {

        activeInteraction = nearbyLongnanInteraction;
        openPiaoziDialogue(
            nearbyLongnanInteraction.pages,
            nearbyLongnanInteraction.id === "bridgePiaozi" ? "longnanPiaozi" : "longnanMemory"
        );

    } else if (nearbySceneExit === "sydneyLife" && !meetingState.dialogueOpen && !cameraIntro.active) {

        startSydneyLifeSequence();

    } else if (nearbySceneExit && !meetingState.dialogueOpen && !cameraIntro.active) {

        startSceneTransition(nearbySceneExit);

    } else if (nearbyStation && !meetingState.dialogueOpen && !cameraIntro.active) {

        openTokyoStationDialogue();

    } else if (nearbyInteractable && !meetingState.dialogueOpen && !cameraIntro.active) {

        openInteractionDialogue(nearbyInteractable);

    } else if (nearbyCatEvent && !meetingState.dialogueOpen && !cameraIntro.active) {

        openCatDialogue();

    } else if (piaoziState.nearby && !meetingState.dialogueOpen) {

        startPiaoziStoryCG();

    } else if (nearbyColesInspectable && !meetingState.dialogueOpen) {

        activeColesInspectable = nearbyColesInspectable;
        openPiaoziDialogue(nearbyColesInspectable.pages, "colesInspect");

    }

}

function updateLeCompanion(deltaTime) {

    if (!le.companion || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active || sceneTransition.active || storyCGOverlay.active) {

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

    if ((!nearbyInteractable && !nearbyCatEvent && !nearbyStation && !nearbySceneExit && !piaoziState.nearby && !nearbyColesInspectable && !nearbyLongnanInteraction && !nearbyLongnanExit && !nearbyLongnanMemoryAlbum) || meetingState.dialogueOpen) return;

    const mobilePrompt = mobileControls.classList.contains("isTouchMode");
    const promptText = nearbyLongnanExit
        ? (mobilePrompt ? "点击 A 前往童年小镇" : "按 E 前往童年小镇")
        : nearbyLongnanMemoryAlbum
        ? (mobilePrompt ? "点击 A 打开回忆" : "按 E 打开回忆")
        : nearbyLongnanInteraction?.id === "final"
        ? (mobilePrompt ? "点击 A 回想这些日子" : "按 E 回想这些日子")
        : nearbyLongnanInteraction
        ? (mobilePrompt ? `点击 A ${nearbyLongnanInteraction.label || "回忆"}` : `按 E ${nearbyLongnanInteraction.label || "回忆"}`)
        : piaoziState.nearby
        ? (mobilePrompt ? "好像发现了特别的水果…… 点击 A 查看" : "好像发现了特别的水果…… 按 E 查看")
        : nearbyColesInspectable
        ? (mobilePrompt ? "点击 A 查看" : "按 E 查看")
        : nearbySceneExit === "coles"
        ? (mobilePrompt ? "点击 A 前往 Coles" : "按 E 前往 Coles")
        : nearbySceneExit === "sydney"
        ? (mobilePrompt ? "点击 A 返回悉尼街区" : "按 E 返回悉尼街区")
        : nearbySceneExit === "sydneyLife"
        ? (mobilePrompt ? "点击 A 结束今天的采购" : "按 E 结束今天的采购")
        : nearbyStation
        ? (mobilePrompt ? "点击 A 进入东京站" : "按 E 进入东京站")
        : nearbyCatEvent
        ? (mobilePrompt ? "发现了什么…… 点击 A 互动" : "发现了什么…… 按 E 互动")
        : nearbyInteractable?.prompt
        ? (mobilePrompt ? `点击 A ${nearbyInteractable.prompt}` : `按 E 查看 ${nearbyInteractable.prompt}`)
        : (mobilePrompt ? "点击 A 互动" : "按 E / 点击互动");
    const promptWidth = nearbyLongnanExit ? 190 : nearbyLongnanMemoryAlbum ? 160 : nearbyLongnanInteraction ? 190 : piaoziState.nearby ? 240 : nearbySceneExit === "sydneyLife" ? 220 : nearbySceneExit ? 170 : nearbyStation ? 156 : nearbyCatEvent ? 164 : nearbyInteractable?.prompt ? 158 : 112;

    gameCtx.fillStyle = "rgba(10, 20, 38, 0.86)";
    gameCtx.fillRect(player.x - 44, player.y - 58, promptWidth, 28);
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "14px Fusion Pixel 12px Monospaced JP";
    gameCtx.fillText(promptText, player.x - 38, player.y - 39);

}

function updateCatCompanion(cat, index, deltaTime) {

    if (!cat.following || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active || sceneTransition.active || storyCGOverlay.active) {

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
    if (currentChapter === "sydney") {

        const scenicTarget = getCameraTarget(targetZoom);
        camera.x = scenicTarget.x;
        camera.y = scenicTarget.y;
        camera.zoom = targetZoom;
        return;

    }
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

    // Sydney is a lookout, not a close-follow exploration map. A wider frame
    // keeps the Opera House and Harbour Bridge present while the party walks.
    if (currentChapter === "sydney") {

        return Math.min(
            gameViewportState.width / SYDNEY_WORLD_WIDTH,
            gameViewportState.height / SYDNEY_WORLD_HEIGHT
        );

    }
    if (!gameViewportState.isMobile) return 1;

    return gameViewportState.portrait ? 0.76 : 0.92;

}

function getCameraTarget(zoom = getCameraFollowZoom()) {

    const visibleWidth = gameViewportState.width / zoom;
    const visibleHeight = gameViewportState.height / zoom;
    const portraitOffsetY = gameViewportState.isMobile && gameViewportState.portrait ? 110 : 0;
    const maxX = Math.max(0, getWorldWidth() - visibleWidth);
    const maxY = Math.max(0, getWorldHeight() - visibleHeight);

    if (currentChapter === "sydney") {

        return {
            x: Math.max(0, (getWorldWidth() - visibleWidth) / 2),
            y: 0
        };

    }

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
    const animationOffset = !player.moving
        ? 0
        : (pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight") ? 8 : 4);
    const row = directionRows[player.direction] + animationOffset;

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
    const row = directionRows[le.direction] + (le.moving ? 4 : 0);

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

    const catSpriteSheet = catSpriteSheets[cat.id];
    if (catSpriteSheet.complete && catSpriteSheet.naturalWidth) {

        const directionRows = { down: 0, up: 1, left: 2, right: 3 };
        const animationOffset = !cat.moving ? 0 : (cat.behaviour === "run" ? 8 : 4);
        const frame = cat.moving ? Math.floor(cat.animationTime / 0.16) % 4 : 0;
        const row = directionRows[cat.direction] + animationOffset;
        const bob = cat.behaviour === "run" ? Math.sin(cat.animationTime * 12) * 2 : 0;
        gameCtx.fillStyle = "rgba(26, 31, 39, 0.25)";
        gameCtx.fillRect(cat.x - 8, cat.y + cat.height - 3, 34, 5);
        gameCtx.drawImage(
            catSpriteSheet,
            frame * 32, row * 48, 32, 48,
            Math.round(cat.x - 16), Math.round(cat.y - 48 + bob), 56, 84
        );
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

    let sceneFrame = {
        x: 0,
        y: 0,
        width: gameViewportState.width,
        height: gameViewportState.height
    };

    if (sydneyMap.complete && sydneyMap.naturalWidth) {

        const sourceHeight = Math.min(665, sydneyMap.naturalHeight);
        const sourceWidth = sydneyMap.naturalWidth;

        if (gameViewportState.isMobile && gameViewportState.portrait) {

            // iPhone portrait: use a deliberate wide observatory frame instead
            // of cover-cropping the scene into a narrow, unreadable slice.
            const sourceX = Math.max(0, Math.round((sourceWidth - 1120) / 2));
            const portraitSourceWidth = Math.min(1120, sourceWidth - sourceX);
            const scale = gameViewportState.width / portraitSourceWidth;
            const drawWidth = gameViewportState.width;
            const drawHeight = Math.round(sourceHeight * scale);
            const drawY = Math.max(20, Math.round(gameViewportState.height * 0.055));
            sceneFrame = { x: 0, y: drawY, width: drawWidth, height: drawHeight };

            gameCtx.fillStyle = "#071225";
            gameCtx.fillRect(0, drawY - 8, gameViewportState.width, drawHeight + 16);
            gameCtx.drawImage(
                sydneyMap,
                sourceX, 0, portraitSourceWidth, sourceHeight,
                0, drawY, drawWidth, drawHeight
            );
            gameCtx.strokeStyle = "rgba(221, 174, 94, .82)";
            gameCtx.lineWidth = 2;
            gameCtx.strokeRect(1, drawY - 7, gameViewportState.width - 2, drawHeight + 14);

        } else {

            const scale = Math.min(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight);
            const drawWidth = sourceWidth * scale;
            const drawHeight = sourceHeight * scale;
            const drawX = (gameViewportState.width - drawWidth) / 2;
            const drawY = (gameViewportState.height - drawHeight) / 2;
            sceneFrame = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
            gameCtx.drawImage(sydneyMap, 0, 0, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);

            // Replace only the baked-in lookout title and version label. The
            // harbour artwork, character label and all other CG details stay
            // exactly as supplied.
            const titleScale = drawWidth / sourceWidth;
            const titleX = drawX + 14 * titleScale;
            const titleY = drawY + 10 * titleScale;
            const titleWidth = 218 * titleScale;
            const titleHeight = 55 * titleScale;
            gameCtx.fillStyle = "#061426";
            gameCtx.fillRect(titleX, titleY, titleWidth, titleHeight);
            gameCtx.strokeStyle = "#d7982b";
            gameCtx.lineWidth = Math.max(1, 2 * titleScale);
            gameCtx.strokeRect(titleX + 1, titleY + 1, titleWidth - 2, titleHeight - 2);
            gameCtx.fillStyle = "#fff0d6";
            gameCtx.font = `${Math.max(12, 21 * titleScale)}px Fusion Pixel, monospace`;
            gameCtx.fillText("悉尼跨年夜", titleX + 27 * titleScale, titleY + 35 * titleScale);

            // The nearby “人物” plaque remains untouched; only the version
            // text to its right is covered with the same night-sky tone.
            gameCtx.fillStyle = "#061426";
            gameCtx.fillRect(drawX + 1360 * titleScale, drawY + 12 * titleScale, 176 * titleScale, 56 * titleScale);

        }

    }

    fireworks.forEach(particle => {

        gameCtx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        gameCtx.fillStyle = particle.color;
        gameCtx.fillRect(
            Math.round(sceneFrame.x + particle.x * sceneFrame.width),
            Math.round(sceneFrame.y + particle.y * sceneFrame.height),
            gameViewportState.portrait ? 2 : 3,
            gameViewportState.portrait ? 2 : 3
        );

    });
    gameCtx.globalAlpha = 1;

}

function drawStoryCG() {

    gameCtx.fillStyle = "#02070d";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    const config = storyCGOverlay.config;
    const image = config?.image;
    if (config?.placeholder) {

        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.fillStyle = "#08172d";
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
        gameCtx.strokeStyle = "#d8aa54";
        gameCtx.lineWidth = 3;
        gameCtx.strokeRect(22, 22, gameViewportState.width - 44, gameViewportState.height - 44);
        gameCtx.fillStyle = "#f4cf7a";
        gameCtx.textAlign = "center";
        gameCtx.font = "28px Fusion Pixel, monospace";
        gameCtx.fillText("陇南 · 回忆", gameViewportState.width / 2, gameViewportState.height / 2);
        gameCtx.textAlign = "left";
        gameCtx.globalAlpha = 1;
        return;

    }
    if (!image?.complete || !image.naturalWidth) return;

    const sourceWidth = image.naturalWidth;
    const sourceHeight = Math.min(config.sourceHeight || image.naturalHeight, image.naturalHeight);
    const focalX = config.focalX ?? 0.5;
    const focalY = config.focalY ?? 0.5;

    if (gameViewportState.isMobile && gameViewportState.portrait && config.mobileDisplay !== "contain") {

        // Portrait uses a focal crop rather than vertical distortion. Each CG can
        // configure focalX/focalY so real people and landmarks stay visible.
        const targetAspect = gameViewportState.width / gameViewportState.height;
        const cropWidth = Math.min(sourceWidth, sourceHeight * targetAspect);
        const cropHeight = Math.min(sourceHeight, cropWidth / targetAspect);
        const sourceX = Math.max(0, Math.min(sourceWidth - cropWidth, sourceWidth * focalX - cropWidth / 2));
        const sourceY = Math.max(0, Math.min(sourceHeight - cropHeight, sourceHeight * focalY - cropHeight / 2));
        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.drawImage(image, sourceX, sourceY, cropWidth, cropHeight, 0, 0, gameViewportState.width, gameViewportState.height);

    } else {

        // Approved full-frame CGs use contain on iPhone too: no stretching and
        // no loss of the image's authored dialogue panel or composition.
        const scale = Math.min(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight);
        const drawWidth = Math.round(sourceWidth * scale);
        const drawHeight = Math.round(sourceHeight * scale);
        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.drawImage(
            image,
            0, 0, sourceWidth, sourceHeight,
            Math.round((gameViewportState.width - drawWidth) / 2),
            Math.max(0, Math.round((gameViewportState.height - drawHeight) / 2)),
            drawWidth, drawHeight
        );

    }

    gameCtx.globalAlpha = 1;

}

function drawColesShelf(x, y, width, label, colors) {

    gameCtx.fillStyle = "#6f4931";
    gameCtx.fillRect(x, y, width, 72);
    gameCtx.fillStyle = "#f1d493";
    gameCtx.fillRect(x + 4, y + 5, width - 8, 7);
    gameCtx.fillStyle = "#321e1a";
    gameCtx.fillRect(x + 5, y + 31, width - 10, 4);
    gameCtx.fillRect(x + 5, y + 56, width - 10, 4);
    for (let column = 0; column < width - 16; column += 17) {

        gameCtx.fillStyle = colors[(column / 17) % colors.length];
        gameCtx.fillRect(x + 9 + column, y + 15, 11, 13);
        gameCtx.fillStyle = colors[(column / 17 + 1) % colors.length];
        gameCtx.fillRect(x + 9 + column, y + 39, 11, 13);

    }
    gameCtx.fillStyle = "#fff0c7";
    gameCtx.font = "10px Fusion Pixel, monospace";
    gameCtx.fillText(label, x + 8, y - 5);

}

function drawColesMap() {

    if (colesInteriorMap.complete && colesInteriorMap.naturalWidth) {

        gameCtx.drawImage(colesInteriorMap, 0, 0, COLES_WORLD_WIDTH, COLES_WORLD_HEIGHT);
        drawColesSign("BAKERY", 550, 72, 92);
        drawColesSign("DAIRY", 720, 72, 84);
        drawColesSign("YOGURT", 818, 72, 100);
        drawColesSign("JUICE", 932, 72, 84);
        drawColesSign("MILK", 1030, 72, 90);
        drawColesSign("SNACKS", 1330, 72, 102);
        drawColesSign("VEGETABLES", 228, 480, 140);
        drawColesSign("FRESH FRUIT", 560, 484, 136);
        drawColesSign("CEREAL", 884, 258, 94);
        drawColesSign("PASTA", 1026, 258, 88);
        drawColesPunnet(1208, 206);
        // Gentle refrigerator shimmer and a tiny cart-handle bob make the room feel lived in.
        const refrigeratorGlow = 0.12 + (Math.sin(windTime * 3) + 1) * 0.035;
        gameCtx.fillStyle = `rgba(210, 237, 255, ${refrigeratorGlow})`;
        gameCtx.fillRect(702, 82, 474, 6);
        gameCtx.fillRect(74, 182, 7, 400);
        gameCtx.strokeStyle = "rgba(226, 87, 56, .72)";
        gameCtx.lineWidth = 2;
        gameCtx.beginPath();
        gameCtx.moveTo(68, 706 + Math.sin(windTime * 2) * 1.5);
        gameCtx.lineTo(194, 706 + Math.sin(windTime * 2) * 1.5);
        gameCtx.stroke();
        return;

    }

    // Warm tiled floor with hand-drawn grout and small scuffs.
    gameCtx.fillStyle = "#d9d0bc";
    gameCtx.fillRect(0, 0, COLES_WORLD_WIDTH, COLES_WORLD_HEIGHT);
    for (let y = 78; y < COLES_WORLD_HEIGHT; y += 32) {
        for (let x = 74; x < COLES_WORLD_WIDTH - 74; x += 32) {

            gameCtx.fillStyle = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? "#d3c8b2" : "#e1d8c6";
            gameCtx.fillRect(x, y, 30, 30);
            if ((x * 7 + y * 3) % 160 === 0) {

                gameCtx.fillStyle = "rgba(118, 103, 84, .25)";
                gameCtx.fillRect(x + 9, y + 12, 4, 1);

            }
        }
    }

    // Perimeter, entrance and a generic red grocery identity (not a copied logo).
    gameCtx.fillStyle = "#314052";
    gameCtx.fillRect(0, 0, COLES_WORLD_WIDTH, 78);
    gameCtx.fillStyle = "#a92f2a";
    gameCtx.fillRect(298, 15, 812, 46);
    gameCtx.fillStyle = "#fff3d4";
    gameCtx.font = "24px Fusion Pixel, monospace";
    gameCtx.fillText("COLES  ·  FRESH MARKET", 476, 47);
    gameCtx.fillStyle = "#6d5a49";
    gameCtx.fillRect(0, 946, 582, 78);
    gameCtx.fillRect(828, 946, COLES_WORLD_WIDTH - 828, 78);
    gameCtx.fillStyle = "#bde5ed";
    gameCtx.fillRect(596, 952, 216, 64);
    gameCtx.fillStyle = "#f6e8bf";
    gameCtx.fillRect(604, 958, 200, 6);

    // Ceiling lamps.
    for (let x = 140; x < COLES_WORLD_WIDTH - 100; x += 210) {

        gameCtx.fillStyle = "rgba(255, 214, 126, .22)";
        gameCtx.fillRect(x - 48, 84, 96, 230);
        gameCtx.fillStyle = "#f7d27c";
        gameCtx.fillRect(x - 19, 88, 38, 7);
        gameCtx.fillStyle = "#756253";
        gameCtx.fillRect(x - 2, 78, 4, 10);

    }

    // Produce displays, carts, dairy wall, aisles, checkout and endcaps.
    [130, 346, 562].forEach((x, index) => {
        gameCtx.fillStyle = "#7d5934";
        gameCtx.fillRect(x, 176, 172, 130);
        gameCtx.fillStyle = "#e6c47d";
        gameCtx.fillRect(x + 7, 184, 158, 16);
        for (let row = 0; row < 3; row++) for (let column = 0; column < 6; column++) {
            gameCtx.fillStyle = ["#dd5540", "#f0b83e", "#6da849", "#a7607c"][(row + column + index) % 4];
            gameCtx.fillRect(x + 12 + column * 24, 210 + row * 27, 16, 16);
        }
        gameCtx.fillStyle = "#fff0c7";
        gameCtx.font = "11px Fusion Pixel, monospace";
        gameCtx.fillText(["水果", "蔬菜", "今日精选"][index], x + 52, 197);
    });
    // A deliberately quiet, strawberry-shaped white-berry punnet. It sits on a
    // lower side shelf, visible only to a player who looks beyond the first displays.
    gameCtx.fillStyle = "#8ca9b3";
    gameCtx.fillRect(738, 260, 62, 44);
    gameCtx.fillStyle = "rgba(239, 249, 246, .9)";
    gameCtx.fillRect(742, 265, 54, 31);
    for (let index = 0; index < 6; index++) {
        const berryX = 748 + (index % 3) * 15;
        const berryY = 272 + Math.floor(index / 3) * 12;
        gameCtx.fillStyle = "#75a25d";
        gameCtx.fillRect(berryX + 4, berryY - 3, 5, 3);
        gameCtx.fillStyle = index % 2 ? "#fff8e7" : "#f5e6e4";
        gameCtx.fillRect(berryX + 2, berryY, 9, 8);
        gameCtx.fillStyle = "#e7bfc4";
        gameCtx.fillRect(berryX + 4, berryY + 5, 2, 2);
    }
    gameCtx.fillStyle = "#fff0c7";
    gameCtx.font = "9px Fusion Pixel, monospace";
    gameCtx.fillText("小浆果", 744, 316);
    gameCtx.fillStyle = "#8bb4c4";
    gameCtx.fillRect(930, 144, 310, 118);
    for (let x = 942; x < 1225; x += 35) {
        gameCtx.fillStyle = "#e8f4f0";
        gameCtx.fillRect(x, 158, 24, 86);
        gameCtx.fillStyle = x % 2 ? "#75a6dc" : "#f5e8a8";
        gameCtx.fillRect(x + 5, 178, 14, 34);
    }
    gameCtx.fillStyle = "#fff0c7";
    gameCtx.font = "12px Fusion Pixel, monospace";
    gameCtx.fillText("乳品 · 冷藏", 1020, 137);
    drawColesShelf(130, 392, 570, "零食 / 饮料", ["#d45346", "#e6ba42", "#5d93b7", "#79a854"]);
    drawColesShelf(130, 572, 570, "面包 / 谷物", ["#d69a50", "#f0d071", "#b8734b", "#dfb35c"]);
    drawColesShelf(792, 390, 474, "食品杂货", ["#d45346", "#6d9c65", "#e3b243", "#6891b2"]);
    drawColesShelf(792, 570, 474, "厨房精选", ["#d9a151", "#9c744b", "#d44b4b", "#6b98a3"]);
    [114, 318].forEach((x, index) => {
        gameCtx.fillStyle = "#a62f2d";
        gameCtx.fillRect(x, 748, 150, 96);
        gameCtx.fillStyle = "#f6d36f";
        gameCtx.fillRect(x + 10, 758, 130, 12);
        gameCtx.fillStyle = "#fff4d4";
        gameCtx.font = "10px Fusion Pixel, monospace";
        gameCtx.fillText(index ? "促销" : "本周优惠", x + 39, 782);
        gameCtx.fillStyle = "#e8bd4d";
        gameCtx.fillRect(x + 30, 798, 22, 28);
        gameCtx.fillStyle = "#76a85b";
        gameCtx.fillRect(x + 80, 798, 22, 28);
    });
    gameCtx.fillStyle = "#574540";
    gameCtx.fillRect(1140, 728, 130, 130);
    gameCtx.fillStyle = "#dfd3bb";
    gameCtx.fillRect(1150, 740, 110, 64);
    gameCtx.fillStyle = "#5d7685";
    gameCtx.fillRect(1160, 752, 40, 28);
    gameCtx.fillStyle = "#f5d68a";
    gameCtx.font = "11px Fusion Pixel, monospace";
    gameCtx.fillText("结账", 1182, 832);
    for (let x = 860; x < 1085; x += 54) {
        gameCtx.strokeStyle = "#738897";
        gameCtx.lineWidth = 4;
        gameCtx.strokeRect(x, 805, 34, 22);
        gameCtx.fillStyle = "#4a6675";
        gameCtx.fillRect(x + 6, 800, 24, 5);
    }
    gameCtx.fillStyle = "#33404e";
    gameCtx.fillRect(0, 0, 74, COLES_WORLD_HEIGHT);
    gameCtx.fillRect(COLES_WORLD_WIDTH - 74, 0, 74, COLES_WORLD_HEIGHT);
    gameCtx.fillStyle = "#f1c95d";
    gameCtx.fillRect(34, 180, 5, 350);
    gameCtx.fillRect(COLES_WORLD_WIDTH - 39, 180, 5, 350);

}

function drawColesSign(label, x, y, width) {

    gameCtx.fillStyle = "rgba(29, 27, 26, .88)";
    gameCtx.fillRect(x, y, width, 24);
    gameCtx.strokeStyle = "#d5ad59";
    gameCtx.lineWidth = 1;
    gameCtx.strokeRect(x + 1, y + 1, width - 2, 22);
    gameCtx.fillStyle = "#f5df9e";
    gameCtx.font = "12px Fusion Pixel, monospace";
    gameCtx.fillText(label, x + 8, y + 16);

}

function drawColesPunnet(x, y) {

    gameCtx.fillStyle = "rgba(132, 164, 170, .94)";
    gameCtx.fillRect(x, y, 46, 32);
    gameCtx.fillStyle = "rgba(242, 247, 235, .88)";
    gameCtx.fillRect(x + 3, y + 3, 40, 24);
    for (let index = 0; index < 6; index++) {

        const berryX = x + 7 + (index % 3) * 12;
        const berryY = y + 8 + Math.floor(index / 3) * 10;
        gameCtx.fillStyle = "#6e9f58";
        gameCtx.fillRect(berryX + 3, berryY - 3, 4, 3);
        gameCtx.fillStyle = index % 2 ? "#fff8e8" : "#f4e4e4";
        gameCtx.fillRect(berryX + 1, berryY, 8, 8);
        gameCtx.fillStyle = "#dfaeb6";
        gameCtx.fillRect(berryX + 3, berryY + 5, 2, 1);

    }

}

function drawLongnanBridgePiaozi() {

    const x = 732;
    const y = 620;
    const unlocked = memoryAlbum.longnanBridgePiaozi.unlocked;
    gameCtx.fillStyle = unlocked ? "rgba(244, 207, 122, .34)" : "rgba(255, 248, 224, .62)";
    gameCtx.fillRect(x - 9, y - 9, 27, 25);
    gameCtx.fillStyle = "#5f964d";
    gameCtx.fillRect(x + 4, y - 3, 7, 5);
    gameCtx.fillStyle = "#fff3df";
    gameCtx.fillRect(x, y + 2, 10, 10);
    gameCtx.fillStyle = "#efa6af";
    gameCtx.fillRect(x + 3, y + 6, 2, 2);
    gameCtx.fillRect(x + 7, y + 4, 1, 2);

}

function drawSceneTransitionOverlay() {

    if (!sceneTransition.active) return;
    const progress = Math.min(sceneTransition.elapsed / 1, 1);
    const alpha = sceneTransition.phase === "fadeOut" ? progress : 1 - progress;
    gameCtx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

}

function drawLongnanTitle() {

    gameCtx.fillStyle = "#07152a";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
    gameCtx.fillStyle = "#18394a";
    for (let x = -80; x < gameViewportState.width + 80; x += 120) {

        gameCtx.beginPath();
        gameCtx.moveTo(x, gameViewportState.height * 0.76);
        gameCtx.lineTo(x + 95, gameViewportState.height * 0.38);
        gameCtx.lineTo(x + 205, gameViewportState.height * 0.76);
        gameCtx.fill();

    }
    gameCtx.textAlign = "center";
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "24px Fusion Pixel, monospace";
    gameCtx.fillText("Chapter 2", gameViewportState.width / 2, gameViewportState.height * 0.32);
    gameCtx.font = "34px Fusion Pixel, monospace";
    gameCtx.fillText("悉尼", gameViewportState.width / 2, gameViewportState.height * 0.41);
    gameCtx.font = "20px Fusion Pixel, monospace";
    gameCtx.fillText("Completed", gameViewportState.width / 2, gameViewportState.height * 0.48);
    if (longnanTitleTimer > 2) {

        gameCtx.font = "24px Fusion Pixel, monospace";
        gameCtx.fillText("Chapter 3", gameViewportState.width / 2, gameViewportState.height * 0.61);
        gameCtx.font = "34px Fusion Pixel, monospace";
        gameCtx.fillText("甘肃 · 陇南", gameViewportState.width / 2, gameViewportState.height * 0.70);
        gameCtx.font = "16px Fusion Pixel, monospace";
        gameCtx.fillText("回到乐乐长大的地方", gameViewportState.width / 2, gameViewportState.height * 0.76);

    }
    gameCtx.textAlign = "left";

}

function drawLongnanOpening() {

    const image = longnanLookoutPixelMap;
    if (image.complete && image.naturalWidth) {

        gameCtx.fillStyle = "#061325";
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
        const scale = Math.min(gameViewportState.width / image.naturalWidth, gameViewportState.height / image.naturalHeight);
        const width = Math.round(image.naturalWidth * scale);
        const height = Math.round(image.naturalHeight * scale);
        gameCtx.imageSmoothingEnabled = false;
        gameCtx.drawImage(image, Math.round((gameViewportState.width - width) / 2), Math.round((gameViewportState.height - height) / 2), width, height);
        return;

    }

    gameCtx.fillStyle = "#9bc8d1";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
    gameCtx.fillStyle = "#6a9b70";
    gameCtx.fillRect(0, gameViewportState.height * 0.54, gameViewportState.width, gameViewportState.height * 0.46);
    gameCtx.fillStyle = "rgba(239, 247, 235, 0.64)";
    gameCtx.fillRect(0, gameViewportState.height * 0.48, gameViewportState.width, 26);
    gameCtx.fillStyle = "#d9ba82";
    gameCtx.fillRect(gameViewportState.width * 0.34, gameViewportState.height * 0.58, gameViewportState.width * 0.32, gameViewportState.height * 0.42);
    gameCtx.fillStyle = "#876044";
    for (let x = 30; x < gameViewportState.width; x += 110) gameCtx.fillRect(x, gameViewportState.height * 0.54, 72, 34);
    gameCtx.fillStyle = "#f7f4d5";
    for (let i = 0; i < 20; i++) gameCtx.fillRect(24 + (i * 97) % gameViewportState.width, gameViewportState.height * 0.5 + (i % 3) * 27, 5, 5);

}

function drawLongnanComplete() {

    gameCtx.fillStyle = "#07152a";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
    gameCtx.textAlign = "center";
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "26px Fusion Pixel, monospace";
    gameCtx.fillText("Chapter 3", gameViewportState.width / 2, gameViewportState.height * 0.40);
    gameCtx.font = "34px Fusion Pixel, monospace";
    gameCtx.fillText("Longnan", gameViewportState.width / 2, gameViewportState.height * 0.49);
    gameCtx.font = "24px Fusion Pixel, monospace";
    gameCtx.fillText("Completed", gameViewportState.width / 2, gameViewportState.height * 0.57);
    gameCtx.textAlign = "left";

}

function drawWeddingIntro() {

    gameCtx.fillStyle = "#dcebd5";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
    gameCtx.fillStyle = "#f9f6eb";
    gameCtx.fillRect(gameViewportState.width * 0.20, gameViewportState.height * 0.18, gameViewportState.width * 0.60, gameViewportState.height * 0.58);
    gameCtx.fillStyle = "#b5d09c";
    gameCtx.fillRect(0, gameViewportState.height * 0.72, gameViewportState.width, gameViewportState.height * 0.28);
    gameCtx.fillStyle = "#e9d39a";
    for (let x = 0; x < gameViewportState.width; x += 48) gameCtx.fillRect(x, gameViewportState.height * 0.70, 26, 5);

    if (!storyFlags.weddingIntroShown) {

        gameCtx.textAlign = "center";
        gameCtx.fillStyle = "rgba(7, 21, 42, .9)";
        gameCtx.font = "24px Fusion Pixel, monospace";
        gameCtx.fillText("Final Chapter", gameViewportState.width / 2, gameViewportState.height * 0.40);
        gameCtx.font = "34px Fusion Pixel, monospace";
        gameCtx.fillText("Wedding", gameViewportState.width / 2, gameViewportState.height * 0.48);
        gameCtx.font = "21px Fusion Pixel, monospace";
        gameCtx.fillText("北京 · 晓园", gameViewportState.width / 2, gameViewportState.height * 0.55);
        gameCtx.textAlign = "left";

    }

}

function drawGame() {

    if (gameState === GameState.SYDNEY_LOOKOUT) {

        drawSydneyLookout();
        drawChapterTransitionOverlay();
        return;

    }

    if (storyCGOverlay.active) {

        drawStoryCG();
        drawSceneTransitionOverlay();
        return;

    }

    if (gameState === GameState.LONGNAN_TITLE) {

        drawLongnanTitle();
        return;

    }

    if (gameState === GameState.LONGNAN_INTRO) {

        drawLongnanOpening();
        return;

    }

    if (gameState === GameState.LONGNAN_COMPLETE) {

        drawLongnanComplete();
        return;

    }

    if (gameState === GameState.WEDDING_INTRO) {

        drawWeddingIntro();
        return;

    }

    gameCtx.fillStyle = "#91ad6d";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    gameCtx.save();
    gameCtx.scale(camera.zoom, camera.zoom);
    gameCtx.translate(-Math.round(camera.x), -Math.round(camera.y));

    if (currentChapter === "coles") {

        drawColesMap();

    } else if (currentChapter === "longnanLookout" && longnanLookoutPixelMap.complete && longnanLookoutPixelMap.naturalWidth) {

        gameCtx.drawImage(longnanLookoutPixelMap, 0, 0, LONGNAN_LOOKOUT_WIDTH, LONGNAN_LOOKOUT_HEIGHT);

    } else if (currentChapter === "longnanTown" && longnanChildhoodTownPixelMap.complete && longnanChildhoodTownPixelMap.naturalWidth) {

        gameCtx.drawImage(longnanChildhoodTownPixelMap, 0, 0, LONGNAN_TOWN_WIDTH, LONGNAN_TOWN_HEIGHT);

    } else if (currentChapter === "sydney" && sydneyExplorationMap.complete && sydneyExplorationMap.naturalWidth) {

        gameCtx.drawImage(sydneyExplorationMap, 0, 0, getWorldWidth(), getWorldHeight());

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
    if (currentChapter === "longnanTown") drawLongnanBridgePiaozi();
    drawWorldAtmosphere();

    [
        { y: player.y + player.height, draw: drawPlayer },
        { y: le.y + le.height, draw: drawLe },
        ...cats.filter(cat => hiddenCatEvent.discovered || !cat.following).map(cat => ({ y: cat.y + cat.height, draw: () => drawCat(cat) }))
    ].sort((first, second) => first.y - second.y).forEach(character => character.draw());

    drawInteractionPrompt();

    gameCtx.restore();

    drawChapterTransitionOverlay();
    drawSceneTransitionOverlay();

}

function updatePlayer(deltaTime) {

    if (cameraIntro.active || meetingState.dialogueOpen || characterPanelOpen || gameplayPauseRemaining || chapterTransition.active || sceneTransition.active || storyCGOverlay.active || ![GameState.TOKYO, GameState.SYDNEY, GameState.COLES, GameState.LONGNAN_LOOKOUT, GameState.LONGNAN_TOWN].includes(gameState)) {

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

    // Direction comes from the movement vector every frame, so keyboard and
    // touch movement always choose the matching front, back or side sprite.
    faceMovementDirection(player, horizontal, vertical);

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
        ? destinationX >= sydneyLookoutWalkableZone.x
            && destinationX + player.width <= sydneyLookoutWalkableZone.x + sydneyLookoutWalkableZone.width
            && destinationY >= sydneyLookoutWalkableZone.y
            && destinationY + player.height <= sydneyLookoutWalkableZone.y + sydneyLookoutWalkableZone.height
        : (exteriorMap.complete && exteriorMap.naturalWidth
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
    updateSceneTransition(deltaTime);
    updateStoryCG(deltaTime);
    if (gameState === GameState.LONGNAN_TITLE) {

        longnanTitleTimer += deltaTime;
        if (longnanTitleTimer >= 4.5) startLongnanOpening();

    }
    if (gameState === GameState.LONGNAN_COMPLETE) {

        longnanSequenceTimer += deltaTime;
        if (longnanSequenceTimer >= 2) {

            gameState = GameState.WEDDING_INTRO;
            longnanSequenceTimer = 0;
            chapterLocation.classList.add("hidden");

        }

    }
    if (gameState === GameState.WEDDING_INTRO && !storyFlags.weddingIntroShown) {

        longnanSequenceTimer += deltaTime;
        if (longnanSequenceTimer >= 1.8) {

            storyFlags.weddingIntroShown = true;
            openPiaoziDialogue([
                { speaker: "森", text: "终于，\n走到了这里。" },
                { speaker: "乐乐", text: "谢谢大家，\n陪我们走过这段旅程。" }
            ], "weddingIntro");

        }

    }
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
        updateNearbySceneExit();
        updateNearbyPiaozi();
        updateNearbyColesInspectable();
        updateNearbyLongnan();

    }
    updateCatCompanions(deltaTime);
    updateDialogueTypewriter(deltaTime);
    updateWorldAtmosphere(deltaTime);
    updateSydneyFireworks(deltaTime);
    mobileControls.classList.toggle("isDialogueOpen", meetingState.dialogueOpen || storyCGOverlay.active || [GameState.LONGNAN_TITLE, GameState.LONGNAN_COMPLETE, GameState.WEDDING_INTRO].includes(gameState));

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
    playOpeningPrologue();

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

    if (nearbyInteractable || nearbyCatEvent || nearbyStation || nearbySceneExit || piaoziState.nearby || nearbyColesInspectable || nearbyLongnanInteraction || nearbyLongnanExit || nearbyLongnanMemoryAlbum) tryInteraction();

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

    if ((event.code === "KeyE" || event.code === "Enter" || event.code === "Space") && (nearbyInteractable || nearbyCatEvent || nearbyStation || nearbySceneExit || piaoziState.nearby || nearbyColesInspectable || nearbyLongnanInteraction || nearbyLongnanExit || nearbyLongnanMemoryAlbum)) {

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
