import { Input } from 'src/code/game/input';
import { Vec2 } from 'src/code/misc/vec2';

import { IEntity, onInput, onRender } from '../../entities';

export function performKeyboardMovement(input: {
  walkToDirection: (direction: Vec2) => void;
}) {
  const walkDir = new Vec2();

  if (
    Input.keyDown['KeyQ'] ||
    Input.keyDown['KeyW'] ||
    Input.keyDown['KeyE'] ||
    Input.keyDown['ArrowUp'] ||
    Input.keyDown['Numpad7'] ||
    Input.keyDown['Numpad8'] ||
    Input.keyDown['Numpad9']
  ) {
    walkDir.y -= 1;
  }
  if (
    Input.keyDown['KeyS'] ||
    Input.keyDown['KeyZ'] ||
    Input.keyDown['KeyX'] ||
    Input.keyDown['KeyC'] ||
    Input.keyDown['ArrowDown'] ||
    Input.keyDown['Numpad1'] ||
    Input.keyDown['Numpad2'] ||
    Input.keyDown['Numpad3']
  ) {
    walkDir.y += 1;
  }
  if (
    Input.keyDown['KeyQ'] ||
    Input.keyDown['KeyA'] ||
    Input.keyDown['KeyZ'] ||
    Input.keyDown['ArrowLeft'] ||
    Input.keyDown['Numpad7'] ||
    Input.keyDown['Numpad4'] ||
    Input.keyDown['Numpad1']
  ) {
    walkDir.x -= 1;
  }
  if (
    Input.keyDown['KeyE'] ||
    Input.keyDown['KeyD'] ||
    Input.keyDown['KeyC'] ||
    Input.keyDown['ArrowRight'] ||
    Input.keyDown['Numpad9'] ||
    Input.keyDown['Numpad6'] ||
    Input.keyDown['Numpad3']
  ) {
    walkDir.x += 1;
  }

  if (!walkDir.equals(new Vec2())) {
    input.walkToDirection(walkDir);
  }
}

export class PlayerKeyboardMovement implements IEntity {
  private _walkToDirection: (direction: Vec2) => void;

  constructor(input: { walkToDirection: (direction: Vec2) => void }) {
    this._walkToDirection = input.walkToDirection;
  }

  setup(): void {
    onInput(() => {
      performKeyboardMovement({ walkToDirection: this._walkToDirection });
    });

    onRender(() => {
      performKeyboardMovement({ walkToDirection: this._walkToDirection });
    });
  }
}
