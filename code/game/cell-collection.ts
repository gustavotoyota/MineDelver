import { Position } from "./position";
import {
  ItemRanges,
  addToItemRanges,
  getFromItemRanges,
} from "../misc/item-ranges";

export class CellCollection<T = undefined> {
  private _cells: ItemRanges<ItemRanges<ItemRanges<T>>> = [];

  addRowCells(startPos: Position, items: T[]) {
    let layer = getFromItemRanges(this._cells, startPos.z, 1)?.[0];

    if (layer == null) {
      layer = [];

      addToItemRanges(this._cells, startPos.z, [layer]);
    }

    let row = getFromItemRanges(layer, startPos.y, 1)?.[0];

    if (row == null) {
      row = [];

      addToItemRanges(layer, startPos.y, [row]);
    }

    addToItemRanges(row, startPos.x, items);
  }
  addCell(pos: Position, item: T) {
    this.addRowCells(pos, [item]);
  }

  getRowCells(startPos: Position, count: number): (T | undefined)[] {
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
  getCell(pos: Position): T | undefined {
    return this.getRowCells(pos, 1)[0];
  }
}
