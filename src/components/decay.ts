import {Component, UpdateContext} from "../ec/component";

export class Decay extends Component {
  private _remainingSeconds;

  constructor(seconds: number) {
    super();
    this._remainingSeconds = seconds;
  }

  update(ctx: UpdateContext): void {
    const {dt, world} = ctx;
    this._remainingSeconds -= dt;

    if (this._remainingSeconds <= 0) {
      world.removeEntity(this.entity.name);
    }
  }
}
