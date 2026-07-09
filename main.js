/* ======================================
   AdventureWedding
   Version 0.2.0
====================================== */

const startButton = document.getElementById("startButton");

const dialog = document.createElement("div");

dialog.id = "dialog";

dialog.innerHTML = `
<div class="dialogBox">

<h2>欢迎来到《冒険の結婚式》</h2>

<p>

这是森与乐的故事。

<br><br>

第一章：

东京

<br><br>

开发进行中……

</p>

<button id="closeDialog">

开始旅程

</button>

</div>
`;

document.body.appendChild(dialog);

dialog.style.display="none";

startButton.addEventListener("click",()=>{

    dialog.style.display="flex";

});

document.addEventListener("click",(e)=>{

    if(e.target.id==="closeDialog"){

        dialog.style.display="none";

    }

});
