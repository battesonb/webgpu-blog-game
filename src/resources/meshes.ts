import { assert } from "../assertions";
import { MeshHandle } from "../components/mesh-handle";
import { UpdateContext } from "../ec/component";
import { Resource } from "../ec/resource";
import { Mesh } from "../mesh";
import { Vertex } from "../vertex";

interface MeshData {
  /**
   * The actual mesh 
   */
  mesh: Mesh;
  /**
   * The number of handles to this mesh.
   */
  handles: number;
}

/**
 * Stores meshes that should be shared across entities.
 *
 * Currently, this cleans up meshes that go unused. This is not great for the
 * case where meshes are frequently created and destroyed. There should be a
 * timer or similar heuristic to slowly clean up meshes over multiple frames.
 */
export class Meshes extends Resource {
  private _meshes: Map<string, MeshData>;

  constructor() {
    super();
    this._meshes = new Map();
  }

  /**
   * Retrieves a handle to the mesh for a given name. If the mesh does not
   * exist, then a new mesh is first generated and then wrapped in a handle.
   *
   * Grabbing a handle means the component must be assigned to exactly one
   * entity.
   */
  get(name: string, generator: () => Vertex[] = () => []): MeshHandle {
    const meshData = this._meshes.get(name);
    if (meshData) {
      meshData.handles += 1;
      return new MeshHandle(name, meshData.mesh);
    }
    const newMeshData = {
      mesh: new Mesh(name, generator()),
      handles: 1,
    };
    this._meshes.set(name, newMeshData);
    return new MeshHandle(name, newMeshData.mesh);
  }

  /**
   * Called to notify this object that the number of handles to a specific mesh
   * has decreased by one.
   */
  decrementMeshHandleCount(name: string) {
    const meshData = this._meshes.get(name);
    if (meshData) {
      meshData.handles -= 1;
      if (meshData.handles == 0) {
        this._meshes.delete(name);
      } else if (meshData.handles < 0) {
        throw new Error("Mesh handle count should not be negative");
      }
      return;
    }
    throw new Error("A handle was decreased after the mesh has already been dropped");
  }
}
