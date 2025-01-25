import {assertDefined} from "../assertions";
import {CleanupContext, Component, InitContext, RenderContext, UpdateContext} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Mesh} from "../mesh";
import { Meshes } from "../resources/meshes";
import {Renderer} from "../resources/renderer";
import {Vertex} from "../vertex";
import {Transform} from "./transform";

/**
 * A mesh handle is responsible for holding the instance buffer for a specific
 * entity as well as a reference to the related mesh.
 *
 * The mesh handle also drives the lifecycle methods through the
 * entity-component architecture.
 */
export class MeshHandle extends Component {
  /**
   * Transform/instance-specific data.
   */
  private _instanceBuffer?: GPUBuffer;
  /**
   * The mesh name, this is not fully safe as the [Meshes] resource may have
   * clobbered this mesh. There should be a generation attached to the name, as
   * well.
   */
  private readonly _name: string;
  /**
   * The mesh
   */
  readonly mesh: Mesh;

  constructor(name: string, mesh: Mesh) {
    super();
    this._name = name;
    this.mesh = mesh;
  }

  set vertices(vertices: Vertex[]) {
    this.mesh.vertices = vertices;
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    const device = world.getResource(Renderer)!.device;
    const name = this.entity.name;
    {
      const identity = Mat4.identity().buffer();
      const instanceData = new Float32Array([...identity, ...identity]);
      this._instanceBuffer = device.createBuffer({
        label: `${name} instance buffer`,
        size: instanceData.buffer.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this._instanceBuffer, 0, instanceData);
    }
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const device = world.getResource(Renderer)!.device;

    this.mesh.update(device);

    const transform = this.getComponent(Transform);
    assertDefined(transform, "Transform must exist on entity with a mesh");
    const model = transform.matrix()

    // Remove the translation, as normals should not be affected by translation
    const modelWithoutTranslation = model.clone();
    modelWithoutTranslation.rows[0].w = 0;
    modelWithoutTranslation.rows[1].w = 0;
    modelWithoutTranslation.rows[2].w = 0;

    const array = new Float32Array([...model.buffer(), ...modelWithoutTranslation.inverse().transpose().buffer()]);
    device.queue.writeBuffer(this._instanceBuffer!, 0, array);
  }

  render(ctx: RenderContext) {
    this.mesh.render(ctx.pass, this._instanceBuffer!);
  }

  cleanup(ctx: CleanupContext): void {
    const { world } = ctx;
    const meshes = world.getResource(Meshes)!;
    meshes.decrementMeshHandleCount(this._name);
  }
}

