import {assert} from "../assertions";
import { Constructor } from "../types";
import {UpdateContext} from "./component";
import {Entity} from "./entity";
import {getResourceId, Resource, ResourceId} from "./resource";

export class World {
  private _newEntities: Entity[];
  private _entities: Map<string, Entity>;
  private _resources: Map<ResourceId, Resource>;

  constructor() {
    this._newEntities = [];
    this._entities = new Map();
    this._resources = new Map();
  }

  get entities(): IterableIterator<Entity> {
    return this._entities.values();
  }

  withResourceDefault<T extends Resource>(type: {new(): T}): World {
    const resource = new type();
    return this.withResource(resource);
  }

  withResource<T extends Resource>(resource: T): World {
    this.addResource(resource);
    return this;
  }

  addResource<T extends Resource>(resource: T) {
    this._resources.set(getResourceId(resource.constructor as { new(...args: any[]): T }), resource);
  }

  getResource<T extends Resource>(type: { new(...args: any[]): T }): T | undefined {
    const component = this._resources.get(getResourceId(type));
    if (component) {
      return component as T;
    }
    return undefined;
  }

  addEntities(...entities: Entity[]) {
    for (const entity of entities) {
      entity.world = this;
    }
    this._newEntities.push(...entities);
  }

  removeEntity(name: string): boolean {
    const entity = this.getByName(name);
    if (entity) {
      for (const component of entity.components) {
        entity.removeComponent(component.constructor as Constructor<any>);
      }
    }
    return this._entities.delete(name);
  }

  getByName(name: string): Entity | undefined {
    return this._entities.get(name);
  }

  /**
   * Performs entity init and update lifecycle methods.
   */
  update(ctx: UpdateContext) {
    for (const entity of this._newEntities) {
      assert(!this._entities.has(entity.name), `Tried to add an entity with the same name to the world: ${entity.name}`);
      this._entities.set(entity.name, entity);
    }

    for (const entity of this._newEntities) {
      for (const component of entity.components) {
        component.init({world: ctx.world});
      }
    }

    this._newEntities.splice(0);

    for (const resource of this._resources.values()) {
      resource.preUpdate(ctx);
    }

    for (const entity of this._entities.values()) {
      for (const component of entity.components) {
        component.update(ctx);
      }
    }

    for (const resource of this._resources.values()) {
      resource.postUpdate(ctx);
    }
  }
}
