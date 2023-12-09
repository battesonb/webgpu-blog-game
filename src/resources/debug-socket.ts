import {BehaviorTree} from "../components/behaviortree";
import {Transform} from "../components/transform";
import {UpdateContext} from "../ec/component";
import {Entity} from "../ec/entity";
import {Resource} from "../ec/resource";
import {WebsocketMessage}  from "../../debug/messages";

const BAKE_TIME = 300;
const WSS_DEV_PORT = 8080;

/**
 * A WebSocket for sending high-level information to a separate node server for
 * debugging behavior trees.
 */
export class DebugSocket extends Resource {
  private _ws: WebSocket;
  /**
   * The most recent enemy that is closest to the player. Keeps follow the last
   * enemy after the player dies.
   */
  private _enemy: Entity | undefined;
  private _nextTimeMs: number = 0;
  private _states: string[];

  constructor() {
    super();
    this._ws = new WebSocket(`ws://localhost:${WSS_DEV_PORT}`);
    this._states = [];
  }

  get socket() {
    return this._ws;
  }

  postUpdate({world, now}: UpdateContext): void {
    if (this._ws.readyState != WebSocket.OPEN) {
      return;
    }

    const player = world.getByName("player");
    if (player) {
      let distanceSquared = Number.MAX_VALUE;
      const playerPosition = player.getComponent(Transform)!.position;
      for (const entity of world.entities) {
        if (entity.name.startsWith("enemy")) {
          const enemyPosition = entity.getComponent(Transform)!.position;
          const currentDistSquared = playerPosition.sub(enemyPosition).magnitudeSquared();
          if (currentDistSquared < distanceSquared) {
            this._enemy = entity;
            distanceSquared = currentDistSquared;
          }
        }
      }
    }

    if (!this._enemy) {
      return;
    }

    const bt = this._enemy.getComponent(BehaviorTree)!;
    const dot = bt.dot();
    if (this._states.length == 0) {
      this._states.unshift(dot);
      return;
    }

    if (this._states[0] != dot) {
      this._states.unshift(dot);
      return;
    }

    if (this._nextTimeMs >= now) {
      return;
    }

    const msg: WebsocketMessage = {
      type: "dot",
      dot: this._states.pop()!,
    };
    this._ws.send(JSON.stringify(msg));
    this._nextTimeMs = now + BAKE_TIME;
  }
}
