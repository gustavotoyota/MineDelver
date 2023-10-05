export interface IVec2 {
  x: number;
  y: number;
}

export class Vec2 implements IVec2 {
  constructor(public x: number = 0, public y: number = 0) {}
}
