/**
 * Can be thought of as a global component. Only one may exist in a World at a
 * given time. Adding a new resource of an existing type will overwrite the
 * previous resource.
 */
export abstract class Resource {
  /**
   * Performed on cleanup of the world.
   */
  destroy() {}
}

/**
 * The resource ID for a given resource class. Note that this value should not
 * be used for serialization (particularly for networking or save games) as it
 * is not guaranteed to be the same if resources are added to the world in a
 * different order.
 */
export type ResourceId = number;

/**
 * Create a function with its own internal state for simultaneously retrieving
 * and assigning resource IDs.
 */
export const getResourceId = (() => {
  // Since JavaScript is single-threaded, we can sneak this global (to this
  // closure) through to assign Resource classes with IDs. We're doing this
  // because there isn't sufficient reflection in JavaScript (that I'm aware
  // of).
  let nextResourceId = 0;

  return <T extends Resource>(type: { new(...args: any[]): T }): ResourceId => {
    // @ts-ignore
    if (type._resourceId === undefined) {
      // @ts-ignore
      type._resourceId = nextResourceId++;
    }
    // @ts-ignore
    return type._resourceId;
    };
})();
