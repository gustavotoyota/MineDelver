<template>
  <div
    style="
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      background-color: rgba(0, 0, 0, 0.25);
    "
  >
    <div
      style="
        border: 1px solid #505050;
        border-radius: 7px;
        padding: 16px;
        background-color: rgba(48, 48, 48, 0.95);
        font-size: 13px;
        color: #d0d0d0;
        width: 170px;
      "
    >
      <template v-if="died">
        <div style="color: red; font-weight: bold; font-size: 14px">
          You died!
        </div>

        <div style="height: 16px"></div>
      </template>

      <div>
        <div>Bomb percentage: {{ _config.bombPercentage }}%</div>
        <input
          type="range"
          min="10"
          max="25"
          step="1"
          v-model="_config.bombPercentage"
          style="width: 100%"
        />
        <div>
          Difficulty:
          {{
            _config.bombPercentage < 12.5
              ? 'Easy'
              : _config.bombPercentage < 17.5
              ? 'Medium'
              : _config.bombPercentage < 22.5
              ? 'Hard'
              : 'Extreme'
          }}
        </div>
      </div>

      <div style="height: 16px"></div>

      <div>
        <div>
          Num lives:
          {{ _config.numLives <= 10 ? _config.numLives : 'Infinite' }}
        </div>
        <input
          type="range"
          min="1"
          max="11"
          v-model="_config.numLives"
          style="width: 100%"
        />
      </div>

      <div style="height: 16px"></div>

      <div>
        <button
          ref="startGameButton"
          style="
            background-color: #404040;
            border: 1px solid #808080;
            color: #d0d0d0;
            width: 100%;
          "
          @click="
            () => {
              _localStorage.setItem('gameConfig', JSON.stringify(_config));

              $emit('startGame', { config: _config });
            }
          "
        >
          Start new game
        </button>
      </div>
    </div>

    <div></div>
  </div>
</template>

<script setup lang="ts">
import { GameConfigData } from 'src/pages/IndexPage.vue';
import { onMounted, reactive, ref } from 'vue';

defineEmits(['startGame']);

defineProps<{ died: boolean }>();

const _config: GameConfigData = reactive({
  bombPercentage: 15,
  numLives: 3,
});

const startGameButton = ref<HTMLButtonElement>();

let _localStorage: Storage;

onMounted(() => {
  _localStorage = localStorage;

  if (localStorage.getItem('gameConfig')) {
    Object.assign(_config, JSON.parse(localStorage.getItem('gameConfig')!));
  }

  startGameButton.value?.focus();
});
</script>
