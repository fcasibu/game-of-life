<script lang="ts">
  import { onMount } from 'svelte';
  import { Grid } from './lib/core/grid';
  import { CellState, type Board } from './lib/types';

  const CELL_SIZE = 10;

  let gridWidth = 0;
  let gridHeight = 0;
  let grid: Grid;
  let board: Board;

  function calculateGridSize() {
    gridWidth = Math.floor(window.innerWidth / CELL_SIZE);
    gridHeight = Math.floor(window.innerHeight / CELL_SIZE);
  }

  function initializeGrid() {
    calculateGridSize();
    grid = new Grid(gridWidth, gridHeight);

    board = grid.getBoard();
  }

  onMount(() => {
    initializeGrid();

    const onResize = () => {
      const newWidth = Math.floor(window.innerWidth / CELL_SIZE);
      const newHeight = Math.floor(window.innerHeight / CELL_SIZE);

      if (newWidth !== gridWidth || newHeight !== gridHeight) {
        gridWidth = newWidth;
        gridHeight = newHeight;
        grid = new Grid(gridWidth, gridHeight);
        board = grid.getBoard();
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  });

  let targetFps = 10;
  let isRunning = true;
  let animationFrameId: number | null = null;

  $: targetFrameTime = targetFps > 0 ? 1000 / targetFps : 60;

  onMount(() => {
    let lastLogicUpdate = performance.now();
    let accumulator = 0;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const elapsed = currentTime - lastLogicUpdate;
      lastLogicUpdate = currentTime;
      accumulator += elapsed;

      while (accumulator >= targetFrameTime) {
        board = grid.processNextGenerationGrid();
        accumulator -= targetFrameTime;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      isRunning = false;
    };
  });

  const cellClass = (state: CellState) => {
    return state === CellState.Alive ? 'alive' : 'dead';
  };

  const togglePause = () => {
    isRunning = !isRunning;
  };

  const stepForward = () => {
    if (!isRunning) {
      board = grid.processNextGenerationGrid();
    }
  };

  const restart = () => {
    board = grid.resetBoard();
  };

  const changeSpeed = (event: Event) => {
    const target = event.target as HTMLInputElement;

    const fps = parseInt(target.value, 10);
    targetFps = fps;
  };

  const placeCell = (x: number, y: number) => {
    grid.placeCell(x, y);
    board = grid.getBoard();
  };

  const emptyBoard = () => {
    board = grid.emptyBoard();
  };
</script>

<div>
  <button onclick={togglePause} type="button">
    {isRunning ? 'Pause' : 'Run'}
  </button>
  <button onclick={stepForward} disabled={isRunning} type="button">Step</button>
  <button onclick={restart} type="button">Restart</button>
  <button onclick={emptyBoard} type="button">Empty</button>
  <label>
    Speed (Logic Updates/sec):
    <input
      type="range"
      min="1"
      max="60"
      bind:value={targetFps}
      oninput={changeSpeed}
    />
  </label>
</div>

<div
  class="grid-container"
  style="--grid-width: {gridWidth}; --grid-height: {gridHeight}"
>
  {#each board as row, y}
    {#each row as cell, x}
      <button
        aria-label="Place living cell at {x}, {y}"
        type="button"
        class="cell"
        data-state={cellClass(cell)}
        onclick={() => placeCell(x, y)}
        disabled={isRunning}
      ></button>
    {/each}
  {/each}
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-width), 10px);
    grid-template-rows: repeat(var(--grid-height), 10px);
  }

  .cell {
    all: unset;

    &[data-state='alive'] {
      background-color: black;
    }

    &[data-state='dead'] {
      background-color: white;
    }
  }
</style>
