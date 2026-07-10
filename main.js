const startButton = document.getElementById("startButton");

const dialog = document.getElementById("dialog");

const closeDialog = document.getElementById("closeDialog");

startButton.addEventListener("click",()=>{

    dialog.style.display="flex";

});

closeDialog.addEventListener("click",()=>{

    dialog.style.display="none";

});
