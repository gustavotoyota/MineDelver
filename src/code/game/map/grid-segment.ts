import { IVec3 } from 'src/code/misc/vec3';

export interface IGridSegment<T> {
  from: IVec3;
  cells: T[][][];
}
