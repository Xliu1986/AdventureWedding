/* ======================================
   AdventureWedding
   Version 0.5.3
====================================== */

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const gameCanvas = document.getElementById("gameCanvas");
const gameCtx = gameCanvas.getContext("2d");

let width = 0;
let height = 0;

function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

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
    ROAD: 0,
    GRASS: 1,
    SIDEWALK: 2,
    BUILDING: 3,
    TREE: 4
};

const tokyoMap = [
    [3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 2, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 4, 3, 3, 1, 4, 3, 3, 2, 0, 0, 2, 3, 3, 4, 3, 1, 3, 4, 3],
    [3, 3, 1, 4, 3, 3, 4, 1, 2, 0, 0, 2, 3, 1, 3, 4, 3, 3, 1, 3],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 1, 4, 3, 3, 4, 1, 3, 2, 0, 0, 2, 3, 3, 4, 1, 3, 4, 3, 3],
    [3, 3, 1, 4, 3, 3, 4, 1, 2, 0, 0, 2, 1, 4, 3, 3, 1, 3, 4, 3],
    [3, 4, 3, 1, 4, 3, 3, 4, 2, 0, 0, 2, 3, 1, 4, 3, 3, 4, 1, 3],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 4, 1, 3, 4, 3, 1, 2, 0, 0, 2, 3, 4, 1, 3, 3, 1, 4, 3]
];

const tileColors = {
    [Tile.ROAD]: "#3d3d43",
    [Tile.GRASS]: "#54764e",
    [Tile.SIDEWALK]: "#9b9a96",
    [Tile.BUILDING]: "#665d64",
    [Tile.TREE]: "#2e6748"
};

function isBlockedTile(x, y) {

    const column = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    const tile = tokyoMap[row]?.[column];

    return tile === Tile.BUILDING || tile === Tile.TREE;

}

function canMoveTo(x, y) {

    const right = x + player.width - 1;
    const bottom = y + player.height - 1;

    return !isBlockedTile(x, y)
        && !isBlockedTile(right, y)
        && !isBlockedTile(x, bottom)
        && !isBlockedTile(right, bottom);

}

function spawnPlayer() {

    player.x = (gameCanvas.width - player.width) / 2;
    player.y = (gameCanvas.height - player.height) / 2;
    player.moving = false;

}

function drawGame() {

    gameCtx.fillStyle = tileColors[Tile.ROAD];
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    tokyoMap.forEach((row, rowIndex) => {

        row.forEach((tile, columnIndex) => {

            gameCtx.fillStyle = tileColors[tile];
            gameCtx.fillRect(
                columnIndex * TILE_SIZE,
                rowIndex * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE
            );

        });

    });

    gameCtx.fillStyle = "#ffffff";
    gameCtx.fillRect(player.x, player.y, player.width, player.height);

}

function updatePlayer(deltaTime) {

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
        Math.min(player.x + horizontal * movementSpeed * deltaTime, gameCanvas.width - player.width)
    );
    const destinationY = Math.max(
        0,
        Math.min(player.y + vertical * movementSpeed * deltaTime, gameCanvas.height - player.height)
    );

    if (canMoveTo(destinationX, destinationY)) {

        player.x = destinationX;
        player.y = destinationY;

    }

}

let previousGameTime = 0;

function gameLoop(timestamp) {

    const deltaTime = Math.min((timestamp - previousGameTime) / 1000, 0.1);
    previousGameTime = timestamp;

    updatePlayer(deltaTime);
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
    previousGameTime = performance.now();
    requestAnimationFrame(gameLoop);

});

window.addEventListener("keydown", event => {

    if (!gameStarted) return;

    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"].includes(event.code)) {

        event.preventDefault();
        pressedKeys.add(event.code);

        if (directionByKey[event.code]) {

            player.direction = directionByKey[event.code];

        }

    }

});

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
