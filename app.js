import { style } from "./pixieStyle.js";

const Application = PIXI.Application;
export const app = new Application({
  width: 960,
  height: 919,
  backgroundColor: 0x6495ed,
  transparent: false,
  antialias: true,
});
document.querySelector(".midSplit").appendChild(app.view);
