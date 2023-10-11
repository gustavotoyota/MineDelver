import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera, screenToWorld, worldToScreen } from '../../camera';
import { ICellData } from '../../map/cells';
import { Grid } from '../../map/grid';
import { getVisibleWorldRect } from '../../map/visible-cells';
import {
  Entities,
  entityHooks,
  IEntity,
  onDestroy,
  onInput,
  onRender,
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
  private _grid: Grid<ICellData>;
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;
  private _pointerScreenPos: Ref<Vec2 | undefined>;
  private _bgColor: Ref<string>;
  private _renderCellOfLayerBelowEntities?: IRenderCell[];
  private _renderBeforeEntities?: IRenderCell;
  private _renderAfterEntities?: IRenderCell;
  private _renderCellOfLayerAboveEntities?: IRenderCell[];
  public readonly cellEntities: Entities<ICellEntity>;

  constructor(input: {
    grid: Grid<ICellData>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    pointerScreenPos: Ref<Vec2 | undefined>;
    bgColor: Ref<string>;
    renderCellOfLayerBelowEntities?: IRenderCell[];
    renderBeforeEntities?: IRenderCell;
    renderAfterEntities?: IRenderCell;
    renderCellOfLayerAboveEntities?: IRenderCell[];
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._pointerScreenPos = input.pointerScreenPos;
    this._grid = input.grid;
    this._bgColor = input.bgColor;
    this._renderCellOfLayerBelowEntities = input.renderCellOfLayerBelowEntities;
    this._renderBeforeEntities = input.renderBeforeEntities;
    this._renderAfterEntities = input.renderAfterEntities;
    this._renderCellOfLayerAboveEntities = input.renderCellOfLayerAboveEntities;
    this.cellEntities = new Entities();
  }

  private _drawLayer(input: {
    gridSlice: Grid<ICellData | undefined>;
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
    this.cellEntities.list.forEach((entity) => entity.setup());

    onInput((input) => {
      for (const entity of this.cellEntities.list) {
        for (const listener of entityHooks.get(entity)?.onInput ?? []) {
          listener(input);
        }
      }
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

      input.canvasCtx.save();
      input.canvasCtx.fillStyle = this._bgColor.value;
      input.canvasCtx.fillRect(0, 0, screenSize.x, screenSize.y);
      input.canvasCtx.restore();

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
            entityHooks.get(entity)?.onCellRender?.forEach((listener) => {
              listener({
                canvasCtx: input.canvasCtx,
                worldPos: input_.worldPos,
                screenPos: input_.screenPos,
                screenSize: screenSize,
                cellData: input_.cellData,
                camera: this._camera.value,
                cellSize: this._cellSize.value,
                halfCellSize: this._cellSize.value / 2,
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

      // Draw the hovered cell

      if (this._pointerScreenPos.value !== undefined) {
        let pointerWorldPos = screenToWorld({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: screenSize,
          screenPos: this._pointerScreenPos.value,
        });

        pointerWorldPos = new Vec3(
          Math.round(pointerWorldPos.x),
          Math.round(pointerWorldPos.y),
          Math.round(pointerWorldPos.z)
        );

        const pointerCell = gridSlice.getCell(pointerWorldPos);

        const pointerScreenPos = worldToScreen({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: screenSize,
          worldPos: new Vec3(
            Math.round(pointerWorldPos.x),
            Math.round(pointerWorldPos.y),
            Math.round(pointerWorldPos.z)
          ),
        });

        input.canvasCtx.save();
        input.canvasCtx.strokeStyle = pointerCell?.unrevealed
          ? '#00d000'
          : '#f0f0f0';
        input.canvasCtx.lineWidth = 2;
        input.canvasCtx.strokeRect(
          pointerScreenPos.x -
            (this._cellSize.value / 2) * this._camera.value.zoom,
          pointerScreenPos.y -
            (this._cellSize.value / 2) * this._camera.value.zoom,
          this._cellSize.value * this._camera.value.zoom,
          this._cellSize.value * this._camera.value.zoom
        );
        input.canvasCtx.restore();
      }
    });

    onDestroy(() => {
      this.cellEntities.clear();
    });
  }
}
