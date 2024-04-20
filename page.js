import { generateTetromino } from "./game.js";

let time = document.querySelector(".score");
let play = document.querySelector(".play");
let playing = false;
let timeValue;

const timeFlow = function () {
  time.textContent++;
};

play.addEventListener("click", function () {
  if (!playing) {
    timeValue = setInterval(timeFlow, 1000);
    playing = true;
    document.querySelector(".play").textContent = "PAUSE";
    generateTetromino();
  } else {
    playing = false;
    clearInterval(timeValue);
    document.querySelector(".play").textContent = "PLAY";
  }
});
