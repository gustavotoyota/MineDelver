<template>
  <q-page style="position: relative">
    <GameCanvas
      :key="key"
      @death="
        () => {
          died = true;
          configVisible = true;
        }
      "
      :config="gameConfig"
      @show-config="() => (configVisible = true)"
    />

    <GameConfigWindow
      v-if="configVisible"
      :died="died"
      :config="gameConfig"
      @start-game="
        (event) => {
          _localStorage.setItem('gameConfig', JSON.stringify(event.config));
          Object.assign(gameConfig, event.config);
          configVisible = false;
          died = false;
          key++;
        }
      "
      @close="configVisible = false"
    />
  </q-page>
</template>

<script lang="ts">
export interface GameConfigData {
  bombPercentage: number;
  numLives: number;
}
</script>

<script setup lang="ts">
import GameCanvas from 'src/components/GameCanvas.vue';
import GameConfigWindow from 'src/components/GameConfigWindow.vue';
import { onBeforeMount, reactive, ref } from 'vue';

const key = ref(0);

const configVisible = ref(false);

const died = ref(false);

const gameConfig = reactive({
  bombPercentage: 20,
  numLives: 3,
});

let _localStorage: Storage;

onBeforeMount(() => {
  _localStorage = localStorage;

  if (localStorage.getItem('gameConfig')) {
    Object.assign(gameConfig, JSON.parse(localStorage.getItem('gameConfig')!));

    key.value++;
  }
});
</script>
