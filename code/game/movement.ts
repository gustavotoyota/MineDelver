import { pull } from "lodash";
import { IVec2 } from "../misc/vec2";
import { vec2To3 } from "../misc/vec3";
import { IRuntimeCellInfos } from "./cells";
import { Entity } from "./entities";
import { Grid } from "./grid";

export interface IMovementData {
  queue: IVec2[];

  timeout?: NodeJS.Timeout;
}

export class MovementData implements IMovementData {
  queue: IVec2[] = [];

  timeout?: NodeJS.Timeout;
}

export function cancelMovements(movementData: IMovementData) {
  clearTimeout(movementData.timeout);

  movementData.queue = [];
}

export function executeNextMovement(input: {
  movementData: IMovementData;
  playerEntity: Entity;
  grid: Grid<IRuntimeCellInfos>;
}): IVec2 | undefined {
  if (input.movementData.queue.length === 0) {
    return;
  }

  const newPlayerPos = vec2To3(
    input.movementData.queue.pop()!,
    input.playerEntity.pos.z
  );

  const newCell = input.grid.getCell(newPlayerPos);

  if (newCell == null) {
    throw new Error("New cell is null");
  }

  if (!newCell.revealed) {
    return;
  }

  const oldCell = input.grid.getCell(input.playerEntity.pos);

  if (oldCell == null) {
    throw new Error("Cell is null");
  }

  pull(oldCell.entities ?? [], "player");

  if (oldCell.entities?.length === 0) {
    delete oldCell.entities;
  }

  newCell.entities ??= [];
  newCell.entities.push("player");

  input.playerEntity.pos = newPlayerPos;

  if (input.movementData.queue.length > 0) {
    input.movementData.timeout = setTimeout(() => {
      executeNextMovement(input);
    }, 200);
  }
}

export function enqueueMovements(input: {
  movementData: IMovementData;
  movements: IVec2[];
  playerEntity: Entity;
  grid: Grid<IRuntimeCellInfos>;
}) {
  cancelMovements(input.movementData);

  input.movementData.queue = [...input.movements];

  executeNextMovement({
    movementData: input.movementData,
    playerEntity: input.playerEntity,
    grid: input.grid,
  });
}
