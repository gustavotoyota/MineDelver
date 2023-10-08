<template>
  <q-page style="position: relative">
    <GameCanvas :key="key" @death="() => key++" />
  </q-page>
</template>

<script setup lang="ts">
import GameCanvas from 'src/components/GameCanvas.vue';
import { ref } from 'vue';

const key = ref(0);
</script>
