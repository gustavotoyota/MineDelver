import { lerp } from './math';

export interface IVec3 {
  x: number;
  y: number;
  z: number;
}

export class Vec3 implements IVec3 {
  x: number;
  y: number;
  z: number;

  constructor(x: Vec3 | number = 0, y?: number, z?: number) {
    if (typeof x === 'object') {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if (y === undefined || z === undefined) {
      this.x = x;
      this.y = x;
      this.z = x;
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  clone3(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  lerp(vec: Vec3, progress: number): Vec3 {
    return new Vec3(
      lerp(this.x, vec.x, progress),
      lerp(this.y, vec.y, progress),
      lerp(this.z, vec.z, progress)
    );
  }
}
