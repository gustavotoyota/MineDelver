<template>
  <div style="width: 100%; height: 100%">
    <canvas
      ref="canvasRef"
      style="width: 100%; height: 100%"
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
      size="32px"
      name="mdi-cog"
      style="
        position: absolute;
        right: 16px;
        top: 16px;
        color: white;
        cursor: pointer;
      "
      @click="$emit('show-config')"
    />
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from 'src/code/composables/use-event-listener';
import { useInterval } from 'src/code/composables/use-interval';
import { Camera, screenToWorld } from 'src/code/game/camera';
import { Entities } from 'src/code/game/entities/entities';
import { getBombCountColor } from 'src/code/game/entities/map/bomb-count';
import { GameMap } from 'src/code/game/entities/map/game-map';
import { ClickToWalk } from 'src/code/game/entities/map/player/click-to-walk';
import { PlayerKeyboardMovement } from 'src/code/game/entities/map/player/keyboard-movement';
import { PlayerEntity } from 'src/code/game/entities/map/player/player';
import { HPBar } from 'src/code/game/entities/ui/hp-bar';
import { Minimap } from 'src/code/game/entities/ui/minimap';
import { Text } from 'src/code/game/entities/ui/text';
import { Timer } from 'src/code/game/entities/ui/timer';
import { drawCellImage } from 'src/code/game/graphics/draw-cell';
import { Images } from 'src/code/game/images';
import { Input } from 'src/code/game/input';
import {
  cellHasBomb,
  getOrCreateCell,
  IRuntimeCellInfos,
  loadCellCluster,
} from 'src/code/game/map/cells';
import { Grid } from 'src/code/game/map/grid';
import { lerpBetween } from 'src/code/misc/math';
import { IVec2, Vec2 } from 'src/code/misc/vec2';
import { IVec3, Vec3 } from 'src/code/misc/vec3';
import { GameConfigData } from 'src/pages/IndexPage.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  config: GameConfigData;
}>();

const emit = defineEmits(['death', 'show-config']);

function getOrCreateCell_(input_: { worldPos: IVec3 }) {
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
  startPos: IVec3;
  grid: Grid<IRuntimeCellInfos>;
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
const halfCellSize = computed(() => cellSize.value / 2);

const entities = new Entities();

const numCorrectGuesses = ref(-1);

onUnmounted(() => {
  entities.clear();
});

const pointerScreenPos = ref<IVec2>();
const pointerWorldPos = ref<IVec3>();

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
  pointerScreenPos: pointerScreenPos,
  bgColor: ref('black'),
  renderGround: (input_) => {
    if (input_.cellInfos === undefined || input_.cellInfos.hidden) {
      return;
    }

    drawCellImage({
      canvasCtx: input_.canvasCtx,
      halfCellSize: halfCellSize.value,
      screenPos: input_.screenPos,
      camera: input_.camera,
      image: images.getImage('ground')!,
    });

    if (
      input_.cellInfos?.revealed &&
      input_.cellInfos?.numAdjacentBombs !== undefined
    ) {
      input_.canvasCtx.save();
      input_.canvasCtx.fillStyle = getBombCountColor(
        input_.cellInfos.numAdjacentBombs
      );
      input_.canvasCtx.textAlign = 'center';
      input_.canvasCtx.textBaseline = 'middle';
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
        image: images.getImage('wall')!,
      });
    }

    if (input_.cellInfos?.revealed && input_.cellInfos?.hasBomb) {
      drawCellImage({
        canvasCtx: input_.canvasCtx,
        halfCellSize: halfCellSize.value,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: images.getImage('bomb')!,
      });
    }
  },
});

mapEntity.cellEntities.add(playerEntity);

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

watch(playerHP, () => {
  if (playerHP.value === 0) {
    emit('death');

    clearInterval(intervalId.value);
    cancelAnimationFrame(animFrameRequest);
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
  currentTime.value = Date.now();

  updatePointerWorldPos();

  camera.value.pos = { ...playerEntity.movementManager.finalPlayerPos };

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

  await images.allImagesLoaded();

  if (canvasRef.value == null) {
    throw new Error('Canvas is null');
  }

  canvasCtx.value = canvasRef.value.getContext('2d', {
    willReadFrequently: true,
  })!;

  if (canvasCtx.value == null) {
    throw new Error('Canvas context is null');
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
