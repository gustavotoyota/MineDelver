<template>
  <GameCanvas :key="key" @death="() => key++" />
</template>

<script setup lang="ts">
const key = ref(0);
</script>

<style>
body {
  margin: 0;

  overflow: hidden;
}

html,
body {
  height: 100%;
}

#__nuxt {
  height: 100%;
}
</style>
