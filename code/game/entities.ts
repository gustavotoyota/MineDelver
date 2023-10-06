import { IVec2 } from "../misc/vec2";
import { WorldPos } from "./position";

export interface Entity {
  pos: WorldPos;

  walking?: {
    targetPos: WorldPos;
    progress: number;
  };
}

export const Entities = Map<string, Entity>;
