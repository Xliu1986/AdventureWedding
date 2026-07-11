/* ======================================
   AdventureWedding
   Version 0.5.1
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

            size: 6 + Math.random() * 8,

            speedY: 0.5 + Math.random(),

            angle: Math.random() * Math.PI * 2,

            rotate: Math.random() * Math.PI * 2,

            rotateSpeed: 0.01 + Math.random() * 0.02

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

    petals.forEach(p=>{

        p.y += p.speedY;

        p.angle += 0.02;

        p.rotate += p.rotateSpeed;

        p.x += Math.sin(p.angle) * 0.5;

        if(p.y > height + 30){

            p.y = -20;

            p.x = Math.random() * width;

        }

        ctx.save();

        ctx.translate(p.x,p.y);

        ctx.rotate(p.rotate);

        ctx.fillStyle = "#ffd7e8";

        ctx.beginPath();

        ctx.ellipse(

            0,

            0,

            p.size,

            p.size * 0.55,

            0,

            0,

            Math.PI*2

        );

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
    size: 24,
    x: 0,
    y: 0,
    speed: 240,
    sprintMultiplier: 1.8,
    direction: "Down"
};

const pressedKeys = new Set();

const directionByKey = {
    KeyW: "Up",
    ArrowUp: "Up",
    KeyS: "Down",
    ArrowDown: "Down",
    KeyA: "Left",
    ArrowLeft: "Left",
    KeyD: "Right",
    ArrowRight: "Right"
};

function spawnPlayer() {

    player.x = (gameCanvas.width - player.size) / 2;
    player.y = (gameCanvas.height - player.size) / 2;

}

function drawGame() {

    gameCtx.fillStyle = "#252525";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameCtx.strokeStyle = "#383838";
    gameCtx.lineWidth = 1;

    for (let x = 0; x <= gameCanvas.width; x += 64) {

        gameCtx.beginPath();
        gameCtx.moveTo(x, 0);
        gameCtx.lineTo(x, gameCanvas.height);
        gameCtx.stroke();

    }

    for (let y = 0; y <= gameCanvas.height; y += 64) {

        gameCtx.beginPath();
        gameCtx.moveTo(0, y);
        gameCtx.lineTo(gameCanvas.width, y);
        gameCtx.stroke();

    }

    gameCtx.fillStyle = "#ffffff";
    gameCtx.fillRect(player.x, player.y, player.size, player.size);

}

function updatePlayer(deltaTime) {

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

    player.x += horizontal * movementSpeed * deltaTime;
    player.y += vertical * movementSpeed * deltaTime;

    player.x = Math.max(0, Math.min(player.x, gameCanvas.width - player.size));
    player.y = Math.max(0, Math.min(player.y, gameCanvas.height - player.size));

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
