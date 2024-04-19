import style from "./pixieStyle.js";
document.write('<script src="pixiStyle.js"></script>');

let time = document.querySelector(".score");
let play = document.querySelector(".play");
let playing = false;
let timeValue;
const Application = PIXI.Application;

const app = new Application({
  width: 960,
  height: 919,

  backgroundColor: 0x6495ed,
  transparent: false,
  antialias: true,
});

const timeFlow = function () {
  time.textContent++;
};

document.querySelector(".midSplit").appendChild(app.view);

const sprite = PIXI.Sprite.from("tetris.png");
//adding tetrominos
//app.stage.addChild(sprite);

const Tetris = new PIXI.Text("TETRIS", style);
Tetris.x = app.screen.width / 3 + 30;
app.stage.addChild(Tetris);

play.addEventListener("click", function () {
  if (!playing) {
    timeValue = setInterval(timeFlow, 1000);
    playing = true;
    document.querySelector(".play").textContent = "PAUSE";
  } else {
    playing = false;
    clearInterval(timeValue);
    document.querySelector(".play").textContent = "PLAY";
  }
});
