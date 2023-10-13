import { IRect3 } from 'src/code/misc/rect3';
import {
  getCount,
  getItemsFromSegments,
  getSliceFromSegments,
  putItemsInSegments,
  Segments,
  ToOrCount,
} from 'src/code/misc/segments';
import { Vec3 } from 'src/code/misc/vec3';

import { IGrid } from './grid';
import { Grid2 } from './grid2';

export type Grid3Segments<TCellData> = Segments<Segments<Segments<TCellData>>>;

export class Grid3<TCellData> extends IGrid<TCellData, Vec3> {
  private _segments: Grid3Segments<TCellData>;

  constructor(input?: { segments?: Grid3Segments<TCellData> }) {
    super();

    this._segments = input?.segments ?? [];
  }

  getLayer(z: number): Grid2<TCellData> {
    const layer = getItemsFromSegments(this._segments, z, { count: 1 })?.[0];

    return new Grid2({ segments: layer });
  }

  private _setRowCells(startPos: Vec3, items: TCellData[]) {
    let layer = getItemsFromSegments(this._segments, startPos.z, {
      count: 1,
    })?.[0];

    if (layer === undefined) {
      layer = [];

      putItemsInSegments(this._segments, startPos.z, [layer]);
    }

    let row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row === undefined) {
      row = [];

      putItemsInSegments(layer, startPos.y, [row]);
    }

    putItemsInSegments(row, startPos.x, items);
  }
  setCell(pos: Vec3, item: TCellData) {
    this._setRowCells(pos, [item]);
  }

  private _getRowSegments(
    startPos: Vec3,
    params: ToOrCount
  ): Segments<TCellData> {
    const count = getCount({ from: startPos.x, ...params });

    const layer = getItemsFromSegments(this._segments, startPos.z, {
      count: 1,
    })?.[0];

    if (layer === undefined) {
      return new Array(count).fill(undefined);
    }

    const row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row === undefined) {
      return new Array(count).fill(undefined);
    }

    return getSliceFromSegments(row, startPos.x, { count: count });
  }
  private _getRowCells(
    startPos: Vec3,
    params: ToOrCount
  ): (TCellData | undefined)[] {
    const count = getCount({ from: startPos.x, ...params });

    const layer = getItemsFromSegments(this._segments, startPos.z, {
      count: 1,
    })?.[0];

    if (layer === undefined) {
      return new Array(count).fill(undefined);
    }

    const row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row === undefined) {
      return new Array(count).fill(undefined);
    }

    return getItemsFromSegments(row, startPos.x, { count: count });
  }
  getCell(pos: Vec3): TCellData | undefined {
    return this._getRowCells(pos, { count: 1 })[0];
  }

  getSlice(input: { rect: IRect3 }): Grid3<TCellData> {
    const result = getSliceFromSegments(this._segments, input.rect.min.z, {
      to: input.rect.max.z + 1,
    });

    for (const zSegment of result) {
      for (const [y, ySegments] of zSegment.items.entries()) {
        zSegment.items[y] = getSliceFromSegments(ySegments, input.rect.min.y, {
          to: input.rect.max.y + 1,
        });

        for (const ySegment of zSegment.items[y]) {
          for (const [x, xSegments] of ySegment.items.entries()) {
            ySegment.items[x] = getSliceFromSegments(
              xSegments,
              input.rect.min.x,
              { to: input.rect.max.x + 1 }
            );
          }
        }
      }
    }

    return new Grid3({ segments: result });
  }

  iterateCells(func: (input: { pos: Vec3; cell: TCellData }) => void) {
    for (const zSegment of this._segments) {
      for (const [z, ySegments] of zSegment.items.entries()) {
        for (const ySegment of ySegments) {
          for (const [y, xSegments] of ySegment.items.entries()) {
            for (const xSegment of xSegments) {
              for (const [x, cell] of xSegment.items.entries()) {
                func({
                  pos: new Vec3(
                    xSegment.from + x,
                    ySegment.from + y,
                    zSegment.from + z
                  ),
                  cell: cell,
                });
              }
            }
          }
        }
      }
    }
  }
}
