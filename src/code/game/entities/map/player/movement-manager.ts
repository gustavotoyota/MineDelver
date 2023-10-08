import { IRuntimeCellInfos } from 'src/code/game/map/cells';
import { Grid } from 'src/code/game/map/grid';
import { add2, distChebyshev2D, equal2D, IVec2 } from 'src/code/misc/vec2';
import { IVec3, lerp3, vec2To3 } from 'src/code/misc/vec3';
import { Ref, ref } from 'vue';

import { onUpdate } from '../../entities';

export type PlayerWalkData =
  | {
      sourcePos: IVec3;
      targetPos: IVec3;
      targetIsObstacle: boolean;
      startTime: number;
      endTime: number;
    }
  | undefined;

export class PlayerMovementManager {
  private _walkDuration: Ref<number>;

  private _playerPos: Ref<IVec3>;

  private _grid: Grid<IRuntimeCellInfos>;
  private _currentTime: Ref<number>;

  private _loadCellCluster: (input: { startPos: IVec3 }) => boolean;
  private _movePlayer: (input: { targetPos: IVec3 }) => void;

  private _hp: Ref<number>;

  private _walkData: Ref<PlayerWalkData>;

  private _nextMovements: IVec2[] = [];

  constructor(input: {
    walkDuration: Ref<number>;
    playerPos: Ref<IVec3>;
    grid: Grid<IRuntimeCellInfos>;
    currentTime: Ref<number>;
    loadCellCluster: (input: { startPos: IVec3 }) => boolean;
    movePlayer: (input: { targetPos: IVec3 }) => void;
    hp: Ref<number>;
  }) {
    this._walkDuration = input.walkDuration;
    this._playerPos = input.playerPos;
    this._grid = input.grid;
    this._currentTime = input.currentTime;
    this._loadCellCluster = input.loadCellCluster;
    this._movePlayer = input.movePlayer;
    this._hp = input.hp;

    this._walkData = ref(undefined);
  }

  get data(): Ref<PlayerWalkData> {
    return this._walkData;
  }

  get isWalking(): boolean {
    return this._walkData.value != null;
  }

  get progress(): number {
    if (this._walkData.value != null) {
      return (
        (this._currentTime.value - this._walkData.value.startTime) /
        (this._walkData.value.endTime - this._walkData.value.startTime)
      );
    } else {
      return 0;
    }
  }

  get targetPlayerPos(): IVec3 {
    if (this._walkData.value != null) {
      return this._walkData.value.targetPos;
    } else {
      return this._playerPos.value;
    }
  }

  get finalPlayerPos(): IVec3 {
    if (this._walkData.value != null) {
      return lerp3(
        this._playerPos.value,
        this._walkData.value.targetPos,
        this.progress
      );
    } else {
      return this._playerPos.value;
    }
  }

  cancelNextMovements() {
    this._nextMovements = [];
  }
  setNextMovements(movements: IVec2[]) {
    this._nextMovements = movements.toReversed();
  }

  walkToDirection(direction: IVec2) {
    this.setNextMovements([add2(this._playerPos.value, direction)]);
  }

  get finalTargetPos(): IVec2 {
    if (this._nextMovements.length === 0) {
      return this._playerPos.value;
    } else {
      return this._nextMovements[0];
    }
  }

  private _tryNextMovement() {
    if (this._nextMovements.length === 0) {
      return;
    }

    if (this.isWalking) {
      return;
    }

    const targetPos = vec2To3(
      this._nextMovements.pop()!,
      this._playerPos.value.z
    );

    if (equal2D(targetPos, this._playerPos.value)) {
      return;
    }

    if (distChebyshev2D(targetPos, this._playerPos.value) > 1) {
      this.cancelNextMovements();
      return;
    }

    if (!this._startWalking({ targetPos: targetPos })) {
      this.cancelNextMovements();
    }
  }

  private _startWalking(input: { targetPos: IVec2 }): boolean {
    const targetPos = vec2To3(input.targetPos, this._playerPos.value.z);

    const newCell = this._grid.getCell(targetPos);

    if (newCell == null) {
      throw new Error('New cell is null');
    }

    this._walkData.value = {
      sourcePos: { ...this._playerPos.value },
      targetPos: { ...targetPos },
      targetIsObstacle: !newCell.revealed || !!newCell.hasBomb,
      startTime: this._currentTime.value,
      endTime: this._currentTime.value + this._walkDuration.value,
    };

    return true;
  }

  setup() {
    onUpdate(() => {
      this._tryNextMovement();
    });

    onUpdate(() => {
      if (
        this._walkData.value != null &&
        this._currentTime.value >= this._walkData.value.endTime
      ) {
        const newCell = this._grid.getCell(this._walkData.value.targetPos);

        if (newCell == null) {
          throw new Error('New cell is null');
        }

        if (!newCell.revealed || newCell.hasBomb) {
          if (
            !this._loadCellCluster({ startPos: this._walkData.value.targetPos })
          ) {
            this._hp.value = Math.max(0, this._hp.value - 1);
          }
        }

        this._movePlayer({ targetPos: this._walkData.value.targetPos });

        this._walkData.value = undefined;
      }
    });
  }
}
