import { hashFNV1a } from "@/code/misc/hash";
import { posMod } from "@/code/misc/math";
import { WorldPos } from "./position";
import { Grid } from "./grid";
import { ICellEntity } from "../entities/map/cell-entity";

export interface IRuntimeCellInfos {
  hidden?: boolean;

  hasBomb?: boolean;
  bombProcessed?: boolean;

  numAdjacentBombs?: number;
  revealed?: boolean;

  entities?: ICellEntity[];
}

export function cellHasBomb(input: {
  seed: number;
  worldPos: WorldPos;
  bombProbability: number;
}): boolean {
  return (
    posMod(
      hashFNV1a(
        `${input.seed}:${input.worldPos.x}:${input.worldPos.y}:${input.worldPos.z}`
      ),
      10000
    ) /
      10000 <
    input.bombProbability
  );
}

export function createCell(input: { hasBomb: boolean }): IRuntimeCellInfos {
  return {
    hidden: true,
    ...(input.hasBomb ? { hasBomb: true, bombProcessed: false } : {}),
  };
}

export function getOrCreateCell(input: {
  worldPos: WorldPos;
  cellHasBomb: (input: { worldPos: WorldPos }) => boolean;
  grid: Grid<IRuntimeCellInfos>;
}): IRuntimeCellInfos {
  let cell = input.grid.getCell(input.worldPos);

  if (cell === undefined) {
    cell = createCell({
      hasBomb: input.cellHasBomb({ worldPos: input.worldPos }),
    });

    input.grid.setCell(input.worldPos, cell);
  }

  return cell;
}

function processBomb(input: {
  cell: IRuntimeCellInfos;
  worldPos: WorldPos;
  getOrCreateCell: (input: { worldPos: WorldPos }) => IRuntimeCellInfos;
}) {
  if (input.cell.bombProcessed === undefined) {
    return;
  }

  delete input.cell.bombProcessed;

  const neighbourPositions = [
    new WorldPos(input.worldPos.x - 1, input.worldPos.y - 1, input.worldPos.z),
    new WorldPos(input.worldPos.x - 1, input.worldPos.y, input.worldPos.z),
    new WorldPos(input.worldPos.x - 1, input.worldPos.y + 1, input.worldPos.z),
    new WorldPos(input.worldPos.x, input.worldPos.y - 1, input.worldPos.z),
    new WorldPos(input.worldPos.x, input.worldPos.y + 1, input.worldPos.z),
    new WorldPos(input.worldPos.x + 1, input.worldPos.y - 1, input.worldPos.z),
    new WorldPos(input.worldPos.x + 1, input.worldPos.y, input.worldPos.z),
    new WorldPos(input.worldPos.x + 1, input.worldPos.y + 1, input.worldPos.z),
  ];

  const neighbourCells = neighbourPositions.map((pos) =>
    input.getOrCreateCell({ worldPos: pos })
  );

  for (const neighbourCell of neighbourCells) {
    if (neighbourCell.hasBomb) {
      processBomb({
        cell: neighbourCell,
        worldPos: neighbourPositions[neighbourCells.indexOf(neighbourCell)],
        getOrCreateCell: input.getOrCreateCell,
      });
    } else {
      neighbourCell.numAdjacentBombs =
        (neighbourCell.numAdjacentBombs ?? 0) + 1;
    }
  }
}

export function loadCellCluster(input: {
  startPos: WorldPos;
  getOrCreateCell: (input: { worldPos: WorldPos }) => IRuntimeCellInfos;
}): boolean {
  const stack = [input.startPos];
  const visited = new Set<string>();

  delete input.getOrCreateCell({ worldPos: input.startPos }).hidden;

  while (stack.length > 0) {
    const worldPos = stack.pop()!;

    const key = `${worldPos.x}:${worldPos.y}:${worldPos.z}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    let cell = input.getOrCreateCell({ worldPos });

    cell.revealed = true;

    if (cell.hasBomb) {
      return false;
    }

    // Load neighbours

    const neighbourPositions = [
      new WorldPos(worldPos.x - 1, worldPos.y - 1, worldPos.z),
      new WorldPos(worldPos.x - 1, worldPos.y, worldPos.z),
      new WorldPos(worldPos.x - 1, worldPos.y + 1, worldPos.z),
      new WorldPos(worldPos.x, worldPos.y - 1, worldPos.z),
      new WorldPos(worldPos.x, worldPos.y + 1, worldPos.z),
      new WorldPos(worldPos.x + 1, worldPos.y - 1, worldPos.z),
      new WorldPos(worldPos.x + 1, worldPos.y, worldPos.z),
      new WorldPos(worldPos.x + 1, worldPos.y + 1, worldPos.z),
    ];

    const neighbourCells = neighbourPositions.map((pos) =>
      input.getOrCreateCell({ worldPos: pos })
    );

    // Make neighbours visible

    for (const neighbourCell of neighbourCells.filter((cell) => cell.hidden)) {
      delete neighbourCell.hidden;
    }

    // Check if some neighbours have bombs

    if (neighbourCells.some((cell) => cell.hasBomb)) {
      neighbourCells
        .map((cell, i) => ({ worldPos: neighbourPositions[i], cell }))
        .filter((input) => input.cell.hasBomb)
        .forEach((input_) => {
          processBomb({
            cell: input_.cell,
            worldPos: input_.worldPos,
            getOrCreateCell: input.getOrCreateCell,
          });
        });
    } else {
      stack.push(...neighbourPositions);
    }
  }

  return true;
}
