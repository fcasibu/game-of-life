<script lang="ts">
  import { onMount } from 'svelte';
  import { Grid } from './lib/core/grid';
  import { CellState } from './lib/types';

  let gridSize = 50;
  let grid = new Grid(gridSize);
  let board = grid.getBoard();

  $: if (gridSize > 0) {
    grid = new Grid(gridSize);
    board = grid.getBoard();
  }

  $: gridSize = gridSize < 10 ? 10 : gridSize;

  let targetFps = 10;

  let targetFrameTime = 1000 / targetFps;
  let animationFrameId: number | null = null;
  let isRunning = true;

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
        grid.processNextGenerationGrid();
        board = grid.getBoard();
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
    return state === CellState.Alive
      ? 'alive'
      : state === CellState.Dead
        ? 'dead'
        : 'empty';
  };

  const togglePause = () => {
    isRunning = !isRunning;
  };

  const stepForward = () => {
    if (!isRunning) {
      grid.processNextGenerationGrid();
      board = grid.getBoard();
    }
  };

  const restart = () => {
    board = grid.resetBoard();
  };

  const changeSpeed = (event: Event) => {
    const target = event.target as HTMLInputElement;

    const fps = parseInt(target.value, 10);
    targetFrameTime = fps > 0 ? 1000 / fps : Infinity;
  };
</script>

<div>
  <button onclick={togglePause} type="button">
    {isRunning ? 'Pause' : 'Run'}
  </button>
  <button onclick={stepForward} disabled={isRunning} type="button">Step</button>
  <button onclick={restart} type="button">Restart</button>
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
  <label>
    Grid Size:
    <input type="range" min="10" max="100" bind:value={gridSize} />
  </label>
</div>

<div class="grid-container" style="--grid-size: {gridSize}">
  {#each board as row}
    {#each row as cell}
      <div class="cell" data-state={cellClass(cell)}></div>
    {/each}
  {/each}
</div>

<style>
  .grid-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 10px);
    grid-template-rows: repeat(var(--grid-size), 10px);
    width: calc(var(--grid-size) * 10px);
    height: calc(var(--grid-size) * 10px);
    border: 1px solid #ccc;
    margin-top: 10px;
  }

  .cell {
    width: 10px;
    height: 10px;
    border: 1px solid #eee;
    box-sizing: border-box;

    &[data-state='alive'] {
      background-color: black;
    }

    &[data-state='dead'] {
      background-color: white;
    }
  }
</style>
