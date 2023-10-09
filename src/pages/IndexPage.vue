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
    />

    <GameConfigWindow
      v-if="configVisible"
      :died="died"
      :config="gameConfig"
      @start-game="
        (event) => {
          Object.assign(gameConfig, event.config);
          configVisible = false;
          key++;
        }
      "
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
import { reactive, ref } from 'vue';

const key = ref(0);

const configVisible = ref(true);

const died = ref(false);

const gameConfig = reactive({
  bombPercentage: 15,
  numLives: 3,
});
</script>
