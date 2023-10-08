import { IVec3 } from "./vec3";

export interface IVec2 {
  x: number;
  y: number;
}

export class Vec2 implements IVec2 {
  constructor(public x: number = 0, public y: number = 0) {}
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
  return { x: a.x + b.x, y: a.y + b.y };
}

export function clone2(input: IVec2): IVec2 {
  return new Vec2(input.x, input.y);
}
