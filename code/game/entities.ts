import { pull } from "lodash";

export interface IEntity {
  setup(): void;
}

export interface RenderListener {
  (input: { canvasCtx: CanvasRenderingContext2D }): void;
}

export interface IEntityHooks {
  onCreate: (() => void)[];
  onUpdate: (() => void)[];
  onRender: RenderListener[];
  onDestroy: (() => void)[];
}

export class Entities {
  private _entities: IEntity[] = [];

  private _hooks: Map<IEntity, IEntityHooks> = new Map();

  add(entity: IEntity) {
    this._entities.push(entity);

    _hooks = {
      onCreate: [],
      onUpdate: [],
      onRender: [],
      onDestroy: [],
    };

    entity.setup();

    _hooks.onCreate.forEach((listener) => listener());

    this._hooks.set(entity, _hooks);
  }

  update() {
    this._entities.forEach((entity) => {
      const hooks = this._hooks.get(entity);

      if (hooks == null) {
        return;
      }

      hooks.onUpdate.forEach((listener) => listener());
    });
  }

  render(input: { canvasCtx: CanvasRenderingContext2D }) {
    this._entities.forEach((entity) => {
      const hooks = this._hooks.get(entity);

      if (hooks == null) {
        return;
      }

      hooks.onRender.forEach((listener) =>
        listener({ canvasCtx: input.canvasCtx })
      );
    });
  }

  remove(entity: IEntity) {
    pull(this._entities, entity);

    const hooks = this._hooks.get(entity);

    if (hooks == null) {
      return;
    }

    hooks.onDestroy.forEach((listener) => listener());
  }
}

let _hooks: IEntityHooks;

export function onCreate(listener: () => void) {
  _hooks.onCreate.push(listener);
}
export function onUpdate(listener: () => void) {
  _hooks.onUpdate.push(listener);
}
export function onRender(listener: RenderListener) {
  _hooks.onRender.push(listener);
}
export function onDestroy(listener: () => void) {
  _hooks.onDestroy.push(listener);
}
