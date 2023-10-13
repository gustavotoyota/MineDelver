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
        background-color: rgba(48, 48, 48, 0.8);
        font-size: 13px;
        color: #d0d0d0;
        width: 200px;
      "
    >
      <div style="display: flex; justify-content: space-between">
        <div style="font-weight: bold; font-size: 15px">
          <div v-if="died" style="color: red">You died!</div>
          <div v-else>New game</div>
        </div>

        <q-icon
          v-if="!died"
          name="mdi-close"
          size="20px"
          style="cursor: pointer"
          @click="$emit('close')"
        />
      </div>

      <div style="height: 16px"></div>

      <div>
        <label>
          <input type="checkbox" v-model="_config.displayGrid" /> Display grid
        </label>
      </div>

      <div style="height: 16px"></div>

      <div>
        <div><b>Bomb percentage:</b> {{ _config.bombPercentage }}%</div>
        <input
          type="range"
          min="10"
          max="30"
          step="1"
          v-model="_config.bombPercentage"
          style="width: 100%"
        />
        <div>
          <b>Difficulty:</b>
          {{
            _config.bombPercentage < 12.5
              ? 'Easy'
              : _config.bombPercentage < 17.5
              ? 'Medium'
              : _config.bombPercentage < 22.5
              ? 'Hard'
              : _config.bombPercentage < 27.5
              ? 'Extreme'
              : 'Impossible'
          }}
        </div>
      </div>

      <div style="height: 16px"></div>

      <div>
        <div>
          <b>Num. lives:</b>
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
            padding: 6px;
            background-color: #404040;
            border: 1px solid #808080;
            color: #d0d0d0;
            width: 100%;
          "
          @click="() => $emit('startGame', { config: _config })"
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

defineEmits(['startGame', 'close']);

const props = defineProps<{
  died: boolean;
  config: GameConfigData;
}>();

const _config: GameConfigData = reactive(props.config);

const startGameButton = ref<HTMLButtonElement>();

onMounted(() => {
  startGameButton.value?.focus();
});
</script>
