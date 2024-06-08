import {Component, InitContext, UpdateContext} from "../ec/component";
import {World} from "../ec/world";
import {lerp} from "../math/helpers";
import {Vec3} from "../math/vec3";
import {Terrain} from "./terrain";
import {Transform} from "./transform";

export class Follow extends Component {
  readonly targetName: string;
  readonly offset: Vec3;
  readonly lerpRatio: number;
  private _transform?: Transform;

  constructor(targetName: string, offset: Vec3, lerpRatio: number = 0.05) {
    super();
    this.targetName = targetName;
    this.offset = offset;
    this.lerpRatio = lerpRatio;
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    this._transform = this.getComponent(Transform);
    const target = this.targetPosition(world);
    this.lerpToTarget(target, 1);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const target = this.targetPosition(world);
    this.lerpToTarget(target, this.lerpRatio);
  }

  private targetPosition(world: World): Vec3 {
    const target = world.getByName(this.targetName);
    if (!target) {
      return new Vec3(Terrain.SIZE_X * 1.5, 110, Terrain.SIZE_Z * 1.5);
    }
    return target.getComponent(Transform)!.position;
  }
  
  private lerpToTarget(target: Vec3, t: number) {
    const transform = this._transform!;
    transform.position.x = this.offset.x + lerp(transform.position.x - this.offset.x, target.x, t);
    transform.position.y = this.offset.y + lerp(transform.position.y - this.offset.y, target.y, t);
    transform.position.z = this.offset.z + lerp(transform.position.z - this.offset.z, target.z, t);
  }
}
