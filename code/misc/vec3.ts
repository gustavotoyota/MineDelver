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
