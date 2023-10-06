import { Grid } from "./grid";
import {
  IRuntimeCellInfos,
  cellHasBomb,
  getOrCreateCell,
  loadCellCluster,
} from "./cells";
import { drawCellImage } from "./drawing/draw-cell";
import { IDrawCell } from "./drawing/draw-game";
import { Images } from "./images";
import { WorldPos } from "./position";

export function loadCellClusterDefault(input: {
  seed: number;
  startPos: WorldPos;
  grid: Grid<IRuntimeCellInfos>;
}) {
  loadCellCluster({
    startPos: input.startPos,
    getOrCreateCell: (input_) =>
      getOrCreateCell({
        worldPos: input_.worldPos,
        cellHasBomb: (input_) =>
          cellHasBomb({
            seed: input.seed,
            worldPos: input_.worldPos,
            bombProbability:
              Math.abs(input_.worldPos.x) <= 1 &&
              Math.abs(input_.worldPos.y) <= 1
                ? 0
                : 0.15,
          }),
        grid: input.grid,
      }),
  });
}

export function drawLayerCellDefault(input: {
  halfCellSize: number;
  images: Images;
}): IDrawCell[] {
  return [
    (input_) => {
      drawCellImage({
        canvasCtx: input_.canvasCtx,
        halfCellSize: input.halfCellSize,
        screenPos: input_.screenPos,
        camera: input_.camera,
        image: input.images.getImage("ground")!,
      });

      if (input_.cellInfos?.numAdjacentBombs !== undefined) {
        input_.canvasCtx.save();
        input_.canvasCtx.fillStyle = "white";
        input_.canvasCtx.textAlign = "center";
        input_.canvasCtx.textBaseline = "middle";
        input_.canvasCtx.font = `${28 * input_.camera.zoom}px "Segoe UI"`;
        input_.canvasCtx.fillText(
          input_.cellInfos.numAdjacentBombs.toString(),
          input_.screenPos.x,
          input_.screenPos.y
        );
        input_.canvasCtx.restore();
      }
    },
    (input_) => {
      if (!input_.cellInfos?.revealed) {
        drawCellImage({
          canvasCtx: input_.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: input.images.getImage("wall")!,
        });
      }

      if (input_.cellInfos?.entities?.includes("player")) {
        drawCellImage({
          canvasCtx: input_.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: input.images.getImage("character")!,
        });
      }
    },
  ];
}
