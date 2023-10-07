import { IVec3 } from "~/code/misc/vec3";
import { StateMachine } from "../../state-machine";

export type PlayerWalkData =
  | {
      sourcePos: IVec3;
      targetPos: IVec3;
      startTime: number;
      endTime: number;
    }
  | undefined;

export interface PlayerAnimData {
  hp: number;
  maxHP: number;

  worldPos: IVec3;

  currentTime: number;

  walking?: PlayerWalkData;
}

export function createPlayerAnimMachine(input: {
  playerHP: Ref<number>;
  playerMaxHP: Ref<number>;
  currentTime: Ref<number>;
  playerWalking: Ref<PlayerWalkData>;
  worldPos: Ref<IVec3>;
}) {
  return new StateMachine<PlayerAnimData>({
    initialState: ref("idle"),
    data: ref({
      hp: input.playerHP,
      maxHP: input.playerMaxHP,

      worldPos: input.worldPos,

      currentTime: input.currentTime,

      walking: input.playerWalking,
    }),
    transitions: [
      {
        condition: ({ state, data }) =>
          state === "idle" &&
          data.walking != null &&
          data.currentTime < data.walking.endTime,
        to: ({ data }) => {
          if (data.walking == null) {
            throw new Error("Walking is null");
          }

          if (data.walking.targetPos.x < data.worldPos.x) {
            return "walk-left";
          } else if (data.walking.targetPos.x > data.worldPos.x) {
            return "walk-right";
          } else if (data.walking.targetPos.y < data.worldPos.y) {
            return "walk-up";
          } else {
            return "walk-down";
          }
        },
      },
      {
        condition: ({ state, data }) =>
          state.startsWith("walk") &&
          (data.walking == null || data.currentTime >= data.walking.endTime),
        to: () => "idle",
      },
    ],
  });
}
