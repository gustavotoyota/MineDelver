import { hashFNV1a } from "@/code/misc/hash";
import { posMod } from "../misc/math";
import { WorldPos } from "./position";

export interface IRuntimeCellInfos {
  hasBomb?: boolean;
  numAdjacentBombs?: number;
  revealed?: boolean;
  entities?: string[];
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
    ...(input.hasBomb ? { hasBomb: true } : {}),
  };
}

export function loadCell(input: {
  worldPos: WorldPos;
  cellHasBomb: (input: { worldPos: WorldPos }) => boolean;
}): IRuntimeCellInfos {
  return createCell({
    hasBomb: input.cellHasBomb({ worldPos: input.worldPos }),
  });
}

export function loadCellCluster(input: {
  startPos: WorldPos;
  getCell: (input: { worldPos: WorldPos }) => IRuntimeCellInfos | undefined;
  loadCell: (input: { worldPos: WorldPos }) => IRuntimeCellInfos;
}) {
  const stack = [input.startPos];

  while (stack.length > 0) {
    const worldPos = stack.pop()!;

    let cell = input.getCell({ worldPos });

    if (cell === undefined) {
      cell = input.loadCell({ worldPos: worldPos });

      if (cell.hasBomb) {
        stack.push(new WorldPos(worldPos.x - 1, worldPos.y - 1, worldPos.z));
        stack.push(new WorldPos(worldPos.x - 1, worldPos.y, worldPos.z));
        stack.push(new WorldPos(worldPos.x - 1, worldPos.y + 1, worldPos.z));
        stack.push(new WorldPos(worldPos.x, worldPos.y - 1, worldPos.z));
        stack.push(new WorldPos(worldPos.x, worldPos.y + 1, worldPos.z));
        stack.push(new WorldPos(worldPos.x + 1, worldPos.y - 1, worldPos.z));
        stack.push(new WorldPos(worldPos.x + 1, worldPos.y, worldPos.z));
        stack.push(new WorldPos(worldPos.x + 1, worldPos.y + 1, worldPos.z));
      }
    }

    if (worldPos !== input.startPos) {
      cell.numAdjacentBombs = (cell.numAdjacentBombs ?? 0) + 1;
    }
  }
}

export function revealCellCluster(input: {
  startPos: WorldPos;
  getCell: (input: { worldPos: WorldPos }) => IRuntimeCellInfos | undefined;
}) {
  const stack = [input.startPos];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const worldPos = stack.pop()!;

    const cell = input.getCell({ worldPos });

    if (cell === undefined || cell.hasBomb || cell.revealed) {
      continue;
    }

    const key = `${worldPos.x}:${worldPos.y}:${worldPos.z}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    cell.revealed = true;

    if (cell.numAdjacentBombs !== undefined) {
      continue;
    }

    stack.push(new WorldPos(worldPos.x - 1, worldPos.y - 1, worldPos.z));
    stack.push(new WorldPos(worldPos.x - 1, worldPos.y, worldPos.z));
    stack.push(new WorldPos(worldPos.x - 1, worldPos.y + 1, worldPos.z));
    stack.push(new WorldPos(worldPos.x, worldPos.y - 1, worldPos.z));
    stack.push(new WorldPos(worldPos.x, worldPos.y + 1, worldPos.z));
    stack.push(new WorldPos(worldPos.x + 1, worldPos.y - 1, worldPos.z));
    stack.push(new WorldPos(worldPos.x + 1, worldPos.y, worldPos.z));
    stack.push(new WorldPos(worldPos.x + 1, worldPos.y + 1, worldPos.z));
  }
}
