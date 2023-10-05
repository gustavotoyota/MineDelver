import { WorldPos } from "./world-pos";
import {
  ItemRanges,
  putInItemRanges,
  getFromItemRanges,
} from "@/code/misc/item-ranges";

export interface ICellCollection<T> {
  setRowCells(startPos: WorldPos, items: T[]): void;
  setCell(pos: WorldPos, item: T): void;

  getRowCells(startPos: WorldPos, count: number): (T | undefined)[];
  getCell(pos: WorldPos): T | undefined;
}

export class CellCollection<T> implements ICellCollection<T> {
  private _cells: ItemRanges<ItemRanges<ItemRanges<T>>> = [];

  setRowCells(startPos: WorldPos, items: T[]) {
    let layer = getFromItemRanges(this._cells, startPos.z, 1)?.[0];

    if (layer == null) {
      layer = [];

      putInItemRanges(this._cells, startPos.z, [layer]);
    }

    let row = getFromItemRanges(layer, startPos.y, 1)?.[0];

    if (row == null) {
      row = [];

      putInItemRanges(layer, startPos.y, [row]);
    }

    putInItemRanges(row, startPos.x, items);
  }
  setCell(pos: WorldPos, item: T) {
    this.setRowCells(pos, [item]);
  }

  getRowCells(startPos: WorldPos, count: number): (T | undefined)[] {
    const layer = getFromItemRanges(this._cells, startPos.z, 1)?.[0];

    if (layer == null) {
      return new Array(count).fill(undefined);
    }

    const row = getFromItemRanges(layer, startPos.y, 1)?.[0];

    if (row == null) {
      return new Array(count).fill(undefined);
    }

    return getFromItemRanges(row, startPos.x, count);
  }
  getCell(pos: WorldPos): T | undefined {
    return this.getRowCells(pos, 1)[0];
  }

  hasCell(pos: WorldPos): boolean {
    return this.getCell(pos) != null;
  }
}
