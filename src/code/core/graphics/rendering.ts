import { Vec2 } from '../../misc/vec2';
import { ICamera } from '../camera';

export function renderCellImage(input: {
  canvasCtx: CanvasRenderingContext2D;
  screenPos: Vec2;
  camera: ICamera;
  image: HTMLImageElement;
  cellSize: number;
}) {
  const halfCellSize = input.cellSize / 2;

  input.canvasCtx.drawImage(
    input.image,
    input.screenPos.x + (-input.image.width + halfCellSize) * input.camera.zoom,
    input.screenPos.y +
      (-input.image.height + halfCellSize) * input.camera.zoom,
    input.image.width * input.camera.zoom,
    input.image.height * input.camera.zoom
  );
}

export function renderSprite(input: {
  canvasCtx: CanvasRenderingContext2D;
  screenPos: Vec2;
  camera: ICamera;
  image: HTMLImageElement;
  cellSize: number;
  spritePos: Vec2;
  spriteSize: number;
}) {
  const halfCellSize = input.cellSize / 2;

  input.canvasCtx.drawImage(
    input.image,
    input.spritePos.x * input.spriteSize,
    input.spritePos.y * input.spriteSize,
    input.spriteSize,
    input.spriteSize,
    input.screenPos.x + (-input.spriteSize + halfCellSize) * input.camera.zoom,
    input.screenPos.y + (-input.spriteSize + halfCellSize) * input.camera.zoom,
    input.spriteSize * input.camera.zoom,
    input.spriteSize * input.camera.zoom
  );
}
