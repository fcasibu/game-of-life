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

  constructor(private readonly size: number) {
    this.board = Grid.generateInitialBoard(size);
  }

  public getBoard() {
    return this.board;
  }

  public resetBoard() {
    this.board = Grid.generateInitialBoard(this.size);
    return this.getBoard();
  }

  public processNextGenerationGrid(): void {
    const nextGenerationGrid = Grid.generateEmptyBoard(this.size);

    for (let row = 0; row < this.board.length; ++row) {
      const cells = this.board[row];

      assert(Array.isArray(cells));

      for (let col = 0; col < cells.length; ++col) {
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

      const nextCellX = cellX + x;
      const nextCellY = cellY + y;

      if (this.isAlive(nextCellX, nextCellY)) {
        count += 1;
      }
    }

    return count;
  }

  private isAlive(x: number, y: number): boolean {
    return this.isWithinBounds(x, y) && this.board[y]![x] === CellState.Alive;
  }

  // TODO(fcasibu): implement wrapping
  private isWithinBounds(x: number, y: number) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  private static generateInitialBoard(size: number): Board {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        Math.random() > 0.5 ? CellState.Alive : CellState.Dead,
      ),
    );
  }

  private static generateEmptyBoard(size: number): Board {
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => CellState.Dead),
    );
  }
}
