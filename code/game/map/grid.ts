import { Segments, getFromSegments, putInSegments } from "~/code/misc/segments";
import { IVec3 } from "~/code/misc/vec3";

export class Grid<T> {
  private _cells: Segments<Segments<Segments<T>>> = [];

  setRowCells(startPos: IVec3, items: T[]) {
    let layer = getFromSegments(this._cells, startPos.z, 1)?.[0];

    if (layer == null) {
      layer = [];

      putInSegments(this._cells, startPos.z, [layer]);
    }

    let row = getFromSegments(layer, startPos.y, 1)?.[0];

    if (row == null) {
      row = [];

      putInSegments(layer, startPos.y, [row]);
    }

    putInSegments(row, startPos.x, items);
  }
  setCell(pos: IVec3, item: T) {
    this.setRowCells(pos, [item]);
  }

  getRowCells(startPos: IVec3, count: number): (T | undefined)[] {
    const layer = getFromSegments(this._cells, startPos.z, 1)?.[0];

    if (layer == null) {
      return new Array(count).fill(undefined);
    }

    const row = getFromSegments(layer, startPos.y, 1)?.[0];

    if (row == null) {
      return new Array(count).fill(undefined);
    }

    return getFromSegments(row, startPos.x, count);
  }
  getCell(pos: IVec3): T | undefined {
    return this.getRowCells(pos, 1)[0];
  }

  getOrCreateCell(pos: IVec3, create: () => T): T {
    let cell = this.getCell(pos);

    if (cell == null) {
      cell = create();

      this.setCell(pos, cell);
    }

    return cell;
  }

  hasCell(pos: IVec3): boolean {
    return this.getCell(pos) != null;
  }
}
