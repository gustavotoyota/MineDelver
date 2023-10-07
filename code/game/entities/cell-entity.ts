import { IVec3 } from "~/code/misc/vec3";
import { IEntity } from "./entities";

export interface ICellEntity extends IEntity {
  worldPos: Ref<IVec3>;
}
