import { pull } from "lodash";
import { IVec2 } from "../misc/vec2";
import { IVec3, vec2To3 } from "../misc/vec3";
import { IRuntimeCellInfos } from "./cells";
import { Entity } from "./entities";
import { Grid } from "./grid";

export interface IActionManager {
  queue: IVec2[];

  timeout?: NodeJS.Timeout;

  loadCellCluster: (input: { startPos: IVec3 }) => void;
}

export class ActionManager implements IActionManager {
  queue: IVec2[] = [];

  timeout?: NodeJS.Timeout;

  loadCellCluster: (input: { startPos: IVec3 }) => void;

  constructor(input: {
    loadCellCluster: (input: { startPos: IVec3 }) => void;
  }) {
    this.loadCellCluster = input.loadCellCluster;
  }
}

export function cancelActions(actionManager: IActionManager) {
  clearTimeout(actionManager.timeout);

  actionManager.queue = [];
}

export function executeNextAction(input: {
  actionManager: IActionManager;
  playerEntity: Entity;
  grid: Grid<IRuntimeCellInfos>;
  loadCellCluster: (input: { startPos: IVec3 }) => void;
}): IVec2 | undefined {
  if (input.actionManager.queue.length === 0) {
    return;
  }

  const newPlayerPos = vec2To3(
    input.actionManager.queue.pop()!,
    input.playerEntity.pos.z
  );

  const newCell = input.grid.getCell(newPlayerPos);

  if (newCell == null) {
    throw new Error("New cell is null");
  }

  if (!newCell.revealed) {
    input.loadCellCluster({ startPos: newPlayerPos });
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

  if (input.actionManager.queue.length > 0) {
    input.actionManager.timeout = setTimeout(() => {
      executeNextAction(input);
    }, 200);
  }
}

export function enqueueActions(input: {
  actionManager: IActionManager;
  actions: IVec2[];
  playerEntity: Entity;
  grid: Grid<IRuntimeCellInfos>;
}) {
  cancelActions(input.actionManager);

  input.actionManager.queue = [...input.actions];

  executeNextAction({
    actionManager: input.actionManager,
    playerEntity: input.playerEntity,
    grid: input.grid,
    loadCellCluster: input.actionManager.loadCellCluster,
  });
}
