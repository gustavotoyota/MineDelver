import { IRect3 } from "../misc/rect3";
import { ICellCollection } from "./cell-collection";
import {
  IRuntimeCellInfos,
  cellHasBomb,
  loadCell,
  loadCellCluster,
} from "./cells";
import { drawCellImage } from "./drawing/draw-cell";
import { IDrawCell } from "./drawing/draw-game";
import { Images } from "./images";
import { WorldPos, forEachPosInRect3D } from "./position";

function loadCellDefault(input: {
  seed: number;
  cells: ICellCollection<IRuntimeCellInfos>;
  worldPos: WorldPos;
}): IRuntimeCellInfos {
  const cell = loadCell({
    worldPos: input.worldPos,
    cellHasBomb: (input_) =>
      cellHasBomb({
        seed: input.seed,
        worldPos: input_.worldPos,
        bombProbability:
          Math.abs(input_.worldPos.x) <= 1 && Math.abs(input_.worldPos.y) <= 1
            ? 0
            : 0.2,
      }),
  });

  input.cells.setCell(input.worldPos, cell);

  return cell;
}

function loadCellClusterDefault(input: {
  seed: number;
  cells: ICellCollection<IRuntimeCellInfos>;
  startPos: WorldPos;
}) {
  loadCellCluster({
    startPos: input.startPos,
    getCell: (input_) => input.cells.getCell(input_.worldPos),
    loadCell: (input_) =>
      loadCellDefault({
        seed: input.seed,
        cells: input.cells,
        worldPos: input_.worldPos,
      }),
  });
}

export function loadVisibleCellsDefault(input: {
  seed: number;
  cells: ICellCollection<IRuntimeCellInfos>;
  visibleWorldRect: IRect3;
}) {
  forEachPosInRect3D({
    ...input.visibleWorldRect,
    func: (pos) =>
      loadCellClusterDefault({
        seed: input.seed,
        cells: input.cells,
        startPos: pos,
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

      if (input_.cellInfos.numAdjacentBombs !== undefined) {
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
      if (!input_.cellInfos.revealed) {
        drawCellImage({
          canvasCtx: input_.canvasCtx,
          halfCellSize: input.halfCellSize,
          screenPos: input_.screenPos,
          camera: input_.camera,
          image: input.images.getImage("wall")!,
        });
      }
    },
  ];
}
