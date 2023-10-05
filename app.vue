<template>
  <div>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>

<script setup lang="ts">
import { drawGame } from "./code/drawing/draw-game";
import { Camera, getVisibleWorldRect, worldToScreen } from "./code/game/camera";
import { cellHasBomb, loadCell, loadCellsInRect } from "./code/game/cell";
import { GameMap } from "./code/game/game-map";
import { Vec2 } from "./code/misc/vec2";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

const map = new GameMap();

let canvasCtx: CanvasRenderingContext2D;

let groundImage: HTMLImageElement;
let wallImage: HTMLImageElement;

const cellSize = 48;
const halfCellSize = cellSize / 2;

function renderFrame() {
  drawGame({
    canvasCtx: canvasCtx!,
    camera: camera,
    map: map,
    bgColor: "#000000",
    drawCell: (input) => {
      const screenPos = worldToScreen({
        screenSize: new Vec2(800, 600),
        camera: camera,
        worldPos: input.worldPos,
        cellSize: cellSize,
      });

      input.canvasCtx.drawImage(
        groundImage,
        screenPos.x - halfCellSize,
        screenPos.y - halfCellSize,
        cellSize,
        cellSize
      );

      if (input.cellInfos.hasBomb) {
        input.canvasCtx.drawImage(
          wallImage,
          screenPos.x - halfCellSize,
          screenPos.y - halfCellSize,
          cellSize,
          cellSize
        );
      }
    },
    cellSize: cellSize,
  });

  requestAnimationFrame(renderFrame);
}

onMounted(() => {
  groundImage = new Image();
  groundImage.src = "/assets/ground.png";

  wallImage = new Image();
  wallImage.src = "/assets/wall.png";

  if (canvasRef.value == null) {
    throw new Error("Canvas is null");
  }

  canvasCtx = canvasRef.value.getContext("2d");

  if (canvasCtx == null) {
    throw new Error("Canvas context is null");
  }

  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasRef.value.width, canvasRef.value.height),
    camera: camera,
    cellSize: cellSize,
  });

  loadCellsInRect({
    ...visibleWorldRect,
    cellExists: (input) => map.cells.hasCell(input.pos),
    loadCell: (input) => {
      const cell = loadCell({
        pos: input.pos,
        cellHasBomb: (input) =>
          cellHasBomb({
            seed: map.seed,
            pos: input.pos,
            bombProbability: 0.25,
          }),
      });

      map.cells.setCell(input.pos, cell);

      return cell.hasBomb;
    },
  });

  console.log(map.cells);

  renderFrame();
});
</script>
