import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICellData } from './cells';

function _processBomb(input: {
  cell: ICellData;
  worldPos: Vec3;
  getOrCreateCell: (input: { worldPos: Vec3 }) => ICellData;
}) {
  if (input.cell.bombProcessed === undefined) {
    return;
  }

  delete input.cell.bombProcessed;

  const neighbourPositions = [
    new Vec3(input.worldPos.x - 1, input.worldPos.y - 1, input.worldPos.z),
    new Vec3(input.worldPos.x - 1, input.worldPos.y, input.worldPos.z),
    new Vec3(input.worldPos.x - 1, input.worldPos.y + 1, input.worldPos.z),
    new Vec3(input.worldPos.x, input.worldPos.y - 1, input.worldPos.z),
    new Vec3(input.worldPos.x, input.worldPos.y + 1, input.worldPos.z),
    new Vec3(input.worldPos.x + 1, input.worldPos.y - 1, input.worldPos.z),
    new Vec3(input.worldPos.x + 1, input.worldPos.y, input.worldPos.z),
    new Vec3(input.worldPos.x + 1, input.worldPos.y + 1, input.worldPos.z),
  ];

  const neighbourCells = neighbourPositions.map((pos) =>
    input.getOrCreateCell({ worldPos: pos })
  );

  for (const neighbourCell of neighbourCells) {
    if (!neighbourCell.hasBomb) {
      neighbourCell.numAdjacentBombs =
        (neighbourCell.numAdjacentBombs ?? 0) + 1;
    }
  }
}

export function loadCellCluster(input: {
  startPos: Vec3;
  numRevealedCells?: Ref<number>;
  numCorrectGuesses?: Ref<number>;
  getOrCreateCell: (input: { worldPos: Vec3 }) => ICellData;
}): boolean {
  const stack = [input.startPos];
  const visited = new Set<string>();

  const startCell = input.getOrCreateCell({ worldPos: input.startPos });

  delete startCell.hidden;

  if (
    startCell.unrevealed &&
    !startCell.hasBomb &&
    input.numCorrectGuesses !== undefined
  ) {
    input.numCorrectGuesses.value++;
  }

  while (stack.length > 0) {
    const worldPos = stack.pop()!;

    const key = `${worldPos.x}:${worldPos.y}:${worldPos.z}`;

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    const cell = input.getOrCreateCell({ worldPos });

    if (cell.unrevealed) {
      if (input.numRevealedCells !== undefined) {
        input.numRevealedCells.value++;
      }

      delete cell.unrevealed;
    }

    // Load neighbours

    const neighbourPositions = [
      new Vec3(worldPos.x - 1, worldPos.y - 1, worldPos.z),
      new Vec3(worldPos.x - 1, worldPos.y, worldPos.z),
      new Vec3(worldPos.x - 1, worldPos.y + 1, worldPos.z),
      new Vec3(worldPos.x, worldPos.y - 1, worldPos.z),
      new Vec3(worldPos.x, worldPos.y + 1, worldPos.z),
      new Vec3(worldPos.x + 1, worldPos.y - 1, worldPos.z),
      new Vec3(worldPos.x + 1, worldPos.y, worldPos.z),
      new Vec3(worldPos.x + 1, worldPos.y + 1, worldPos.z),
    ];

    const neighbourCells = neighbourPositions.map((pos) =>
      input.getOrCreateCell({ worldPos: pos })
    );

    // Make neighbours visible

    for (const neighbourCell of neighbourCells.filter((cell) => cell.hidden)) {
      delete neighbourCell.hidden;
    }

    if (cell.hasBomb) {
      return false;
    }

    // Check if some neighbours have bombs

    if (neighbourCells.some((cell) => cell.hasBomb)) {
      neighbourCells
        .map((cell, i) => ({ worldPos: neighbourPositions[i], cell }))
        .filter((input) => input.cell.hasBomb)
        .forEach((input_) => {
          _processBomb({
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
