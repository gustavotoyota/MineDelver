import { StateMachine } from 'src/code/game/state-machine';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref, ref } from 'vue';

import { PlayerWalkData } from './movement-manager';

export interface PlayerAnimData {
  hp: number;
  maxHP: number;

  worldPos: Vec3;

  currentTime: number;

  walking?: PlayerWalkData;
}

export function createPlayerAnimMachine(input: {
  playerHP: Ref<number>;
  playerMaxHP: Ref<number>;
  currentTime: Ref<number>;
  playerWalking: Ref<PlayerWalkData>;
  worldPos: Ref<Vec3>;
}) {
  return new StateMachine<PlayerAnimData>({
    initialState: ref('idle-down'),
    data: ref({
      hp: input.playerHP,
      maxHP: input.playerMaxHP,

      worldPos: input.worldPos,

      currentTime: input.currentTime,

      walking: input.playerWalking,
    }),
    transitions: [
      {
        condition: ({ data }) =>
          data.walking !== undefined && data.currentTime < data.walking.endTime,
        to: ({ data }) => {
          if (data.walking === undefined) {
            throw new Error('Walking is undefined');
          }

          const prefix = data.walking.targetIsObstacle ? 'mine' : 'walk';

          if (data.walking.targetPos.x < data.worldPos.x) {
            return `${prefix}-left`;
          } else if (data.walking.targetPos.x > data.worldPos.x) {
            return `${prefix}-right`;
          } else if (data.walking.targetPos.y < data.worldPos.y) {
            return `${prefix}-up`;
          } else {
            return `${prefix}-down`;
          }
        },
      },
      {
        condition: ({ state, data }) =>
          (state.startsWith('walk') || state.startsWith('mine')) &&
          (data.walking === undefined ||
            data.currentTime >= data.walking.endTime),
        to: ({ prevState }) => `idle-${prevState.slice(5)}`,
      },
    ],
  });
}
