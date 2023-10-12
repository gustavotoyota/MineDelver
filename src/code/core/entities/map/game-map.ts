import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICellData } from '../../../app/grid/cells';
import { getVisibleWorldRect, ICamera, worldToScreen } from '../../camera';
import { Grid3 } from '../../grid/grid3';
import {
  Entities,
  getEntityHooks,
  IEntity,
  onDestroy,
  onInput,
  onRender,
  onUpdate,
} from '../entities';
import { ICellEntity } from './cell-entity';

export interface IRenderCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: Vec3;
    screenPos: Vec2;
    cellData: ICellData | undefined; // Here for optimization
    camera: ICamera;
  }): void;
}

export class GameMap implements IEntity {
  private _grid: Grid3<ICellData>;
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;
  private _renderCellOfLayerBelowEntities?: IRenderCell[];
  private _renderBeforeEntities?: IRenderCell;
  private _renderAfterEntities?: IRenderCell;
  private _renderCellOfLayerAboveEntities?: IRenderCell[];

  private _cellEntities: Entities<ICellEntity>;

  get cellEntities(): Entities<ICellEntity> {
    return this._cellEntities;
  }

  constructor(input: {
    grid: Grid3<ICellData>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    renderCellOfLayerBelowEntities?: IRenderCell[];
    renderBeforeEntities?: IRenderCell;
    renderAfterEntities?: IRenderCell;
    renderCellOfLayerAboveEntities?: IRenderCell[];
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._grid = input.grid;
    this._renderCellOfLayerBelowEntities = input.renderCellOfLayerBelowEntities;
    this._renderBeforeEntities = input.renderBeforeEntities;
    this._renderAfterEntities = input.renderAfterEntities;
    this._renderCellOfLayerAboveEntities = input.renderCellOfLayerAboveEntities;
    this._cellEntities = new Entities();
  }

  private _drawLayer(input: {
    gridSlice: Grid3<ICellData | undefined>;
    screenSize: Vec2;
    canvasCtx: CanvasRenderingContext2D;
    drawCell: (input: {
      worldPos: Vec3;
      screenPos: Vec2;
      cellData: ICellData | undefined;
    }) => void;
  }) {
    input.gridSlice.iterateCells(({ pos, cell }) => {
      const screenPos = worldToScreen({
        screenSize: input.screenSize,
        camera: this._camera.value,
        worldPos: pos,
        cellSize: this._cellSize.value,
      });

      input.drawCell({
        worldPos: pos,
        screenPos: screenPos,
        cellData: cell,
      });
    });
  }

  setup(): void {
    onInput((input) => {
      for (const entity of this._cellEntities.list) {
        for (const listener of getEntityHooks(entity)?.onInput ?? []) {
          listener(input);
        }
      }
    });

    onUpdate((input) => {
      this._cellEntities.update(input);
    });

    onRender((input) => {
      const screenSize = new Vec2(
        input.canvasCtx.canvas.width,
        input.canvasCtx.canvas.height
      );

      const visibleWorldRect = getVisibleWorldRect({
        screenSize: screenSize,
        camera: this._camera.value,
        cellSize: this._cellSize.value,
      });

      const gridSlice = this._grid.getSlice({ rect: visibleWorldRect });

      // Clear the canvas

      input.canvasCtx.clearRect(0, 0, screenSize.x, screenSize.y);

      // Draw the map

      for (const renderFunc of this._renderCellOfLayerBelowEntities ?? []) {
        this._drawLayer({
          canvasCtx: input.canvasCtx,
          gridSlice: gridSlice,
          screenSize: screenSize,
          drawCell: (input_) => {
            renderFunc({
              canvasCtx: input.canvasCtx,
              worldPos: input_.worldPos,
              screenPos: input_.screenPos,
              cellData: input_.cellData,
              camera: this._camera.value,
            });
          },
        });
      }

      this._drawLayer({
        canvasCtx: input.canvasCtx,
        gridSlice: gridSlice,
        screenSize: screenSize,
        drawCell: (input_) => {
          this._renderBeforeEntities?.({
            canvasCtx: input.canvasCtx,
            worldPos: input_.worldPos,
            screenPos: input_.screenPos,
            cellData: input_.cellData,
            camera: this._camera.value,
          });

          for (const entity of input_.cellData?.entities ?? []) {
            getEntityHooks(entity)?.onCellRender?.forEach((listener) => {
              listener({
                canvasCtx: input.canvasCtx,
                worldPos: input_.worldPos,
                screenPos: input_.screenPos,
                screenSize: screenSize,
                cellData: input_.cellData,
                camera: this._camera.value,
                cellSize: this._cellSize.value,
              });
            });
          }
          this._renderAfterEntities?.({
            canvasCtx: input.canvasCtx,
            worldPos: input_.worldPos,
            screenPos: input_.screenPos,
            cellData: input_.cellData,
            camera: this._camera.value,
          });
        },
      });

      for (const renderFunc of this._renderCellOfLayerAboveEntities ?? []) {
        this._drawLayer({
          canvasCtx: input.canvasCtx,
          gridSlice: gridSlice,
          screenSize: screenSize,
          drawCell: (input_) => {
            renderFunc({
              canvasCtx: input.canvasCtx,
              worldPos: input_.worldPos,
              screenPos: input_.screenPos,
              cellData: input_.cellData,
              camera: this._camera.value,
            });
          },
        });
      }

      this._cellEntities.render(input);
    });

    onDestroy(() => {
      this._cellEntities.clear();
    });
  }
}
