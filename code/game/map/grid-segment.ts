import { WorldPos } from "./position";

export interface IGridSegment<T> {
  from: WorldPos;
  cells: T[][][];
}
