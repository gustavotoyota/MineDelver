import { worldToScreen } from "~/code/game/camera";
import { drawCellImage } from "~/code/game/graphics/draw-cell";
import { Images } from "~/code/game/images";
import { IRuntimeCellInfos } from "~/code/game/map/cells";
import { Grid } from "~/code/game/map/grid";
import { WorldPos } from "~/code/game/map/position";
import { StateMachine } from "~/code/game/state-machine";
import { IVec2, distChebyshev2D } from "~/code/misc/vec2";
import { IVec3, vec2To3 } from "~/code/misc/vec3";
import { onCellRender } from "../../entities";
import { CellEntity } from "../cell-entity";
import {
  PlayerAnimData,
  PlayerWalkData,
  createPlayerAnimMachine,
} from "./anim-machine";

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
  private _walkPromise: Promise<void> | undefined;

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

    if (!newCell.revealed) {
      if (!this._loadCellCluster({ startPos: targetPos })) {
        this._hp.value = Math.max(0, this._hp.value - 1);
      }
    }

    this._walkData.value = {
      sourcePos: { ...this.worldPos.value },
      targetPos: { ...targetPos },
      startTime: this._currentTime.value,
      endTime: this._currentTime.value + this._walkDuration.value,
    };

    this._walkPromise = new Promise((resolve) => {
      setTimeout(() => {
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
    onCellRender((input) => {
      let screenPos: IVec2;

      if (this._walkPromise != null) {
        const newWorldPos = this.finalWorldPos;

        screenPos = worldToScreen({
          worldPos: newWorldPos,
          camera: input.camera,
          cellSize: input.cellSize,
          screenSize: input.screenSize,
        });
      } else {
        screenPos = input.screenPos;
      }

      drawCellImage({
        canvasCtx: input.canvasCtx,
        halfCellSize: input.halfCellSize,
        screenPos: screenPos,
        camera: input.camera,
        image: this._images.getImage("character")!,
      });
    });
  }
}
