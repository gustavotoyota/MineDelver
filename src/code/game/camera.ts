import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';

export interface ICamera {
  pos: Vec3;
  zoom: number;
}

export class Camera implements ICamera {
  pos: Vec3;
  zoom: number;

  constructor(input?: { pos?: Vec3; zoom?: number }) {
    this.pos = input?.pos ?? new Vec3();
    this.zoom = input?.zoom ?? 1;
  }
}

export function screenToWorld(input: {
  screenSize: Vec2;
  cellSize: number;
  screenPos: Vec2;
  camera: ICamera;
}): Vec3 {
  return new Vec3(
    input.camera.pos.x +
      (input.screenPos.x - input.screenSize.x / 2) /
        input.cellSize /
        input.camera.zoom,
    input.camera.pos.y +
      (input.screenPos.y - input.screenSize.y / 2) /
        input.cellSize /
        input.camera.zoom,
    input.camera.pos.z
  );
}

export function worldToScreen(input: {
  screenSize: Vec2;
  cellSize: number;
  worldPos: Vec3;
  camera: ICamera;
}): Vec2 {
  return new Vec2(
    input.screenSize.x / 2 +
      (input.worldPos.x - input.camera.pos.x) *
        input.camera.zoom *
        input.cellSize,
    input.screenSize.y / 2 +
      (input.worldPos.y - input.camera.pos.y) *
        input.camera.zoom *
        input.cellSize
  );
}
