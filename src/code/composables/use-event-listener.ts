import { onBeforeUnmount, onMounted } from 'vue';

export function useEventListener<K extends keyof DocumentEventMap>(
  document: () => Document,
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any
): void;

export function useEventListener<K extends keyof WindowEventMap>(
  window: () => Window,
  type: K,
  listener: (this: Document, ev: WindowEventMap[K]) => any
): void;

export function useEventListener(...args: any[]) {
  onMounted(() => {
    args[0]().addEventListener(args[1], args[2]);
  });

  onBeforeUnmount(() => {
    args[0]().removeEventListener(args[1], args[2]);
  });
}
