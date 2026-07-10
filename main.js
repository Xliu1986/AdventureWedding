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

const sakura=[];

for(let i=0;i<35;i++){

    sakura.push({

        x:Math.random()*w,

        y:Math.random()*h,

        size:4+Math.random()*5,

        speed:0.4+Math.random()*0.8,

        drift:-0.5+Math.random()

    });

}



function drawSky(){

    ctx.fillStyle="#071321";

    ctx.fillRect(0,0,w,h);

}



function drawStars(){

    stars.forEach(star=>{

        star.a+=star.speed;

        let alpha=(Math.sin(star.a)+1)/2;

        ctx.beginPath();

        ctx.arc(star.x,star.y,star.r,0,Math.PI*2);

        ctx.fillStyle=`rgba(255,255,255,${alpha})`;

        ctx.fill();

    });

}



function drawPetals(){

    sakura.forEach(p=>{

        ctx.save();

        ctx.translate(p.x,p.y);

        ctx.rotate(p.y*0.01);

        ctx.fillStyle="#ffd9e6";

        ctx.beginPath();

        ctx.ellipse(

            0,

            0,

            p.size,

            p.size*0.6,

            0,

            0,

            Math.PI*2

        );

        ctx.fill();

        ctx.restore();

        p.y+=p.speed;

        p.x+=p.drift;

        if(p.y>h+20){

            p.y=-20;

            p.x=Math.random()*w;

        }

        if(p.x<-20){

            p.x=w+20;

        }

        if(p.x>w+20){

            p.x=-20;

        }

    });

}



function animate(){

    drawSky();

    drawStars();

    drawPetals();

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
