<template>
  <div>
    <canvas ref="canvasRef" width="800" height="600"></canvas>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "./code/composables/use-event-listener";
import { Camera } from "./code/game/camera";
import { CellCollection } from "./code/game/cell-collection";
import { IRuntimeCellInfos, revealCellCluster } from "./code/game/cells";
import { drawGame } from "./code/game/drawing/draw-game";
import { Entities } from "./code/game/entities";
import { Images } from "./code/game/images";
import { WorldPos } from "./code/game/position";
import {
  drawLayerCellDefault,
  loadVisibleCellsDefault,
} from "./code/game/setup";
import { getVisibleWorldRect } from "./code/game/visible-cells";
import { Vec2 } from "./code/misc/vec2";
import { pull } from "lodash";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

console.log(camera);

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

    pull(cell.entities ?? [], "player");

    if (cell.entities?.length === 0) {
      delete cell.entities;
    }

    if (event.code === "ArrowUp") {
      player.pos.y -= 1;
    } else if (event.code === "ArrowDown") {
      player.pos.y += 1;
    } else if (event.code === "ArrowLeft") {
      player.pos.x -= 1;
    } else if (event.code === "ArrowRight") {
      player.pos.x += 1;
    }

    const newCell = cells.getCell(player.pos);

    if (newCell == null) {
      throw new Error("New cell is null");
    }

    newCell.entities ??= [];
    newCell.entities.push("player");

    camera.pos = { ...player.pos };

    const visibleWorldRect = getVisibleWorldRect({
      screenSize: new Vec2(canvasRef.value!.width, canvasRef.value!.height),
      camera: camera,
      cellSize: cellSize,
    });

    loadVisibleCellsDefault({
      seed: seed,
      cells: cells,
      visibleWorldRect: visibleWorldRect,
    });

    revealCellCluster({
      startPos: player.pos,
      getCell: (input) => cells.getCell(input.worldPos),
    });
  }
);

function renderFrame() {
  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasCtx.canvas.width, canvasCtx.canvas.height),
    camera: camera,
    cellSize: cellSize,
  });

  drawGame({
    canvasCtx: canvasCtx!,
    camera: camera,
    cells: cells,
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
    seed: seed,
    cells: cells,
    visibleWorldRect: visibleWorldRect,
  });

  revealCellCluster({
    startPos: new WorldPos(),
    getCell: (input) => cells.getCell(input.worldPos),
  });

  console.log(cells);

  renderFrame();
});
</script>
