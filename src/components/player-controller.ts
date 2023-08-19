import {Component, InitContext, UpdateContext} from "../ec/component";
import {Vec2} from "../math/vec2";
import {Input} from "../resources/input";
import {Transform} from "./transform";

export class PlayerController extends Component {
  speed: number = 4;
  transform?: Transform;

  init(_: InitContext): void {
    this.transform = this.getComponent(Transform);
  }

  update(ctx: UpdateContext): void {
    const { dt, world } = ctx;
    const input = world.getResource(Input)!;
    let direction = Vec2.zero();
    if (input.keyDown("a")) {
      direction.x -= 1;
      direction.y += 1;
    } else if (input.keyDown("d")) {
      direction.x += 1;
      direction.y -= 1;
    }
    if (input.keyDown("w")) {
      direction.x -= 1;
      direction.y -= 1;
    } else if (input.keyDown("s")) {
      direction.x += 1;
      direction.y += 1;
    }

    if (direction.magnitudeSquared() > 0.1) {
      direction = direction.normal();

      this.transform!.position.x += this.speed * direction.x * dt;
      this.transform!.position.z += this.speed * direction.y * dt;
    }
  }
}
