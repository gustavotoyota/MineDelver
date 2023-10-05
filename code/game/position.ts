import { IVec3, Vec3 } from "@/code/misc/vec3";

export type WorldPos = IVec3;

export const WorldPos = Vec3;

export function forEachPosInRect(input: {
  topLeft: WorldPos;
  bottomRight: WorldPos;
  func: (pos: WorldPos) => void;
}) {
  for (
    let z = Math.floor(input.topLeft.z);
    z <= Math.ceil(input.bottomRight.z);
    z++
  ) {
    for (
      let y = Math.floor(input.topLeft.y);
      y <= Math.ceil(input.bottomRight.y);
      y++
    ) {
      for (
        let x = Math.floor(input.topLeft.x);
        x <= Math.ceil(input.bottomRight.x);
        x++
      ) {
        input.func(new WorldPos(x, y, z));
      }
    }
  }
}
