import {
  getVisibleWorldRect,
  ICamera,
  worldToScreen,
} from 'src/code/domain/camera';
import { IEntity, onRender } from 'src/code/domain/entities/entities';
import { lerpBetween } from 'src/code/misc/math';
import { Rect2 } from 'src/code/misc/rect2';
import { Rect3 } from 'src/code/misc/rect3';
import { Vec2 } from 'src/code/misc/vec2';
import { Ref } from 'vue';

export class MapGridEntity implements IEntity {
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;
  private _screenSize: Ref<Vec2>;

  constructor(input: {
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    screenSize: Ref<Vec2>;
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._screenSize = input.screenSize;
  }

  setup(): void {
    onRender((input) => {
      const visibleWorldRect = getVisibleWorldRect({
        camera: this._camera.value,
        cellSize: this._cellSize.value,
        screenSize: this._screenSize.value,
      });

      const cornersWorldRect = new Rect3(
        visibleWorldRect.min.sub(0.5),
        visibleWorldRect.max.add(0.5)
      );

      const screenRect = new Rect2(
        worldToScreen({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: this._screenSize.value,
          worldPos: cornersWorldRect.min,
        }),
        worldToScreen({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: this._screenSize.value,
          worldPos: cornersWorldRect.max,
        })
      );

      input.canvasCtx.save();
      input.canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      input.canvasCtx.lineWidth = 1;

      input.canvasCtx.beginPath();

      for (
        let worldY = visibleWorldRect.min.y - 0.5;
        worldY <= visibleWorldRect.max.y + 0.5;
        ++worldY
      ) {
        const screenY = lerpBetween(
          cornersWorldRect.min.y,
          cornersWorldRect.max.y,
          worldY,
          screenRect.min.y,
          screenRect.max.y
        );

        input.canvasCtx.moveTo(0, screenY);
        input.canvasCtx.lineTo(this._screenSize.value.x, screenY);
      }

      for (
        let worldX = visibleWorldRect.min.x - 0.5;
        worldX <= visibleWorldRect.max.x + 0.5;
        ++worldX
      ) {
        const screenY = lerpBetween(
          cornersWorldRect.min.x,
          cornersWorldRect.max.x,
          worldX,
          screenRect.min.x,
          screenRect.max.x
        );

        input.canvasCtx.moveTo(screenY, 0);
        input.canvasCtx.lineTo(screenY, this._screenSize.value.y);
      }

      input.canvasCtx.stroke();

      input.canvasCtx.restore();
    });
  }
}
