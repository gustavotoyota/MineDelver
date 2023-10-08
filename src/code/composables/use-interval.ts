import { onMounted, onUnmounted } from 'vue';

export function useInterval(handler: () => void, ms?: number) {
  let intervalId: NodeJS.Timeout | number;

  onMounted(() => {
    intervalId = setInterval(handler, ms);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });
}
