export class Tetromino {
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
