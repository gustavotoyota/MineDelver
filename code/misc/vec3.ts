import { IVec2 } from "./vec2";

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

export function vec2To3(input: IVec2, z?: number): IVec3 {
  return { x: input.x, y: input.y, z: z ?? 0 };
}
