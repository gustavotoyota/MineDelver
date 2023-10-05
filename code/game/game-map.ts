import { loadCellCluster } from "./cell";
import { CellCollection } from "./cell-collection";
import { IRuntimeCellInfos } from "./runtime-cell-infos";
import { WorldPos } from "./world-pos";

export interface IGameMap {
  seed: number;

  readonly cells: CellCollection<IRuntimeCellInfos>;
}

export class GameMap implements IGameMap {
  seed = 0;

  readonly cells = new CellCollection<IRuntimeCellInfos>();

  constructor() {}
}
