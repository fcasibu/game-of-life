import { CellState, type Board } from '../types';
import { assert } from '../utils';

export class Grid {
  private board: Board;
  // prettier-ignore
  private readonly OFFSETS: number[][] = 
  [
    [0,  -1], [1,  0], [0, 1], [-1, 0],
    [-1, -1], [1, -1], [1, 1], [-1, 1],
  ];

  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {
    this.board = Grid.generateInitialBoard(width, height);
  }

  public getBoard(): Board {
    return structuredClone(this.board);
  }

  public resetBoard(): Board {
    this.board = Grid.generateInitialBoard(this.width, this.height);
    return this.getBoard();
  }

  public emptyBoard() {
    this.board = Grid.generateEmptyBoard(this.width, this.height);
    return this.getBoard();
  }

  public placeCell(x: number, y: number) {
    if (x < 0 && x > this.width && y < 0 && y > this.height) {
      throw new Error('invalid cell position');
    }

    this.board[y]![x] = CellState.Alive;
  }

  public processNextGenerationGrid(): Board {
    const nextGenerationGrid = Grid.generateEmptyBoard(this.width, this.height);

    for (let row = 0; row < this.height; ++row) {
      const cells = this.board[row];

      assert(Array.isArray(cells));

      for (let col = 0; col < this.width; ++col) {
        const newStateOfCell = this.getNewStateOfCell(
          col,
          row,
          this.countLiveNeighborsOfCell(col, row),
        );

        const nextGenerationCells = nextGenerationGrid[row];

        assert(Array.isArray(nextGenerationCells));
        nextGenerationCells[col] = newStateOfCell;
      }
    }

    this.board = nextGenerationGrid;

    return this.board;
  }

  private getNewStateOfCell(
    cellX: number,
    cellY: number,
    liveNeighborCount: number,
  ): CellState {
    const isAlive = this.isAlive(cellX, cellY);

    if (isAlive && (liveNeighborCount === 2 || liveNeighborCount === 3)) {
      return CellState.Alive;
    }

    if (isAlive && (liveNeighborCount < 2 || liveNeighborCount > 3)) {
      return CellState.Dead;
    }

    if (!isAlive && liveNeighborCount === 3) {
      return CellState.Alive;
    }

    return CellState.Dead;
  }

  private countLiveNeighborsOfCell(cellX: number, cellY: number): number {
    let count = 0;

    for (const [x, y] of this.OFFSETS) {
      assert(typeof x === 'number');
      assert(typeof y === 'number');

      const nextCellX = (cellX + x + this.width) % this.width;
      const nextCellY = (cellY + y + this.height) % this.height;

      if (this.isAlive(nextCellX, nextCellY)) {
        count += 1;
      }
    }

    return count;
  }

  private isAlive(x: number, y: number): boolean {
    return this.board[y]![x] === CellState.Alive;
  }

  private static generateInitialBoard(width: number, height: number): Board {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () =>
        Math.random() > 0.5 ? CellState.Alive : CellState.Dead,
      ),
    );
  }

  private static generateEmptyBoard(width: number, height: number): Board {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () => CellState.Dead),
    );
  }
}
