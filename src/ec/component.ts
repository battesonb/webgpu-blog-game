import {Entity} from "./entity";
import {World} from "./world";

export interface InitContext {
  world: World,
}

export interface UpdateContext {
  dt: number,
  now: number,
  world: World,
}

export interface RenderContext {
  pass: GPURenderPassEncoder,
  dt: number,
}

export abstract class Component {
  private _entity?: Entity;

  withComponent<T extends Component>(type: { new(...args: any[]): T }, component: T): Entity {
    return this._entity!.withComponent(type, component);
  }

  getComponent<T extends Component>(type: { new(...args: any[]): T }): T | undefined {
    return this._entity?.getComponent(type);
  }

  get entity(): Entity {
    return this._entity!
  }

  set entity(value: Entity) {
    this._entity = value;
  }

  /**
   * Performed once for this component when its parent entity is added to the world
   */
  init(_ctx: InitContext) {}

  /**
   * Runs every frame.
   */
  update(_ctx: UpdateContext) {}

  /**
   * Runs every frame after update -- should only be used for rendering.
   */
  render(_ctx: RenderContext) {}
}

/**
 * The component ID for a given component class. Note that this value should not
 * be used for serialization (particularly for networking or save games) as it
 * is not guaranteed to be the same if components are added to the world in a
 * different order.
 */
export type ComponentId = number;

/**
 * Create a function with its own internal state for simultaneously retrieving
 * and assigning component IDs.
 */
export const getComponentId = (() => {
  // Since JavaScript is single-threaded, we can sneak this global (to this
  // closure) through to assign component classes with IDs. We're doing this
  // because there isn't sufficient reflection in JavaScript (that I'm aware
  // of).
  let nextComponentId = 0;

  return <T extends Component>(type: { new(...args: any[]): T }): ComponentId => {
    // @ts-ignore
    if (type._componentId === undefined) {
      // @ts-ignore
      type._componentId = nextComponentId++;
    }
    // @ts-ignore
    return type._componentId;
    };
})();
