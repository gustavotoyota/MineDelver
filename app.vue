<template>
  <div>
    <canvas ref="canvasRef" width="768" height="576"></canvas>
  </div>
</template>

<script setup lang="ts">
import { pull } from "lodash";
import { useEventListener } from "./code/composables/use-event-listener";
import { Camera } from "./code/game/camera";
import { CellCollection } from "./code/game/cell-collection";
import { IRuntimeCellInfos } from "./code/game/cells";
import { drawGame } from "./code/game/drawing/draw-game";
import { Entities } from "./code/game/entities";
import { Images } from "./code/game/images";
import { WorldPos } from "./code/game/position";
import {
  drawLayerCellDefault,
  loadCellClusterDefault,
} from "./code/game/setup";
import {
  getGridSegmentFromWorldRect,
  getVisibleWorldRect,
} from "./code/game/visible-cells";
import { Vec2 } from "./code/misc/vec2";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
const cells = new CellCollection<IRuntimeCellInfos>();

cells.setCell(new WorldPos(), {
  entities: ["player"],
});

const entities = new Entities();
entities.set("player", {
  pos: new WorldPos(),
});

let canvasCtx: CanvasRenderingContext2D;

const images = new Images();

const cellSize = 48;
const halfCellSize = cellSize / 2;

useEventListener(
  () => window,
  "keydown",
  (event) => {
    const player = entities.get("player");

    if (player == null) {
      throw new Error("Player entity is null");
    }

    const cell = cells.getCell(player.pos);

    if (cell == null) {
      throw new Error("Cell is null");
    }

    const newPlayerPos = { ...player.pos };

    if (event.code === "ArrowUp") {
      newPlayerPos.y -= 1;
    } else if (event.code === "ArrowDown") {
      newPlayerPos.y += 1;
    } else if (event.code === "ArrowLeft") {
      newPlayerPos.x -= 1;
    } else if (event.code === "ArrowRight") {
      newPlayerPos.x += 1;
    }

    const newCell = cells.getCell(newPlayerPos);

    if (newCell == null) {
      throw new Error("New cell is null");
    }

    if (!newCell.revealed) {
      return;
    }

    pull(cell.entities ?? [], "player");

    if (cell.entities?.length === 0) {
      delete cell.entities;
    }

    newCell.entities ??= [];
    newCell.entities.push("player");

    player.pos = newPlayerPos;
    camera.pos = { ...player.pos };
  }
);

function renderFrame() {
  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasCtx.canvas.width, canvasCtx.canvas.height),
    camera: camera,
    cellSize: cellSize,
  });

  const gridSegment = getGridSegmentFromWorldRect({
    cells: cells,
    worldRect: visibleWorldRect,
  });

  drawGame({
    canvasCtx: canvasCtx!,
    camera: camera,
    bgColor: "#000000",
    cellSize: cellSize,
    gridSegment: gridSegment,
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

  loadCellClusterDefault({
    seed: seed,
    cells: cells,
    startPos: new WorldPos(),
  });

  renderFrame();
});
</script>
