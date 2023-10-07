import { IVec2 } from "~/code/misc/vec2";
import { IEntity, onCellRender } from "./entities";
import { StateMachine } from "../state-machine";
import { IVec3 } from "~/code/misc/vec3";
import { ICellEntity } from "./cell-entity";
import { drawCellImage } from "../graphics/draw-cell";
import { Images } from "../images";

export interface PlayerData {
  hp: number;
  maxHP: number;

  walking?: {
    targetPos: IVec2;
    progress: number;
  };
}

export class Player implements ICellEntity {
  private _images: Images;

  private _hp: Ref<number>;
  private _maxHP: Ref<number>;

  readonly worldPos: Ref<IVec3>;

  private _animMachine: StateMachine<string, PlayerData>;

  constructor(input: {
    animMachine: StateMachine<string, PlayerData>;
    hp: Ref<number>;
    maxHP: Ref<number>;
    worldPos: Ref<IVec3>;
    images: Images;
  }) {
    this._animMachine = input.animMachine;
    this._hp = input.hp;
    this._maxHP = input.maxHP;
    this.worldPos = input.worldPos;
    this._images = input.images;
  }

  setup(): void {
    onCellRender((input) => {
      drawCellImage({
        canvasCtx: input.canvasCtx,
        halfCellSize: input.halfCellSize,
        screenPos: input.screenPos,
        camera: input.camera,
        image: this._images.getImage("character")!,
      });
    });
  }
}
