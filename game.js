import { app } from "./app.js";
const gridSizeX = 10; // Liczba kolumn
const gridSizeY = 20; // Liczba rzędów
const cellSize = 40; // Rozmiar każdego kwadratu
let currentTetromino;
let nextTetromino;
let autoDropIntervalId;
let score = 0;
let linesCleared = 0;
let level = 1;

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
    checkFullLines(); // Sprawdzenie pełnych linii po zablokowaniu Tetromino
    stopAutoDrop();
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

const startAutoDrop = function (interval = 1000) {
  return setInterval(() => {
    currentTetromino.moveDown();
  }, interval);
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
  const tetrominoes = [
    TetrominoI,
    TetrominoL,
    TetrominoO,
    TetrominoZ,
    TetrominoT,
  ];
  // Fisher-Yates shuffle
  for (let i = tetrominoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tetrominoes[i], tetrominoes[j]] = [tetrominoes[j], tetrominoes[i]];
  }
  return tetrominoes[0]; // Zwróć pierwsze tetromino z przetasowanej tablicy
};

const isGameOver = function () {
  return grid[0].some((cell) => !cell.isEmpty);
};

const generateTetromino = function () {
  stopAutoDrop();
  if (isGameOver()) {
    alert("Game Over! Your score: " + score);
    location.reload(); // Restart gry
  } else {
    currentTetromino =
      nextTetromino ||
      new Tetromino(
        grid,
        cellSize,
        getTetromino().colour,
        getTetromino().shape
      );
    nextTetromino = new Tetromino(
      grid,
      cellSize,
      getTetromino().colour,
      getTetromino().shape
    );
    autoDropIntervalId = startAutoDrop();
    document.addEventListener("keydown", moveKeyListener);
  }
};

const updateScore = function (lines) {
  const points = [0, 100, 300, 500, 800]; // Punkty za 1, 2, 3 i 4 linie naraz
  score += points[lines];
  linesCleared += lines;
  if (linesCleared >= level * 10) {
    level++;
    clearInterval(autoDropIntervalId);
    autoDropIntervalId = startAutoDrop(1000 - (level - 1) * 100);
  }
  // Aktualizacja interfejsu użytkownika z wynikiem i poziomem
  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("level").innerText = "Level: " + level;
};

const checkFullLines = function () {
  let lines = 0;
  for (let row = gridSizeY - 1; row >= 0; row--) {
    if (grid[row].every((cell) => !cell.isEmpty)) {
      removeLine(row);
      lines++;
      row++;
    }
  }
  if (lines > 0) {
    updateScore(lines);
  }
};

const removeLine = function (rowToRemove) {
  for (let col = 0; col < gridSizeX; col++) {
    grid[rowToRemove][col].graphics.clear();
    grid[rowToRemove][col].graphics.beginFill(0x808080);
    grid[rowToRemove][col].graphics.drawRect(0, 0, cellSize, cellSize);
    grid[rowToRemove][col].graphics.endFill();
  }

  for (let row = rowToRemove; row > 0; row--) {
    for (let col = 0; col < gridSizeX; col++) {
      grid[row][col].fillColor = grid[row - 1][col].fillColor;
      grid[row][col].isEmpty = grid[row - 1][col].isEmpty;
      grid[row][col].graphics.clear();
      grid[row][col].graphics.beginFill(grid[row][col].fillColor);
      grid[row][col].graphics.drawRect(0, 0, cellSize, cellSize);
      grid[row][col].graphics.endFill();
    }
  }

  for (let col = 0; col < gridSizeX; col++) {
    grid[0][col].fillColor = 0x808080;
    grid[0][col].isEmpty = true;
    grid[0][col].graphics.clear();
    grid[0][col].graphics.beginFill(0x808080);
    grid[0][col].graphics.drawRect(0, 0, cellSize, cellSize);
    grid[0][col].graphics.endFill();
  }
};

// Inicjalizacja pierwszego Tetromino
generateTetromino();
