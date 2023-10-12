<template>
  <div style="width: 100%; height: 100%">
    <canvas
      ref="canvasRef"
      style="width: 100%; height: 100%"
      oncontextmenu="return false"
      @pointermove="(event) => updatePointerPos(event)"
      @pointerleave="
        () => {
          pointerScreenPos = undefined;
          pointerWorldPos = undefined;
        }
      "
      @pointerdown="
        (event) => {
          Input.pointerDown[event.button] = true;

          updatePointerPos(event);

          entities.input({ event });
        }
      "
      @pointerup="
        (event) => {
          Input.pointerDown[event.button] = false;

          entities.input({ event });
        }
      "
    ></canvas>

    <q-icon
      size="28px"
      name="mdi-cog"
      style="
        position: absolute;
        right: 16px;
        top: 16px;
        color: #d0d0d0;
        cursor: pointer;
      "
      @click="$emit('show-config')"
    />

    <button
      v-if="$q.platform.is.mobile"
      style="
        position: absolute;
        left: 16px;
        bottom: 16px;
        padding: 10px 12px;
        background-color: #404040;
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: #d0d0d0;
      "
      :style="{ 'background-color': flagMode ? '#600000' : '#404040' }"
      @click="flagMode = !flagMode"
    >
      Toggle flag mode
    </button>
  </div>
</template>

<script setup lang="ts">
import { getBombCountColor } from 'src/code/app/entities/map/bomb-count';
import { CellHover } from 'src/code/app/entities/map/cell-hover';
import { Flagging } from 'src/code/app/entities/map/flagging';
import { MapGridEntity } from 'src/code/app/entities/map/grid';
import { ClickToWalk } from 'src/code/app/entities/player/click-to-walk';
import { PlayerKeyboardMovement } from 'src/code/app/entities/player/keyboard-movement';
import { PlayerEntity } from 'src/code/app/entities/player/player';
import { HPBar } from 'src/code/app/entities/ui/hp-bar';
import { Minimap } from 'src/code/app/entities/ui/minimap';
import { Text } from 'src/code/app/entities/ui/text';
import { Timer } from 'src/code/app/entities/ui/timer';
import {
  cellHasBomb,
  getOrCreateCell,
  ICellData,
  loadCellCluster,
} from 'src/code/app/grid/cells';
import {
  Camera,
  getVisibleWorldRect,
  screenToWorld,
} from 'src/code/core/camera';
import { Entities } from 'src/code/core/entities/entities';
import { GameMap } from 'src/code/core/entities/map/game-map';
import { renderCellImage } from 'src/code/core/graphics/rendering';
import { Grid } from 'src/code/core/grid/grid';
import { Images } from 'src/code/core/images';
import { Input } from 'src/code/core/input';
import { lerpBetween } from 'src/code/misc/math';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { useEventListener } from 'src/composables/use-event-listener';
import { useInterval } from 'src/composables/use-interval';
import { GameConfigData } from 'src/pages/IndexPage.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  config: GameConfigData;
}>();

const emit = defineEmits(['death', 'show-config']);

function getOrCreateCell_(input_: { worldPos: Vec3 }) {
  return getOrCreateCell({
    worldPos: input_.worldPos,
    cellHasBomb: (input_) =>
      cellHasBomb({
        seed: seed,
        worldPos: input_.worldPos,
        bombProbability:
          Math.abs(input_.worldPos.x) <= 1 && Math.abs(input_.worldPos.y) <= 1
            ? 0
            : props.config.bombPercentage / 100,
      }),
    grid: grid,
  });
}

function loadCellCluster_(input: {
  seed: number;
  startPos: Vec3;
  grid: Grid<ICellData>;
}) {
  return loadCellCluster({
    startPos: input.startPos,
    numCorrectGuesses: numCorrectGuesses,
    getOrCreateCell: (input_) =>
      getOrCreateCell_({
        worldPos: input_.worldPos,
      }),
  });
}

const canvasRef = ref<HTMLCanvasElement>();

const currentTime = ref(Date.now());

const camera = ref(new Camera());

const playerMaxHP = ref(
  props.config.numLives <= 10 ? props.config.numLives : Infinity
);
const playerHP = ref(playerMaxHP.value);

const seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);

const canvasCtx = ref<CanvasRenderingContext2D>();

const images = new Images();

const cellSize = ref(32);

const entities = new Entities();

const numCorrectGuesses = ref(0);

const flagMode = ref(false);

onUnmounted(() => {
  entities.clear();
});

const pointerScreenPos = ref<Vec2>();
const pointerWorldPos = ref<Vec3>();

const screenSize = ref(new Vec2());

const minimapScale = ref(3);
const minimapSize = ref(new Vec2(200, 150));

const grid = new Grid<ICellData>();

let stopTimer = false;

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
  walkDuration: ref(150),
});

grid.setCell(new Vec3(), { entities: [playerEntity] });

useEventListener(
  () => window,
  'resize',
  () => (screenSize.value = new Vec2(innerWidth, innerHeight))
);

onMounted(() => {
  screenSize.value = new Vec2(innerWidth, innerHeight);
});

watch(screenSize, () => {
  canvasRef.value!.width = screenSize.value.x;
  canvasRef.value!.height = screenSize.value.y;

  if (canvasCtx.value !== undefined) {
    canvasCtx.value.imageSmoothingEnabled = false;
  }

  camera.value.zoom =
    (32 / cellSize.value) *
    lerpBetween(
      300,
      1920,
      Math.max(screenSize.value.x, screenSize.value.y),
      0.8,
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
  renderCellOfLayerBelowEntities: [
    (input_) => {
      if (input_.cellData === undefined || input_.cellData.hidden) {
        return;
      }

      renderCellImage({
        renderCellImage: input_.canvasCtx,
        cellSize: cellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage('ground')!,
      });
    },
  ],
  renderBeforeEntities: (input_) => {
    if (input_.cellData === undefined || input_.cellData.hidden) {
      return;
    }

    if (input_.cellData?.unrevealed) {
      renderCellImage({
        renderCellImage: input_.canvasCtx,
        cellSize: cellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage('wall')!,
      });

      if (input_.cellData?.flag) {
        renderCellImage({
          renderCellImage: input_.canvasCtx,
          cellSize: cellSize.value,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: images.getImage('flag')!,
        });
      }
    }

    if (!input_.cellData?.unrevealed && input_.cellData?.hasBomb) {
      renderCellImage({
        renderCellImage: input_.canvasCtx,
        cellSize: cellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage('bomb')!,
      });
    }
  },
  renderCellOfLayerAboveEntities: [
    (input_) => {
      if (input_.cellData === undefined || input_.cellData.hidden) {
        return;
      }

      if (
        !input_.cellData?.unrevealed &&
        input_.cellData?.numAdjacentBombs !== undefined
      ) {
        const isPlayerOnCell = new Vec2(input_.worldPos).equals(
          playerEntity.worldPos.value
        );

        input_.canvasCtx.save();

        input_.canvasCtx.fillStyle = getBombCountColor(
          input_.cellData.numAdjacentBombs
        );
        input_.canvasCtx.textAlign = 'center';
        input_.canvasCtx.textBaseline = 'middle';
        input_.canvasCtx.font = `500 ${
          (cellSize.value * input_.camera.zoom) / 1.6
        }px Play`;

        if (isPlayerOnCell) {
          input_.canvasCtx.strokeStyle = 'black';
          input_.canvasCtx.lineWidth = 2.5 * camera.value.zoom;

          input_.canvasCtx.strokeText(
            input_.cellData.numAdjacentBombs.toString(),
            input_.screenPos.x,
            input_.screenPos.y
          );
        }

        input_.canvasCtx.fillText(
          input_.cellData.numAdjacentBombs.toString(),
          input_.screenPos.x,
          input_.screenPos.y
        );

        input_.canvasCtx.restore();
      }
    },
  ],
});

mapEntity.cellEntities.add(playerEntity);

entities.add(mapEntity);

entities.add(
  new MapGridEntity({
    camera: camera,
    cellSize: cellSize,
    screenSize: screenSize,
  })
);

entities.add(
  new CellHover({
    camera: camera,
    grid: grid,
    pointerWorldPos: pointerWorldPos,
    cellSize: cellSize,
    screenSize: screenSize,
  })
);

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
  new Text({
    pos: ref(new Vec2(10, 58)),
    text: computed(() => `Successful: ${numCorrectGuesses.value}`),
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

entities.add(
  new PlayerKeyboardMovement({
    walkToDirection: (direction) =>
      playerEntity.movementManager.walkToDirection(direction),
  })
);

entities.add(
  new ClickToWalk({
    grid: grid,
    playerMovementManager: playerEntity.movementManager,
    pointerWorldPos: pointerWorldPos,
  })
);

entities.add(
  new Flagging({
    grid: grid,
    pointerWorldPos: pointerWorldPos,
    flagMode: flagMode,
  })
);

watch(playerHP, () => {
  if (playerHP.value === 0) {
    const visibleWorldRect = getVisibleWorldRect({
      screenSize: screenSize.value,
      camera: camera.value,
      cellSize: cellSize.value,
    });

    const gridSlice = grid.getSlice({ rect: visibleWorldRect });

    gridSlice.iterateCells(({ cell }) => {
      if (cell?.hasBomb) {
        delete cell.unrevealed;
      }
    });

    clearInterval(intervalId.value);

    stopTimer = true;

    emit('death');
  }
});

loadCellCluster_({
  seed: seed,
  grid: grid,
  startPos: new Vec3(),
});

useEventListener(
  () => window,
  'keydown',
  (event) => {
    Input.keyDown[event.code] = true;

    entities.input({ event });
  }
);

useEventListener(
  () => window,
  'keyup',
  (event) => {
    Input.keyDown[event.code] = false;
  }
);

function updatePointerPos(event: MouseEvent) {
  Input.pointerPos = new Vec2(event.offsetX, event.offsetY);

  pointerScreenPos.value = new Vec2(event.offsetX, event.offsetY);

  updatePointerWorldPos();
}

function updatePointerWorldPos() {
  if (pointerScreenPos.value !== undefined) {
    pointerWorldPos.value = screenToWorld({
      camera: camera.value,
      cellSize: cellSize.value,
      screenSize: screenSize.value,
      screenPos: pointerScreenPos.value,
    });

    pointerWorldPos.value = new Vec3(
      Math.round(pointerWorldPos.value.x),
      Math.round(pointerWorldPos.value.y),
      Math.round(pointerWorldPos.value.z)
    );
  }
}

let animFrameRequest: number;

function renderFrame() {
  if (!stopTimer) {
    currentTime.value = Date.now();
  }

  updatePointerWorldPos();

  camera.value.pos = new Vec3(playerEntity.movementManager.finalPlayerPos);

  entities.render({ canvasCtx: canvasCtx.value! });

  animFrameRequest = requestAnimationFrame(renderFrame);
}

onUnmounted(() => {
  cancelAnimationFrame(animFrameRequest);
});

const intervalId = useInterval(() => {
  entities.update({
    currentTime: currentTime.value,
    deltaTime: 1000 / 60,
  });
}, 1000 / 60);

onMounted(async () => {
  images.addImage('ground', '/assets/ground.png');
  images.addImage('wall', '/assets/wall.png');
  images.addImage('heart', '/assets/heart.png');
  images.addImage('miner', '/assets/miner.webp');
  images.addImage('bomb', '/assets/bomb.png');
  images.addImage('flag', '/assets/flag.png');

  await images.allImagesLoaded();

  if (canvasRef.value === undefined) {
    throw new Error('Canvas is undefined');
  }

  canvasCtx.value = canvasRef.value.getContext('2d', { alpha: false })!;

  if (canvasCtx.value === undefined) {
    throw new Error('Canvas context is undefined');
  }

  canvasCtx.value.imageSmoothingEnabled = false;

  renderFrame();
});
</script>

<style scoped>
canvas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
