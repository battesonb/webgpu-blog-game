import {Component, InitContext, UpdateContext} from "../ec/component";
import {World} from "../ec/world";
import {lerp} from "../math/helpers";
import {Vec3} from "../math/vec3";
import {Terrain} from "./terrain";
import {Transform} from "./transform";

export class Follow extends Component {
  readonly targetName: string;
  readonly horizontalOffset: number;
  readonly verticalOffset: number;
  readonly lerpRatio: number;
  private _transform?: Transform;

  constructor(targetName: string, horizontalOffset: number, verticalOffset: number, lerpRatio: number = 0.05) {
    super();
    this.targetName = targetName;
    this.horizontalOffset = horizontalOffset;
    this.verticalOffset = verticalOffset;
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
    transform.position.x = this.horizontalOffset + lerp(transform.position.x - this.horizontalOffset, target.x, t);
    transform.position.z = this.horizontalOffset + lerp(transform.position.z - this.horizontalOffset, target.z, t);
    transform.position.y = this.verticalOffset + lerp(transform.position.y - this.verticalOffset, target.y, t);
  }
}
