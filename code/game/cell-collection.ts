import { WorldPos } from "./position";
import {
  ItemRanges,
  putInItemRanges,
  getFromItemRanges,
} from "@/code/misc/item-ranges";

export interface ICellCollection<T> {
  setCell(pos: WorldPos, item: T): void;
  getCell(pos: WorldPos): T | undefined;

  setRowCells(startPos: WorldPos, items: T[]): void;
  getRowCells(startPos: WorldPos, count: number): (T | undefined)[];

  getOrCreateCell(pos: WorldPos, create: () => T): T;

  hasCell(pos: WorldPos): boolean;
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

  getOrCreateCell(pos: WorldPos, create: () => T): T {
    let cell = this.getCell(pos);

    if (cell == null) {
      cell = create();

      this.setCell(pos, cell);
    }

    return cell;
  }

  hasCell(pos: WorldPos): boolean {
    return this.getCell(pos) != null;
  }
}
