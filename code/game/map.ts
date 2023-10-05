import { CellCollection } from "./cell-collection";
import { IRuntimeCellInfos } from "./runtime-cell-infos";

export interface IGame {
  seed: number;

  cells: CellCollection<IRuntimeCellInfos>;
}
