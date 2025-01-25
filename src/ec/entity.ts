import { Constructor } from "../types";
import { Component, ComponentId, getComponentId } from "./component";
import { World } from "./world";

export class Entity {
  private _components: Map<ComponentId, Component>;
  private _name: string;
  private _world?: World;

  /**
   * Create an entity with a unique name. You do not need to keep a reference to
   * the name, but names for important entities may be useful for efficient
   * retrieval.
   *
   * @throws if the name is not unique.
   */
  constructor(name: string) {
    this._components = new Map();
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get components(): IterableIterator<Component> {
    return this._components.values()
  }

  set world(value: World) {
    this._world = value;
  }

  withComponentDefault<T extends Component>(type: { new(): T }): Entity {
    const component = new type();
    return this.withComponent(component);
  }

  withComponent<T extends Component>(component: T): Entity {
    component.entity = this;
    this._components.set(getComponentId(component.constructor as { new(...args: any[]): T }), component);
    return this;
  }

  getComponent<T extends Component>(type: Constructor<T>): T | undefined {
    const component = this._components.get(getComponentId(type));
    if (component) {
      return component as T;
    }
    return undefined;
  }

  removeComponent<T extends Component>(type: Constructor<T>): boolean {
    const component = this.getComponent(type);
    if (component) {
      component?.cleanup({ world: this._world! });
    }
    return this._components.delete(getComponentId(type));
  }

  hasComponent<T extends Component>(type: Constructor<T>): boolean {
    const component = this._components.get(getComponentId(type));
    return component !== undefined;
  }
}
