import {
  ICamera,
  getVisibleWorldRect,
  screenToWorld,
} from "@/code/game/camera";
import { IGameMap } from "@/code/game/game-map";
import { IRuntimeCellInfos } from "@/code/game/runtime-cell-infos";
import { WorldPos } from "~/code/game/world-pos";

export interface IDrawCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: WorldPos;
    cellInfos: IRuntimeCellInfos; // Here for optimization
    camera: ICamera;
  }): void;
}

export function drawGame(input: {
  canvasCtx: CanvasRenderingContext2D;
  map: IGameMap;
  camera: ICamera;
  cellSize: number;
  bgColor: string;
  drawCell: IDrawCell;
}) {
  // Clear the canvas

  input.canvasCtx.save();
  input.canvasCtx.fillStyle = input.bgColor;
  input.canvasCtx.fillRect(
    0,
    0,
    input.canvasCtx.canvas.width,
    input.canvasCtx.canvas.height
  );
  input.canvasCtx.restore();

  // Draw the map

  const visibleWorldRect = getVisibleWorldRect({
    camera: input.camera,
    cellSize: input.cellSize,
    screenSize: {
      x: input.canvasCtx.canvas.width,
      y: input.canvasCtx.canvas.height,
    },
  });

  for (
    let y = Math.floor(visibleWorldRect.topLeft.y);
    y <= Math.ceil(visibleWorldRect.bottomRight.y);
    y++
  ) {
    const startX = Math.floor(visibleWorldRect.topLeft.x);
    const endX = Math.ceil(visibleWorldRect.bottomRight.x);

    const row = input.map.cells.getRowCells(
      new WorldPos(startX, y, input.camera.pos.z),
      endX - startX + 1
    );

    for (let x = startX; x <= endX; x++) {
      const cellInfos = row[x - startX];

      if (cellInfos === undefined) {
        continue;
      }

      input.drawCell({
        canvasCtx: input.canvasCtx,
        worldPos: new WorldPos(x, y, input.camera.pos.z),
        cellInfos: cellInfos,
        camera: input.camera,
      });
    }
  }
}
