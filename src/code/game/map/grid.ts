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

type GridSegments<T> = Segments<Segments<Segments<T>>>;

export interface IMatrixSegment<T> {
  from: Vec3;
  cells: T[][][];
}

export class Grid<T> {
  private _segments: GridSegments<T>;

  constructor(input?: { segments?: GridSegments<T> }) {
    this._segments = input?.segments ?? [];
  }

  private _setRowCells(startPos: Vec3, items: T[]) {
    let layer = getItemsFromSegments(this._segments, startPos.z, {
      count: 1,
    })?.[0];

    if (layer == null) {
      layer = [];

      putItemsInSegments(this._segments, startPos.z, [layer]);
    }

    let row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row == null) {
      row = [];

      putItemsInSegments(layer, startPos.y, [row]);
    }

    putItemsInSegments(row, startPos.x, items);
  }
  setCell(pos: Vec3, item: T) {
    this._setRowCells(pos, [item]);
  }

  private _getRowSegments(startPos: Vec3, params: ToOrCount): Segments<T> {
    const count = getCount({ from: startPos.x, ...params });

    const layer = getItemsFromSegments(this._segments, startPos.z, {
      count: 1,
    })?.[0];

    if (layer == null) {
      return new Array(count).fill(undefined);
    }

    const row = getItemsFromSegments(layer, startPos.y, { count: 1 })?.[0];

    if (row == null) {
      return new Array(count).fill(undefined);
    }

    return getSliceFromSegments(row, startPos.x, { count: count });
  }
  private _getRowCells(startPos: Vec3, params: ToOrCount): (T | undefined)[] {
    const count = getCount({ from: startPos.x, ...params });

    const layer = getItemsFromSegments(this._segments, startPos.z, {
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
  getCell(pos: Vec3): T | undefined {
    return this._getRowCells(pos, { count: 1 })[0];
  }

  getOrCreateCell(pos: Vec3, create: () => T): T {
    let cell = this.getCell(pos);

    if (cell == null) {
      cell = create();

      this.setCell(pos, cell);
    }

    return cell;
  }

  hasCell(pos: Vec3): boolean {
    return this.getCell(pos) != null;
  }

  getSlice(input: { rect: IRect3 }): Grid<T> {
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

    return new Grid({ segments: result });
  }

  iterateCells(func: (input: { pos: Vec3; cell: T }) => void) {
    for (const zSegment of this._segments) {
      for (const ySegments of zSegment.items) {
        for (const ySegment of ySegments) {
          for (const [y, xSegments] of ySegment.items.entries()) {
            for (const xSegment of xSegments) {
              for (const [x, cell] of xSegment.items.entries()) {
                func({
                  pos: new Vec3(
                    xSegment.from + x,
                    ySegment.from + y,
                    zSegment.from
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

  getMatrixSlice(input: { rect: IRect3 }): IMatrixSegment<T | undefined> {
    const grid: IMatrixSegment<T | undefined> = {
      from: new Vec3(input.rect.min.x, input.rect.min.y, input.rect.min.z),
      cells: [],
    };

    for (let z = input.rect.min.z; z <= input.rect.max.z; z++) {
      const layer: (T | undefined)[][] = [];

      for (let y = input.rect.min.y; y <= input.rect.max.y; y++) {
        const startX = input.rect.min.x;
        const endX = input.rect.max.x;

        const row = this._getRowCells(new Vec3(startX, y, z), {
          count: endX - startX + 1,
        });

        layer.push(row);
      }

      grid.cells.push(layer);
    }

    return grid;
  }
}
