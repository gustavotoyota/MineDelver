import { lerp } from './math';
import { IVec2 } from './vec2';

export interface IVec3 {
  x: number;
  y: number;
  z: number;
}

export class Vec3 implements IVec3 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}
}

export function clone3(input: IVec3): IVec3 {
  return new Vec3(input.x, input.y, input.z);
}

export function vec2To3(input: IVec2, z?: number): IVec3 {
  return { x: input.x, y: input.y, z: z ?? 0 };
}

export function lerp3(a: IVec3, b: IVec3, progress: number): IVec3 {
  return new Vec3(
    lerp(a.x, b.x, progress),
    lerp(a.y, b.y, progress),
    lerp(a.z, b.z, progress)
  );
}
