import { onMounted, onUnmounted, Ref, ref } from 'vue';

export function useInterval(
  handler: () => void,
  ms?: number
): Ref<NodeJS.Timeout | number> {
  const intervalId = ref() as Ref<NodeJS.Timeout | number>;

  onMounted(() => {
    intervalId.value = setInterval(handler, ms);
  });

  onUnmounted(() => {
    clearInterval(intervalId.value);
  });

  return intervalId;
}
