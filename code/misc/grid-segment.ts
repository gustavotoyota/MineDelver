import { WorldPos } from "../game/position";

export interface IGridSegment<T> {
  from: WorldPos;
  cells: T[][][];
}
