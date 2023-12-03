import {Component, InitContext, UpdateContext} from "../ec/component";
import {Vec2} from "../math/vec2";
import {Body} from "./body";
import {Transform} from "./transform";

/**
 * A component for controlling NPC agents. Since agents in this game need to
 * react to terrain, it's best to model this in a component instead of within a
 * behavior tree.
 */
export class Locomotor extends Component {
  private _body?: Body;
  private _transform?: Transform;
  private _moving: boolean;
  target?: Vec2;
  speed: number;

  constructor(speed: number, target?: Vec2) {
    super();
    this._moving = false;
    this.target = target;
    this.speed = speed;
  }

  init(_ctx: InitContext): void {
    this._body = this.getComponent(Body);
    this._transform = this.getComponent(Transform);
  }

  update(_ctx: UpdateContext): void {
    const body = this._body!;
    if (this.target === undefined) {
      this._moving = false;
      body.velocity.x = 0;
      body.velocity.z = 0;
      return;
    }

    const position = this._transform!.position;
    const direction = this.target.sub(new Vec2(position.x, position.z));
    const magnitudeSquared = direction.magnitudeSquared();

    if (magnitudeSquared < 0.1) {
      this._moving = false;
      body.velocity.x = 0;
      body.velocity.z = 0;
      return;
    }

    if (body.onGround && this._moving) {
      const horizontalVelocity = new Vec2(body.observedVelocity.x, body.observedVelocity.z);
      if (body.velocity.y <= 0 && horizontalVelocity.magnitudeSquared() < this.speed) {
        body.velocity.y = 5;
      }
    }

    const normal = direction.normal();
    body.velocity.x = this.speed * normal.x;
    body.velocity.z = this.speed * normal.y;
    this._moving = true;
  }
}
