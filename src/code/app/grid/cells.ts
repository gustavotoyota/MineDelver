import { Vec3 } from 'src/code/misc/vec3';

import { ICellEntity } from '../../core/entities/map/cell-entity';
import { Grid3 } from '../../core/grid/grid3';

export interface ICellData {
  hidden?: boolean;

  hasBomb?: boolean;
  bombProcessed?: boolean;

  numAdjacentBombs?: number;
  unrevealed?: boolean;

  entities?: ICellEntity[];

  flag?: boolean;
}

export function createCell(input: { hasBomb: boolean }): ICellData {
  return {
    hidden: true,
    unrevealed: true,
    ...(input.hasBomb ? { hasBomb: true, bombProcessed: false } : {}),
  };
}

export function getOrCreateCell(input: {
  worldPos: Vec3;
  cellHasBomb: (input: { worldPos: Vec3 }) => boolean;
  grid: Grid3<ICellData>;
}): ICellData {
  let cell = input.grid.getCell(input.worldPos);

  if (cell === undefined) {
    cell = createCell({
      hasBomb: input.cellHasBomb({ worldPos: input.worldPos }),
    });

    input.grid.setCell(input.worldPos, cell);
  }

  return cell;
}
