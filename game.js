import { app } from "./app.js";
const gridSizeX = 10; // Liczba kolumn
const gridSizeY = 20; // Liczba rzędów
const cellSize = 40; // Rozmiar każdego kwadratu

const gridWidth = gridSizeX * cellSize;
const gridHeight = gridSizeY * cellSize;

const gridContainer = new PIXI.Container();
gridContainer.x = app.screen.width / 2 - gridWidth / 2;
gridContainer.y = app.screen.height / 2 - gridHeight / 2;
app.stage.addChild(gridContainer);

class tetrominoShape {
  constructor(number, shape, colour) {
    this.number = number;
    this.shape = shape;
    this.colour = colour;
  }
}

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

const TetrominoI = new tetrominoShape(1, shapeI, 0x40e0d0);
const TetrominoL = new tetrominoShape(2, shapeL, 0x00008b);
const TetrominoO = new tetrominoShape(3, shapeO, 0xffff00);
const TetrominoZ = new tetrominoShape(4, shapeZ, 0x008000);
const TetrominoT = new tetrominoShape(5, shapeT, 0x800080);
const grid = [];

// Tworzenie siatki o wymiarach gridSizeY x gridSizeX
for (let row = 0; row < gridSizeY; row++) {
  grid[row] = []; // Tworzenie nowego rzędu w siatce
  for (let col = 0; col < gridSizeX; col++) {
    const border = new PIXI.Graphics();
    border.lineStyle(2, 0x000000);
    border.drawRect(0, 0, cellSize, cellSize);
    border.position.set(col * cellSize, row * cellSize);
    gridContainer.addChild(border);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x808080);
    graphics.drawRect(0, 0, cellSize, cellSize);
    graphics.position.set(col * cellSize, row * cellSize);
    gridContainer.addChild(graphics);

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

class Tetromino {
  constructor(grid, cellSize, color, shape) {
    this.grid = grid;
    this.cellSize = cellSize;
    this.color = color;
    this.shape = shape;
    this.x = Math.floor(gridSizeX / 2) - 1;
    this.y = 0;
    this.blocks = [];
    this.initShape();
  }

  initShape() {
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] !== 0) {
          const block = new PIXI.Graphics();
          block.beginFill(this.color);
          block.drawRect(0, 0, this.cellSize, this.cellSize);

          const border = new PIXI.Graphics();
          border.lineStyle(2, 0x000000);
          border.drawRect(0, 0, this.cellSize, this.cellSize);
          block.addChild(border);

          block.position.set(
            (this.x + col) * this.cellSize,
            (this.y + row) * this.cellSize
          );
          gridContainer.addChild(block);
          this.blocks.push(block);
        }
      }
    }
  }
}
//losowanie jakie tetromino sie pojawi
const getTetromino = function () {
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  console.log(randomNumber);
  switch (randomNumber) {
    case 1:
      return TetrominoI;
      break;
    case 2:
      return TetrominoL;
      break;
    case 3:
      return TetrominoO;
      break;
    case 4:
      return TetrominoZ;
      break;
    case 5:
      return TetrominoT;
      break;
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
