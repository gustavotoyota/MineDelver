import { IVec3, Vec3 } from "@/code/misc/vec3";
import { IRect3 } from "~/code/misc/rect3";

export type WorldPos = IVec3;

export const WorldPos = Vec3;

export function forEachPosInRect3D(input: {
  worldRect: IRect3;
  func: (pos: WorldPos) => void;
}) {
  for (let z = input.worldRect.min.z; z <= input.worldRect.max.z; z++) {
    for (let y = input.worldRect.min.y; y <= input.worldRect.max.y; y++) {
      for (let x = input.worldRect.min.x; x <= input.worldRect.max.x; x++) {
        input.func(new WorldPos(x, y, z));
      }
    }
  }
}
