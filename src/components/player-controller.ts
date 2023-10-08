import {Component, InitContext, UpdateContext} from "../ec/component";
import {Vec2} from "../math/vec2";
import {Input} from "../resources/input";
import {Body} from "./body";

export class PlayerController extends Component {
  private _speed: number = 4;
  private _jumpSpeed = 5;
  private _body?: Body;

  constructor() {
    super();
  }

  init(_: InitContext): void {
    this._body = this.getComponent(Body);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
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

      this._body!.velocity.x = this._speed * direction.x;
      this._body!.velocity.z = this._speed * direction.y;
    } else {
      this._body!.velocity.x = 0;
      this._body!.velocity.z = 0;
    }

    if (input.keyDown(" ") && this._body!.onGround && this._body!.velocity.y <= 0) {
      this._body!.velocity.y = this._jumpSpeed;
    }
  }
}
