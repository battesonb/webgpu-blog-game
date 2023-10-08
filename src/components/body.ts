import {Aabb} from "../aabb";
import {Component, InitContext, UpdateContext} from "../ec/component";
import {Entity} from "../ec/entity";
import {Vec3} from "../math/vec3";
import {Terrain} from "./terrain";
import {Transform} from "./transform";

export class Body extends Component {
  private _terrain?: Entity;
  velocity: Vec3;
  gravity: number;
  private _onGround: boolean;
  private _observedVelocity: Vec3;
  private _center: Vec3;
  private _extents: Vec3;

  constructor(velocity: Vec3 = Vec3.zero(), gravity: number = 9.81) {
    super();
    this.velocity = velocity;
    this.gravity = gravity;
    this._onGround = false;
    this._observedVelocity = Vec3.zero();
    this._center = new Vec3(0, -0.25, 0);
    this._extents = Vec3.fill(0.7);
  }

  public get observedVelocity() {
    return this._observedVelocity;
  }

  public get onGround(): boolean {
    return this._onGround;
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    this._terrain = world.getByName("terrain");
  }

  update(ctx: UpdateContext): void {
    const {dt} = ctx;
    const transform = this.getComponent(Transform)!;
    const terrain = this._terrain!.getComponent(Terrain);

    const startPosition = transform.position.clone();

    this.velocity.y -= this.gravity * dt;
    this._onGround = false;
    const steps = 6;
    const velocityPerStep = this.velocity.mul(dt / steps);

    for (let step = 0; step < steps; step++) {
      transform.position = transform.position.add(velocityPerStep);
      const bodyAabb = new Aabb(transform.position.add(this._center), this._extents);

      const minCoords = new Vec3(bodyAabb.minX, bodyAabb.minY, bodyAabb.minZ).map(x => Math.floor(x));
      const maxCoords = new Vec3(bodyAabb.maxX, bodyAabb.maxY, bodyAabb.maxZ).map(x => Math.floor(x));

      for (let i = minCoords.x; i <= maxCoords.x; i++) {
        for (let j = minCoords.y; j <= maxCoords.y; j++) {
          for (let k = minCoords.z; k <= maxCoords.z; k++) {
            const block = terrain?.getBlockAabb(new Vec3(i, j, k));
            if (block) {
                const { normal, depth } = bodyAabb.intersection(block);
                if (depth == 0) {
                  continue;
                }
                this._onGround = this._onGround || (normal.y < 0 && this.velocity.y < 0);
                if (this._onGround) {
                  this.velocity.y = 0;
                }
                transform.position = transform.position.sub(normal.mul(depth));
                // Update AABB absolute center
                bodyAabb.center = transform.position.add(this._center);
            }
          }
        }
      }
    }

    // Prevent physics bodies from falling through the map.
    const bottom = 1 - this._center.y + this._extents.y / 2;
    if (transform.position.y <= bottom) {
      transform.position.y = bottom;
      this.velocity.y = 0;
      this._onGround = true;
    }

    this._observedVelocity = transform.position.sub(startPosition).div(dt);
  }
}
