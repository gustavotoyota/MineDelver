<template>
  <div>
    <canvas
      ref="canvasRef"
      width="768"
      height="576"
      @mousemove="(event) => updateMousePos(event)"
      @mouseleave="
        () => {
          mouseScreenPos.value = undefined;
          mouseWorldPos.value = undefined;
        }
      "
      @mousedown="
        (event) => {
          updateMousePos(event);
          
          const shortestPath = getShortestPath({
            grid: grid,
            sourcePos: creatures.get('player')!.pos,
            targetPos: mouseWorldPos.value!,
          });

          if (shortestPath == null) {
            return;
          }

          enqueueActions({
            actionManager: actionManager,
            actions: shortestPath.toReversed(),
            playerCreature: creatures.get('player')!,
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
import { ActionManager, enqueueActions } from "./code/game/creatures/actions";
import { Creatures } from "./code/game/creatures/creatures";
import { Entities } from "./code/game/entities";
import { GameMap, IDrawCell } from "./code/game/entities/game-map";
import { HPBar } from "./code/game/entities/hp-bar";
import { drawCellImage } from "./code/game/graphics/draw-cell";
import { Images } from "./code/game/images";
import {
  IRuntimeCellInfos,
  cellHasBomb,
  getOrCreateCell,
  loadCellCluster,
} from "./code/game/map/cells";
import { Grid } from "./code/game/map/grid";
import { getShortestPath } from "./code/game/map/path-finding";
import { WorldPos } from "./code/game/map/position";
import { useObservable } from "./code/misc/observable";
import { useRef } from "./code/misc/ref";
import { IVec2, Vec2 } from "./code/misc/vec2";
import { IVec3, Vec3 } from "./code/misc/vec3";

function loadCellClusterDefault(input: {
  seed: number;
  startPos: WorldPos;
  grid: Grid<IRuntimeCellInfos>;
}) {
  loadCellCluster({
    startPos: input.startPos,
    getOrCreateCell: (input_) =>
      getOrCreateCell({
        worldPos: input_.worldPos,
        cellHasBomb: (input_) =>
          cellHasBomb({
            seed: input.seed,
            worldPos: input_.worldPos,
            bombProbability:
              Math.abs(input_.worldPos.x) <= 1 &&
              Math.abs(input_.worldPos.y) <= 1
                ? 0
                : 0.15,
          }),
        grid: input.grid,
      }),
  });
}

function drawLayerCellDefault(input: {
  halfCellSize: number;
  images: Images;
}): IDrawCell[] {
  return [
    (input_) => {
      if (input_.cellInfos === undefined || input_.cellInfos.hidden) {
        return;
      }

      drawCellImage({
        canvasCtx: input_.canvasCtx,
        halfCellSize: input.halfCellSize,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: input.images.getImage("ground")!,
      });

      if (
        input_.cellInfos?.revealed &&
        input_.cellInfos?.numAdjacentBombs !== undefined
      ) {
        input_.canvasCtx.save();
        input_.canvasCtx.fillStyle = "white";
        input_.canvasCtx.textAlign = "center";
        input_.canvasCtx.textBaseline = "middle";
        input_.canvasCtx.font = `${28 * input_.camera.zoom}px "Segoe UI"`;
        input_.canvasCtx.fillText(
          input_.cellInfos.numAdjacentBombs.toString(),
          input_.screenPos.x,
          input_.screenPos.y
        );
        input_.canvasCtx.restore();
      }
    },
    (input_) => {
      if (input_.cellInfos === undefined || input_.cellInfos.hidden) {
        return;
      }

      if (!input_.cellInfos?.revealed) {
        drawCellImage({
          canvasCtx: input_.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: input.images.getImage("wall")!,
        });
      }

      if (input_.cellInfos?.creatures?.includes("player")) {
        drawCellImage({
          canvasCtx: input_.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: input.images.getImage("character")!,
        });
      }
    },
  ];
}

const canvasRef = ref<HTMLCanvasElement>();

const camera = useRef(new Camera());

const playerHP = useRef(100);

const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
const grid = new Grid<IRuntimeCellInfos>();

grid.setCell(new WorldPos(), {
  creatures: ["player"],
});

const creatures = new Creatures();
creatures.set("player", { pos: new WorldPos() });

const canvasCtx = useRef<CanvasRenderingContext2D>();

const images = new Images();

const cellSize = useRef(48);
const halfCellSize = useObservable(cellSize, (value) => value / 2);

const entities = new Entities();

const mouseScreenPos = useRef<IVec2>();
const mouseWorldPos = useRef<IVec3>();

entities.add(
  new GameMap({
    grid: grid,
    images: images,
    cellSize: cellSize,
    camera: camera,
    mouseScreenPos: mouseScreenPos,
    bgColor: useRef("black"),
    drawLayerCell: drawLayerCellDefault({
      halfCellSize: halfCellSize.value,
      images: images,
    }),
  })
);

entities.add(
  new HPBar({
    hp: playerHP,
    pos: useRef(new Vec2(0, 0)),
  })
);

const actionManager = new ActionManager({
  loadCellCluster: (input) => {
    loadCellClusterDefault({
      seed: seed,
      grid: grid,
      startPos: input.startPos,
    });
  },
});

loadCellClusterDefault({
  seed: seed,
  grid: grid,
  startPos: new WorldPos(),
});

useEventListener(
  () => window,
  "keydown",
  (event) => {
    const player = creatures.get("player");

    if (player == null) {
      throw new Error("Player creature is null");
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
      playerCreature: player,
      grid: grid,
    });
  }
);

function updateMousePos(event: MouseEvent) {
  mouseScreenPos.value = new Vec2(event.offsetX, event.offsetY);

  mouseWorldPos.value = screenToWorld({
    camera: camera.value,
    cellSize: cellSize.value,
    screenSize: new Vec2(canvasRef.value!.width, canvasRef.value!.height),
    screenPos: mouseScreenPos.value,
  });

  mouseWorldPos.value = new Vec3(
    Math.round(mouseWorldPos.value.x),
    Math.round(mouseWorldPos.value.y),
    Math.round(mouseWorldPos.value.z)
  );
}

function renderFrame() {
  camera.value.pos = { ...creatures.get("player")!.pos };

  entities.render({ canvasCtx: canvasCtx.value! });

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

  canvasCtx.value = canvasRef.value.getContext("2d")!;

  if (canvasCtx == null) {
    throw new Error("Canvas context is null");
  }

  renderFrame();
});
</script>
