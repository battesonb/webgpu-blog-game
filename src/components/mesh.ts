import {assertDefined} from "../assertions";
import {Component, InitContext, RenderContext, UpdateContext} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";
import {GpuResources} from "../resources/gpu-resources";
import {Vertex} from "../vertex";
import {Transform} from "./transform";

export class Mesh extends Component {
  /**
   * Vertex data.
   */
  private vertexBuffer?: GPUBuffer;
  /**
   * Transform/instance-specific data.
   */
  private instanceBuffer?: GPUBuffer;
  /**
   * Indices into the vertex buffer.
   */
  private indexBuffer?: GPUBuffer;
  /**
   * CPU-side representation of vertices. Kept to allow updating of meshes,
   * since meshes in this game are small.
   */
  private _vertices: Vertex[];
  /**
   * A per-frame check to see if the vertices list was updated in the previous
   * frame.
   */
  private _shouldUpdate: boolean;

  constructor(vertices: Vertex[] = []) {
    super();
    this._vertices = vertices;
    this._shouldUpdate = false;
  }

  set vertices(value: Vertex[]) {
    this._shouldUpdate = true;
    this._vertices = value;
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    const device = world.getResource(GpuResources)!.device;
    const name = this.entity.name;
    {
      const identity = Mat4.identity().buffer();
      const instanceData = new Float32Array([...identity, ...identity]);
      this.instanceBuffer = device.createBuffer({
        label: `${name} instance buffer`,
        size: instanceData.buffer.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this.instanceBuffer, 0, instanceData);
    }

    this.createVertexAndIndexBuffers(device);
  }

  private createVertexAndIndexBuffers(device: GPUDevice) {
    this.updateVertexNormalsAndTangents();

    const name = this.entity.name;
    {
      const vertexArray = new Float32Array(this._vertices.map(v => v.array()).flat());
      this.vertexBuffer = device.createBuffer({
        label: `${name} vertex buffer`,
        size: vertexArray.buffer.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this.vertexBuffer, 0, vertexArray);
    }

    // We do quads by default
    {
      const indices = Array.from({length: this._vertices.length / 4})
        .map((_, i) => [0, 1, 2, 0, 2, 3].map((x) => x + i * 4))
        .flat();
      const indexArray = new Uint32Array(indices);
      this.indexBuffer = device.createBuffer({
        label: `${name} index buffer`,
        size: indexArray.buffer.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(this.indexBuffer, 0, indexArray);
    }

    this._shouldUpdate = false;
  }

  /**
   * Configure all vertex tangent and bi-tangent vectors of this mesh.
   */
  private updateVertexNormalsAndTangents() {
    for (let i = 0; i < this._vertices.length; i += 4) {
      const a = this._vertices[i];
      const b = this._vertices[i + 1];
      const c = this._vertices[i + 2];
      const d = this._vertices[i + 3];

      // We use quads, so we split each iteration up into two triangles to make
      // the calculation easier.
      this.updateTriangleTangents(a, b, c);
      this.updateTriangleTangents(a, c, d);
    }
  }

  /**
   * Given a vertices representing a triangle in anti-clockwise winding order,
   * and UV coordinates that start at the top-left of an image, set the vertex
   * tangent and bi-tangent vectors.
   */
  private updateTriangleTangents(a: Vertex, b: Vertex, c: Vertex) {
    const edge1 = b.position.sub(a.position);
    const deltaUv1 = b.uv.sub(a.uv);

    const edge2 = c.position.sub(a.position);
    const deltaUv2 = c.uv.sub(a.uv);

    const determinant = 1.0 / (deltaUv1.y * deltaUv2.x - deltaUv1.x * deltaUv2.y);

    const tangent = new Vec3(
      -deltaUv2.y * edge1.x + deltaUv1.y * edge2.x,
      -deltaUv2.y * edge1.y + deltaUv1.y * edge2.y,
      -deltaUv2.y * edge1.z + deltaUv1.y * edge2.z,
    ).mul(determinant).normal();

    const bitangent = new Vec3(
      -deltaUv2.x * edge1.x + deltaUv1.x * edge2.x,
      -deltaUv2.x * edge1.y + deltaUv1.x * edge2.y,
      -deltaUv2.x * edge1.z + deltaUv1.x * edge2.z,
    ).mul(determinant).normal();

    const normal = tangent.cross(bitangent).normal();

    a.tangent.set(tangent);
    b.tangent.set(tangent);
    c.tangent.set(tangent);

    a.bitangent.set(bitangent);
    b.bitangent.set(bitangent);
    c.bitangent.set(bitangent);

    a.normal.set(normal);
    b.normal.set(normal);
    c.normal.set(normal);

  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const device = world.getResource(GpuResources)!.device;

    if (this._shouldUpdate) {
      this.createVertexAndIndexBuffers(device);
    }

    const transform = this.getComponent(Transform);
    assertDefined(transform, "Transform must exist on entity with a mesh");
    const model = transform.matrix()

    // Remove the translation, as normals should not be affected by translation
    const modelWithoutTranslation = model.clone();
    modelWithoutTranslation.rows[0].w = 0;
    modelWithoutTranslation.rows[1].w = 0;
    modelWithoutTranslation.rows[2].w = 0;

    const array = new Float32Array([...model.buffer(), ...modelWithoutTranslation.inverse().transpose().buffer()]);
    device.queue.writeBuffer(this.instanceBuffer!, 0, array);
  }

  render(ctx: RenderContext) {
    const {pass} = ctx;
    pass.setVertexBuffer(0, this.vertexBuffer!);
    pass.setVertexBuffer(1, this.instanceBuffer!);
    pass.setIndexBuffer(this.indexBuffer!, "uint32");
    pass.drawIndexed(this.indexBuffer!.size / 4, 1);
  }
}

