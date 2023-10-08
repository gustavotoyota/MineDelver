import { IVec3 } from "~/code/misc/vec3";

export interface IGridSegment<T> {
  from: IVec3;
  cells: T[][][];
}
