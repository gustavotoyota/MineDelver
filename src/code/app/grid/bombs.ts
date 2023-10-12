import { hashFNV1a } from 'src/code/misc/hash';
import { posMod } from 'src/code/misc/math';
import { Vec3 } from 'src/code/misc/vec3';

export function cellHasBomb(input: {
  seed: number;
  worldPos: Vec3;
  bombProbability: number;
}): boolean {
  const hash = hashFNV1a(
    `${input.seed}:${input.worldPos.x}:${input.worldPos.y}:${input.worldPos.z}`
  );

  const modded = posMod(hash, 10000);

  return modded / 10000 < input.bombProbability;
}
