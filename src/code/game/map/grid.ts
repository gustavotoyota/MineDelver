import {
  getCount,
  getItemsFromSegments,
  putItemsInSegments,
  Segments,
  ToOrCount,
} from 'src/code/misc/segments';
import { IVec3 } from 'src/code/misc/vec3';

export class Grid<T> {
  private _cells: Segments<Segments<Segments<T>>> = [];

  setRowCells(startPos: IVec3, items: T[]) {
    let layer = getItemsFromSegments(this._cells, startPos.z, {
      count: 1,
    })?.[0];

    if (layer == null) {
      layer = [];

      putItemsInSegments(this._cells, startPos.z, [layer]);
    }

    let row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row == null) {
      row = [];

      putItemsInSegments(layer, startPos.y, [row]);
    }

    putItemsInSegments(row, startPos.x, items);
  }
  setCell(pos: IVec3, item: T) {
    this.setRowCells(pos, [item]);
  }

  getRowCells(startPos: IVec3, params: ToOrCount): (T | undefined)[] {
    const count = getCount({ from: startPos.x, ...params });

    const layer = getItemsFromSegments(this._cells, startPos.z, {
      count: 1,
    })?.[0];

    if (layer == null) {
      return new Array(count).fill(undefined);
    }

    const row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row == null) {
      return new Array(count).fill(undefined);
    }

    return getItemsFromSegments(row, startPos.x, { count: count });
  }
  getCell(pos: IVec3): T | undefined {
    return this.getRowCells(pos, { count: 1 })[0];
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
