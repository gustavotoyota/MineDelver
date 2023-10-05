import {
  ICamera,
  getVisibleWorldRect,
  screenToWorld,
  worldToScreen,
} from "@/code/game/camera";
import { IGameMap } from "@/code/game/game-map";
import { IRuntimeCellInfos } from "@/code/game/runtime-cell-infos";
import { WorldPos } from "~/code/game/position";
import { IVec2, Vec2 } from "../misc/vec2";

export interface IDrawCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: WorldPos;
    screenPos: IVec2;
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
  drawCell: IDrawCell[];
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

  for (let layer = 0; layer < input.drawCell.length; layer++) {
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

        const worldPos = new WorldPos(x, y, input.camera.pos.z);

        const screenPos = worldToScreen({
          screenSize: new Vec2(
            input.canvasCtx.canvas.width,
            input.canvasCtx.canvas.height
          ),
          camera: input.camera,
          worldPos: worldPos,
          cellSize: input.cellSize,
        });

        input.drawCell[layer]({
          canvasCtx: input.canvasCtx,
          worldPos: worldPos,
          screenPos: screenPos,
          cellInfos: cellInfos,
          camera: input.camera,
        });
      }
    }
  }
}
