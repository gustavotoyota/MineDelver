import { lerp } from './math';
import { Vec3 } from './vec3';

export interface IVec2 {
  x: number;
  y: number;
}

export class Vec2 implements IVec2 {
  x: number;
  y: number;

  constructor(x: number | IVec2 = 0, y?: number) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
    } else if (y === undefined) {
      this.x = x;
      this.y = x;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  add(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(this.x + vec.x, this.y + vec.y);
  }
  sub(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(this.x - vec.x, this.y - vec.y);
  }
  mul(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(this.x * vec.x, this.y * vec.y);
  }
  div(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(this.x / vec.x, this.y / vec.y);
  }

  min(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(Math.min(this.x, vec.x), Math.min(this.y, vec.y));
  }
  max(vec: IVec2 | number): Vec2 {
    vec = new Vec2(vec);

    return new Vec2(Math.max(this.x, vec.x), Math.max(this.y, vec.y));
  }

  round(): Vec2 {
    return new Vec2(Math.round(this.x), Math.round(this.y));
  }
  floor(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
  }
  ceil(): Vec2 {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  lerp(vec: IVec2, t: number): Vec2 {
    return new Vec2(lerp(this.x, vec.x, t), lerp(this.y, vec.y, t));
  }

  distSqr(vec: IVec2): number {
    return (this.x - vec.x) ** 2 + (this.y - vec.y) ** 2;
  }

  dist(vec: IVec2): number {
    return Math.sqrt(this.distSqr(vec));
  }

  equals(vec: IVec2): boolean {
    return this.x === vec.x && this.y === vec.y;
  }

  to3D(z = 0): Vec3 {
    return new Vec3(this.x, this.y, z);
  }

  distManhattan(vec: IVec2): number {
    return Math.abs(this.x - vec.x) + Math.abs(this.y - vec.y);
  }

  distChebyshev(vec: IVec2): number {
    return Math.max(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y));
  }
}
