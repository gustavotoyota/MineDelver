import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { Input } from '../../input';
import { ICellData } from '../../map/cells';
import { Grid } from '../../map/grid';
import { IEntity, onInput } from '../entities';

export class Flagging implements IEntity {
  private _grid: Grid<ICellData>;
  private _pointerWorldPos: Ref<Vec3 | undefined>;
  private _flagMode: Ref<boolean>;

  constructor(input: {
    grid: Grid<ICellData>;
    pointerWorldPos: Ref<Vec3 | undefined>;
    flagMode: Ref<boolean>;
  }) {
    this._grid = input.grid;
    this._pointerWorldPos = input.pointerWorldPos;
    this._flagMode = input.flagMode;
  }

  setup(): void {
    onInput(() => {
      if (
        (!(this._flagMode.value && Input.pointerDown[0]) &&
          !Input.pointerDown[2]) ||
        this._pointerWorldPos.value == null
      ) {
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
