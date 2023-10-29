import {Component, UpdateContext} from "../ec/component";
import {newEnemy} from "../entities/enemy";
import {Vec3} from "../math/vec3";
import {Terrain} from "./terrain";
import {Transform} from "./transform";

export class Spawner extends Component {
  /**
   * Time in seconds until an enemy should be spawned.
   */
  period: number;
  /**
   * Time in seconds remaining until the next spawn.
   */
  private _nextSpawn: number;

  constructor(period: number = 2) {
    super();
    this.period = period;
    this._nextSpawn = period;
  }

  update(ctx: UpdateContext) {
    const {dt, world} = ctx;
    const player = world.getByName("player");
    if (!player) {
      return;
    }
    this._nextSpawn -= dt;
    if (this._nextSpawn <= 0) {
      this._nextSpawn = this.period;
      const playerPosition = player.getComponent(Transform)!.position;
      let position = new Vec3(0, 20, 0);
      for (let i = 0; i < 10; i++) {
        position.x = Math.random() * Terrain.SIZE_X;
        position.z = Math.random() * Terrain.SIZE_Z;
        if (playerPosition.sub(position).magnitudeSquared() > 16) {
          break;
        }
      }
      world.addEntities(...newEnemy(world, position));
    }
  }
}
