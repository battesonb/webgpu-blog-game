import {Component, InitContext, UpdateContext} from "../ec/component";
import {Body} from "./body";
import {Transform} from "./transform";

export enum BulletKind {
  Player = 0,
  Enemy = 1,
}

export const BULLET_SPEED = 7;

export class Bullet extends Component {
  private _kind: BulletKind;
  private _transform?: Transform;
  private _body?: Body;

  constructor(kind: BulletKind) {
    super();
    this._kind = kind;
  }

  init(_ctx: InitContext): void {
    this._transform = this.getComponent(Transform);
    this._body = this.getComponent(Body);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;

    if (this._body!.observedVelocity.magnitudeSquared() + BULLET_SPEED * 0.5 < BULLET_SPEED * BULLET_SPEED) {
      world.removeEntity(this.entity.name);
      return;
    }

    for (const entity of world.entities) {
      if (!entity.name.startsWith(this.targetName)) {
        continue;
      }
      const targetTransform = entity.getComponent(Transform)!;
      const deltaSquared = targetTransform.position.sub(this._transform!.position).magnitudeSquared();
      if (deltaSquared < 0.25) {
        world.removeEntity(entity.name);
        world.removeEntity(this.entity.name)
      }
    }
  }

  get targetName(): string {
    switch (this._kind) {
      case BulletKind.Player:
        return "enemy";
      case BulletKind.Enemy:
        return "player";
    }
  }
}
