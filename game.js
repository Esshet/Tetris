import { app } from "./app.js";
const gridSizeX = 10; // Liczba kolumn
const gridSizeY = 20; // Liczba rzędów
const cellSize = 40; // Rozmiar każdego kwadratu
let currentTetromino;
let autoDropIntervalId;

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

const shapeI = [[1, 1, 1, 1]];
const shapeO = [
  [1, 1],
  [1, 1],
];
const shapeL = [
  [1, 0, 0],
  [1, 1, 1],
];
const shapeT = [
  [0, 1, 0],
  [1, 1, 1],
];
const shapeZ = [
  [1, 1, 0],
  [0, 1, 1],
];

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
    this.x = Math.floor(gridSizeX / 2) - Math.ceil(this.getMaxCol() / 2);
    this.y = 0;
    this.blocks = [];
    this.initShape();
  }

  initShape() {
    // Usuń tetromino z kontenera przed zainicjowaniem nowego kształtu
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

  moveLeft() {
    if (!this.checkCollision(-1, 0)) {
      this.x -= 1;
      this.updatePosition();
    }
  }

  moveRight() {
    if (!this.checkCollision(1, 0)) {
      this.x += 1;
      this.updatePosition();
    }
  }

  moveDown() {
    if (!this.checkCollision(0, 1)) {
      this.y += 1;
      this.updatePosition();
    } else {
      this.lockTetromino();
      generateTetromino();
    }
  }

  hardDrop() {
    while (!this.checkCollision(0, 1)) {
      this.y += 1;
    }
    this.updatePosition();
    this.lockTetromino();
    generateTetromino();
  }

  rotate() {
    const newShape = this.shape[0].map((_, colIndex) =>
      this.shape.map((row) => row[colIndex]).reverse()
    );
    if (!this.checkCollision(0, 0, newShape)) {
      this.shape = newShape;
      this.updatePosition();
    }
  }

  updatePosition() {
    this.blocks.forEach((block) => {
      gridContainer.removeChild(block);
    });
    this.blocks = [];
    this.initShape();
  }

  lockTetromino() {
    this.blocks.forEach((block) => {
      const col = Math.floor(block.x / this.cellSize);
      const row = Math.floor(block.y / this.cellSize);
      grid[row][col].fillColor = this.color;
      grid[row][col].isEmpty = false;
    });
    this.blocks = [];
    stopAutoDrop(); // Zatrzymanie automatycznego opadania
  }

  getMaxRow() {
    return this.shape.length;
  }

  getMaxCol() {
    let maxCol = 0;
    this.shape.forEach((row) => {
      maxCol = Math.max(maxCol, row.length);
    });
    return maxCol;
  }

  checkCollision(deltaX, deltaY, newShape = this.shape) {
    for (let row = 0; row < newShape.length; row++) {
      for (let col = 0; col < newShape[row].length; col++) {
        if (newShape[row][col] !== 0) {
          const targetX = this.x + col + deltaX;
          const targetY = this.y + row + deltaY;
          if (
            targetX < 0 ||
            targetX >= gridSizeX ||
            targetY >= gridSizeY ||
            (targetY >= 0 && !grid[targetY][targetX].isEmpty)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

const startAutoDrop = function () {
  return setInterval(() => {
    currentTetromino.moveDown();
  }, 1000);
};

const stopAutoDrop = function () {
  clearInterval(autoDropIntervalId);
};

const moveKeyListener = (event) => {
  switch (event.key) {
    case "ArrowLeft":
      currentTetromino.moveLeft();
      break;
    case "ArrowRight":
      currentTetromino.moveRight();
      break;
    case "ArrowDown":
      currentTetromino.moveDown();
      break;
    case "ArrowUp":
      currentTetromino.rotate();
      break;
    case "Space":
      currentTetromino.hardDrop();
      break;
  }
};

const tetrominoes = [
  TetrominoI,
  TetrominoL,
  TetrominoO,
  TetrominoZ,
  TetrominoT,
];

const getTetromino = function () {
  // Fisher-Yates shuffle
  for (let i = tetrominoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tetrominoes[i], tetrominoes[j]] = [tetrominoes[j], tetrominoes[i]];
  }
  return tetrominoes[0]; // Zwróć pierwsze tetromino z przetasowanej tablicy
};

export const generateTetromino = function () {
  stopAutoDrop(); // Zatrzymanie poprzedniego interwału przed wygenerowaniem nowego Tetromino
  const tetrominoHelp = getTetromino();
  currentTetromino = new Tetromino(
    grid,
    cellSize,
    tetrominoHelp.colour,
    tetrominoHelp.shape
  );

  autoDropIntervalId = startAutoDrop();

  if (currentTetromino.y + currentTetromino.getMaxRow() < gridSizeY) {
    document.addEventListener("keydown", moveKeyListener);
  }
};

// Uruchomienie pierwszego Tetromino
generateTetromino();
