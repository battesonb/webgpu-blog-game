import {Component, InitContext, UpdateContext} from "../ec/component";
import {clamp} from "../math/helpers";
import {Vec3} from "../math/vec3";
import {Terrain} from "./terrain";
import {Transform} from "./transform";

const MAX_DELTA = 5;

export class Shadow extends Component {
  private _transform?: Transform;
  private _targetName: string;
  maxScale: number;

  constructor(targetName: string, maxScale: number) {
    super();
    this._targetName = targetName;
    this.maxScale = maxScale;
  }

  init(_ctx: InitContext): void {
    this._transform = this.getComponent(Transform);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const target = world.getByName(this._targetName);
    const terrain = world.getByName("terrain")?.getComponent(Terrain);
    if (!target) {
      world.removeEntity(this.entity.name);
      return;
    }

    const targetPosition = target.getComponent(Transform)!.position;
    this._transform!.position = targetPosition.clone();

    const x = this._transform!.position.x;
    const z = this._transform!.position.z;
    for (let j = Math.floor(this._transform!.position.y); j >= 0; j--) {
      if (terrain!.getBlock(new Vec3(x, j, z))) {
        this._transform!.position.y = j + 1.01;
        break;
      }
    }

    const clamped = clamp(0, MAX_DELTA, targetPosition.y - this._transform!.position.y);
    const ratio = (MAX_DELTA - clamped) / MAX_DELTA;
    const halfScale = this.maxScale / 2;
    this._transform!.scale = Vec3.fill(ratio * halfScale + halfScale);
  }
}
