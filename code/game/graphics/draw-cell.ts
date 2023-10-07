import { ICamera } from "../camera";
import { IVec2 } from "../../misc/vec2";

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
