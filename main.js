/* ======================================
   AdventureWedding
   Version 0.9.4 — Gameplay Polish
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
const chapterCard = document.getElementById("chapterCard");
const chapterCardLabel = document.querySelector(".chapterCardLabel");
const chapterCardTitleZh = document.querySelector(".chapterCardTitleZh");
const chapterCardTitleEn = document.querySelector(".chapterCardTitleEn");
const chapterCardTheme = document.querySelector(".chapterCardTheme");
const chapterCardMessage = document.querySelector(".chapterCardMessage");

let gameStarted = false;
let characterPanelOpen = false;
const chapterCardState = {
    active: false, mode: "", chapterId: "", elapsed: 0, phase: "idle",
    onComplete: null, inputUnlocked: false, finalCard: false, previousGameState: null
};
let transitionInputLockUntil = 0;

// The single canonical location for every playable-character visual.
const CHARACTERS = window.CHARACTERS;
if (!CHARACTERS) throw new Error("Missing canonical data/characters.js manifest.");

const CHAPTERS = window.CHAPTERS;
if (!CHAPTERS) throw new Error("Missing centralized data/chapters.js configuration.");

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

function lockForChapterCard() {

    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    if (characterPanelOpen) setCharacterPanelOpen(false);
    mobileControls.classList.add("hidden");
    characterMenuButton.classList.add("hidden");
    chapterLocation.classList.add("hidden");

}

function showChapterCard({ mode, chapter, onComplete = null }) {

    if (chapterCardState.active || !chapter) return false;

    lockForChapterCard();
    const isEnding = mode === "ending";
    const isFinal = mode === "finalEnding";
    chapterCardState.active = true;
    chapterCardState.mode = mode;
    chapterCardState.chapterId = chapter.id;
    chapterCardState.elapsed = 0;
    chapterCardState.phase = "fadeIn";
    chapterCardState.onComplete = onComplete;
    chapterCardState.inputUnlocked = false;
    chapterCardState.finalCard = isFinal;
    chapterCardState.previousGameState = gameState;

    if (mode === "prologue") gameState = GameState.PROLOGUE;
    else if (isEnding) gameState = GameState.CHAPTER_ENDING;
    else if (isFinal) gameState = GameState.FINAL_ENDING;
    else gameState = GameState.CHAPTER_INTRO;

    chapterCardLabel.textContent = isFinal ? "AdventureWedding" : (isEnding ? chapter.endingLabel : chapter.introLabel);
    chapterCardTitleZh.textContent = isFinal ? "The End" : (isEnding ? `${chapter.titleZh} · ${chapter.theme}` : chapter.titleZh);
    chapterCardTitleEn.textContent = isFinal ? "2026.09.09" : (isEnding ? "" : chapter.titleEn);
    chapterCardTheme.textContent = isFinal ? "森 ❤ 乐" : (isEnding ? "" : chapter.theme);
    chapterCardMessage.textContent = isFinal ? "谢谢你，\n陪我们走过这段旅程。\n\nPRESS START AGAIN" : (isEnding ? chapter.endingMessage : chapter.introMessage);
    chapterCard.dataset.mode = mode;
    chapterCard.style.opacity = "0";
    chapterCard.classList.remove("hidden");
    transitionInputLockUntil = performance.now() + 350;
    return true;

}

function showPrologue(onComplete) {

    return showChapterCard({ mode: "prologue", chapter: CHAPTERS.prologue, onComplete });

}

function showChapterIntro(chapterId, onComplete) {

    const chapter = typeof chapterId === "string" ? CHAPTERS[chapterId] : chapterId;
    return showChapterCard({ mode: "intro", chapter, onComplete });

}

function showChapterEnding(chapterId, onComplete) {

    const chapter = typeof chapterId === "string" ? CHAPTERS[chapterId] : chapterId;
    return showChapterCard({ mode: "ending", chapter, onComplete });

}

function showFinalEnding() {

    return showChapterCard({ mode: "finalEnding", chapter: CHAPTERS.wedding });

}

function requestChapterCardSkip() {

    if (!chapterCardState.active || !chapterCardState.inputUnlocked || chapterCardState.finalCard) return;
    if (performance.now() < transitionInputLockUntil) return;
    chapterCardState.phase = "fadeOut";
    chapterCardState.elapsed = 0;

}

function updateChapterCard(deltaTime) {

    if (!chapterCardState.active) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeDuration = reduceMotion ? 0.18 : 0.55;
    const holdDuration = reduceMotion ? 1.1 : 2.8;
    chapterCardState.elapsed += deltaTime;

    if (chapterCardState.phase === "fadeIn") {

        chapterCard.style.opacity = String(Math.min(1, chapterCardState.elapsed / fadeDuration));
        if (chapterCardState.elapsed >= fadeDuration) {

            chapterCardState.phase = "hold";
            chapterCardState.elapsed = 0;
            chapterCardState.inputUnlocked = true;

        }
        return;

    }

    if (chapterCardState.phase === "hold") {

        if (chapterCardState.finalCard) return;
        if (chapterCardState.elapsed >= holdDuration) {

            chapterCardState.phase = "fadeOut";
            chapterCardState.elapsed = 0;

        }
        return;

    }

    if (chapterCardState.phase === "fadeOut") {

        chapterCard.style.opacity = String(Math.max(0, 1 - chapterCardState.elapsed / fadeDuration));
        if (chapterCardState.elapsed < fadeDuration) return;

        const onComplete = chapterCardState.onComplete;
        chapterCard.classList.add("hidden");
        chapterCardState.active = false;
        chapterCardState.phase = "idle";
        chapterCardState.onComplete = null;
        transitionInputLockUntil = performance.now() + 350;
        if (onComplete) onComplete();

    }

}

window.testChapterCard = (chapterId, mode = "intro") => {

    if (mode === "prologue") return showPrologue();
    if (mode === "finalEnding") return showFinalEnding();
    return mode === "ending" ? showChapterEnding(chapterId) : showChapterIntro(chapterId);

};

function completeWeddingChapter() {

    if (chapterCardState.active || gameState !== GameState.WEDDING_XIAOYUAN) return false;
    return showChapterEnding("wedding", () => {

        storyFlags.weddingChapterComplete = true;
        storyFlags.gameComplete = true;
        showFinalEnding();

    });

}

window.completeWeddingChapter = completeWeddingChapter;

function restoreGameplayUI() {

    openingPrologue.classList.add("hidden");
    gameViewport.classList.remove("hidden");
    chapterLocation.classList.remove("hidden");
    characterMenuButton.classList.remove("hidden");
    mobileControls.classList.remove("hidden");
}

function beginTokyoGameplay() {

    restoreGameplayUI();
    currentChapter = "tokyo";
    gameState = GameState.TOKYO;
    storyFlags.tokyoChapterStarted = true;
    spawnPlayer();
    startCameraIntro();

}

function beginGameplay() {

    // Kept as the one-shot game-loop launcher. Scene callbacks only load
    // content; they never create another requestAnimationFrame chain.
    previousGameTime = performance.now();
    requestAnimationFrame(gameLoop);

}

function playOpeningPrologue() {

    // Compatibility entry point for older callers; Build 0.9.1 uses the
    // reusable chapter-card system rather than the retired timed prologue.
    showPrologue(() => {

        storyFlags.prologueViewed = true;
        showChapterIntro("tokyo", beginTokyoGameplay);

    });

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
    direction8: "down",
    renderDirection: "down",
    velocityX: 0,
    velocityY: 0,
    moving: false
};

const playerSprite = new Image();
playerSprite.src = CHARACTERS.mori.sprite;

const playerFallbackSprite = new Image();
playerFallbackSprite.src = CHARACTERS.mori.sprite;

const le = {
    // Sakura Avenue is the opening meeting place on the portrait Tokyo map.
    x: 1680,
    y: 1580,
    width: 24,
    height: 24,
    direction: "down",
    moving: false,
    animationTime: 0,
    visible: true,
    companion: false,
    idleOffsetX: 0,
    idleOffsetY: 0,
    idleOffsetTimer: 0
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
    // Tokyo Station, shrine hall, the shopping-street facades and river.
    // Coordinates are world pixels (the 1024 × 1536 portrait artwork is
    // rendered at STORY_MAP_SCALE), leaving its plazas, sidewalks, bridge and
    // Sakura Avenue clear for the existing story interactions.
    { x: 480, y: 0, width: 1060, height: 470 },
    { x: 1610, y: 0, width: 438, height: 610 },
    { x: 0, y: 1210, width: 1460, height: 530 },
    { x: 0, y: 2460, width: 1010, height: 612 },
    { x: 1245, y: 2460, width: 803, height: 612 }
];

const walkableZones = [
    { x: 380, y: 470, width: 1160, height: 650 },
    { x: 1500, y: 600, width: 420, height: 1560 },
    { x: 0, y: 1740, width: 1500, height: 620 },
    { x: 1000, y: 2360, width: 250, height: 700 }
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
        x: 1510, y: 1120, width: 90, height: 70,
        pages: [
            { speaker: "乐乐", text: "东京有很多这样的公园。\n以前我喜欢一个人坐在这里。" },
            { speaker: "森", text: "以后。\n就不是一个人了。" }
        ],
        completed: false
    },
    {
        id: "vending",
        x: 1180, y: 1750, width: 80, height: 80,
        pages: [
            { speaker: "乐乐", text: "日本的自动售货机，\n什么都有。" },
            { speaker: "森", text: "真的吗？" },
            { speaker: "乐乐", text: "以后慢慢带你发现。" }
        ],
        completed: false
    },
    {
        id: "shrine",
        x: 1700, y: 890, width: 140, height: 110,
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
        x: 580, y: 1740, width: 150, height: 82,
        prompt: "一点张",
        pages: [
            { speaker: "森", text: "这家拉面店看起来很特别，生意很不错啊！" },
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
    x: 1510,
    y: 1160,
    width: 380,
    height: 980,
    active: false,
    discovered: false
};

const hiddenCatEvent = {
    x: 1290,
    y: 880,
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
        id: "tuotuo", name: "坨坨", x: 1305, y: 902, width: 22, height: 18,
        collar: "#d9524f", marking: "#d9d7ce", direction: "down",
        following: false, moving: false, animationTime: 0, behaviour: "idle", behaviourTime: 0,
        idleTimer: 3 + Math.random() * 5, idleOffsetX: -2, idleOffsetY: 1, idleOffsetTimer: 0
    },
    {
        id: "dazhi", name: "大痣", x: 1337, y: 909, width: 22, height: 18,
        collar: "#8855a6", marking: "#77757a", direction: "down",
        following: false, moving: false, animationTime: 0, behaviour: "idle", behaviourTime: 0,
        idleTimer: 3 + Math.random() * 5, idleOffsetX: 2, idleOffsetY: -1, idleOffsetTimer: 0
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
    prologueViewed: false,
    tokyoChapterStarted: false,
    tokyoChapterComplete: false,
    sydneyChapterStarted: false,
    gansuPiaozi: false,
    sydneyCooking: false,
    sydneySeaside: false,
    tasmaniaAdventure: false,
    blueWorksMemory: false,
    sydneyChapterComplete: false,
    longnanChapterStarted: false,
    longnanMemoryAlbumViewed: false,
    longnanChapterComplete: false,
    weddingChapterStarted: false,
    weddingMapEntered: false,
    weddingIntroShown: false,
    weddingSignInViewed: false,
    weddingPhotoAreaViewed: false,
    weddingCeremonyAreaViewed: false,
    weddingArchUnlocked: false,
    weddingArchSequenceStarted: false,
    weddingInvitationViewed: false,
    weddingChapterComplete: false,
    gameComplete: false
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
    ] },
    { id: "blueWorksMemory", cg: "blueWorksMemory", flag: "blueWorksMemory", hold: 0.9, pages: [
        { speaker: "乐乐", text: "相熟十载宝藏老店，\n挚友蓝工品质保证。" }
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
let activeChapterIntro = null;
let activeChapterComplete = null;
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
    x: 1510,
    y: 1160,
    width: 380,
    height: 980
};

const exteriorMap = new Image();
exteriorMap.src = "assets/tokyo-story-map.png?v=0.9.2-portrait";

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

const weddingXiaoyuanMap = new Image();
weddingXiaoyuanMap.src = "assets/maps/wedding/xiaoyuan-wedding-map.png?v=0.9.0-map2";
weddingXiaoyuanMap.addEventListener("load", () => {

    if (currentChapter === "weddingXiaoyuan") storyFlags.weddingMapEntered = true;

});

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
        sourceHeight: 602,
        // On an iPhone, keep the story image centred above the live dialogue
        // instead of letting a full-screen crop sit behind it.
        mobileDisplay: "dialogueSafe"
    },
    sydneyCooking: {
        src: "assets/cg/sydney/cg-cooking-together.png",
        location: "Crows Nest",
        focalX: 0.55,
        focalY: 0.42,
        sourceHeight: 941,
        // This approved image includes its own authored JRPG dialogue panel.
        // On iPhone keep the complete composition rather than cropping it.
        mobileDisplay: "contain"
    },
    sydneyWatchingTheSea: {
        src: "assets/cg/sydney/cg-seaside-jump.png",
        location: "Cronulla",
        focalX: 0.51,
        focalY: 0.45,
        sourceHeight: 1024,
        mobileDisplay: "contain"
    },
    tasmaniaAdventure: {
        src: "assets/cg/sydney/cg-tasmania-trip.png",
        location: "比舍诺",
        focalX: 0.53,
        focalY: 0.47,
        mobileDisplay: "contain"
    },
    blueWorksMemory: {
        src: "assets/cg/sydney/cg-blueworks.png",
        location: "Blue Works Vintage Store",
        focalX: 0.5,
        focalY: 0.48,
        mobileDisplay: "contain",
        fallbackPlaceholder: true,
        placeholderTitle: "Blue Works Vintage Store",
        placeholderSubtitle: "Sydney Memory",
        pendingAsset: true
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
    longnanAlbumWildFruit: {
        src: "assets/cg/memory-album/tokyo-wild-fruit.png?v=0.8.7",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        autoCloseAfter: 2.5,
        memoryAlbum: true
    },
    longnanAlbumPiaozi: {
        src: "assets/cg/memory-album/longnan-piaozi.png?v=0.8.7",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        autoCloseAfter: 2.5,
        memoryAlbum: true
    },
    longnanAlbumMoment: {
        src: "assets/cg/memory-album/sydney-moment.png?v=0.8.7",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        autoCloseAfter: 2.5,
        memoryAlbum: true
    },
    longnanAlbumWedding: {
        src: "assets/cg/memory-album/wedding-portrait.png?v=0.8.7",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        autoCloseAfter: 2.5,
        memoryAlbum: true
    },
    weddingInvitation: {
        src: "assets/cg/wedding/wedding-invitation.png?v=0.9.2",
        focalX: 0.5,
        focalY: 0.5,
        mobileDisplay: "contain",
        fallbackPlaceholder: true,
        placeholderTitle: "Wedding Invitation",
        placeholderSubtitle: "北京 · 晓园",
        requiresContinue: true,
        fadeFromWhite: true
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
    onComplete: null,
    inputReady: false,
    albumMode: "",
    albumPageIndex: 0
};

function preloadStoryCGs() {

    Object.values(storyCGs).forEach(config => {

        if (!config.image && config.src) {

            config.image = new Image();
            config.image.addEventListener("error", () => {

                config.loadFailed = true;
                if (!config.pendingAsset) console.warn(`Missing Story CG asset: ${config.src}`);

            });
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
const WEDDING_XIAOYUAN_WIDTH = 1448;
const WEDDING_XIAOYUAN_HEIGHT = 1086;
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
// The approved Xiaoyuan artwork remains unchanged. These connected zones only
// describe paths, lawn circulation and patios; furniture and ceremony décor
// are removed with the blocked rectangles below.
const weddingXiaoyuanWalkableZones = [
    { x: 610, y: 200, width: 230, height: 520 }, // entrance and ceremony aisle
    { x: 110, y: 420, width: 1230, height: 300 }, // lawn paths / circulation
    { x: 95, y: 270, width: 330, height: 170 }, // courtyard patio
    { x: 880, y: 390, width: 430, height: 320 } // photo and floral side paths
];
const weddingXiaoyuanBlockedRects = [
    { x: 0, y: 0, width: WEDDING_XIAOYUAN_WIDTH, height: 78 },
    { x: 0, y: 0, width: 74, height: 790 },
    { x: 1370, y: 0, width: 78, height: 790 },
    { x: 0, y: 735, width: WEDDING_XIAOYUAN_WIDTH, height: 351 },
    { x: 82, y: 92, width: 344, height: 178 }, // courtyard building
    { x: 118, y: 290, width: 258, height: 104 }, // patio furniture
    { x: 640, y: 140, width: 170, height: 120 }, // floral arch
    { x: 520, y: 294, width: 135, height: 180 }, // left chair rows
    { x: 790, y: 294, width: 140, height: 180 }, // right chair rows
    { x: 1068, y: 112, width: 250, height: 185 }, // tent and refreshments
    { x: 180, y: 505, width: 200, height: 132 }, // sign-in table and chairs
    { x: 1035, y: 490, width: 265, height: 125 }, // floral photo backdrop / bench
    { x: 885, y: 630, width: 280, height: 80 } // floral-decoration tables
];
const weddingInteractables = [
    {
        id: "weddingSignIn", label: "签到区", x: 270, y: 570, repeatable: true,
        pages: [{ speaker: "坨坨", text: "欢迎各位来宾～\n\n请大家到达后，\n先在这里签到喵！" }]
    },
    {
        id: "weddingPhotoArea", label: "合影区", x: 1160, y: 545, repeatable: true,
        pages: [{ speaker: "大痣", text: "请大家来这里拍照留念。\n\n希望能和大家，\n留下许多美好的瞬间，喵呜～" }]
    },
    {
        id: "weddingCeremonyArea", label: "仪式区", x: 720, y: 285, repeatable: true,
        pages: [
            { speaker: "坨坨", text: "这里就是森和乐乐，\n举行婚礼仪式的地方喵～" },
            { speaker: "大痣", text: "请各位来宾，\n在仪式开始前入座。" },
            { speaker: "大痣", text: "一起见证他们，\n最重要的时刻，喵呜～" }
        ]
    }
];
let nearbyWeddingInteraction = null;
const weddingFloralGateway = { id: "weddingFloralGateway", label: "进入花拱门", x: 725, y: 274, range: 116 };
const weddingGatewaySequence = {
    active: false,
    phase: "idle",
    elapsed: 0,
    whiteFade: 0,
    invitationReady: false,
    formationReached: false,
    catsStopped: false
};
let weddingGatewayNoticeRemaining = 0;
const GameState = Object.freeze({
    PROLOGUE: "prologue",
    CHAPTER_INTRO: "chapterIntro",
    CHAPTER_ENDING: "chapterEnding",
    FINAL_ENDING: "finalEnding",
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
    WEDDING_INTRO: "weddingIntro",
    WEDDING_XIAOYUAN: "weddingXiaoyuan",
    WEDDING_GATEWAY_DIALOGUE: "weddingGatewayDialogue",
    WEDDING_GATEWAY_CUTSCENE: "weddingGatewayCutscene",
    WEDDING_WHITE_TRANSITION: "weddingWhiteTransition",
    WEDDING_INVITATION: "weddingInvitation",
    WEDDING_CONTINUATION: "weddingContinuation"
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
let interactionPromptAlpha = 0;

const AmbientHooks = Object.freeze({
    TokyoAmbient: () => window.dispatchEvent(new CustomEvent("adventurewedding:ambient", { detail: "TokyoAmbient" })),
    SydneyAmbient: () => window.dispatchEvent(new CustomEvent("adventurewedding:ambient", { detail: "SydneyAmbient" })),
    LongnanAmbient: () => window.dispatchEvent(new CustomEvent("adventurewedding:ambient", { detail: "LongnanAmbient" })),
    WeddingAmbient: () => window.dispatchEvent(new CustomEvent("adventurewedding:ambient", { detail: "WeddingAmbient" }))
});
window.AdventureWeddingAmbientHooks = AmbientHooks;
window.TokyoAmbient = AmbientHooks.TokyoAmbient;
window.SydneyAmbient = AmbientHooks.SydneyAmbient;
window.LongnanAmbient = AmbientHooks.LongnanAmbient;
window.WeddingAmbient = AmbientHooks.WeddingAmbient;

const colesAmbientShoppers = [
    { x: 780, y: 330, minX: 650, maxX: 840, speed: 18, direction: 1, color: "#7a554d" },
    { x: 812, y: 618, minX: 650, maxX: 930, speed: 14, direction: -1, color: "#45677d" },
    { x: 1045, y: 704, minX: 820, maxX: 1080, speed: 16, direction: 1, color: "#6c7150" }
];

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

const stationDepartureZone = { x: 800, y: 490, width: 460, height: 250 };
let nearbyStation = false;
const chapterTransition = {
    active: false,
    completed: false,
    phase: "idle",
    elapsed: 0,
    petalPhase: 0,
    partyTargets: [
        { actor: player, x: 1035, y: 530 },
        { actor: le, x: 990, y: 570 },
        { actor: null, x: 948, y: 610 },
        { actor: null, x: 912, y: 640 }
    ]
};

// Scene exits are intentionally explicit: this keeps exploration player-led on
// both desktop and touch devices.
const sydneyToColesExit = { x: 790, y: 900, width: 280, height: 150 };
const colesToSydneyExit = { x: 600, y: 760, width: 330, height: 180 };
// Reaching the lower lookout terrace naturally starts the New Year food
// conversation once, before the existing Coles entrance remains available.
const sydneyNewYearSnackTrigger = {
    id: "sydneyNewYearSnack",
    x: 790,
    y: 900,
    width: 280,
    height: 150,
    completed: false,
    pages: [
        { speaker: "森", text: "走，我们去买点吃的吧，做些好吃的好好庆祝一下新年～" },
        { speaker: "乐乐", text: "好呀，还真是有点饿了。" },
        { speaker: "坨坨，大痣", text: "饿了喵～" }
    ]
};
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
    if (currentChapter === "weddingXiaoyuan") return WEDDING_XIAOYUAN_WIDTH;

    return exteriorMap.naturalWidth
        ? exteriorMap.naturalWidth * STORY_MAP_SCALE
        : MAP_COLUMNS * TILE_SIZE;

}

function getWorldHeight() {

    if (currentChapter === "sydney") return SYDNEY_WORLD_HEIGHT;
    if (currentChapter === "coles") return COLES_WORLD_HEIGHT;
    if (currentChapter === "longnanLookout") return LONGNAN_LOOKOUT_HEIGHT;
    if (currentChapter === "longnanTown") return LONGNAN_TOWN_HEIGHT;
    if (currentChapter === "weddingXiaoyuan") return WEDDING_XIAOYUAN_HEIGHT;

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

    if (currentChapter === "weddingXiaoyuan") {

        const centerX = x + actor.width / 2;
        const centerY = y + actor.height / 2;
        const destination = { x, y, width: actor.width, height: actor.height };
        return weddingXiaoyuanWalkableZones.some(zone =>
            centerX >= zone.x && centerX <= zone.x + zone.width
            && centerY >= zone.y && centerY <= zone.y + zone.height
        ) && !weddingXiaoyuanBlockedRects.some(rect => rectanglesOverlap(destination, rect));

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

    const verticalName = vertical < 0 ? "up" : "down";
    const horizontalName = horizontal < 0 ? "left" : "right";
    actor.direction8 = horizontal && vertical
        ? `${verticalName}-${horizontalName}`
        : (horizontal ? horizontalName : verticalName);

    // The canonical sheets provide four authored rows. During a diagonal
    // input retain the last compatible row, creating a natural cardinal →
    // diagonal → cardinal turn without rotating or distorting the sprite.
    if (horizontal && vertical) {

        if (actor.direction !== horizontalName && actor.direction !== verticalName) actor.direction = horizontalName;
        actor.renderDirection = actor.direction;
        return;

    }

    if (Math.abs(horizontal) > Math.abs(vertical)) {

        actor.direction = horizontal > 0 ? "right" : "left";

    } else {

        actor.direction = vertical > 0 ? "down" : "up";

    }

    actor.renderDirection = actor.direction;

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
        const delay = /[。！？]/.test(character)
            ? 150
            : /[，、；：]/.test(character)
            ? 90
            : character === "…"
            ? 125
            : /[（）]/.test(character)
            ? 70
            : 40;

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

        storyCGOverlay.onComplete = () => {

            storyFlags.sydneyChapterComplete = true;
            showChapterEnding("sydney", () => {

                showChapterIntro("longnan", () => {

                    storyFlags.longnanChapterStarted = true;
                    restoreGameplayUI();
                    startLongnanOpening();

                });

            });

        };
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

    if (dialoguePurpose === "weddingGuide" && activeInteraction) {

        const viewedFlagById = {
            weddingSignIn: "weddingSignInViewed",
            weddingPhotoArea: "weddingPhotoAreaViewed",
            weddingCeremonyArea: "weddingCeremonyAreaViewed"
        };
        const viewedFlag = viewedFlagById[activeInteraction.id];
        if (viewedFlag) storyFlags[viewedFlag] = true;
        unlockWeddingFloralGateway();

    }

    if (dialoguePurpose === "weddingGateway") beginWeddingGatewayCutscene();

    if (dialoguePurpose === "weddingInvitation") {

        storyFlags.weddingInvitationViewed = true;
        storyCGOverlay.onComplete = showWeddingContinuation;
        storyCGOverlay.phase = "endingHold";
        storyCGOverlay.revealDelay = 0.55;

    }

    if (dialoguePurpose === "colesInspect" && activeColesInspectable) activeColesInspectable.completed = true;

    activeInteraction = null;
    activeColesInspectable = null;

}

function unlockWeddingFloralGateway() {

    if (storyFlags.weddingArchUnlocked) return;
    if (!storyFlags.weddingSignInViewed || !storyFlags.weddingPhotoAreaViewed || !storyFlags.weddingCeremonyAreaViewed) return;

    storyFlags.weddingArchUnlocked = true;
    weddingGatewayNoticeRemaining = 1.8;

}

const weddingGatewayDialoguePages = [
    { speaker: "坨坨", text: "森～\n\n准备好了喵？" },
    { speaker: "大痣", text: "大家都在等你们喵呜～" },
    { speaker: "乐乐", text: "那我们，\n\n一起进去吧。" },
    { speaker: "森", text: "走吧。\n\n迎接我们的，\n\n下一段人生。" }
];

function startWeddingGatewayDialogue() {

    if (!storyFlags.weddingArchUnlocked || storyFlags.weddingArchSequenceStarted || gameState !== GameState.WEDDING_XIAOYUAN) return;

    storyFlags.weddingArchSequenceStarted = true;
    weddingGatewaySequence.active = true;
    weddingGatewaySequence.phase = "dialogue";
    weddingGatewaySequence.elapsed = 0;
    weddingGatewaySequence.whiteFade = 0;
    weddingGatewaySequence.formationReached = false;
    weddingGatewaySequence.catsStopped = false;
    nearbyWeddingInteraction = null;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => {

        cat.moving = false;
        cat.behaviour = "idle";

    });
    le.companion = false;
    cats.forEach(cat => cat.following = false);
    if (characterPanelOpen) setCharacterPanelOpen(false);
    mobileControls.classList.remove("hidden");
    mobileControls.classList.add("isDialogueOpen");
    characterMenuButton.classList.add("hidden");
    gameState = GameState.WEDDING_GATEWAY_DIALOGUE;
    openPiaoziDialogue(weddingGatewayDialoguePages, "weddingGateway");

}

function beginWeddingGatewayCutscene() {

    if (!weddingGatewaySequence.active) return;
    gameState = GameState.WEDDING_GATEWAY_CUTSCENE;
    weddingGatewaySequence.phase = "formation";
    weddingGatewaySequence.elapsed = 0;
    mobileControls.classList.add("hidden");

}

function showWeddingInvitation() {

    gameState = GameState.WEDDING_INVITATION;
    weddingGatewaySequence.active = false;
    weddingGatewaySequence.phase = "invitation";
    weddingGatewaySequence.invitationReady = false;
    transitionInputLockUntil = performance.now() + 350;
    mobileControls.classList.remove("hidden");
    mobileControls.classList.add("invitationMode");
    showStoryCG({ id: "weddingInvitation", revealDelay: 0.25 });

}

function continueWeddingInvitation() {

    if (gameState !== GameState.WEDDING_INVITATION || !storyCGOverlay.active || !storyCGOverlay.inputReady || meetingState.dialogueOpen) return;
    if (performance.now() < transitionInputLockUntil) return;

    transitionInputLockUntil = performance.now() + 350;
    storyCGOverlay.inputReady = false;
    openPiaoziDialogue([
        { speaker: "乐乐", text: "谢谢你，\n\n陪我们一路走到了这里。" },
        { speaker: "森", text: "谢谢大家，\n\n来参加我们的婚礼。" }
    ], "weddingInvitation");

}

function showWeddingContinuation() {

    lockForChapterCard();
    mobileControls.classList.remove("invitationMode");
    gameState = GameState.WEDDING_CONTINUATION;
    chapterCardState.active = true;
    chapterCardState.mode = "weddingContinuation";
    chapterCardState.chapterId = "wedding";
    chapterCardState.phase = "hold";
    chapterCardState.finalCard = true;
    chapterCardState.inputUnlocked = false;
    chapterCardLabel.textContent = "Wedding";
    chapterCardTitleZh.textContent = "婚礼即将开始……";
    chapterCardTitleEn.textContent = "";
    chapterCardTheme.textContent = "北京 · 晓园";
    chapterCardMessage.textContent = "";
    chapterCard.dataset.mode = "continuation";
    chapterCard.style.opacity = "1";
    chapterCard.classList.remove("hidden");

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
    showChapterIntro("longnan", () => {

        storyFlags.longnanChapterStarted = true;
        restoreGameplayUI();
        startLongnanOpening();

    });

}

function startLongnanOpening() {

    restoreGameplayUI();
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

const weddingOpeningPages = [
    { speaker: "乐乐", text: "终于来到这里了。" },
    { speaker: "森", text: "我们一路从东京，\n走到了今天。" },
    { speaker: "坨坨", text: "婚礼开始喵～" },
    { speaker: "大痣", text: "大家快进来喵呜～" }
];

function enterWeddingXiaoyuan() {

    restoreGameplayUI();
    currentChapter = "weddingXiaoyuan";
    gameState = GameState.WEDDING_XIAOYUAN;
    storyFlags.weddingChapterStarted = true;
    storyFlags.weddingMapEntered = weddingXiaoyuanMap.complete && weddingXiaoyuanMap.naturalWidth > 0;
    chapterLocation.textContent = "北京 · 晓园 · 婚礼现场";
    chapterLocation.classList.remove("hidden");

    // Just inside the main gate: Mori leads, with a clear, non-overlapping party.
    player.x = 710;
    player.y = 660;
    le.x = 674;
    le.y = 684;
    cats[0].x = 640;
    cats[0].y = 698;
    cats[1].x = 766;
    cats[1].y = 698;
    player.direction = "up";
    le.direction = "up";
    cats.forEach(cat => {
        cat.direction = "up";
        cat.following = true;
        cat.moving = false;
    });
    le.companion = true;
    seedPartyHistory();
    centerCameraOnPlayer();
    openPiaoziDialogue(weddingOpeningPages, "weddingXiaoyuanOpening");

}

function startLongnanCGSequence() {

    if (storyCGOverlay.active) return;
    longnanCGIndex = 0;
    playLongnanCG();

}

function playLongnanCG() {

    const scene = longnanCGSequence[longnanCGIndex];
    if (!scene) {

        showChapterEnding("longnan", () => {

            storyFlags.longnanChapterComplete = true;
            showChapterIntro("wedding", () => {

                restoreGameplayUI();
                enterWeddingXiaoyuan();

            });

        });
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
    storyCGOverlay.inputReady = false;
    storyCGOverlay.albumMode = "";
    storyCGOverlay.albumPageIndex = 0;
    pressedKeys.clear();
    clearMobileControls();
    player.moving = false;
    le.moving = false;
    cats.forEach(cat => cat.moving = false);
    return true;

}

const longnanMemoryAlbumPages = [
    "longnanAlbumWildFruit",
    "longnanAlbumPiaozi",
    "longnanAlbumMoment",
    "longnanAlbumWedding"
];

function showLongnanMemoryAlbum(pageIndex = 0) {

    const id = longnanMemoryAlbumPages[pageIndex];
    if (!id) {

        storyFlags.longnanMemoryAlbumViewed = true;
        showChapterEnding("longnan", () => {

            storyFlags.longnanChapterComplete = true;
            showChapterIntro("wedding", () => {

                restoreGameplayUI();
                enterWeddingXiaoyuan();

            });

        });
        return;

    }

    const opened = showStoryCG({
        id,
        dialoguePurpose: "longnanMemoryAlbum",
        revealDelay: 0.45,
        onComplete: () => showLongnanMemoryAlbum(pageIndex + 1)
    });
    if (opened) {

        storyCGOverlay.albumMode = pageIndex === 0 ? "open" : "flip";
        storyCGOverlay.albumPageIndex = pageIndex;

    }

}

function hideStoryCG() {

    if (!storyCGOverlay.active || storyCGOverlay.phase === "fadeOut") return;
    storyCGOverlay.phase = "fadeOut";

}

function updateStoryCG(deltaTime) {

    if (!storyCGOverlay.active) return;

    if (storyCGOverlay.phase === "fadeIn") {

        storyCGOverlay.opacity = Math.min(1, storyCGOverlay.opacity + deltaTime / 0.85);
        if (storyCGOverlay.opacity < 1) return;
        storyCGOverlay.phase = "hold";

    }

    if (storyCGOverlay.phase === "hold" && !storyCGOverlay.dialogueStarted) {

        storyCGOverlay.revealDelay = Math.max(0, storyCGOverlay.revealDelay - deltaTime);
        if (storyCGOverlay.revealDelay === 0) {

            storyCGOverlay.dialogueStarted = true;
            if (storyCGOverlay.dialogue?.length) {

                openPiaoziDialogue(storyCGOverlay.dialogue, storyCGOverlay.dialoguePurpose);

            } else if (storyCGOverlay.config?.requiresContinue) {

                storyCGOverlay.inputReady = true;
                weddingGatewaySequence.invitationReady = true;

            } else if (storyCGOverlay.config?.autoCloseAfter) {

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

        storyCGOverlay.opacity = Math.max(0, storyCGOverlay.opacity - deltaTime / 0.85);
        if (storyCGOverlay.opacity > 0) return;

        const onComplete = storyCGOverlay.onComplete;
        storyCGOverlay.active = false;
        storyCGOverlay.id = null;
        storyCGOverlay.config = null;
        storyCGOverlay.phase = "idle";
        storyCGOverlay.dialogue = null;
        storyCGOverlay.onComplete = null;
        storyCGOverlay.inputReady = false;
        if (onComplete) onComplete();

    }

}

function checkFirstMeeting() {

    if (chapterCardState.active || meetingState.triggered || cameraIntro.active) return;

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

    restoreGameplayUI();
    currentChapter = "sydney";
    storyFlags.sydneyChapterStarted = true;
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

        chapterTransition.active = false;
        chapterTransition.completed = true;
        storyFlags.tokyoChapterComplete = true;
        showChapterEnding("tokyo", () => {

            showChapterIntro("sydney", () => {

                spawnSydneyParty();
                startSydneyDialogue();

            });

        });
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

function updateSydneyNewYearSnackTrigger() {

    if (gameState !== GameState.SYDNEY || meetingState.dialogueOpen || sceneTransition.active || sydneyNewYearSnackTrigger.completed) return;

    const closestX = Math.max(sydneyNewYearSnackTrigger.x, Math.min(player.x + player.width / 2, sydneyNewYearSnackTrigger.x + sydneyNewYearSnackTrigger.width));
    const closestY = Math.max(sydneyNewYearSnackTrigger.y, Math.min(player.y + player.height / 2, sydneyNewYearSnackTrigger.y + sydneyNewYearSnackTrigger.height));

    if (Math.hypot(player.x + player.width / 2 - closestX, player.y + player.height / 2 - closestY) <= 72) {

        openInteractionDialogue(sydneyNewYearSnackTrigger);

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

function updateNearbyWedding() {

    nearbyWeddingInteraction = null;
    if (gameState !== GameState.WEDDING_XIAOYUAN || meetingState.dialogueOpen || storyCGOverlay.active || weddingGatewaySequence.active) return;

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    if (storyFlags.weddingArchUnlocked && !storyFlags.weddingArchSequenceStarted
        && Math.hypot(centerX - weddingFloralGateway.x, centerY - weddingFloralGateway.y) <= weddingFloralGateway.range) {

        nearbyWeddingInteraction = weddingFloralGateway;
        return;

    }
    nearbyWeddingInteraction = weddingInteractables
        .map(item => ({ item, distance: Math.hypot(centerX - item.x, centerY - item.y) }))
        .filter(entry => entry.distance <= 108)
        .sort((first, second) => first.distance - second.distance)[0]?.item || null;

}

function moveWeddingActor(actor, target, deltaTime, speed) {

    const distance = Math.hypot(target.x - actor.x, target.y - actor.y);
    if (distance <= 2) {

        actor.x = target.x;
        actor.y = target.y;
        actor.moving = false;
        return true;

    }

    const step = Math.min(distance, speed * deltaTime);
    actor.x += ((target.x - actor.x) / distance) * step;
    actor.y += ((target.y - actor.y) / distance) * step;
    actor.moving = true;
    faceToward(actor, target);
    return false;

}

function placeWeddingFormation() {

    const formation = [
        [player, { x: 682, y: 510 }],
        [le, { x: 758, y: 510 }],
        [cats[0], { x: 682, y: 570 }],
        [cats[1], { x: 758, y: 570 }]
    ];
    formation.forEach(([actor, target]) => {

        actor.x = target.x;
        actor.y = target.y;
        actor.direction = "up";
        actor.moving = false;

    });

}

function updateWeddingGatewaySequence(deltaTime) {

    if (!weddingGatewaySequence.active || weddingGatewaySequence.phase === "dialogue") return;
    weddingGatewaySequence.elapsed += deltaTime;

    if (weddingGatewaySequence.phase === "formation") {

        const formation = [
            [player, { x: 682, y: 510 }],
            [le, { x: 758, y: 510 }],
            [cats[0], { x: 682, y: 570 }],
            [cats[1], { x: 758, y: 570 }]
        ];
        const regroupSpeed = weddingGatewaySequence.elapsed >= 3 ? 420 : 128;
        const reached = formation.map(([actor, target]) => moveWeddingActor(actor, target, deltaTime, regroupSpeed)).every(Boolean);
        if (reached) {

            weddingGatewaySequence.formationReached = true;
            weddingGatewaySequence.phase = "approach";
            weddingGatewaySequence.elapsed = 0;

        }
        return;

    }

    if (weddingGatewaySequence.phase === "approach") {

        const targets = [
            [player, { x: 682, y: 322 }],
            [le, { x: 758, y: 322 }],
            [cats[0], { x: 682, y: 380 }],
            [cats[1], { x: 758, y: 380 }]
        ];
        const reached = targets.map(([actor, target]) => moveWeddingActor(actor, target, deltaTime, 104)).every(Boolean);
        if (reached) {

            cats.forEach(cat => faceToward(cat, player));
            weddingGatewaySequence.catsStopped = true;
            weddingGatewaySequence.phase = "catPause";
            weddingGatewaySequence.elapsed = 0;

        }
        return;

    }

    if (weddingGatewaySequence.phase === "catPause") {

        player.moving = false;
        le.moving = false;
        if (weddingGatewaySequence.elapsed >= 0.75) {

            weddingGatewaySequence.phase = "coupleEnter";
            weddingGatewaySequence.elapsed = 0;

        }
        return;

    }

    if (weddingGatewaySequence.phase === "coupleEnter") {

        const reached = [
            moveWeddingActor(player, { x: 682, y: 230 }, deltaTime, 92),
            moveWeddingActor(le, { x: 758, y: 230 }, deltaTime, 92)
        ].every(Boolean);
        cats.forEach(cat => cat.moving = false);
        if (reached) {

            player.moving = false;
            le.moving = false;
            weddingGatewaySequence.phase = "whiteFade";
            weddingGatewaySequence.elapsed = 0;
            gameState = GameState.WEDDING_WHITE_TRANSITION;

        }
        return;

    }

    if (weddingGatewaySequence.phase === "whiteFade") {

        weddingGatewaySequence.whiteFade = Math.min(1, weddingGatewaySequence.elapsed / 1.45);
        if (weddingGatewaySequence.whiteFade >= 1) {

            weddingGatewaySequence.phase = "whiteHold";
            weddingGatewaySequence.elapsed = 0;

        }
        return;

    }

    if (weddingGatewaySequence.phase === "whiteHold" && weddingGatewaySequence.elapsed >= 0.55) showWeddingInvitation();

}

function drawWeddingGatewayVisuals() {

    if (!storyFlags.weddingArchUnlocked) return;
    const pulse = 0.16 + (Math.sin(windTime * 2.3) + 1) * 0.045;
    const archX = weddingFloralGateway.x;
    const archY = weddingFloralGateway.y;
    gameCtx.save();
    gameCtx.globalCompositeOperation = "screen";
    gameCtx.fillStyle = `rgba(255, 246, 216, ${pulse})`;
    gameCtx.fillRect(archX - 104, archY - 118, 208, 130);
    gameCtx.fillStyle = "rgba(247, 207, 120, .66)";
    for (let index = 0; index < 8; index++) {

        const angle = windTime * 1.1 + index * 0.78;
        const x = archX + Math.cos(angle) * (70 + (index % 3) * 9);
        const y = archY - 42 + Math.sin(angle * 1.5) * 44;
        gameCtx.fillRect(Math.round(x), Math.round(y), 3, 3);

    }
    gameCtx.fillStyle = "rgba(255, 248, 239, .75)";
    for (let index = 0; index < 4; index++) {

        const x = archX - 70 + ((windTime * 16 + index * 37) % 138);
        const y = archY - 104 + ((windTime * 11 + index * 29) % 108);
        gameCtx.fillRect(Math.round(x), Math.round(y), 3, 4);

    }
    gameCtx.restore();

}

function drawWeddingGatewayOverlays() {

    if (weddingGatewayNoticeRemaining > 0) {

        const alpha = Math.min(1, weddingGatewayNoticeRemaining / 0.25, (1.8 - weddingGatewayNoticeRemaining) / 0.25);
        const width = 260;
        const x = Math.round((gameViewportState.width - width) / 2);
        gameCtx.globalAlpha = Math.max(0, alpha);
        gameCtx.fillStyle = "rgba(7, 21, 42, .94)";
        gameCtx.fillRect(x, 44, width, 42);
        gameCtx.strokeStyle = "#d8aa54";
        gameCtx.lineWidth = 2;
        gameCtx.strokeRect(x, 44, width, 42);
        gameCtx.fillStyle = "#fff2cc";
        gameCtx.textAlign = "center";
        gameCtx.font = "15px Fusion Pixel, monospace";
        gameCtx.fillText("花拱门似乎亮了起来……", gameViewportState.width / 2, 70);
        gameCtx.textAlign = "left";
        gameCtx.globalAlpha = 1;

    }

    if (weddingGatewaySequence.phase === "whiteFade" || weddingGatewaySequence.phase === "whiteHold") {

        const alpha = weddingGatewaySequence.phase === "whiteHold" ? 1 : weddingGatewaySequence.whiteFade;
        gameCtx.fillStyle = `rgba(255, 249, 231, ${alpha})`;
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

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

    if (nearbyWeddingInteraction && !meetingState.dialogueOpen) {

        if (nearbyWeddingInteraction.id === "weddingFloralGateway") {

            startWeddingGatewayDialogue();
            return;

        }

        activeInteraction = nearbyWeddingInteraction;
        openPiaoziDialogue(nearbyWeddingInteraction.pages, "weddingGuide");

    } else if (nearbyLongnanInteraction?.id === "railing") {

        showStoryCG({
            id: "longnanHometownView",
            dialogue: longnanHometownPages,
            dialoguePurpose: "longnanHometown",
            revealDelay: 0.35
        });

    } else if (nearbyLongnanMemoryAlbum) {

        gameState = GameState.LONGNAN_MEMORY_ALBUM;
        showLongnanMemoryAlbum();

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

function updateOrganicIdleOffset(actor, deltaTime) {

    actor.idleOffsetTimer = Math.max(0, (actor.idleOffsetTimer || 0) - deltaTime);
    if (actor.idleOffsetTimer > 0) return;
    actor.idleOffsetX = Math.round((Math.random() * 6) - 3);
    actor.idleOffsetY = Math.round((Math.random() * 6) - 3);
    actor.idleOffsetTimer = 3 + Math.random() * 5;

}

function updateLeCompanion(deltaTime) {

    if (!le.companion || chapterCardState.active || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active || sceneTransition.active || storyCGOverlay.active) {

        le.moving = false;
        return;

    }

    updateOrganicIdleOffset(le, deltaTime);
    const historyPoint = moriPositionHistory[Math.max(0, moriPositionHistory.length - 14)];
    const delayedPoint = historyPoint && {
        x: historyPoint.x + le.idleOffsetX,
        y: historyPoint.y + le.idleOffsetY
    };

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
    faceMovementDirection(le, horizontal, vertical);

}

function drawInteractionPrompt() {

    if ((!nearbyInteractable && !nearbyCatEvent && !nearbyStation && !nearbySceneExit && !piaoziState.nearby && !nearbyColesInspectable && !nearbyLongnanInteraction && !nearbyLongnanExit && !nearbyLongnanMemoryAlbum && !nearbyWeddingInteraction) || meetingState.dialogueOpen) return;

    const mobilePrompt = mobileControls.classList.contains("isTouchMode");
    const promptText = nearbyLongnanExit
        ? (mobilePrompt ? "点击 A 前往童年小镇" : "按 E 前往童年小镇")
        : nearbyWeddingInteraction?.id === "weddingFloralGateway"
        ? `${nearbyWeddingInteraction.label}\n${mobilePrompt ? "点击 A" : "按 E"}`
        : nearbyWeddingInteraction
        ? `${nearbyWeddingInteraction.label}\n${mobilePrompt ? "点击 A 查看" : "按 E 查看"}`
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
    const promptWidth = nearbyWeddingInteraction?.id === "weddingFloralGateway" ? 150 : nearbyWeddingInteraction ? 126 : nearbyLongnanExit ? 190 : nearbyLongnanMemoryAlbum ? 160 : nearbyLongnanInteraction ? 190 : piaoziState.nearby ? 240 : nearbySceneExit === "sydneyLife" ? 220 : nearbySceneExit ? 170 : nearbyStation ? 156 : nearbyCatEvent ? 164 : nearbyInteractable?.prompt ? 158 : 112;

    gameCtx.save();
    gameCtx.globalAlpha = interactionPromptAlpha;
    gameCtx.fillStyle = "rgba(10, 20, 38, 0.86)";
    gameCtx.fillRect(player.x - 44, player.y - (nearbyWeddingInteraction ? 76 : 58), promptWidth, nearbyWeddingInteraction ? 46 : 28);
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "14px Fusion Pixel 12px Monospaced JP";
    if (nearbyWeddingInteraction) {

        const viewed = ({ weddingSignIn: storyFlags.weddingSignInViewed, weddingPhotoArea: storyFlags.weddingPhotoAreaViewed, weddingCeremonyArea: storyFlags.weddingCeremonyAreaViewed })[nearbyWeddingInteraction.id];
        gameCtx.fillText(`${nearbyWeddingInteraction.label}${viewed ? " ✓" : ""}`, player.x - 38, player.y - 57);
        gameCtx.fillText(nearbyWeddingInteraction.id === "weddingFloralGateway"
            ? (mobilePrompt ? "点击 A" : "按 E")
            : (mobilePrompt ? "点击 A 查看" : "按 E 查看"), player.x - 38, player.y - 38);

    } else {

        gameCtx.fillText(promptText, player.x - 38, player.y - 39);

    }
    gameCtx.restore();

}

function updateInteractionPromptFade(deltaTime) {

    const visible = !meetingState.dialogueOpen && Boolean(
        nearbyInteractable || nearbyCatEvent || nearbyStation || nearbySceneExit
        || piaoziState.nearby || nearbyColesInspectable || nearbyLongnanInteraction
        || nearbyLongnanExit || nearbyLongnanMemoryAlbum || nearbyWeddingInteraction
    );
    const target = visible ? 1 : 0;
    interactionPromptAlpha += (target - interactionPromptAlpha) * (1 - Math.exp(-deltaTime / 0.16));
    if (Math.abs(target - interactionPromptAlpha) < .01) interactionPromptAlpha = target;

}

function updateCatCompanion(cat, index, deltaTime) {

    if (!cat.following || chapterCardState.active || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active || gameplayPauseRemaining > 0 || chapterTransition.active || sceneTransition.active || storyCGOverlay.active) {

        cat.moving = false;
        cat.animationTime += deltaTime;
        return;

    }

    cat.animationTime += deltaTime;
    updateOrganicIdleOffset(cat, deltaTime);
    cat.idleTimer -= deltaTime;

    if (cat.idleTimer <= 0 && !cat.moving) {

        const behaviours = cat.id === "tuotuo"
            ? ["tail", "lookLeft", "lookRight", "blink", "sit", "stand"]
            : ["blink", "tail", "ear", "lookPlayer", "stretch"];
        cat.behaviour = behaviours[Math.floor(Math.random() * behaviours.length)];
        cat.behaviourTime = 0.55 + Math.random() * 1.15;
        cat.idleTimer = 3 + Math.random() * 5;
        if (cat.behaviour === "lookLeft") cat.direction = "left";
        if (cat.behaviour === "lookRight") cat.direction = "right";
        if (cat.behaviour === "lookPlayer") faceToward(cat, player);

    }

    if (cat.behaviourTime > 0) {

        cat.behaviourTime -= deltaTime;
        cat.moving = false;
        return;

    }

    const historyPoint = moriPositionHistory[Math.max(0, moriPositionHistory.length - 24 - index * 10)];
    const delayedPoint = historyPoint && {
        x: historyPoint.x + cat.idleOffsetX,
        y: historyPoint.y + cat.idleOffsetY
    };

    if (!delayedPoint) return;

    const distance = Math.hypot(delayedPoint.x - cat.x, delayedPoint.y - cat.y);

    if (distance > 240) {

        cat.x = delayedPoint.x;
        cat.y = delayedPoint.y;
        cat.moving = false;
        return;

    }

    if (distance < 32) {

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
    faceMovementDirection(cat, horizontal, vertical);

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

    player.x = 1660;
    player.y = 1900;
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

        // On a tall phone screen, fill the display by the harbour artwork's
        // height.  The camera can then travel across the wide panorama as the
        // player walks, rather than shrinking the 16:9 world into a strip.
        if (gameViewportState.isMobile && gameViewportState.portrait) {

            return gameViewportState.height / SYDNEY_WORLD_HEIGHT;

        }

        return Math.min(
            gameViewportState.width / SYDNEY_WORLD_WIDTH,
            gameViewportState.height / SYDNEY_WORLD_HEIGHT
        );

    }
    if (!gameViewportState.isMobile) return 1;

    // The new Tokyo artwork is composed natively for a tall phone screen.
    // A slightly wider portrait frame keeps both the party and the avenue
    // readable without stretching or cropping the map image.
    if (currentChapter === "tokyo" && gameViewportState.portrait) return 0.68;

    // Coles is a wide interior. Filling the phone's height makes the aisles
    // readable and lets the regular horizontal camera follow explore it.
    if (currentChapter === "coles" && gameViewportState.portrait) {

        return gameViewportState.height / COLES_WORLD_HEIGHT;

    }

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
            x: Math.max(0, Math.min(player.x + player.width / 2 - visibleWidth / 2, maxX)),
            y: Math.max(0, Math.min(player.y + player.height / 2 - visibleHeight / 2, maxY))
        };

    }

    if (weddingGatewaySequence.active && ["formation", "approach", "catPause", "coupleEnter", "whiteFade", "whiteHold"].includes(weddingGatewaySequence.phase)) {

        const partyCenterX = (player.x + le.x + player.width + le.width) / 2;
        const partyCenterY = (player.y + le.y + player.height + le.height) / 2;
        return {
            x: Math.max(0, Math.min(partyCenterX - visibleWidth / 2, maxX)),
            y: Math.max(0, Math.min(partyCenterY - visibleHeight / 2, maxY))
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

    const overviewZoom = getCameraIntroOverviewZoom();

    camera.x = Math.max(0, (getWorldWidth() - gameViewportState.width / overviewZoom) / 2);
    camera.y = Math.max(0, (getWorldHeight() - gameViewportState.height / overviewZoom) / 2);
    camera.zoom = overviewZoom;
    cameraIntro.active = true;
    cameraIntro.elapsed = 0;

}

function getCameraIntroOverviewZoom() {

    // Tokyo's portrait map is shown in full before the camera moves down to
    // Sakura Avenue.  Using the entire available phone width preserves the
    // whole map rather than presenting the previous small inset overview.
    if (currentChapter === "tokyo" && gameViewportState.isMobile && gameViewportState.portrait) {

        return Math.min(
            gameViewportState.width / getWorldWidth(),
            gameViewportState.height / getWorldHeight()
        );

    }

    return Math.min(
        (gameViewportState.width - 48) / getWorldWidth(),
        (gameViewportState.height - 48) / getWorldHeight()
    );

}

function getCameraDeadZoneTarget(zoom) {

    const visibleWidth = gameViewportState.width / zoom;
    const visibleHeight = gameViewportState.height / zoom;
    const maxX = Math.max(0, getWorldWidth() - visibleWidth);
    const maxY = Math.max(0, getWorldHeight() - visibleHeight);
    const deadHalfWidth = visibleWidth * 0.15;
    const deadHalfHeight = visibleHeight * 0.12;
    const portraitOffsetY = gameViewportState.isMobile && gameViewportState.portrait ? 110 : 0;
    const focusX = player.x + player.width / 2;
    const focusY = player.y + player.height / 2 + portraitOffsetY;
    const cameraCenterX = camera.x + visibleWidth / 2;
    const cameraCenterY = camera.y + visibleHeight / 2;
    let targetX = camera.x;
    let targetY = camera.y;

    if (focusX < cameraCenterX - deadHalfWidth) targetX += focusX - (cameraCenterX - deadHalfWidth);
    if (focusX > cameraCenterX + deadHalfWidth) targetX += focusX - (cameraCenterX + deadHalfWidth);
    if (focusY < cameraCenterY - deadHalfHeight) targetY += focusY - (cameraCenterY - deadHalfHeight);
    if (focusY > cameraCenterY + deadHalfHeight) targetY += focusY - (cameraCenterY + deadHalfHeight);

    return {
        x: Math.max(0, Math.min(targetX, maxX)),
        y: Math.max(0, Math.min(targetY, maxY))
    };

}

function updateCamera(deltaTime) {

    const followZoom = getCameraFollowZoom();
    const cinematicWeddingCamera = weddingGatewaySequence.active
        && ["formation", "approach", "catPause", "coupleEnter", "whiteFade", "whiteHold"].includes(weddingGatewaySequence.phase);
    let target = cinematicWeddingCamera ? getCameraTarget(followZoom) : getCameraDeadZoneTarget(followZoom);
    const followAmount = 1 - Math.pow(1 - camera.smoothing, deltaTime * 60);

    if (characterPanelOpen) return;

    if (cameraIntro.active) {

        cameraIntro.elapsed += deltaTime;

        const overviewZoom = getCameraIntroOverviewZoom();
        const overviewX = Math.max(0, (getWorldWidth() - gameViewportState.width / overviewZoom) / 2);
        const overviewY = Math.max(0, (getWorldHeight() - gameViewportState.height / overviewZoom) / 2);
        target = getCameraTarget(followZoom);

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
    clampCameraToWorld();

}

function tileNoise(column, row, offset) {

    return (column * 19 + row * 37 + offset * 13) % 13;

}

function drawGrassTile(x, y, column, row) {

    gameCtx.fillStyle = currentChapter === "tokyo"
        && gameViewportState.isMobile
        && gameViewportState.portrait
        && cameraIntro.active
        ? "#06111d"
        : "#91ad6d";
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

    if (currentChapter === "coles") colesAmbientShoppers.forEach(shopper => {

        shopper.x += shopper.speed * shopper.direction * deltaTime;
        if (shopper.x < shopper.minX || shopper.x > shopper.maxX) {

            shopper.direction *= -1;
            shopper.x = Math.max(shopper.minX, Math.min(shopper.x, shopper.maxX));

        }

    });

    if (currentChapter !== "tokyo") return;

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

        // Two distant ferries, slow cloud bands and a pair of harbour birds.
        for (let index = 0; index < 2; index++) {

            const boatX = ((windTime * (18 + index * 4) + index * 710) % 1500) + 180;
            const boatY = 485 + index * 82;
            gameCtx.fillStyle = "rgba(245, 222, 167, .72)";
            gameCtx.fillRect(boatX, boatY, 34, 4);
            gameCtx.fillStyle = "rgba(233, 246, 255, .55)";
            gameCtx.fillRect(boatX + 8, boatY - 5, 18, 5);

        }
        gameCtx.fillStyle = "rgba(197, 216, 237, .08)";
        gameCtx.fillRect((windTime * 5 % 1500) - 220, 115, 260, 12);
        gameCtx.fillRect(((windTime * 4 + 680) % 1700) - 180, 175, 210, 9);
        for (let index = 0; index < 2; index++) {

            const birdX = ((windTime * 32 + index * 620) % 1650) + 90;
            const birdY = 270 + index * 45;
            gameCtx.strokeStyle = "rgba(232, 239, 246, .7)";
            gameCtx.beginPath();
            gameCtx.moveTo(birdX - 5, birdY);
            gameCtx.lineTo(birdX, birdY - 3);
            gameCtx.lineTo(birdX + 5, birdY);
            gameCtx.stroke();

        }

        return;

    }

    if (currentChapter === "longnanLookout" || currentChapter === "longnanTown") {

        // Longnan uses mountain breeze, leaves, insects and warm sun flecks —
        // deliberately no Tokyo-style pink petals.
        for (let index = 0; index < 16; index++) {

            const x = (index * 149 + windTime * (8 + index % 3) * 6) % getWorldWidth();
            const y = (index * 97 + Math.sin(windTime * 1.2 + index) * 28 + 80) % getWorldHeight();
            gameCtx.fillStyle = index % 3 ? "rgba(105, 139, 58, .48)" : "rgba(181, 143, 68, .4)";
            gameCtx.fillRect(x, y, 4, 2);

        }
        for (let index = 0; index < 7; index++) {

            const x = 120 + (index * 227 + windTime * 9) % Math.max(240, getWorldWidth() - 240);
            const y = 160 + (index * 113) % Math.max(220, getWorldHeight() - 320);
            gameCtx.fillStyle = `rgba(255, 224, 117, ${0.22 + Math.sin(windTime * 3 + index) * 0.08})`;
            gameCtx.fillRect(x, y, 2, 2);

        }
        gameCtx.fillStyle = `rgba(255, 240, 181, ${0.025 + Math.sin(windTime * .7) * .008})`;
        gameCtx.fillRect(0, 0, getWorldWidth(), getWorldHeight());
        return;

    }

    if (currentChapter === "weddingXiaoyuan") {

        for (let index = 0; index < 18; index++) {

            const x = (index * 103 + windTime * 11) % getWorldWidth();
            const y = (index * 71 + windTime * (5 + index % 2)) % getWorldHeight();
            gameCtx.fillStyle = index % 2 ? "rgba(255, 246, 224, .55)" : "rgba(242, 183, 196, .45)";
            gameCtx.fillRect(x, y, 3, 3);

        }
        for (let index = 0; index < 3; index++) {

            const x = 460 + index * 290 + Math.sin(windTime * 1.4 + index) * 18;
            const y = 320 + index * 76 + Math.cos(windTime * 1.8 + index) * 9;
            gameCtx.fillStyle = "rgba(255, 226, 118, .58)";
            gameCtx.fillRect(x - 3, y, 3, 2);
            gameCtx.fillRect(x + 2, y, 3, 2);

        }
        // Soft highlights suggest swaying flowers, the photo banner and tent.
        gameCtx.fillStyle = `rgba(255, 248, 223, ${0.08 + Math.sin(windTime * 1.2) * .025})`;
        gameCtx.fillRect(1130, 195, 150, 4);
        gameCtx.fillRect(1040, 495, 184, 3);
        return;

    }

    if (currentChapter === "coles") return;

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

        // Tiny landmark details: station clock, shrine bird, convenience sign
        // and 一点张 lantern. They remain restrained overlays on the official art.
        gameCtx.strokeStyle = "rgba(51, 44, 35, .82)";
        gameCtx.lineWidth = 2;
        gameCtx.beginPath();
        gameCtx.moveTo(1024, 237);
        gameCtx.lineTo(1024 + Math.sin(windTime * .12) * 8, 237 - Math.cos(windTime * .12) * 8);
        gameCtx.moveTo(1024, 237);
        gameCtx.lineTo(1024 + Math.sin(windTime * .01) * 5, 237 - Math.cos(windTime * .01) * 5);
        gameCtx.stroke();
        const flicker = .16 + Math.max(0, Math.sin(windTime * 5.3)) * .12;
        gameCtx.fillStyle = `rgba(255, 232, 145, ${flicker})`;
        gameCtx.fillRect(150, 1434, 98, 5);
        gameCtx.fillStyle = `rgba(255, 185, 82, ${0.14 + Math.sin(windTime * 2.1) * .04})`;
        gameCtx.fillRect(515, 1538, 72, 7);
        const birdX = 1660 + Math.sin(windTime * .75) * 24;
        gameCtx.strokeStyle = "rgba(65, 61, 54, .58)";
        gameCtx.beginPath();
        gameCtx.moveTo(birdX - 4, 365);
        gameCtx.lineTo(birdX, 362);
        gameCtx.lineTo(birdX + 4, 365);
        gameCtx.stroke();

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
    const row = directionRows[player.renderDirection || player.direction] + animationOffset;

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
    const row = directionRows[le.renderDirection || le.direction] + (le.moving ? 4 : 0);

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
        const idleFrames = { blink: 1, tail: 2, ear: 3, sit: 1, stand: 0, stretch: 2, lookLeft: 0, lookRight: 0, lookPlayer: 0 };
        const frame = cat.moving ? Math.floor(cat.animationTime / 0.16) % 4 : (idleFrames[cat.behaviour] || 0);
        const row = directionRows[cat.direction] + animationOffset;
        const bob = cat.behaviour === "run"
            ? Math.sin(cat.animationTime * 12) * 2
            : (cat.behaviour === "stretch" ? Math.sin(cat.animationTime * 5) * 1.5 : 0);
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
        const chapter = phase === "chapterOne" ? CHAPTERS.tokyo : CHAPTERS.sydney;
        drawChapterCard(
            phase === "chapterOne" ? chapter.endingLabel : chapter.introLabel,
            phase === "chapterOne" ? chapter.titleZh : chapter.titleEn,
            phase === "chapterOne" ? chapter.endingMessage.replace("\n", " ") : chapter.titleZh
        );
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

    // Use the clean harbour scene for the opening tableau.  The earlier
    // reference image contains pre-rendered people, which would not match the
    // canonical sprites used everywhere else in the game.
    const lookoutBackground = sydneyExplorationMap.complete && sydneyExplorationMap.naturalWidth
        ? sydneyExplorationMap
        : sydneyMap;

    if (lookoutBackground.complete && lookoutBackground.naturalWidth) {

        const sourceHeight = lookoutBackground.naturalHeight;
        const sourceWidth = lookoutBackground.naturalWidth;

        if (gameViewportState.isMobile && gameViewportState.portrait) {

            // iPhone portrait keeps the complete harbour panorama in the
            // upper scene frame, without cutting the Opera House or bridge.
            const scale = (gameViewportState.width - 12) / sourceWidth;
            const drawWidth = Math.round(sourceWidth * scale);
            const drawHeight = Math.round(sourceHeight * scale);
            const drawY = Math.max(20, Math.round(gameViewportState.height * 0.055));
            const drawX = Math.round((gameViewportState.width - drawWidth) / 2);
            sceneFrame = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };

            gameCtx.fillStyle = "#071225";
            gameCtx.fillRect(drawX - 4, drawY - 8, drawWidth + 8, drawHeight + 16);
            gameCtx.drawImage(
                lookoutBackground,
                0, 0, sourceWidth, sourceHeight,
                drawX, drawY, drawWidth, drawHeight
            );
            gameCtx.strokeStyle = "rgba(221, 174, 94, .82)";
            gameCtx.lineWidth = 2;
            gameCtx.strokeRect(drawX - 3, drawY - 7, drawWidth + 6, drawHeight + 14);

        } else {

            const scale = Math.min(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight);
            const drawWidth = sourceWidth * scale;
            const drawHeight = sourceHeight * scale;
            const drawX = (gameViewportState.width - drawWidth) / 2;
            const drawY = (gameViewportState.height - drawHeight) / 2;
            sceneFrame = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
            gameCtx.drawImage(lookoutBackground, 0, 0, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);

        }

    }

    drawSydneyLookoutParty(sceneFrame);

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

function drawSydneyLookoutParty(sceneFrame) {

    const groundY = sceneFrame.y + sceneFrame.height * 0.93;
    const personHeight = Math.round(Math.min(sceneFrame.height * 0.34, 132));
    const personWidth = Math.round(personHeight * 2 / 3);
    const catHeight = Math.round(personHeight * 0.7);
    const catWidth = Math.round(catHeight * 2 / 3);
    const positions = [0.40, 0.50, 0.60, 0.69].map(ratio => sceneFrame.x + sceneFrame.width * ratio);

    const drawSprite = (sprite, fallback, x, width, height) => {

        const image = sprite.complete && sprite.naturalWidth ? sprite : fallback;
        if (!image?.complete || !image.naturalWidth) return;
        gameCtx.drawImage(image, 0, 48, 32, 48, Math.round(x - width / 2), Math.round(groundY - height), width, height);

    };

    // Row 1 is the upward/back-facing idle pose, matching a group looking out
    // across the harbour.  All four are drawn from assets/characters.
    drawSprite(playerSprite, playerFallbackSprite, positions[0], personWidth, personHeight);
    drawSprite(leSprite, leFallbackSprite, positions[1], personWidth, personHeight);
    drawSprite(catSpriteSheets.tuotuo, null, positions[2], catWidth, catHeight);
    drawSprite(catSpriteSheets.dazhi, null, positions[3], catWidth, catHeight);

}

function drawStoryCGAmbience(config, frame) {

    if (!frame || storyCGOverlay.id !== "sydneyWatchingTheSea") return;
    const progress = windTime;
    gameCtx.save();
    gameCtx.globalAlpha = storyCGOverlay.opacity;
    gameCtx.strokeStyle = "rgba(224, 244, 255, .28)";
    gameCtx.lineWidth = Math.max(1, Math.round(frame.width / 700));
    for (let index = 0; index < 3; index++) {

        const y = frame.y + frame.height * (.49 + index * .025);
        const x = frame.x + ((progress * (9 + index) + index * 140) % Math.max(1, frame.width));
        gameCtx.beginPath();
        gameCtx.moveTo(x - 26, y);
        gameCtx.lineTo(x + 26, y);
        gameCtx.stroke();

    }
    gameCtx.fillStyle = "rgba(239, 247, 251, .07)";
    gameCtx.fillRect(frame.x + ((progress * 4) % frame.width) - 130, frame.y + frame.height * .12, 150, 7);
    gameCtx.strokeStyle = "rgba(88, 126, 57, .25)";
    for (let index = 0; index < 8; index++) {

        const x = frame.x + frame.width * (.08 + index * .105);
        const y = frame.y + frame.height * .69;
        gameCtx.beginPath();
        gameCtx.moveTo(x, y);
        gameCtx.lineTo(x + Math.sin(progress * 1.8 + index) * 3, y - 7);
        gameCtx.stroke();

    }
    gameCtx.restore();

}

function drawMemoryAlbumTransition(frame) {

    if (!frame || !storyCGOverlay.config?.memoryAlbum || storyCGOverlay.phase !== "fadeIn") return;
    const remaining = 1 - storyCGOverlay.opacity;
    gameCtx.save();
    if (storyCGOverlay.albumMode === "open") {

        const coverWidth = Math.ceil(frame.width * .5 * remaining);
        gameCtx.fillStyle = "#07182c";
        gameCtx.fillRect(frame.x, frame.y, coverWidth, frame.height);
        gameCtx.fillRect(frame.x + frame.width - coverWidth, frame.y, coverWidth, frame.height);
        gameCtx.strokeStyle = "#d8aa54";
        gameCtx.lineWidth = 3;
        gameCtx.beginPath();
        gameCtx.moveTo(frame.x + coverWidth, frame.y);
        gameCtx.lineTo(frame.x + coverWidth, frame.y + frame.height);
        gameCtx.moveTo(frame.x + frame.width - coverWidth, frame.y);
        gameCtx.lineTo(frame.x + frame.width - coverWidth, frame.y + frame.height);
        gameCtx.stroke();

    } else {

        const foldWidth = Math.ceil(frame.width * remaining);
        const foldX = frame.x + frame.width - foldWidth;
        const fold = gameCtx.createLinearGradient(foldX, 0, frame.x + frame.width, 0);
        fold.addColorStop(0, "rgba(247, 226, 181, .18)");
        fold.addColorStop(.5, "rgba(9, 27, 48, .88)");
        fold.addColorStop(1, "rgba(216, 170, 84, .38)");
        gameCtx.fillStyle = fold;
        gameCtx.fillRect(foldX, frame.y, foldWidth, frame.height);

    }
    gameCtx.restore();

}

function drawStoryCG() {

    gameCtx.fillStyle = storyCGOverlay.config?.fadeFromWhite ? "#fff8e7" : "#02070d";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);

    const config = storyCGOverlay.config;
    const image = config?.image;
    if (config?.fallbackPlaceholder && (!image?.complete || !image.naturalWidth)) {

        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.fillStyle = "#08172d";
        gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
        gameCtx.strokeStyle = "#d8aa54";
        gameCtx.lineWidth = 3;
        gameCtx.strokeRect(22, 22, gameViewportState.width - 44, gameViewportState.height - 44);
        gameCtx.fillStyle = "#f4cf7a";
        gameCtx.textAlign = "center";
        gameCtx.font = "28px Fusion Pixel, monospace";
        gameCtx.fillText(config.placeholderTitle || "Story CG", gameViewportState.width / 2, gameViewportState.height / 2 - 16);
        gameCtx.font = "18px Fusion Pixel, monospace";
        gameCtx.fillText(config.placeholderSubtitle || "", gameViewportState.width / 2, gameViewportState.height / 2 + 24);
        if (storyCGOverlay.inputReady) {

            gameCtx.font = "15px Fusion Pixel, monospace";
            gameCtx.fillText(gameViewportState.isMobile ? "点击 A 继续" : "按 E 继续", gameViewportState.width / 2, gameViewportState.height - 62);

        }
        gameCtx.textAlign = "left";
        gameCtx.globalAlpha = 1;
        return;

    }
    if (!image?.complete || !image.naturalWidth) return;

    const sourceWidth = image.naturalWidth;
    const sourceHeight = Math.min(config.sourceHeight || image.naturalHeight, image.naturalHeight);
    let storyFrame = null;

    if (gameViewportState.isMobile && gameViewportState.portrait) {

        // Every Story CG uses the same iPhone portrait cinema layout: contain
        // the complete approved artwork in the upper visual panel, leave a
        // navy gap for the live dialogue below, and never cover-crop a memory.
        const panelTop = 72;
        const panelBottom = Math.min(468, Math.round(gameViewportState.height * 0.49));
        const panelWidth = gameViewportState.width - 28;
        const panelHeight = panelBottom - panelTop;
        const scale = Math.min(panelWidth / sourceWidth, panelHeight / sourceHeight);
        const drawWidth = Math.round(sourceWidth * scale);
        const drawHeight = Math.round(sourceHeight * scale);
        const drawX = Math.round((gameViewportState.width - drawWidth) / 2);
        const drawY = Math.round(panelTop + (panelHeight - drawHeight) / 2);

        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.drawImage(image, 0, 0, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
        gameCtx.strokeStyle = "rgba(216, 170, 84, .88)";
        gameCtx.lineWidth = 2;
        gameCtx.strokeRect(drawX - 1, drawY - 1, drawWidth + 2, drawHeight + 2);
        storyFrame = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };

    } else {

        // Desktop and landscape preserve each approved CG's full composition.
        const scale = Math.min(gameViewportState.width / sourceWidth, gameViewportState.height / sourceHeight);
        const drawWidth = Math.round(sourceWidth * scale);
        const drawHeight = Math.round(sourceHeight * scale);
        const drawX = Math.round((gameViewportState.width - drawWidth) / 2);
        const drawY = Math.max(0, Math.round((gameViewportState.height - drawHeight) / 2));
        gameCtx.globalAlpha = storyCGOverlay.opacity;
        gameCtx.drawImage(
            image,
            0, 0, sourceWidth, sourceHeight,
            drawX,
            drawY,
            drawWidth, drawHeight
        );
        storyFrame = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };

    }

    gameCtx.globalAlpha = 1;

    drawStoryCGAmbience(config, storyFrame);
    drawMemoryAlbumTransition(storyFrame);

    if (config.location && storyFrame) {

        drawStoryCGLocation(config.location, storyFrame);

    }

    if (storyCGOverlay.inputReady) {

        gameCtx.fillStyle = "rgba(5, 17, 33, .76)";
        gameCtx.fillRect(gameViewportState.width / 2 - 82, gameViewportState.height - 58, 164, 30);
        gameCtx.strokeStyle = "#d8aa54";
        gameCtx.lineWidth = 2;
        gameCtx.strokeRect(gameViewportState.width / 2 - 82, gameViewportState.height - 58, 164, 30);
        gameCtx.fillStyle = "#fff2cc";
        gameCtx.textAlign = "center";
        gameCtx.font = "14px Fusion Pixel, monospace";
        gameCtx.fillText(gameViewportState.isMobile ? "点击 A 继续" : "按 E 继续", gameViewportState.width / 2, gameViewportState.height - 37);
        gameCtx.textAlign = "left";

    }

}

function drawStoryCGLocation(location, frame) {

    const fontSize = Math.max(13, Math.min(22, Math.round(frame.width * 0.035)));
    const paddingX = Math.max(10, Math.round(fontSize * 0.7));
    const paddingY = Math.max(7, Math.round(fontSize * 0.55));

    gameCtx.save();
    gameCtx.font = `${fontSize}px Fusion Pixel, monospace`;
    const labelWidth = Math.min(frame.width - 16, Math.ceil(gameCtx.measureText(location).width) + paddingX * 2);
    const labelHeight = fontSize + paddingY * 2;
    const labelX = frame.x + 8;
    const labelY = frame.y + 8;

    gameCtx.fillStyle = "rgba(5, 17, 33, .94)";
    gameCtx.fillRect(labelX, labelY, labelWidth, labelHeight);
    gameCtx.strokeStyle = "#d8aa54";
    gameCtx.lineWidth = 2;
    gameCtx.strokeRect(labelX, labelY, labelWidth, labelHeight);
    gameCtx.fillStyle = "#fff2cc";
    gameCtx.textAlign = "left";
    gameCtx.textBaseline = "middle";
    gameCtx.fillText(location, labelX + paddingX, labelY + labelHeight / 2 + 1);
    gameCtx.restore();

}

function drawColesAmbientShoppers() {

    if (currentChapter !== "coles") return;
    colesAmbientShoppers.forEach((shopper, index) => {

        const sway = Math.sin(windTime * 4 + index) * 1.5;
        gameCtx.fillStyle = "rgba(17, 24, 32, .2)";
        gameCtx.fillRect(shopper.x - 7, shopper.y + 19, 16, 4);
        gameCtx.fillStyle = shopper.color;
        gameCtx.fillRect(shopper.x - 6, shopper.y + 5 + sway, 13, 18);
        gameCtx.fillStyle = "#c99372";
        gameCtx.fillRect(shopper.x - 4, shopper.y + sway, 9, 8);

    });

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

    const chapter = activeChapterIntro || CHAPTERS.longnan;
    const previousChapter = CHAPTERS.sydney;

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
    gameCtx.fillText(previousChapter.endingLabel, gameViewportState.width / 2, gameViewportState.height * 0.32);
    gameCtx.font = "34px Fusion Pixel, monospace";
    gameCtx.fillText(previousChapter.titleZh, gameViewportState.width / 2, gameViewportState.height * 0.41);
    gameCtx.font = "20px Fusion Pixel, monospace";
    gameCtx.fillText(previousChapter.endingMessage.replace("\n", " "), gameViewportState.width / 2, gameViewportState.height * 0.48);
    if (longnanTitleTimer > 2) {

        gameCtx.font = "24px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.introLabel, gameViewportState.width / 2, gameViewportState.height * 0.61);
        gameCtx.font = "34px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.titleZh, gameViewportState.width / 2, gameViewportState.height * 0.70);
        gameCtx.font = "16px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.theme, gameViewportState.width / 2, gameViewportState.height * 0.76);

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

    const chapter = activeChapterComplete || CHAPTERS.longnan;

    gameCtx.fillStyle = "#07152a";
    gameCtx.fillRect(0, 0, gameViewportState.width, gameViewportState.height);
    gameCtx.textAlign = "center";
    gameCtx.fillStyle = "#f4cf7a";
    gameCtx.font = "26px Fusion Pixel, monospace";
    gameCtx.fillText(chapter.endingLabel || "Chapter Completed", gameViewportState.width / 2, gameViewportState.height * 0.40);
    gameCtx.font = "34px Fusion Pixel, monospace";
    gameCtx.fillText(chapter.titleEn, gameViewportState.width / 2, gameViewportState.height * 0.49);
    gameCtx.font = "24px Fusion Pixel, monospace";
    gameCtx.fillText(chapter.endingMessage.replace("\n", " "), gameViewportState.width / 2, gameViewportState.height * 0.57);
    gameCtx.textAlign = "left";

}

function drawWeddingIntro() {

    const chapter = CHAPTERS.wedding;

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
        gameCtx.fillText(chapter.introLabel, gameViewportState.width / 2, gameViewportState.height * 0.34);
        gameCtx.font = "34px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.titleEn, gameViewportState.width / 2, gameViewportState.height * 0.43);
        gameCtx.font = "21px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.titleZh, gameViewportState.width / 2, gameViewportState.height * 0.50);
        gameCtx.font = "18px Fusion Pixel, monospace";
        gameCtx.fillText(chapter.theme, gameViewportState.width / 2, gameViewportState.height * 0.56);
        const [firstLine, secondLine] = chapter.introMessage.split("\n");
        gameCtx.fillText(firstLine, gameViewportState.width / 2, gameViewportState.height * 0.66);
        gameCtx.fillText(secondLine || "", gameViewportState.width / 2, gameViewportState.height * 0.71);
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

    // Centre the complete portrait Tokyo map during the opening overview.
    // The offset naturally reaches zero as the camera begins its close-in
    // journey to Mori on Sakura Avenue.
    const introWorldOffsetY = currentChapter === "tokyo"
        && gameViewportState.isMobile
        && gameViewportState.portrait
        && cameraIntro.active
        ? Math.max(0, (gameViewportState.height - getWorldHeight() * camera.zoom) / 2) / camera.zoom
        : 0;

    gameCtx.save();
    gameCtx.scale(camera.zoom, camera.zoom);
    gameCtx.translate(-Math.round(camera.x), -Math.round(camera.y) + introWorldOffsetY);

    if (currentChapter === "coles") {

        drawColesMap();

    } else if (currentChapter === "longnanLookout" && longnanLookoutPixelMap.complete && longnanLookoutPixelMap.naturalWidth) {

        gameCtx.drawImage(longnanLookoutPixelMap, 0, 0, LONGNAN_LOOKOUT_WIDTH, LONGNAN_LOOKOUT_HEIGHT);

    } else if (currentChapter === "longnanTown" && longnanChildhoodTownPixelMap.complete && longnanChildhoodTownPixelMap.naturalWidth) {

        gameCtx.drawImage(longnanChildhoodTownPixelMap, 0, 0, LONGNAN_TOWN_WIDTH, LONGNAN_TOWN_HEIGHT);

    } else if (currentChapter === "weddingXiaoyuan" && weddingXiaoyuanMap.complete && weddingXiaoyuanMap.naturalWidth) {

        gameCtx.drawImage(weddingXiaoyuanMap, 0, 0, WEDDING_XIAOYUAN_WIDTH, WEDDING_XIAOYUAN_HEIGHT);

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
    if (currentChapter === "coles") drawColesAmbientShoppers();
    if (currentChapter === "weddingXiaoyuan") drawWeddingGatewayVisuals();

    const showOpeningParty = !(
        currentChapter === "tokyo"
        && gameViewportState.isMobile
        && gameViewportState.portrait
        && cameraIntro.active
        && cameraIntro.elapsed <= cameraIntro.overviewDuration
    );

    if (showOpeningParty) {

        [
            { y: player.y + player.height, draw: drawPlayer },
            { y: le.y + le.height, draw: drawLe },
            ...cats.filter(cat => hiddenCatEvent.discovered || !cat.following).map(cat => ({ y: cat.y + cat.height, draw: () => drawCat(cat) }))
        ].sort((first, second) => first.y - second.y).forEach(character => character.draw());

    }

    drawInteractionPrompt();

    gameCtx.restore();

    drawChapterTransitionOverlay();
    drawSceneTransitionOverlay();
    drawWeddingGatewayOverlays();

}

function updatePlayer(deltaTime) {

    if (chapterCardState.active || cameraIntro.active || meetingState.dialogueOpen || characterPanelOpen || gameplayPauseRemaining || chapterTransition.active || sceneTransition.active || storyCGOverlay.active || ![GameState.TOKYO, GameState.SYDNEY, GameState.COLES, GameState.LONGNAN_LOOKOUT, GameState.LONGNAN_TOWN, GameState.WEDDING_XIAOYUAN].includes(gameState)) {

        player.moving = false;
        player.velocityX = 0;
        player.velocityY = 0;
        return;

    }

    let horizontal = 0;
    let vertical = 0;

    if (pressedKeys.has("KeyA") || pressedKeys.has("ArrowLeft")) horizontal -= 1;
    if (pressedKeys.has("KeyD") || pressedKeys.has("ArrowRight")) horizontal += 1;
    if (pressedKeys.has("KeyW") || pressedKeys.has("ArrowUp")) vertical -= 1;
    if (pressedKeys.has("KeyS") || pressedKeys.has("ArrowDown")) vertical += 1;

    if (horizontal && vertical) {

        horizontal *= Math.SQRT1_2;
        vertical *= Math.SQRT1_2;

    }

    const isSprinting = pressedKeys.has("ShiftLeft") || pressedKeys.has("ShiftRight");
    const movementSpeed = player.speed * (isSprinting ? player.sprintMultiplier : 1);
    const targetVelocityX = horizontal * movementSpeed;
    const targetVelocityY = vertical * movementSpeed;
    const easingAmount = 1 - Math.exp(-deltaTime / 0.08);

    player.velocityX += (targetVelocityX - player.velocityX) * easingAmount;
    player.velocityY += (targetVelocityY - player.velocityY) * easingAmount;
    if (!horizontal && Math.abs(player.velocityX) < 1) player.velocityX = 0;
    if (!vertical && Math.abs(player.velocityY) < 1) player.velocityY = 0;

    player.moving = Math.hypot(player.velocityX, player.velocityY) > 3;
    if (horizontal || vertical) faceMovementDirection(player, horizontal, vertical);

    const destinationX = Math.max(
        0,
        Math.min(player.x + player.velocityX * deltaTime, getWorldWidth() - player.width)
    );
    const destinationY = Math.max(
        0,
        Math.min(player.y + player.velocityY * deltaTime, getWorldHeight() - player.height)
    );

    const canMovePlayerTo = (x, y) => currentChapter === "sydney"
        ? x >= sydneyLookoutWalkableZone.x
            && x + player.width <= sydneyLookoutWalkableZone.x + sydneyLookoutWalkableZone.width
            && y >= sydneyLookoutWalkableZone.y
            && y + player.height <= sydneyLookoutWalkableZone.y + sydneyLookoutWalkableZone.height
        : (exteriorMap.complete && exteriorMap.naturalWidth ? canMoveOnOfficialMap(x, y) : canMoveTo(x, y));

    if (canMovePlayerTo(destinationX, destinationY)) {

        player.x = destinationX;
        player.y = destinationY;

    } else {

        if (canMovePlayerTo(destinationX, player.y)) player.x = destinationX;
        else player.velocityX = 0;
        if (canMovePlayerTo(player.x, destinationY)) player.y = destinationY;
        else player.velocityY = 0;

    }

}

let previousGameTime = 0;

function gameLoop(timestamp) {

    const deltaTime = Math.min((timestamp - previousGameTime) / 1000, 0.1);
    previousGameTime = timestamp;

    if (gameplayPauseRemaining > 0) gameplayPauseRemaining = Math.max(0, gameplayPauseRemaining - deltaTime);

    updateChapterCard(deltaTime);
    updateChapterTransition(deltaTime);
    updateSceneTransition(deltaTime);
    updateWeddingGatewaySequence(deltaTime);
    updateStoryCG(deltaTime);
    if (weddingGatewayNoticeRemaining > 0) weddingGatewayNoticeRemaining = Math.max(0, weddingGatewayNoticeRemaining - deltaTime);
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
        if (longnanSequenceTimer >= 3.2) {

            storyFlags.weddingIntroShown = true;
            enterWeddingXiaoyuan();

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
        updateSydneyNewYearSnackTrigger();
        updateNearbySceneExit();
        updateNearbyPiaozi();
        updateNearbyColesInspectable();
        updateNearbyLongnan();
        updateNearbyWedding();

    }
    updateCatCompanions(deltaTime);
    updateDialogueTypewriter(deltaTime);
    updateInteractionPromptFade(deltaTime);
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
    beginGameplay();
    playOpeningPrologue();

});

characterMenuButton.addEventListener("pointerdown", event => {

    event.preventDefault();
    toggleCharacterPanel();

});

function triggerMobileAction() {

    if (chapterCardState.active) {

        requestChapterCardSkip();
        return;

    }

    if (gameState === GameState.WEDDING_INVITATION) {

        continueWeddingInvitation();
        return;

    }

    if (meetingState.dialogueOpen) {

        advanceMeetingDialogue();
        return;

    }

    if (!gameStarted || characterPanelOpen || cameraIntro.active) return;

    if (nearbyInteractable || nearbyCatEvent || nearbyStation || nearbySceneExit || piaoziState.nearby || nearbyColesInspectable || nearbyLongnanInteraction || nearbyLongnanExit || nearbyLongnanMemoryAlbum || nearbyWeddingInteraction) tryInteraction();

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

        if (!gameStarted || chapterCardState.active || meetingState.dialogueOpen || characterPanelOpen || cameraIntro.active) return;

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

    if (chapterCardState.active) {

        if (["Enter", "Space", "KeyE"].includes(event.code)) requestChapterCardSkip();
        event.preventDefault();
        return;

    }

    if (gameState === GameState.WEDDING_INVITATION) {

        if (["Enter", "Space", "KeyE"].includes(event.code)) continueWeddingInvitation();
        event.preventDefault();
        return;

    }

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

    if ((event.code === "KeyE" || event.code === "Enter" || event.code === "Space") && (nearbyInteractable || nearbyCatEvent || nearbyStation || nearbySceneExit || piaoziState.nearby || nearbyColesInspectable || nearbyLongnanInteraction || nearbyLongnanExit || nearbyLongnanMemoryAlbum || nearbyWeddingInteraction)) {

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
chapterCard.addEventListener("click", requestChapterCardSkip);
gameCanvas.addEventListener("click", () => {

    if (gameState === GameState.WEDDING_INVITATION) continueWeddingInvitation();
    else if (!chapterCardState.active) tryInteraction();

});

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
