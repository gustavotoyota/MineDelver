import { IVec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { Input } from '../../input';
import { IRuntimeCellInfos } from '../../map/cells';
import { Grid } from '../../map/grid';
import { IEntity, onInput } from '../entities';

export class Flagging implements IEntity {
  private _grid: Grid<IRuntimeCellInfos>;
  private _pointerWorldPos: Ref<IVec3 | undefined>;

  constructor(input: {
    grid: Grid<IRuntimeCellInfos>;
    pointerWorldPos: Ref<IVec3 | undefined>;
  }) {
    this._grid = input.grid;
    this._pointerWorldPos = input.pointerWorldPos;
  }

  setup(): void {
    onInput(() => {
      if (!Input.pointerDown[2] || this._pointerWorldPos.value == null) {
        return;
      }

      const cell = this._grid.getCell(this._pointerWorldPos.value);

      if (cell == null || cell.revealed) {
        return;
      }

      if (cell.flag) {
        delete cell.flag;
      } else {
        cell.flag = true;
      }

      return true;
    });
  }
}
