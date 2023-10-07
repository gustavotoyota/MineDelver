import Heap from "heap";
import {
  IVec2,
  Vec2,
  dist2D,
  distChebyshev2D,
  equal2D,
} from "@/code/misc/vec2";
import { IVec3, vec2To3 } from "@/code/misc/vec3";
import { IRuntimeCellInfos } from "./cells";
import { Grid } from "./grid";

interface PosInfo {
  pos: IVec2;
  prevPos: IVec2;
  pathScore: number;
  guessScore: number;
}

function _reconstructPath(input: {
  posInfos: Map<string, PosInfo>;
  currentPos: IVec2;
  sourcePos: IVec2;
}) {
  const path: IVec2[] = [];

  let pos = input.currentPos;

  while (!equal2D(pos, input.sourcePos)) {
    path.push(pos);

    pos = input.posInfos.get(`${pos.x}:${pos.y}`)!.prevPos;
  }

  path.reverse();

  return path;
}

export function getShortestPath(input: {
  sourcePos: IVec3;
  targetPos: IVec2;
  grid: Grid<IRuntimeCellInfos>;
}): IVec2[] | undefined {
  const closedSet = new Set<string>();

  const posInfos = new Map<string, PosInfo>();

  const sourcePosInfo = {
    pos: input.sourcePos,
    prevPos: new Vec2(),
    pathScore: 0,
    guessScore: distChebyshev2D(input.sourcePos, input.targetPos),
  };

  posInfos.set(`${input.sourcePos.x}:${input.sourcePos.y}`, sourcePosInfo);

  const open = new Heap<PosInfo>((a, b) => a.guessScore - b.guessScore);

  open.push(sourcePosInfo);

  while (!open.empty()) {
    const currentPosInfo = open.pop();

    if (currentPosInfo === undefined) {
      break;
    }

    const key = `${currentPosInfo.pos.x}:${currentPosInfo.pos.y}`;

    closedSet.add(key);

    if (equal2D(currentPosInfo.pos, input.targetPos)) {
      return _reconstructPath({
        posInfos: posInfos,
        currentPos: currentPosInfo.pos,
        sourcePos: input.sourcePos,
      });
    }

    const neighbourPositions = [
      new Vec2(currentPosInfo.pos.x - 1, currentPosInfo.pos.y),
      new Vec2(currentPosInfo.pos.x + 1, currentPosInfo.pos.y),
      new Vec2(currentPosInfo.pos.x, currentPosInfo.pos.y - 1),
      new Vec2(currentPosInfo.pos.x, currentPosInfo.pos.y + 1),

      new Vec2(currentPosInfo.pos.x - 1, currentPosInfo.pos.y - 1),
      new Vec2(currentPosInfo.pos.x - 1, currentPosInfo.pos.y + 1),
      new Vec2(currentPosInfo.pos.x + 1, currentPosInfo.pos.y - 1),
      new Vec2(currentPosInfo.pos.x + 1, currentPosInfo.pos.y + 1),
    ];

    const currentInfo = posInfos.get(key)!;

    for (const neighbourPos of neighbourPositions) {
      const key = `${neighbourPos.x}:${neighbourPos.y}`;

      if (closedSet.has(key)) {
        continue;
      }

      const neighbourCell = input.grid.getCell(
        vec2To3(neighbourPos, input.sourcePos.z)
      );

      if (!neighbourCell?.revealed) {
        if (equal2D(neighbourPos, input.targetPos)) {
          return [
            ..._reconstructPath({
              posInfos: posInfos,
              currentPos: currentPosInfo.pos,
              sourcePos: input.sourcePos,
            }),
            { ...input.targetPos },
          ];
        }

        continue;
      }

      let neighbourInfo = posInfos.get(key);

      if (neighbourInfo == null) {
        neighbourInfo = {
          pos: neighbourPos,
          prevPos: currentPosInfo.pos,
          pathScore: Infinity,
          guessScore: Infinity,
        };

        posInfos.set(key, neighbourInfo);
      }

      const actionWeight = dist2D(currentPosInfo.pos, neighbourPos);
      const pathScore = currentInfo.pathScore + actionWeight;

      if (pathScore < neighbourInfo.pathScore) {
        neighbourInfo.prevPos = { ...currentPosInfo.pos };
        neighbourInfo.pathScore = pathScore;
        neighbourInfo.guessScore =
          pathScore + distChebyshev2D(neighbourPos, input.targetPos);

        if (open.has(neighbourInfo)) {
          open.updateItem(neighbourInfo);
        } else {
          open.push(neighbourInfo);
        }
      }
    }
  }
}
