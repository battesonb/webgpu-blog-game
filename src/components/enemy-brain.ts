import {Component, InitContext, UpdateContext} from "../ec/component";
import {Vec2} from "../math/vec2";
import {Body} from "./body";
import {Transform} from "./transform";
import {Turret} from "./turret";

const SHOOT_DISTANCE = 8;
const STOP_DISTANCE = 0.5;

export class EnemyBrain extends Component {
  private _speed: number = 2.5;
  private _transform?: Transform;
  private _body?: Body;

  constructor() {
    super();
  }

  init(_ctx: InitContext): void {
    this._transform = this.getComponent(Transform);
    this._body = this.getComponent(Body);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const player = world.getByName("player");
    if (!player) {
      this._body!.velocity.x = 0;
      this._body!.velocity.z = 0;
      return;
    }
    const playerTransform = player.getComponent(Transform)!;
    const target = playerTransform.position.sub(this._transform!.position);
    let targetOnPlane = new Vec2(target.x, target.z);
    const distanceSquared = targetOnPlane.magnitudeSquared();
    if (distanceSquared < STOP_DISTANCE * STOP_DISTANCE) {
      return;
    }

    if (this._body!.onGround) {
      if (distanceSquared < SHOOT_DISTANCE * SHOOT_DISTANCE) {
        const turret = this.getComponent(Turret)!;
        const aim = new Vec2(playerTransform.position.x, playerTransform.position.z);
        turret.queueShot(aim);
      }

      const horizontalVelocity = new Vec2(this._body!.observedVelocity.x, this._body!.observedVelocity.z);
      if (this._body!.velocity.y <= 0 && horizontalVelocity.magnitudeSquared() < 1) {
        this._body!.velocity.y = 5;
      }
    }

    targetOnPlane = targetOnPlane.normal();
    this._body!.velocity.x = targetOnPlane.x * this._speed;
    this._body!.velocity.z = targetOnPlane.y * this._speed;
  }
}
