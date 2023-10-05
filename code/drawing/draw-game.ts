import { ICamera } from "@/code/game/camera";
import { IGame } from "~/code/game/map";
import { IRuntimeCellInfos } from "~/code/game/runtime-cell-infos";
import { Position } from "@/code/game/position";

export interface IDrawCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    pos: Position;
    cellInfos: IRuntimeCellInfos;
    camera: ICamera;
  }): void;
}

export function drawGame(input: {
  canvasCtx: CanvasRenderingContext2D;
  world: IGame;
  camera: ICamera;
  drawCell: IDrawCell;
}) {
  //
}
