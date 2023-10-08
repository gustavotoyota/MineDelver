import { worldToScreen } from "~/code/game/camera";
import { drawSprite } from "~/code/game/graphics/draw-cell";
import { Images } from "~/code/game/images";
import { Input } from "~/code/game/input";
import { IRuntimeCellInfos } from "~/code/game/map/cells";
import { Grid } from "~/code/game/map/grid";
import { WorldPos } from "~/code/game/map/position";
import { StateMachine } from "~/code/game/state-machine";
import { IVec2, Vec2, distChebyshev2D, equal2D } from "~/code/misc/vec2";
import { IVec3, vec2To3 } from "~/code/misc/vec3";
import { onCellRender, onDestroy, onUpdate } from "../../entities";
import { CellEntity } from "../cell-entity";
import {
  PlayerAnimData,
  PlayerWalkData,
  createPlayerAnimMachine,
} from "./anim-machine";
import { PlayerHurt } from "./hurt";

const _sprites: Record<string, IVec2[]> = {
  "idle-down": [new Vec2(1, 0)],
  "idle-left": [new Vec2(1, 1)],
  "idle-right": [new Vec2(1, 2)],
  "idle-up": [new Vec2(1, 3)],
  "walk-down": [new Vec2(0, 0), new Vec2(1, 0), new Vec2(2, 0)],
  "walk-left": [new Vec2(0, 1), new Vec2(1, 1), new Vec2(2, 1)],
  "walk-right": [new Vec2(0, 2), new Vec2(1, 2), new Vec2(2, 2)],
  "walk-up": [new Vec2(0, 3), new Vec2(1, 3), new Vec2(2, 3)],
  "mine-down": [new Vec2(3, 0), new Vec2(4, 0), new Vec2(5, 0)],
  "mine-left": [new Vec2(3, 1), new Vec2(4, 1), new Vec2(5, 1)],
  "mine-right": [new Vec2(3, 2), new Vec2(4, 2), new Vec2(5, 2)],
  "mine-up": [new Vec2(3, 3), new Vec2(4, 3), new Vec2(5, 3)],
};

export class PlayerEntity extends CellEntity {
  private _images: Images;

  private _hp: Ref<number>;
  private _maxHP: Ref<number>;

  readonly worldPos: Ref<IVec3>;

  protected _grid: Grid<IRuntimeCellInfos>;

  private _loadCellCluster: (input: { startPos: IVec3 }) => boolean;

  private _animMachine: StateMachine<PlayerAnimData>;

  private _currentTime: Ref<number>;

  private _walkDuration: Ref<number>;
  private _walkData: Ref<PlayerWalkData>;
  private _walkPromise?: Promise<void>;

  private _hurt: PlayerHurt;

  constructor(input: {
    hp: Ref<number>;
    maxHP: Ref<number>;
    worldPos: Ref<IVec3>;
    images: Images;
    grid: Grid<IRuntimeCellInfos>;
    loadCellCluster: (input: { startPos: IVec3 }) => boolean;
    currentTime: Ref<number>;
    walkDuration: Ref<number>;
  }) {
    super();

    this._hp = input.hp;
    this._maxHP = input.maxHP;
    this.worldPos = input.worldPos;
    this._images = input.images;
    this._grid = input.grid;
    this._loadCellCluster = input.loadCellCluster;
    this._currentTime = input.currentTime;
    this._walkDuration = input.walkDuration;

    this._walkData = ref(undefined);

    this._animMachine = createPlayerAnimMachine({
      playerHP: this._hp,
      playerMaxHP: this._maxHP,
      currentTime: this._currentTime,
      playerWalking: this._walkData,
      worldPos: this.worldPos,
    });

    this._hurt = new PlayerHurt({
      hp: this._hp,
      currentTime: this._currentTime,
    });
  }

  isWalking(): boolean {
    return this._walkPromise != null;
  }

  walk(input: { targetPos: IVec2 }): Promise<void> | undefined {
    if (this._walkPromise != null) {
      return this._walkPromise;
    }

    if (distChebyshev2D(input.targetPos, this.worldPos.value) !== 1) {
      return;
    }

    const targetPos = vec2To3(input.targetPos, this.worldPos.value.z);

    const newCell = this._grid.getCell(targetPos);

    if (newCell == null) {
      throw new Error("New cell is null");
    }

    this._walkData.value = {
      sourcePos: { ...this.worldPos.value },
      targetPos: { ...targetPos },
      targetIsObstacle: !newCell.revealed || !!newCell.hasBomb,
      startTime: this._currentTime.value,
      endTime: this._currentTime.value + this._walkDuration.value,
    };

    this._walkPromise = new Promise((resolve) => {
      setTimeout(() => {
        if (!newCell.revealed || newCell.hasBomb) {
          if (!this._loadCellCluster({ startPos: targetPos })) {
            this._hp.value = Math.max(0, this._hp.value - 1);
          }
        }

        this.move({ targetPos: targetPos });

        this._walkPromise = undefined;

        resolve();
      }, this._walkDuration.value);
    });

    return this._walkPromise;
  }

  get finalWorldPos(): IVec3 {
    if (this._walkPromise != null) {
      const progress =
        (this._currentTime.value - this._walkData.value!.startTime) /
        (this._walkData.value!.endTime - this._walkData.value!.startTime);

      const newWorldPos = new WorldPos(
        this._walkData.value!.sourcePos.x +
          (this._walkData.value!.targetPos.x -
            this._walkData.value!.sourcePos.x) *
            progress,
        this._walkData.value!.sourcePos.y +
          (this._walkData.value!.targetPos.y -
            this._walkData.value!.sourcePos.y) *
            progress,
        this._walkData.value!.sourcePos.z
      );

      return newWorldPos;
    }

    return { ...this.worldPos.value };
  }

  setup(): void {
    this._hurt.setup();

    onUpdate(() => {
      const newPlayerPos = { ...this.worldPos.value };

      if (
        Input.keyDown["KeyQ"] ||
        Input.keyDown["KeyW"] ||
        Input.keyDown["KeyE"] ||
        Input.keyDown["ArrowUp"] ||
        Input.keyDown["Numpad7"] ||
        Input.keyDown["Numpad8"] ||
        Input.keyDown["Numpad9"]
      ) {
        newPlayerPos.y -= 1;
      }
      if (
        Input.keyDown["KeyS"] ||
        Input.keyDown["KeyZ"] ||
        Input.keyDown["KeyX"] ||
        Input.keyDown["KeyC"] ||
        Input.keyDown["ArrowDown"] ||
        Input.keyDown["Numpad1"] ||
        Input.keyDown["Numpad2"] ||
        Input.keyDown["Numpad3"]
      ) {
        newPlayerPos.y += 1;
      }
      if (
        Input.keyDown["KeyQ"] ||
        Input.keyDown["KeyA"] ||
        Input.keyDown["KeyZ"] ||
        Input.keyDown["ArrowLeft"] ||
        Input.keyDown["Numpad7"] ||
        Input.keyDown["Numpad4"] ||
        Input.keyDown["Numpad1"]
      ) {
        newPlayerPos.x -= 1;
      }
      if (
        Input.keyDown["KeyE"] ||
        Input.keyDown["KeyD"] ||
        Input.keyDown["KeyC"] ||
        Input.keyDown["ArrowRight"] ||
        Input.keyDown["Numpad9"] ||
        Input.keyDown["Numpad6"] ||
        Input.keyDown["Numpad3"]
      ) {
        newPlayerPos.x += 1;
      }

      if (!equal2D(newPlayerPos, this.worldPos.value)) {
        this.walk({ targetPos: newPlayerPos });

        return true;
      }
    });

    onCellRender((input) => {
      if (this._hurt.isBlinking()) {
        return;
      }

      let screenPos: IVec2;

      let spriteIndex: number;

      if (this._walkPromise != null) {
        const newWorldPos = this.finalWorldPos;

        screenPos = worldToScreen({
          worldPos: newWorldPos,
          camera: input.camera,
          cellSize: input.cellSize,
          screenSize: input.screenSize,
        });

        spriteIndex = Math.min(
          _sprites[this._animMachine.state].length - 1,
          Math.floor(
            ((this._currentTime.value - this._walkData.value!.startTime) /
              (this._walkData.value!.endTime -
                this._walkData.value!.startTime)) *
              3
          )
        );
      } else {
        screenPos = input.screenPos;

        spriteIndex = 0;
      }

      drawSprite({
        canvasCtx: input.canvasCtx,
        halfCellSize: input.halfCellSize,
        screenPos: screenPos,
        camera: input.camera,
        image: this._images.getImage("miner")!,
        spritePos: _sprites[this._animMachine.state][spriteIndex],
        spriteSize: input.cellSize,
      });
    });

    onDestroy(() => {
      this._animMachine.destroy();
    });
  }
}
