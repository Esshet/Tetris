import { app } from "./app.js";
import { TetrominoShape } from "./tetrominoes/TetrominoShape.js";
import { Tetromino } from "./tetrominoes/Tetromino.js";

window.gridSizeX = 10; // Liczba kolumn
window.gridSizeY = 20; // Liczba rzędów
window.cellSize = 40; // Rozmiar każdego kwadratu

const gridWidth = window.gridSizeX * window.cellSize;
const gridHeight = window.gridSizeY * window.cellSize;

window.gridContainer = new PIXI.Container();
window.gridContainer.x = app.screen.width / 2 - gridWidth / 2;
window.gridContainer.y = app.screen.height / 2 - gridHeight / 2;
app.stage.addChild(window.gridContainer);

const texture = await PIXI.Assets.load("graphics/tetris.png");
const exampleSprite = new PIXI.Sprite(texture);
app.stage.addChild(exampleSprite);

const shapeI = [[1], [1], [1], [1]];
const shapeO = [
  [1, 1],
  [1, 1],
];
const shapeL = [[1], [1], [1, 1]];
const shapeT = [
  [0, 1, 0],
  [1, 1, 1],
];
const shapeZ = [[1], [1, 1], [0, 1]];

const TetrominoI = new TetrominoShape(1, shapeI, 0x40e0d0);
const TetrominoL = new TetrominoShape(2, shapeL, 0x00008b);
const TetrominoO = new TetrominoShape(3, shapeO, 0xffff00);
const TetrominoZ = new TetrominoShape(4, shapeZ, 0x008000);
const TetrominoT = new TetrominoShape(5, shapeT, 0x800080);
const grid = [];

// Tworzenie siatki o wymiarach gridSizeY x gridSizeX
for (let row = 0; row < gridSizeY; row++) {
  grid[row] = []; // Tworzenie nowego rzędu w siatce
  for (let col = 0; col < gridSizeX; col++) {
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0x000000);
    border.drawRect(0, 0, cellSize, cellSize);
    border.position.set(col * cellSize, row * cellSize);
    window.gridContainer.addChild(border);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x808080);
    graphics.drawRect(0, 0, cellSize, cellSize);
    graphics.position.set(col * cellSize, row * cellSize);
    window.gridContainer.addChild(graphics);

    // Dodanie komórki do siatki
    grid[row][col] = {
      x: col * cellSize,
      y: row * cellSize,
      border: border,
      graphics: graphics,
      fillColor: 0x808080,
      isEmpty: true,
    };
  }
}

//losowanie jakie tetromino sie pojawi
const getTetromino = function () {
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  console.log(randomNumber);
  switch (randomNumber) {
    case 1:
      return TetrominoI;
    case 2:
      return TetrominoL;
    case 3:
      return TetrominoO;
    case 4:
      return TetrominoZ;
    case 5:
      return TetrominoT;
  }
};
//generowanie wylosowanego tetromino
export const generateTetromino = function () {
  const tetromino = getTetromino();
  const tetromino2 = new Tetromino(
    grid,
    cellSize,
    tetromino.colour,
    tetromino.shape
  );
};
