import { pull } from "lodash";
import { IVec2 } from "@/code/misc/vec2";
import { IVec3, vec2To3 } from "@/code/misc/vec3";
import { IRuntimeCellInfos } from "@/code/game/map/cells";
import { Creature } from "~/code/game/creatures/creatures";
import { Grid } from "@/code/game/map/grid";

export interface IActionManager {
  queue: IVec2[];

  timeout?: NodeJS.Timeout;

  loadCellCluster: (input: { startPos: IVec3 }) => void;
}

export interface IAction {
  type: string;

  [key: string]: any;
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
  playerCreature: Creature;
  grid: Grid<IRuntimeCellInfos>;
  loadCellCluster: (input: { startPos: IVec3 }) => void;
}): IVec2 | undefined {
  if (input.actionManager.queue.length === 0) {
    return;
  }

  const newPlayerPos = vec2To3(
    input.actionManager.queue.pop()!,
    input.playerCreature.pos.z
  );

  const newCell = input.grid.getCell(newPlayerPos);

  if (newCell == null) {
    throw new Error("New cell is null");
  }

  if (!newCell.revealed) {
    input.loadCellCluster({ startPos: newPlayerPos });
  }

  const oldCell = input.grid.getCell(input.playerCreature.pos);

  if (oldCell == null) {
    throw new Error("Cell is null");
  }

  pull(oldCell.creatures ?? [], "player");

  if (oldCell.creatures?.length === 0) {
    delete oldCell.creatures;
  }

  newCell.creatures ??= [];
  newCell.creatures.push("player");

  input.playerCreature.pos = newPlayerPos;

  if (input.actionManager.queue.length > 0) {
    input.actionManager.timeout = setTimeout(() => {
      executeNextAction(input);
    }, 200);
  }
}

export function enqueueActions(input: {
  actionManager: IActionManager;
  actions: IVec2[];
  playerCreature: Creature;
  grid: Grid<IRuntimeCellInfos>;
}) {
  cancelActions(input.actionManager);

  input.actionManager.queue = [...input.actions];

  executeNextAction({
    actionManager: input.actionManager,
    playerCreature: input.playerCreature,
    grid: input.grid,
    loadCellCluster: input.actionManager.loadCellCluster,
  });
}