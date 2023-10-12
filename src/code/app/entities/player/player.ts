import { ICellData } from 'src/code/app/grid/cells';
import { worldToScreen } from 'src/code/core/camera';
import { renderSprite } from 'src/code/core/graphics/rendering';
import { Grid3 } from 'src/code/core/grid/grid3';
import { Images } from 'src/code/core/images';
import { StateMachine } from 'src/code/core/state-machine';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import {
  Entities,
  IEntity,
  onCellRender,
  onDestroy,
} from '../../../core/entities/entities';
import { CellEntity } from '../../../core/entities/map/cell-entity';
import { createPlayerAnimMachine, PlayerAnimData } from './anim-machine';
import { PlayerHurt } from './hurt';
import { PlayerMovementManager } from './movement-manager';

const _sprites: Record<string, Vec2[]> = {
  'idle-down': [new Vec2(1, 0)],
  'idle-left': [new Vec2(1, 1)],
  'idle-right': [new Vec2(1, 2)],
  'idle-up': [new Vec2(1, 3)],
  'walk-down': [new Vec2(0, 0), new Vec2(1, 0), new Vec2(2, 0)],
  'walk-left': [new Vec2(0, 1), new Vec2(1, 1), new Vec2(2, 1)],
  'walk-right': [new Vec2(0, 2), new Vec2(1, 2), new Vec2(2, 2)],
  'walk-up': [new Vec2(0, 3), new Vec2(1, 3), new Vec2(2, 3)],
  'mine-down': [new Vec2(3, 0), new Vec2(4, 0), new Vec2(5, 0)],
  'mine-left': [new Vec2(3, 1), new Vec2(4, 1), new Vec2(5, 1)],
  'mine-right': [new Vec2(3, 2), new Vec2(4, 2), new Vec2(5, 2)],
  'mine-up': [new Vec2(3, 3), new Vec2(4, 3), new Vec2(5, 3)],
};

export class PlayerEntity extends CellEntity {
  private _images: Images;

  private _hp: Ref<number>;
  private _maxHP: Ref<number>;

  readonly worldPos: Ref<Vec3>;

  protected _grid: Grid3<ICellData>;

  private _loadCellCluster: (input: { startPos: Vec3 }) => boolean;

  private _animMachine: StateMachine<PlayerAnimData>;

  private _currentTime: Ref<number>;

  private _walkDuration: Ref<number>;

  private _hurt: PlayerHurt;

  public readonly movementManager: PlayerMovementManager;

  public readonly entities: Entities<IEntity> = new Entities();

  constructor(input: {
    hp: Ref<number>;
    maxHP: Ref<number>;
    worldPos: Ref<Vec3>;
    images: Images;
    grid: Grid3<ICellData>;
    loadCellCluster: (input: { startPos: Vec3 }) => boolean;
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

    this.movementManager = new PlayerMovementManager({
      walkDuration: this._walkDuration,
      playerPos: this.worldPos,
      grid: this._grid,
      currentTime: this._currentTime,
      loadCellCluster: this._loadCellCluster,
      movePlayer: ({ targetPos }) => this.move({ targetPos }),
      hp: this._hp,
    });

    this._animMachine = createPlayerAnimMachine({
      playerHP: this._hp,
      playerMaxHP: this._maxHP,
      currentTime: this._currentTime,
      playerWalking: this.movementManager.data,
      worldPos: this.worldPos,
    });

    this._hurt = new PlayerHurt({
      hp: this._hp,
      currentTime: this._currentTime,
    });
  }

  setup(): void {
    this._hurt.setup();

    this.movementManager.setup();

    onCellRender((input) => {
      if (this._hurt.isBlinking()) {
        return;
      }

      let screenPos: Vec2;

      let spriteIndex: number;

      if (this.movementManager.isWalking) {
        const newWorldPos = this.movementManager.finalPlayerPos;

        screenPos = worldToScreen({
          worldPos: newWorldPos,
          camera: input.camera,
          cellSize: input.cellSize,
          screenSize: input.screenSize,
        });

        spriteIndex = Math.min(
          Math.max(0, Math.floor((1 - this.movementManager.progress) * 3)),
          _sprites[this._animMachine.state].length - 1
        );
      } else {
        screenPos = input.screenPos;

        spriteIndex = 0;
      }

      renderSprite({
        canvasCtx: input.canvasCtx,
        cellSize: input.cellSize,
        screenPos: screenPos,
        camera: input.camera,
        image: this._images.getImage('miner')!,
        spritePos: _sprites[this._animMachine.state][spriteIndex],
        spriteSize: input.cellSize,
      });
    });

    onDestroy(() => {
      this._animMachine.destroy();
      this.entities.clear();
    });
  }
}
