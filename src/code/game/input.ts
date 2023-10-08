import { IVec2, Vec2 } from '../misc/vec2';

export interface Input {
  keyDown: Record<string, boolean>;

  pointerDown: Record<number, boolean>;
  pointerPos: IVec2;
}

export const Input: Input = {
  keyDown: {},

  pointerDown: {},
  pointerPos: new Vec2(),
};
