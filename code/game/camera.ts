import { IVec2, Vec2 } from "../misc/vec2";
import { IVec3, Vec3 } from "../misc/vec3";
import { WorldPos } from "./position";

export interface ICamera {
  pos: WorldPos;
  zoom: number;
}

export class Camera implements ICamera {
  pos: WorldPos;
  zoom: number;

  constructor(input?: { pos?: WorldPos; zoom?: number }) {
    this.pos = input?.pos ?? new WorldPos();
    this.zoom = input?.zoom ?? 1;
  }
}

export function screenToWorld(input: {
  screenSize: IVec2;
  cellSize: number;
  screenPos: IVec2;
  camera: ICamera;
}): IVec3 {
  const worldPos = new Vec3();

  worldPos.x =
    input.camera.pos.x +
    (input.screenPos.x - input.screenSize.x / 2) /
      input.cellSize /
      input.camera.zoom;
  worldPos.y =
    input.camera.pos.y +
    (input.screenPos.y - input.screenSize.y / 2) /
      input.cellSize /
      input.camera.zoom;
  worldPos.z = input.camera.pos.z;

  return worldPos;
}

export function worldToScreen(input: {
  screenSize: IVec2;
  cellSize: number;
  worldPos: IVec3;
  camera: ICamera;
}): IVec2 {
  const screenPos = new Vec2();

  screenPos.x =
    input.screenSize.x / 2 +
    (input.worldPos.x - input.camera.pos.x) *
      input.camera.zoom *
      input.cellSize;
  screenPos.y =
    input.screenSize.y / 2 +
    (input.worldPos.y - input.camera.pos.y) *
      input.camera.zoom *
      input.cellSize;

  return screenPos;
}

export function getVisibleWorldRect(input: {
  camera: ICamera;
  cellSize: number;
  screenSize: IVec2;
}): { topLeft: WorldPos; bottomRight: WorldPos } {
  const topLeft = screenToWorld({
    camera: input.camera,
    screenPos: { x: 0, y: 0 },
    cellSize: input.cellSize,
    screenSize: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
  });

  const bottomRight = screenToWorld({
    camera: input.camera,
    screenPos: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
    cellSize: input.cellSize,
    screenSize: {
      x: input.screenSize.x,
      y: input.screenSize.y,
    },
  });

  return {
    topLeft,
    bottomRight,
  };
}
