import {Component, InitContext, UpdateContext} from "../ec/component";
import {Entity} from "../ec/entity";
import {lerp} from "../math/helpers";
import {Transform} from "./transform";

export class Follow extends Component {
  readonly targetName: string;
  readonly offset: number;
  readonly lerpRatio: number;
  transform?: Transform;
  target?: Entity;

  constructor(targetName: string, offset: number, lerpRatio: number = 0.05) {
    super();
    this.targetName = targetName;
    this.offset = offset;
    this.lerpRatio = lerpRatio;
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    this.target = world.getByName(this.targetName);
    this.transform = this.getComponent(Transform);
    this.lerpToTarget(1);
  }

  update(_: UpdateContext): void {
    this.lerpToTarget(this.lerpRatio);
  }
  
  private lerpToTarget(t: number) {
    const transform = this.transform!;
    const target = this.target!;
    const targetPosition = target.getComponent(Transform)!.position;
    transform.position.x = this.offset + lerp(transform.position.x - this.offset, targetPosition.x, t);
    transform.position.z = this.offset + lerp(transform.position.z - this.offset, targetPosition.z, t);
  }
}
