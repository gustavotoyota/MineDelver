import { pull } from "lodash";
import { IVec2 } from "../../misc/vec2";
import { ICamera } from "../camera";
import { WorldPos } from "../map/position";

export interface IEntity {
  setup(): void;
}

export type IEntityHooks = Record<string, ((...args: any[]) => any)[]>;

export type InputParams = { event: UIEvent };
export type UpdateParams = { currentTime: number; deltaTime: number };
export type RenderParams = { canvasCtx: CanvasRenderingContext2D };

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

  input(input: InputParams): boolean | void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      for (const listener of entityHooks.get(this.list[i])?.onInput ?? []) {
        if (listener(input)) {
          return true;
        }
      }
    }
  }

  update(input: UpdateParams) {
    this.list.forEach((entity) => {
      entityHooks.get(entity)?.onUpdate?.forEach((listener) => listener(input));
    });
  }

  render(input: RenderParams) {
    this.list.forEach((entity) => {
      entityHooks.get(entity)?.onRender?.forEach((listener) => listener(input));
    });
  }

  remove(entity: T) {
    pull(this.list, entity);

    entityHooks.get(entity)?.onDestroy?.forEach((listener) => listener());

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
export function onInput(listener: (input: InputParams) => boolean | void) {
  _hooks.onInput ??= [];
  _hooks.onInput.push(listener);
}
export function onUpdate(listener: (input: UpdateParams) => void) {
  _hooks.onUpdate ??= [];
  _hooks.onUpdate.push(listener);
}
export function onRender(listener: (input: RenderParams) => void) {
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
