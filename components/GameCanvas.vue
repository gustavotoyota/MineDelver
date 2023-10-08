<template>
  <canvas
    ref="canvasRef"
    style="width: 100%; height: 100%"
    @pointermove="(event) => updatePointerPos(event)"
    @pointerleave="
      () => {
        mouseScreenPos = undefined;
        mouseWorldPos = undefined;
      }
    "
    @pointerdown="
      (event) => {
        Input.pointerDown[event.button] = true;

        updatePointerPos(event);
        
        const shortestPath = getShortestPath({
          grid: grid,
          sourcePos: playerEntity.worldPos.value,
          targetPos: mouseWorldPos!,
        });

        if (shortestPath == null) {
          return;
        }

        playerMovementManager.enqueueMovements(shortestPath);
      }
    "
    @pointerup="
      (event) => {
        Input.pointerDown[event.button] = false;
      }
    "
  ></canvas>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useEventListener } from "@/code/composables/use-event-listener";
import { Camera, screenToWorld } from "@/code/game/camera";
import { Entities } from "@/code/game/entities/entities";
import { GameMap } from "@/code/game/entities/map/game-map";
import { PlayerEntity } from "@/code/game/entities/map/player/player";
import { HPBar } from "@/code/game/entities/ui/hp-bar";
import { drawCellImage } from "@/code/game/graphics/draw-cell";
import { Images } from "@/code/game/images";
import {
  IRuntimeCellInfos,
  cellHasBomb,
  getOrCreateCell,
  loadCellCluster,
} from "@/code/game/map/cells";
import { Grid } from "@/code/game/map/grid";
import { getShortestPath } from "@/code/game/map/path-finding";
import { WorldPos } from "@/code/game/map/position";
import { IVec2, Vec2 } from "@/code/misc/vec2";
import { IVec3, Vec3 } from "@/code/misc/vec3";
import { PlayerMovementManager } from "@/code/game/entities/map/player/movement-manager";
import { getBombCountColor } from "@/code/game/entities/map/bomb-count";
import { Minimap } from "@/code/game/entities/ui/minimap";
import { lerpBetween } from "@/code/misc/math";
import { useInterval } from "~/code/composables/use-interval";
import { Input } from "~/code/game/input";
import { Timer } from "~/code/game/entities/ui/timer";

const emit = defineEmits(["death"]);

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

const cellSize = ref(32);
const halfCellSize = computed(() => cellSize.value / 2);

const entities = new Entities();

onUnmounted(() => {
  entities.clear();
});

const mouseScreenPos = ref<IVec2>();
const mouseWorldPos = ref<IVec3>();

const screenSize = ref(new Vec2());

const minimapScale = ref(3);
const minimapSize = ref(new Vec2(200, 150));

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

const playerMovementManager = new PlayerMovementManager({
  playerEntity: playerEntity,
});

grid.setCell(new WorldPos(), { entities: [playerEntity] });

useEventListener(
  () => window,
  "resize",
  () => {
    screenSize.value = new Vec2(
      canvasRef.value!.offsetWidth,
      canvasRef.value!.offsetHeight
    );
  }
);

onMounted(() => {
  screenSize.value = new Vec2(
    canvasRef.value!.offsetWidth,
    canvasRef.value!.offsetHeight
  );
});

watch(screenSize, () => {
  canvasRef.value!.width = screenSize.value.x;
  canvasRef.value!.height = screenSize.value.y;

  if (canvasCtx.value != null) {
    canvasCtx.value.imageSmoothingEnabled = false;
  }

  camera.value.zoom =
    (32 / cellSize.value) *
    lerpBetween(
      300,
      1920,
      Math.max(screenSize.value.x, screenSize.value.y),
      0.7,
      1.2
    ) *
    1.5;

  minimapScale.value =
    lerpBetween(
      300,
      1920,
      Math.max(screenSize.value.x, screenSize.value.y),
      0.6,
      1.5
    ) * 2.5;
  minimapSize.value = new Vec2(
    Math.round(7 * minimapScale.value * 11),
    Math.round(5.5 * minimapScale.value * 11)
  );
});

const mapEntity = new GameMap({
  grid: grid,
  cellSize: cellSize,
  camera: camera,
  mouseScreenPos: mouseScreenPos,
  bgColor: ref("black"),
  cellEntities: new Entities([playerEntity]),
  renderGround: (input_) => {
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
      input_.canvasCtx.fillStyle = getBombCountColor(
        input_.cellInfos.numAdjacentBombs
      );
      input_.canvasCtx.textAlign = "center";
      input_.canvasCtx.textBaseline = "middle";
      input_.canvasCtx.font = `${
        (cellSize.value * input_.camera.zoom) / 1.6
      }px "Segoe UI"`;
      input_.canvasCtx.fillText(
        input_.cellInfos.numAdjacentBombs.toString(),
        input_.screenPos.x,
        input_.screenPos.y
      );
      input_.canvasCtx.restore();
    }
  },
  renderNonGround: (input_) => {
    if (input_.cellInfos === undefined || input_.cellInfos.hidden) {
      return;
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

    if (input_.cellInfos?.revealed && input_.cellInfos?.hasBomb) {
      drawCellImage({
        canvasCtx: input_.canvasCtx,
        halfCellSize: halfCellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage("bomb")!,
      });
    }
  },
});

entities.add(mapEntity);

entities.add(
  new HPBar({
    hp: playerHP,
    pos: ref(new Vec2(10, 10)),
    images: images,
  })
);

entities.add(
  new Timer({
    pos: ref(new Vec2(10, 35)),
    currentTime: currentTime,
  })
);

entities.add(
  new Minimap({
    camera: camera,
    grid: grid,
    pos: computed(
      () => new Vec2(screenSize.value.x - minimapSize.value.x - 10, 10)
    ),
    scale: minimapScale,
    size: minimapSize,
  })
);

watch(playerHP, () => {
  if (playerHP.value === 0) {
    setTimeout(() => {
      alert("You died!");

      emit("death");
    }, 50);
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
    Input.keyDown[event.code] = true;

    entities.input({ event });
  }
);

useEventListener(
  () => window,
  "keyup",
  (event) => {
    Input.keyDown[event.code] = false;
  }
);

function updatePointerPos(event: MouseEvent) {
  Input.pointerPos = new Vec2(event.offsetX, event.offsetY);

  mouseScreenPos.value = new Vec2(event.offsetX, event.offsetY);

  mouseWorldPos.value = screenToWorld({
    camera: camera.value,
    cellSize: cellSize.value,
    screenSize: screenSize.value,
    screenPos: mouseScreenPos.value,
  });

  mouseWorldPos.value = new Vec3(
    Math.round(mouseWorldPos.value.x),
    Math.round(mouseWorldPos.value.y),
    Math.round(mouseWorldPos.value.z)
  );
}

let animFrameRequest: number;

function renderFrame() {
  currentTime.value = Date.now();

  camera.value.pos = { ...playerEntity.finalWorldPos };

  entities.render({ canvasCtx: canvasCtx.value! });

  animFrameRequest = requestAnimationFrame(renderFrame);
}

onUnmounted(() => {
  cancelAnimationFrame(animFrameRequest);
});

useInterval(() => {
  entities.update({
    currentTime: currentTime.value,
    deltaTime: 1000 / 60,
  });
}, 1000 / 60);

onMounted(async () => {
  images.addImage("ground", "/assets/ground.png");
  images.addImage("wall", "/assets/wall.png");
  images.addImage("heart", "/assets/heart.png");
  images.addImage("miner", "/assets/miner.webp");
  images.addImage("bomb", "/assets/bomb.png");

  await images.allImagesLoaded();

  if (canvasRef.value == null) {
    throw new Error("Canvas is null");
  }

  canvasCtx.value = canvasRef.value.getContext("2d")!;

  if (canvasCtx == null) {
    throw new Error("Canvas context is null");
  }

  canvasCtx.value.imageSmoothingEnabled = false;

  renderFrame();
});
</script>
