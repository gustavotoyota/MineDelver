import { IVec2 } from "~/code/misc/vec2";
import { IEntity, onCellRender } from "../entities";
import { StateMachine } from "../../state-machine";
import { IVec3 } from "~/code/misc/vec3";
import { CellEntity, ICellEntity } from "../cell-entity";
import { drawCellImage } from "../../graphics/draw-cell";
import { Images } from "../../images";
import { pull } from "lodash";
import { Grid } from "../../map/grid";
import { IRuntimeCellInfos } from "../../map/cells";
import {
  PlayerAnimData,
  PlayerWalkData,
  createPlayerAnimMachine,
} from "./anim-machine";
import { WorldPos } from "../../map/position";
import { worldToScreen } from "../../camera";

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

  walk(input: { targetPos: IVec3 }): Promise<void> {
    const newCell = this._grid.getCell(input.targetPos);

    if (newCell == null) {
      throw new Error("New cell is null");
    }

    if (!newCell.revealed) {
      if (!this._loadCellCluster({ startPos: input.targetPos })) {
        this._hp.value -= 1;
      }
    }

    this._walkData.value = {
      sourcePos: { ...this.worldPos.value },
      targetPos: { ...input.targetPos },
      startTime: this._currentTime.value,
      endTime: this._currentTime.value + this._walkDuration.value,
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        this.move({ targetPos: input.targetPos });

        resolve();
      }, this._walkDuration.value);
    });
  }

  get finalWorldPos(): IVec3 {
    if (this._animMachine.state.startsWith("walk")) {
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
      if (this._animMachine.state.startsWith("walk")) {
        const newWorldPos = this.finalWorldPos;

        const newScreenPos = worldToScreen({
          worldPos: newWorldPos,
          camera: input.camera,
          cellSize: input.cellSize,
          screenSize: input.screenSize,
        });

        drawCellImage({
          canvasCtx: input.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: newScreenPos,
          camera: input.camera,
          image: this._images.getImage("character")!,
        });
      } else {
        drawCellImage({
          canvasCtx: input.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input.screenPos,
          camera: input.camera,
          image: this._images.getImage("character")!,
        });
      }
    });
  }
}
