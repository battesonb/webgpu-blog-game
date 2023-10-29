import {Component, UpdateContext} from "../ec/component";
import {newBullet} from "../entities/bullet";
import {Vec2} from "../math/vec2";
import {BulletKind} from "./bullet";
import {Transform} from "./transform";

export class Turret extends Component {
  firePeriod: number;
  bulletKind: BulletKind;
  private _nextShot: number;
  private _target?: Vec2;

  constructor(kind: BulletKind, firePeriod: number = 0.5) {
    super();
    this.firePeriod = firePeriod;
    this.bulletKind = kind;
    this._nextShot = this.firePeriod;
    this._target = undefined;
  }

  update(ctx: UpdateContext): void {
    const {dt, world} = ctx;
    this._nextShot -= dt;
    if (this._target && this._nextShot <= 0) {
      const position = this.getComponent(Transform)!.position;
      world.addEntities(...newBullet(world, this.bulletKind, position, this._target))

      this._nextShot = this.firePeriod;
      this._target = undefined;
    }
  }

  queueShot(target: Vec2) {
    if (this._nextShot < this.firePeriod / 2) {
      this._target = target;
    }
  }
}
