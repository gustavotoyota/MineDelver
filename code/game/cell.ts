import { hashFNV1a } from "@/code/misc/hash";
import { posMod } from "../misc/math";
import { IRuntimeCellInfos } from "./runtime-cell-infos";
import { WorldPos } from "./position";

export function cellHasBomb(input: {
  seed: number;
  pos: WorldPos;
  bombProbability: number;
}): boolean {
  return (
    posMod(
      hashFNV1a(`${input.seed}:${input.pos.x}:${input.pos.y}:${input.pos.z}`),
      10000
    ) /
      10000 <
    input.bombProbability
  );
}

export function loadCell(input: {
  pos: WorldPos;
  cellHasBomb: (input: { pos: WorldPos }) => boolean;
}): IRuntimeCellInfos {
  const cell = { hasBomb: false };

  cell.hasBomb = input.cellHasBomb({ pos: input.pos });

  return cell;
}

export function loadCellCluster(input: {
  startPos: WorldPos;
  cellExists: (input: { pos: WorldPos }) => boolean;
  loadCell: (input: { pos: WorldPos }) => boolean; // Return true to queue adjacent cells
}) {
  const stack = [input.startPos];

  while (stack.length !== 0) {
    const pos = stack.pop()!;

    if (input.cellExists({ pos })) {
      continue;
    }

    if (input.loadCell({ pos })) {
      stack.push(new WorldPos(pos.x - 1, pos.y - 1, pos.z));
      stack.push(new WorldPos(pos.x - 1, pos.y, pos.z));
      stack.push(new WorldPos(pos.x - 1, pos.y + 1, pos.z));
      stack.push(new WorldPos(pos.x, pos.y - 1, pos.z));
      stack.push(new WorldPos(pos.x, pos.y + 1, pos.z));
      stack.push(new WorldPos(pos.x + 1, pos.y - 1, pos.z));
      stack.push(new WorldPos(pos.x + 1, pos.y, pos.z));
      stack.push(new WorldPos(pos.x + 1, pos.y + 1, pos.z));
    }
  }
}
