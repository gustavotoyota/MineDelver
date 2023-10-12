import { IRect3 } from 'src/code/misc/rect3';
import { Vec3 } from 'src/code/misc/vec3';

export function forEachPosInRect3D(input: {
  worldRect: IRect3;
  func: (pos: Vec3) => void;
}) {
  for (let z = input.worldRect.min.z; z <= input.worldRect.max.z; z++) {
    for (let y = input.worldRect.min.y; y <= input.worldRect.max.y; y++) {
      for (let x = input.worldRect.min.x; x <= input.worldRect.max.x; x++) {
        input.func(new Vec3(x, y, z));
      }
    }
  }
}
