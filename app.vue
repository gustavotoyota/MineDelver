<template>
  <div>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>

<script setup lang="ts">
import { drawGame } from "./code/drawing/draw-game";
import { Camera, getVisibleWorldRect, worldToScreen } from "./code/game/camera";
import { cellHasBomb, loadCell, loadCellCluster } from "./code/game/cell";
import { GameMap } from "./code/game/game-map";
import { forEachPosInRect } from "./code/game/position";
import { Vec2 } from "./code/misc/vec2";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

console.log(camera);

const map = new GameMap({
  seed: Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
});

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
    cellSize: cellSize,
    drawCell: [
      (input) => {
        input.canvasCtx.drawImage(
          groundImage,
          input.screenPos.x -
            (groundImage.width + halfCellSize) * input.camera.zoom,
          input.screenPos.y -
            (groundImage.height + halfCellSize) * input.camera.zoom,
          groundImage.width * input.camera.zoom,
          groundImage.height * input.camera.zoom
        );
      },
      (input) => {
        if (input.cellInfos.hasBomb) {
          input.canvasCtx.drawImage(
            wallImage,
            input.screenPos.x -
              (wallImage.width + halfCellSize) * input.camera.zoom,
            input.screenPos.y -
              (wallImage.height + halfCellSize) * input.camera.zoom,
            wallImage.width * input.camera.zoom,
            wallImage.height * input.camera.zoom
          );
        }
      },
    ],
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

  forEachPosInRect({
    ...visibleWorldRect,
    func: (pos) => {
      loadCellCluster({
        startPos: pos,
        cellExists: (input) => map.cells.hasCell(input.pos),
        loadCell: (input) => {
          const cell = loadCell({
            pos: input.pos,
            cellHasBomb: (input) =>
              cellHasBomb({
                seed: map.seed,
                pos: input.pos,
                bombProbability: 0.2,
              }),
          });

          map.cells.setCell(input.pos, cell);

          return cell.hasBomb;
        },
      });
    },
  });

  console.log(map.cells);

  renderFrame();
});
</script>
./code/game/position
