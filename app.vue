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
            sourcePos: playerEntity.worldPos.value,
            targetPos: mouseWorldPos!,
          });

          if (shortestPath == null) {
            return;
          }

          enqueueActions({
            actionManager: actionManager,
            actions: shortestPath.toReversed(),
            playerEntity: playerEntity,
            grid
          });
        }
      "
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useEventListener } from "./code/composables/use-event-listener";
import { Camera, screenToWorld } from "./code/game/camera";
import {
  ActionManager,
  enqueueActions,
} from "./code/game/entities/player/actions";
import { Entities } from "./code/game/entities/entities";
import { GameMap, IRenderCell } from "./code/game/entities/game-map";
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
import { StateMachine } from "./code/game/state-machine";
import { IVec2, Vec2 } from "./code/misc/vec2";
import { IVec3, Vec3 } from "./code/misc/vec3";
import { PlayerEntity } from "./code/game/entities/player/player";

function getOrCreateCell_(input_: { worldPos: WorldPos }) {
  return getOrCreateCell({
    worldPos: input_.worldPos,
    cellHasBomb: (input_) =>
      cellHasBomb({
        seed: seed,
        worldPos: input_.worldPos,
        bombProbability:
          Math.abs(input_.worldPos.x) <= 1 && Math.abs(input_.worldPos.y) <= 1
            ? 0
            : 0.15,
      }),
    grid: grid,
  });
}

function loadCellCluster_(input: {
  seed: number;
  startPos: WorldPos;
  grid: Grid<IRuntimeCellInfos>;
}) {
  return loadCellCluster({
    startPos: input.startPos,
    getOrCreateCell: (input_) =>
      getOrCreateCell_({
        worldPos: input_.worldPos,
      }),
  });
}

const canvasRef = ref<HTMLCanvasElement>();

const currentTime = ref(Date.now());

const camera = ref(new Camera());

const playerHP = ref(3);
const playerMaxHP = ref(3);

const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);

const canvasCtx = ref<CanvasRenderingContext2D>();

const images = new Images();

const cellSize = ref(48);
const halfCellSize = computed(() => cellSize.value / 2);

const entities = new Entities();

const mouseScreenPos = ref<IVec2>();
const mouseWorldPos = ref<IVec3>();

const grid = new Grid<IRuntimeCellInfos>();

const playerEntity = new PlayerEntity({
  hp: playerHP,
  maxHP: playerMaxHP,
  worldPos: ref(new Vec3(0, 0, 0)),
  images: images,
  grid: grid,
  loadCellCluster: (input) =>
    loadCellCluster_({
      seed: seed,
      grid: grid,
      startPos: input.startPos,
    }),
  currentTime: currentTime,
  walkDuration: ref(200),
});

grid.setCell(new WorldPos(), { entities: [playerEntity] });

const mapEntity = new GameMap({
  grid: grid,
  cellSize: cellSize,
  camera: camera,
  mouseScreenPos: mouseScreenPos,
  bgColor: ref("black"),
  cellEntities: new Entities([playerEntity]),
  renderCell: (input_) => {
    if (input_.cellInfos === undefined || input_.cellInfos.hidden) {
      return;
    }

    drawCellImage({
      canvasCtx: input_.canvasCtx,
      halfCellSize: halfCellSize.value,
      screenPos: input_.screenPos,
      camera: input_.camera,
      image: images.getImage("ground")!,
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

    if (!input_.cellInfos?.revealed) {
      drawCellImage({
        canvasCtx: input_.canvasCtx,
        halfCellSize: halfCellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage("wall")!,
      });
    }
  },
});

entities.add(mapEntity);

entities.add(
  new HPBar({
    hp: playerHP,
    maxHP: playerMaxHP,
    pos: ref(new Vec2(10, 10)),
  })
);

const actionManager = new ActionManager({
  loadCellCluster: (input) => {
    loadCellCluster_({
      seed: seed,
      grid: grid,
      startPos: input.startPos,
    });
  },
});

watch(playerHP, () => {
  if (playerHP.value === 0) {
    setTimeout(() => {
      alert("You died!");
    });
  }
});

loadCellCluster_({
  seed: seed,
  grid: grid,
  startPos: new WorldPos(),
});

useEventListener(
  () => window,
  "keydown",
  (event) => {
    if (event.code.startsWith("Arrow")) {
      const newPlayerPos = { ...playerEntity.worldPos.value };

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
        playerEntity: playerEntity,
        grid: grid,
      });
    }
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
  currentTime.value = Date.now();

  camera.value.pos = { ...playerEntity.finalWorldPos };

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
