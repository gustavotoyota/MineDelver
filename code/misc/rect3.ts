import { IVec3, Vec3 } from "./vec3";

export interface IRect3 {
  topLeft: IVec3;
  bottomRight: IVec3;
}

export class Rect3 implements IRect3 {
  constructor(
    public topLeft: IVec3 = new Vec3(),
    public bottomRight: IVec3 = new Vec3()
  ) {}
}
