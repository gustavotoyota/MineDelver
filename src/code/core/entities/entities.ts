import { pull } from 'lodash';
import { Vec3 } from 'src/code/misc/vec3';

import { Vec2 } from '../../misc/vec2';
import { ICamera } from '../camera';

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
  }

  add(entity: T) {
    this.list.push(entity);

    let entityInfos = _entityInfos.get(entity);

    if (entityInfos === undefined) {
      entityInfos = { hooks: {}, count: 0 };

      _entityInfos.set(entity, entityInfos);
    }

    entityInfos.count++;

    if (entityInfos.count > 1) {
      return;
    }

    _hooks = entityInfos.hooks;

    entity.setup();
  }

  input(input: InputParams): boolean | void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      for (const listener of _entityInfos.get(this.list[i])?.hooks.onInput ??
        []) {
        if (listener(input)) {
          return true;
        }
      }
    }
  }

  update(input: UpdateParams) {
    this.list.forEach((entity) => {
      _entityInfos
        .get(entity)
        ?.hooks.onUpdate?.forEach((listener) => listener(input));
    });
  }

  render(input: RenderParams) {
    this.list.forEach((entity) => {
      _entityInfos
        .get(entity)
        ?.hooks.onRender?.forEach((listener) => listener(input));
    });
  }

  remove(entity: T) {
    if (pull(this.list, entity).length === 0) {
      return;
    }

    const entityInfos = _entityInfos.get(entity);

    if (entityInfos === undefined) {
      return;
    }

    if (entityInfos.count > 1) {
      return;
    }

    _entityInfos
      .get(entity)
      ?.hooks.onDestroy?.forEach((listener) => listener());
    _entityInfos.delete(entity);
  }

  clear() {
    this.list.forEach((entity) => this.remove(entity));
  }
}

let _hooks: IEntityHooks;

const _entityInfos: Map<IEntity, { hooks: IEntityHooks; count: number }> =
  new Map();

export function getEntityHooks(entity: IEntity): IEntityHooks | undefined {
  return _entityInfos.get(entity)?.hooks;
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
    worldPos: Vec3;
    screenPos: Vec2;
    screenSize: Vec2;
    canvasCtx: CanvasRenderingContext2D;
    camera: ICamera;
    cellSize: number;
  }) => void
) {
  _hooks.onCellRender ??= [];
  _hooks.onCellRender.push(listener);
}
export function onDestroy(listener: () => void) {
  _hooks.onDestroy ??= [];
  _hooks.onDestroy.push(listener);
}
