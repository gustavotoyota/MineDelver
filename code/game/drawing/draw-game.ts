import { ICamera, worldToScreen } from "@/code/game/camera";
import { IRuntimeCellInfos } from "@/code/game/cells";
import { WorldPos } from "~/code/game/position";
import { IRect3 } from "../../misc/rect3";
import { IVec2, Vec2 } from "../../misc/vec2";
import { ICellCollection } from "../cell-collection";

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
  cells: ICellCollection<IRuntimeCellInfos>;
  camera: ICamera;
  cellSize: number;
  bgColor: string;
  visibleWorldRect: IRect3;
  drawLayerCell: IDrawCell[];
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

  for (let layer = 0; layer < input.drawLayerCell.length; layer++) {
    for (
      let y = Math.floor(input.visibleWorldRect.topLeft.y);
      y <= Math.ceil(input.visibleWorldRect.bottomRight.y);
      y++
    ) {
      const startX = Math.floor(input.visibleWorldRect.topLeft.x);
      const endX = Math.ceil(input.visibleWorldRect.bottomRight.x);

      const row = input.cells.getRowCells(
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

        input.drawLayerCell[layer]({
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
