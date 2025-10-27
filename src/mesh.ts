import {Vec3} from "./math/vec3";
import {Vertex} from "./vertex";

export class Mesh {
  /**
   * Vertex data.
   */
  private vertexBuffer?: GPUBuffer;
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
  /**
   * A name for this mesh.
   */
  private _name: string;

  constructor(name: string, vertices: Vertex[] = []) {
    this._vertices = vertices;
    this._shouldUpdate = true;
    this._name = name;
  }

  set vertices(value: Vertex[]) {
    this._shouldUpdate = true;
    this._vertices = value;
  }

  private createVertexAndIndexBuffers(device: GPUDevice) {
    this.updateVertexNormalsAndTangents();

    {
      const vertexArray = new Float32Array(this._vertices.map(v => v.array()).flat());
      if (!this.vertexBuffer || this.vertexBuffer?.size != 4 * vertexArray.length) {
        this.vertexBuffer = device.createBuffer({
          label: `${this._name} vertex buffer`,
          size: vertexArray.buffer.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }
      device.queue.writeBuffer(this.vertexBuffer, 0, vertexArray);
    }

    // We do quads by default
    {
      const indices = Array.from({length: this._vertices.length / 4})
        .map((_, i) => [0, 1, 2, 0, 2, 3].map((x) => x + i * 4))
        .flat();
      const indexArray = new Uint32Array(indices);
      if (!this.indexBuffer || this.indexBuffer?.size != 4 * indexArray.length) {
        this.indexBuffer = device.createBuffer({
          label: `${this._name} index buffer`,
          size: indexArray.buffer.byteLength,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
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
   * Given vertices representing a triangle in anti-clockwise winding order, and
   * UV coordinates that start at the top-left of an image, set the vertex
   * tangent and bi-tangent vectors.
   */
  private updateTriangleTangents(a: Vertex, b: Vertex, c: Vertex) {
    const edge1 = b.position.sub(a.position);
    const deltaUv1 = b.uv.sub(a.uv);

    const edge2 = c.position.sub(a.position);
    const deltaUv2 = c.uv.sub(a.uv);

    const determinant = 1.0 / (deltaUv1.x * deltaUv2.y - deltaUv1.y * deltaUv2.x);

    const tangent = new Vec3(
      -deltaUv2.y * edge1.x + deltaUv1.y * edge2.x,
      -deltaUv2.y * edge1.y + deltaUv1.y * edge2.y,
      -deltaUv2.y * edge1.z + deltaUv1.y * edge2.z,
    ).mul(determinant).normal();

    const bitangent = new Vec3(
      deltaUv2.x * edge1.x - deltaUv1.x * edge2.x,
      deltaUv2.x * edge1.y - deltaUv1.x * edge2.y,
      deltaUv2.x * edge1.z - deltaUv1.x * edge2.z,
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

  update(device: GPUDevice): void {
    if (this._shouldUpdate) {
      this.createVertexAndIndexBuffers(device);
    }
  }

  render(pass: GPURenderPassEncoder, instanceBuffer: GPUBuffer) {
    pass.setVertexBuffer(0, this.vertexBuffer!);
    pass.setVertexBuffer(1, instanceBuffer);
    pass.setIndexBuffer(this.indexBuffer!, "uint32");
    pass.drawIndexed(this.indexBuffer!.size / 4, 1);
  }

  static get vertexBufferLayout(): GPUVertexBufferLayout {
    return {
      stepMode: "vertex",
      arrayStride: 68,
      attributes: [
        { // pos
          format: "float32x3",
          offset: 0,
          shaderLocation: 0,
        },
        { // normal
          format: "float32x3",
          offset: 12,
          shaderLocation: 1,
        },
        { // tangent
          format: "float32x3",
          offset: 24,
          shaderLocation: 2,
        },
        { // bitangent
          format: "float32x3",
          offset: 36,
          shaderLocation: 3,
        },
        { // uv
          format: "float32x2",
          offset: 48,
          shaderLocation: 4,
        },
        { // color
          format: "float32x3",
          offset: 56,
          shaderLocation: 5,
        }
      ],
    };
  }

  static get instanceBufferLayout(): GPUVertexBufferLayout {
    return {
      stepMode: "instance",
      arrayStride: 128,
      attributes: [
        // Model matrix
        {
          // column #1
          format: "float32x4",
          offset: 0,
          shaderLocation: 6,
        },
        {
          // column #2
          format: "float32x4",
          offset: 16,
          shaderLocation: 7,
        },
        {
          // column #3
          format: "float32x4",
          offset: 32,
          shaderLocation: 8,
        },
        {
          // column #4
          format: "float32x4",
          offset: 48,
          shaderLocation: 9,
        },
        // Model inverse tranpose matrix
        {
          // column #1
          format: "float32x4",
          offset: 64,
          shaderLocation: 10,
        },
        {
          // column #2
          format: "float32x4",
          offset: 80,
          shaderLocation: 11,
        },
        {
          // column #3
          format: "float32x4",
          offset: 96,
          shaderLocation: 12,
        },
        {
          // column #4
          format: "float32x4",
          offset: 112,
          shaderLocation: 13,
        },
      ],
    }
  }
}

