import { ICamera, worldToScreen } from "@/code/game/camera";
import { IRuntimeCellInfos } from "@/code/game/cells";
import { WorldPos } from "~/code/game/position";
import { IGridSegment } from "~/code/misc/grid-segment";
import { IVec2, Vec2 } from "../../misc/vec2";

export interface IDrawCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: WorldPos;
    screenPos: IVec2;
    cellInfos: IRuntimeCellInfos | undefined; // Here for optimization
    camera: ICamera;
  }): void;
}

export function drawGame(input: {
  canvasCtx: CanvasRenderingContext2D;
  camera: ICamera;
  cellSize: number;
  bgColor: string;
  gridSegment: IGridSegment<IRuntimeCellInfos | undefined>;
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
    for (let y = 0; y < input.gridSegment.cells[0].length; y++) {
      const row = input.gridSegment.cells[0][y];

      for (let x = 0; x < row.length; x++) {
        const cellInfos = row[x];

        const worldPos = new WorldPos(
          input.gridSegment.from.x + x,
          input.gridSegment.from.y + y,
          input.gridSegment.from.z
        );

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
