import { Vec2 } from 'src/code/misc/vec2';

import { IEntity, onRender } from './entities';

export class BackgroundEntity implements IEntity {
  setup(): void {
    onRender(({ canvasCtx }) => {
      const screenSize = new Vec2(
        canvasCtx.canvas.width,
        canvasCtx.canvas.height
      );

      canvasCtx.clearRect(0, 0, screenSize.x, screenSize.y);
    });
  }
}
