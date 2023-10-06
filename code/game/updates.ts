import { IGridSegment } from "../misc/grid-segment";
import { IRuntimeCellInfos } from "./cells";
import { WorldPos } from "./position";

export function revealMissedCellClusters(input: {
  gridSegment: IGridSegment<IRuntimeCellInfos | undefined>;
  revealCellCluster: (input: { startPos: WorldPos }) => void;
}) {
  for (let y = 0; y < input.gridSegment.cells[0].length; y++) {
    let prevCell = input.gridSegment.cells[0][y][0];

    const row = input.gridSegment.cells[0][y];

    for (let x = 1; x < row.length; x++) {
      const cell = row[x];

      if (
        !prevCell?.numAdjacentBombs &&
        !prevCell?.hasBomb &&
        prevCell?.revealed &&
        !cell?.revealed
      ) {
        input.revealCellCluster({
          startPos: new WorldPos(
            input.gridSegment.from.x + x,
            input.gridSegment.from.y + y,
            input.gridSegment.from.z
          ),
        });
      }

      if (
        !prevCell?.revealed &&
        !cell?.numAdjacentBombs &&
        !cell?.hasBomb &&
        cell?.revealed
      ) {
        input.revealCellCluster({
          startPos: new WorldPos(
            input.gridSegment.from.x + x - 1,
            input.gridSegment.from.y + y,
            input.gridSegment.from.z
          ),
        });
      }

      prevCell = cell;
    }
  }

  for (let x = 0; x < input.gridSegment.cells[0][0].length; x++) {
    let prevCell = input.gridSegment.cells[0][0][x];

    for (let y = 1; y < input.gridSegment.cells[0].length; y++) {
      const cell = input.gridSegment.cells[0][y][x];

      if (
        !prevCell?.numAdjacentBombs &&
        !prevCell?.hasBomb &&
        prevCell?.revealed &&
        !cell?.revealed
      ) {
        input.revealCellCluster({
          startPos: new WorldPos(
            input.gridSegment.from.x + x,
            input.gridSegment.from.y + y,
            input.gridSegment.from.z
          ),
        });
      }

      if (
        !prevCell?.revealed &&
        !cell?.numAdjacentBombs &&
        !cell?.hasBomb &&
        cell?.revealed
      ) {
        input.revealCellCluster({
          startPos: new WorldPos(
            input.gridSegment.from.x + x,
            input.gridSegment.from.y + y - 1,
            input.gridSegment.from.z
          ),
        });
      }

      prevCell = cell;
    }
  }
}
