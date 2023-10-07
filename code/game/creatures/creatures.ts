import { WorldPos } from "../map/position";

export interface Creature {
  pos: WorldPos;

  walking?: {
    targetPos: WorldPos;
    progress: number;
  };
}

export const Creatures = Map<string, Creature>;
