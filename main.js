/* ======================================
   AdventureWedding
   Version 0.3
   Part 1 / 2
====================================== */

const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

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

const closeDialog = document.getElementById("closeDialog");

startButton.addEventListener("click",()=>{

    dialog.classList.remove("hidden");

});

closeDialog.addEventListener("click",()=>{

    dialog.classList.add("hidden");

});

/* ===========================
   Rebuild on Resize
=========================== */

window.addEventListener("resize",()=>{

    resizeCanvas();

    createStars();

    createPetals();

});