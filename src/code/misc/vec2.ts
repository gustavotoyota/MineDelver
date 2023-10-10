import { lerp } from './math';
import { IVec3 } from './vec3';

export interface IVec2 {
  x: number;
  y: number;
}

export class Vec2 implements IVec2 {
  x: number;
  y: number;

  constructor(x: number | IVec2 = 0, y = 0) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      this.y = y;
    }
  }
}

export function distSqr2D(a: IVec2, b: IVec2): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function dist2D(a: IVec2, b: IVec2): number {
  return Math.sqrt(distSqr2D(a, b));
}

export function equal2D(a: IVec2, b: IVec2): boolean {
  return a.x === b.x && a.y === b.y;
}

export function vec3To2(input: IVec3): IVec2 {
  return { x: input.x, y: input.y };
}

export function distManhattan2D(a: IVec2, b: IVec2): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function distChebyshev2D(a: IVec2, b: IVec2): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function add2(a: IVec2, b: IVec2): IVec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}
export function sub2(a: IVec2, b: IVec2): IVec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}
export function sub2Scalar(a: IVec2, b: number): IVec2 {
  return {
    x: a.x - b,
    y: a.y - b,
  };
}
export function mul2(a: IVec2, b: IVec2): IVec2 {
  return {
    x: a.x * b.x,
    y: a.y * b.y,
  };
}

export function min2(a: IVec2, b: IVec2): IVec2 {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
  };
}
export function max2(a: IVec2, b: IVec2): IVec2 {
  return {
    x: Math.max(a.x, b.x),
    y: Math.max(a.y, b.y),
  };
}

export function div2Scalar(a: IVec2, b: number): IVec2 {
  return {
    x: a.x / b,
    y: a.y / b,
  };
}

export function round2(a: IVec2): IVec2 {
  return {
    x: Math.round(a.x),
    y: Math.round(a.y),
  };
}
export function floor2(a: IVec2): IVec2 {
  return {
    x: Math.floor(a.x),
    y: Math.floor(a.y),
  };
}
export function ceil2(a: IVec2): IVec2 {
  return {
    x: Math.ceil(a.x),
    y: Math.ceil(a.y),
  };
}

export function lerp2(a: IVec2, b: IVec2, t: number): IVec2 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

export function clone2(input: IVec2): IVec2 {
  return new Vec2(input.x, input.y);
}
