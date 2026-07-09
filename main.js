

const startButton = document.getElementById("startButton");

startButton.addEventListener("click", () => {

    startButton.innerText = "LOADING...";

    startButton.disabled = true;

    setTimeout(() => {

        alert(
`欢迎来到《冒険の結婚式》

森 × 乐

第一章将在下一版本开放。

谢谢你陪伴我们，
走进这段故事。`
        );

        startButton.innerText = "PRESS START";

        startButton.disabled = false;

    },1000);

});
