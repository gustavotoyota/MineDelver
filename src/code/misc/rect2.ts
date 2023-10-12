import { IRect } from './rect';
import { Vec2 } from './vec2';

export type IRect2 = IRect<Vec2>;

export class Rect2 implements IRect2 {
  constructor(public min: Vec2 = new Vec2(), public max: Vec2 = new Vec2()) {}
}

export function growRect2D(rect: IRect2, amount?: number): IRect2 {
  amount = amount ?? 1;

  return new Rect2(
    new Vec2(rect.min.x - amount, rect.min.y - amount),
    new Vec2(rect.max.x + amount, rect.max.y + amount)
  );
}
