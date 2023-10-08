import { IVec2, Vec2 } from './vec2';

export interface IRect2 {
  min: IVec2;
  max: IVec2;
}

export class Rect2 implements IRect2 {
  constructor(public min: IVec2 = new Vec2(), public max: IVec2 = new Vec2()) {}
}

export function growRect2D(rect: IRect2, amount?: number): IRect2 {
  amount = amount ?? 1;

  return new Rect2(
    new Vec2(rect.min.x - amount, rect.min.y - amount),
    new Vec2(rect.max.x + amount, rect.max.y + amount)
  );
}
