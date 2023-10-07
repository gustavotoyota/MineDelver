export function useInterval(handler: () => void, ms?: number) {
  let intervalId: NodeJS.Timeout;

  onMounted(() => {
    intervalId = setInterval(handler, ms);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });
}
