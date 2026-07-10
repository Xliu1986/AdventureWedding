const canvas = document.getElementById("background");

const ctx = canvas.getContext("2d");

let w;
let h;

function resize(){

    w = canvas.width = window.innerWidth;

    h = canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



/* ---------- Stars ---------- */

const stars=[];

for(let i=0;i<120;i++){

    stars.push({

        x:Math.random()*w,

        y:Math.random()*h,

        r:Math.random()*2,

        a:Math.random(),

        speed:0.01+Math.random()*0.02

    });

}



/* ---------- Sakura ---------- */

const petals = [];

for (let i = 0; i < 60; i++) {

    petals.push({

        x: Math.random() * w,

        y: Math.random() * h,

        size: 8 + Math.random() * 8,

        speed: 0.5 + Math.random() * 1.2,

        swing: Math.random() * Math.PI * 2,

        rotate: Math.random() * Math.PI,

        rotateSpeed: 0.01 + Math.random() * 0.02

    });

}

function drawPetals() {

    petals.forEach(p => {

        p.y += p.speed;

        p.swing += 0.02;

        p.rotate += p.rotateSpeed;

        p.x += Math.sin(p.swing) * 0.6;

        if (p.y > h + 30) {

            p.y = -30;

            p.x = Math.random() * w;

        }

        ctx.save();

        ctx.translate(p.x, p.y);

        ctx.rotate(p.rotate);

        ctx.fillStyle = "#ffd7ea";

        ctx.beginPath();

        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);

        ctx.fill();

        ctx.restore();

    });

}

    requestAnimationFrame(animate);

}

animate();



/* ---------- UI ---------- */

const startButton=document.getElementById("startButton");

const dialog=document.getElementById("dialog");

const closeDialog=document.getElementById("closeDialog");

startButton.onclick=()=>{

    dialog.style.display="flex";

}

closeDialog.onclick=()=>{

    dialog.style.display="none";

}
