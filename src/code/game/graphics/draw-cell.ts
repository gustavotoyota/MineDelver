import { IVec2 } from '../../misc/vec2';
import { ICamera } from '../camera';

export function drawCellImage(input: {
  canvasCtx: CanvasRenderingContext2D;
  screenPos: IVec2;
  camera: ICamera;
  image: HTMLImageElement;
  halfCellSize: number;
}) {
  input.canvasCtx.drawImage(
    input.image,
    input.screenPos.x +
      (-input.image.width + input.halfCellSize) * input.camera.zoom,
    input.screenPos.y +
      (-input.image.height + input.halfCellSize) * input.camera.zoom,
    input.image.width * input.camera.zoom,
    input.image.height * input.camera.zoom
  );
}

export function drawSprite(input: {
  canvasCtx: CanvasRenderingContext2D;
  screenPos: IVec2;
  camera: ICamera;
  image: HTMLImageElement;
  halfCellSize: number;
  spritePos: IVec2;
  spriteSize: number;
}) {
  input.canvasCtx.drawImage(
    input.image,
    input.spritePos.x * input.spriteSize,
    input.spritePos.y * input.spriteSize,
    input.spriteSize,
    input.spriteSize,
    input.screenPos.x +
      (-input.spriteSize + input.halfCellSize) * input.camera.zoom,
    input.screenPos.y +
      (-input.spriteSize + input.halfCellSize) * input.camera.zoom,
    input.spriteSize * input.camera.zoom,
    input.spriteSize * input.camera.zoom
  );
}
