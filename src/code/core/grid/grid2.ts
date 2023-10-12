import { IRect } from 'src/code/misc/rect';
import {
  getCount,
  getItemsFromSegments,
  getSliceFromSegments,
  putItemsInSegments,
  Segments,
  ToOrCount,
} from 'src/code/misc/segments';
import { Vec2 } from 'src/code/misc/vec2';

import { IGrid } from './grid';

export type Grid2Segments<TCellData> = Segments<Segments<TCellData>>;

export class Grid2<TCellData> extends IGrid<TCellData, Vec2> {
  private _segments: Grid2Segments<TCellData>;

  constructor(input?: { segments?: Grid2Segments<TCellData> }) {
    super();

    this._segments = input?.segments ?? [];
  }

  private _setRowCells(startPos: Vec2, items: TCellData[]) {
    let row = getItemsFromSegments(this._segments, startPos.y, {
      count: 1,
    })?.[0];

    if (row === undefined) {
      row = [];

      putItemsInSegments(this._segments, startPos.y, [row]);
    }

    putItemsInSegments(row, startPos.x, items);
  }
  setCell(pos: Vec2, item: TCellData): void {
    this._setRowCells(pos, [item]);
  }

  private _getRowCells(
    startPos: Vec2,
    params: ToOrCount
  ): (TCellData | undefined)[] {
    const count = getCount({ from: startPos.x, ...params });

    const row = getItemsFromSegments(this._segments, startPos.y, {
      count: 1,
    })?.[0];

    if (row === undefined) {
      return new Array(count).fill(undefined);
    }

    return getItemsFromSegments(row, startPos.x, { count: count });
  }
  getCell(pos: Vec2): TCellData | undefined {
    return this._getRowCells(pos, { count: 1 })[0];
  }

  getSlice(input: { rect: IRect<Vec2> }): IGrid<TCellData, Vec2> {
    const result = getSliceFromSegments(this._segments, input.rect.min.y, {
      to: input.rect.max.y + 1,
    });

    for (const ySegment of result) {
      for (const [x, xSegments] of ySegment.items.entries()) {
        ySegment.items[x] = getSliceFromSegments(xSegments, input.rect.min.x, {
          to: input.rect.max.x + 1,
        });
      }
    }

    return new Grid2({ segments: result });
  }

  iterateCells(func: (input: { pos: Vec2; cell: TCellData }) => void): void {
    for (const ySegment of this._segments) {
      for (const [y, xSegments] of ySegment.items.entries()) {
        for (const xSegment of xSegments) {
          for (const [x, cell] of xSegment.items.entries()) {
            func({
              pos: new Vec2(xSegment.from + x, ySegment.from + y),
              cell: cell,
            });
          }
        }
      }
    }
  }
}
