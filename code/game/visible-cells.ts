import { IRect3 } from "../misc/rect3";
import { IVec2 } from "../misc/vec2";
import { ICamera, screenToWorld } from "./camera";

export function getVisibleWorldRect(input: {
  camera: ICamera;
  cellSize: number;
  screenSize: IVec2;
}): IRect3 {
  const topLeft = screenToWorld({
    camera: input.camera,
    screenPos: { x: 0, y: 0 },
    cellSize: input.cellSize,
    screenSize: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
  });

  const bottomRight = screenToWorld({
    camera: input.camera,
    screenPos: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
    cellSize: input.cellSize,
    screenSize: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
  });

  return {
    topLeft,
    bottomRight,
  };
}
