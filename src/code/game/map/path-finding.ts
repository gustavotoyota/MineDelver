import Heap from 'heap';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';

import { ICellData } from './cells';
import { Grid } from './grid';

interface PosInfo {
  pos: Vec2;
  prevPos: Vec2;
  pathScore: number;
  guessScore: number;
}

function _reconstructPath(input: {
  posInfos: Map<string, PosInfo>;
  currentPos: Vec2;
  sourcePos: Vec2;
}) {
  const path: Vec2[] = [];

  let pos = input.currentPos;

  while (!pos.equals(input.sourcePos)) {
    path.push(pos);

    pos = input.posInfos.get(`${pos.x}:${pos.y}`)!.prevPos;
  }

  path.reverse();

  return path;
}

export function getShortestPath(input: {
  sourcePos: Vec3;
  targetPos: Vec2;
  grid: Grid<ICellData>;
}): Vec2[] | undefined {
  const closedSet = new Set<string>();

  const posInfos = new Map<string, PosInfo>();

  const sourcePosInfo = {
    pos: new Vec2(input.sourcePos),
    prevPos: new Vec2(),
    pathScore: 0,
    guessScore: new Vec2(input.sourcePos).distChebyshev(input.targetPos),
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

    if (currentPosInfo.pos.equals(input.targetPos)) {
      return _reconstructPath({
        posInfos: posInfos,
        currentPos: currentPosInfo.pos,
        sourcePos: new Vec2(input.sourcePos),
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
        neighbourPos.to3D(input.sourcePos.z)
      );

      if (!neighbourCell?.revealed || neighbourCell?.hasBomb) {
        if (neighbourPos.equals(input.targetPos)) {
          const path = _reconstructPath({
            posInfos: posInfos,
            currentPos: currentPosInfo.pos,
            sourcePos: new Vec2(input.sourcePos),
          });

          if (neighbourCell?.flag) {
            return path;
          } else {
            return [...path, new Vec2(input.targetPos)];
          }
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

      const actionWeight = currentPosInfo.pos.dist(neighbourPos);
      const pathScore = currentInfo.pathScore + actionWeight;

      if (pathScore < neighbourInfo.pathScore) {
        neighbourInfo.prevPos = new Vec2(currentPosInfo.pos);
        neighbourInfo.pathScore = pathScore;
        neighbourInfo.guessScore =
          pathScore + neighbourPos.distChebyshev(input.targetPos);

        if (open.has(neighbourInfo)) {
          open.updateItem(neighbourInfo);
        } else {
          open.push(neighbourInfo);
        }
      }
    }
  }
}
