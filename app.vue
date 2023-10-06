<template>
  <div>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>

<script setup lang="ts">
import { c } from "vitest/dist/reporters-5f784f42";
import { Camera } from "./code/game/camera";
import { revealCellCluster } from "./code/game/cells";
import { drawGame } from "./code/game/drawing/draw-game";
import { GameMap } from "./code/game/game-map";
import { Images } from "./code/game/images";
import { WorldPos } from "./code/game/position";
import {
  drawLayerCellDefault,
  loadVisibleCellsDefault,
} from "./code/game/setup";
import { getVisibleWorldRect } from "./code/game/visible-cells";
import { Vec2 } from "./code/misc/vec2";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

console.log(camera);

const map = new GameMap({
  seed: Math.round(Math.random() * Number.MAX_SAFE_INTEGER),
});

let canvasCtx: CanvasRenderingContext2D;

const images = new Images();

const cellSize = 48;
const halfCellSize = cellSize / 2;

function renderFrame() {
  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasCtx.canvas.width, canvasCtx.canvas.height),
    camera: camera,
    cellSize: cellSize,
  });

  drawGame({
    canvasCtx: canvasCtx!,
    camera: camera,
    cells: map.cells,
    bgColor: "#000000",
    cellSize: cellSize,
    visibleWorldRect: visibleWorldRect,
    drawLayerCell: drawLayerCellDefault({
      images: images,
      halfCellSize: halfCellSize,
    }),
  });

  requestAnimationFrame(renderFrame);
}

onMounted(async () => {
  images.addImage("ground", "/assets/ground.png");
  images.addImage("wall", "/assets/wall.png");
  images.addImage("character", "/assets/character.png");

  await images.allImagesLoaded();

  if (canvasRef.value == null) {
    throw new Error("Canvas is null");
  }

  canvasCtx = canvasRef.value.getContext("2d")!;

  if (canvasCtx == null) {
    throw new Error("Canvas context is null");
  }

  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasRef.value.width, canvasRef.value.height),
    camera: camera,
    cellSize: cellSize,
  });

  loadVisibleCellsDefault({
    seed: map.seed,
    cells: map.cells,
    visibleWorldRect: visibleWorldRect,
  });

  revealCellCluster({
    startPos: new WorldPos(),
    getCell: (input) => map.cells.getCell(input.worldPos),
  });

  console.log(map.cells);

  renderFrame();
});
</script>
