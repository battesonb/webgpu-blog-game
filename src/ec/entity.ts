import {Component, ComponentId, getComponentId} from "./component";

export class Entity {
  private _components: Map<ComponentId, Component>;
  private _name: string;

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

  get components(): Component[] {
    return [...this._components.values()];
  }

  withComponentDefault<T extends Component>(type: { new(): T }): Entity {
    const component = new type();
    return this.withComponent(type, component);
  }

  withComponent<T extends Component>(type: { new(...args: any[]): T }, component: T): Entity {
    component.entity = this;
    this._components.set(getComponentId(type), component);
    return this;
  }

  getComponent<T extends Component>(type: { new(): T }): T | undefined {
    const component = this._components.get(getComponentId(type));
    if (component) {
      return component as T;
    }
    return undefined;
  }
}
