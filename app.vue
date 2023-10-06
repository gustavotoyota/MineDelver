<template>
  <div>
    <canvas
      ref="canvasRef"
      width="768"
      height="576"
      @mousemove="(event) => updateMousePos(event)"
      @mouseleave="
        () => {
          mouseScreenPos = undefined;
          mouseWorldPos = undefined;
        }
      "
      @mousedown="
        (event) => {
          updateMousePos(event);
          
          const shortestPath = getShortestPath({
            grid: grid,
            sourcePos: entities.get('player')!.pos,
            targetPos: mouseWorldPos!,
          });

          if (shortestPath == null) {
            return;
          }

          enqueueActions({
            actionManager: actionManager,
            actions: shortestPath.toReversed(),
            playerEntity: entities.get('player')!,
            grid
          });
        }
      "
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "./code/composables/use-event-listener";
import { Camera, screenToWorld } from "./code/game/camera";
import { IRuntimeCellInfos } from "./code/game/cells";
import { drawGame } from "./code/game/drawing/draw-game";
import { Entities } from "./code/game/entities";
import { Grid } from "./code/game/grid";
import { Images } from "./code/game/images";
import { ActionManager, enqueueActions } from "./code/game/actions";
import { getShortestPath } from "./code/game/path-finding";
import { WorldPos } from "./code/game/position";
import {
  drawLayerCellDefault,
  loadCellClusterDefault,
} from "./code/game/setup";
import {
  getGridSegmentFromWorldRect,
  getVisibleWorldRect,
} from "./code/game/visible-cells";
import { IVec2, Vec2 } from "./code/misc/vec2";
import { IVec3 } from "./code/misc/vec3";

const canvasRef = ref<HTMLCanvasElement>();

const camera = new Camera();

const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
const grid = new Grid<IRuntimeCellInfos>();

grid.setCell(new WorldPos(), {
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

let mouseScreenPos: IVec2 | undefined;
let mouseWorldPos: IVec3 | undefined;

const actionManager = new ActionManager({
  loadCellCluster: (input) => {
    loadCellClusterDefault({
      seed: seed,
      grid: grid,
      startPos: input.startPos,
    });
  },
});

useEventListener(
  () => window,
  "keydown",
  (event) => {
    const player = entities.get("player");

    if (player == null) {
      throw new Error("Player entity is null");
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

    enqueueActions({
      actionManager: actionManager,
      actions: [newPlayerPos],
      playerEntity: player,
      grid: grid,
    });
  }
);

function updateMousePos(event: MouseEvent) {
  mouseScreenPos = new Vec2(event.offsetX, event.offsetY);

  mouseWorldPos = screenToWorld({
    camera: camera,
    cellSize: cellSize,
    screenSize: new Vec2(canvasRef.value!.width, canvasRef.value!.height),
    screenPos: mouseScreenPos,
  });

  mouseWorldPos.x = Math.round(mouseWorldPos.x);
  mouseWorldPos.y = Math.round(mouseWorldPos.y);
}

function renderFrame() {
  const visibleWorldRect = getVisibleWorldRect({
    screenSize: new Vec2(canvasCtx.canvas.width, canvasCtx.canvas.height),
    camera: camera,
    cellSize: cellSize,
  });

  const gridSegment = getGridSegmentFromWorldRect({
    grid: grid,
    worldRect: visibleWorldRect,
  });

  camera.pos = { ...entities.get("player")!.pos };

  drawGame({
    canvasCtx: canvasCtx!,
    camera: camera,
    bgColor: "#000000",
    cellSize: cellSize,
    gridSegment: gridSegment,
    mouseScreenPos: mouseScreenPos,
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
    grid: grid,
    startPos: new WorldPos(),
  });

  renderFrame();
});
</script>
./code/game/grid ./code/game/actions
