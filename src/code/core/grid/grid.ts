import { IRect } from 'src/code/misc/rect';

export abstract class IGrid<CellData, Vec> {
  abstract setCell(pos: Vec, item: CellData): void;

  abstract getCell(pos: Vec): CellData | undefined;

  getOrCreateCell(pos: Vec, create: () => CellData): CellData {
    let cell = this.getCell(pos);

    if (cell === undefined) {
      cell = create();

      this.setCell(pos, cell);
    }

    return cell;
  }

  hasCell(pos: Vec): boolean {
    return this.getCell(pos) !== undefined;
  }

  abstract getSlice(input: { rect: IRect<Vec> }): IGrid<CellData, Vec>;

  abstract iterateCells(
    func: (input: { pos: Vec; cell: CellData }) => void
  ): void;
}
