import { CellCollection } from "./cell-collection";
import { IRuntimeCellInfos } from "./runtime-cell-infos";

export interface IGameMap {
  seed: number;

  readonly cells: CellCollection<IRuntimeCellInfos>;
}

export class GameMap implements IGameMap {
  seed: number;

  readonly cells = new CellCollection<IRuntimeCellInfos>();

  constructor(input?: { seed?: number }) {
    this.seed = input?.seed ?? 0;
  }
}
