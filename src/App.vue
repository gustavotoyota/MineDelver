<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar';

useMeta(() => ({
  title: 'MineDelver - Infinite Minesweeper RPG',
  meta: {
    description: {
      name: 'description',
      value:
        'MineDelver is an infinite minesweeper game with some RPG elements. ',
    },
  },
}));
</script>

<style>
@font-face {
  font-family: Play;
  src: url(/public/fonts/Play/Play-Regular.ttf);
}

* {
  user-select: none;

  font-family: Play, sans-serif;
}

body {
  background-color: black;
}
</style>
