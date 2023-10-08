import { IGridSegment } from "./grid-segment";
import { IRect3 } from "../../misc/rect3";
import { IVec2 } from "../../misc/vec2";
import { ICamera, screenToWorld } from "../camera";
import { Grid } from "./grid";
import { IRuntimeCellInfos } from "./cells";
import { Vec3 } from "~/code/misc/vec3";

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
    min: {
      x: Math.floor(topLeft.x - 1),
      y: Math.floor(topLeft.y - 1),
      z: Math.floor(topLeft.z),
    },
    max: {
      x: Math.ceil(bottomRight.x + 1),
      y: Math.ceil(bottomRight.y + 1),
      z: Math.ceil(bottomRight.z),
    },
  };
}

export function getGridSegmentFromWorldRect(input: {
  worldRect: IRect3;
  grid: Grid<IRuntimeCellInfos>;
}): IGridSegment<IRuntimeCellInfos | undefined> {
  const grid: IGridSegment<IRuntimeCellInfos | undefined> = {
    from: {
      x: input.worldRect.min.x,
      y: input.worldRect.min.y,
      z: input.worldRect.min.z,
    },
    cells: [],
  };

  for (let z = input.worldRect.min.z; z <= input.worldRect.max.z; z++) {
    const layer: (IRuntimeCellInfos | undefined)[][] = [];

    for (let y = input.worldRect.min.y; y <= input.worldRect.max.y; y++) {
      const startX = input.worldRect.min.x;
      const endX = input.worldRect.max.x;

      const row = input.grid.getRowCells(
        new Vec3(startX, y, z),
        endX - startX + 1
      );

      layer.push(row);
    }

    grid.cells.push(layer);
  }

  return grid;
}
