import { IRect } from './rect';
import { Vec3 } from './vec3';

export type IRect3 = IRect<Vec3>;

export class Rect3 implements IRect3 {
  constructor(public min: Vec3 = new Vec3(), public max: Vec3 = new Vec3()) {}
}

export function growRect3D(rect: IRect3, amount?: number): IRect3 {
  amount = amount ?? 1;

  return new Rect3(
    new Vec3(rect.min.x - amount, rect.min.y - amount, rect.min.z - amount),
    new Vec3(rect.max.x + amount, rect.max.y + amount, rect.max.z + amount)
  );
}
