import { pull } from "lodash";
import { IVec2 } from "../../misc/vec2";
import { ICamera } from "../camera";
import { WorldPos } from "../map/position";

export interface IEntity {
  setup(): void;
}

export type IEntityHooks = Record<string, ((...args: any[]) => any)[]>;

export class Entities<T extends IEntity> {
  readonly list: T[] = [];

  constructor(entities: T[] = []) {
    entities.forEach((entity) => this.add(entity));

    onUnmounted(() => {
      this.clear();
    });
  }

  add(entity: T) {
    this.list.push(entity);

    _hooks = {};

    entity.setup();

    _hooks.onCreate?.forEach((listener) => listener());

    entityHooks.set(entity, _hooks);
  }

  render(input: { canvasCtx: CanvasRenderingContext2D }) {
    this.list.forEach((entity) => {
      const hooks = entityHooks.get(entity);

      if (hooks == null) {
        return;
      }

      hooks.onRender?.forEach((listener) =>
        listener({ canvasCtx: input.canvasCtx })
      );
    });
  }

  remove(entity: T) {
    pull(this.list, entity);

    const hooks = entityHooks.get(entity);

    if (hooks == null) {
      return;
    }

    hooks.onDestroy?.forEach((listener) => listener());

    entityHooks.delete(entity);
  }

  clear() {
    this.list.forEach((entity) => this.remove(entity));
  }
}

let _hooks: IEntityHooks;

export const entityHooks: Map<IEntity, IEntityHooks> = new Map();

export function onCreate(listener: () => void) {
  _hooks.onCreate ??= [];
  _hooks.onCreate.push(listener);
}
export function onRender(
  listener: (input: { canvasCtx: CanvasRenderingContext2D }) => void
) {
  _hooks.onRender ??= [];
  _hooks.onRender.push(listener);
}
export function onCellRender(
  listener: (input: {
    worldPos: WorldPos;
    screenPos: IVec2;
    screenSize: IVec2;
    canvasCtx: CanvasRenderingContext2D;
    camera: ICamera;
    cellSize: number;
    halfCellSize: number;
  }) => void
) {
  _hooks.onCellRender ??= [];
  _hooks.onCellRender.push(listener);
}
export function onDestroy(listener: () => void) {
  _hooks.onDestroy ??= [];
  _hooks.onDestroy.push(listener);
}
