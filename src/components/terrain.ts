import {Component, InitContext} from "../ec/component";
import {Vec3} from "../math/vec3";
import {GpuResources} from "../resources/gpu-resources";
import {uvFromIndex} from "../texture";
import {Vertex} from "../vertex";
import {Mesh} from "./mesh";

export enum Block {
  Air = 0,
  Grass = 1,
  Dirt = 2,
}

const cardinalDirections = [
  new Vec3(1, 0, 0),
  new Vec3(0, 1, 0),
  new Vec3(0, 0, 1),
  new Vec3(-1, 0, 0),
  new Vec3(0, -1, 0),
  new Vec3(0, 0, -1),
];

function cubePlane(texture: GPUTexture, topIndex: number, sideIndex: number, direction: Vec3) {
  if (direction.x == 1) {
    return [
      new Vertex(new Vec3(0.5, -0.5, 0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, -0.5, -0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, 0.5, -0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
      new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),
    ];
  // skipping x == -1 (we can't see it)
  } else if (direction.z == 1) {
    return [
      new Vertex(new Vec3(-0.5, -0.5, 0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, -0.5, 0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
      new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),
    ];
  // skipping z == -1 (we can't see it)
  } else if (direction.y == 1) {
    return [
      new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(topIndex, 0.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(topIndex, 1.0, 1.0, texture)),
      new Vertex(new Vec3(0.5, 0.5, -0.5), uvFromIndex(topIndex, 1.0, 0.0, texture)),
      new Vertex(new Vec3(-0.5, 0.5, -0.5), uvFromIndex(topIndex, 0.0, 0.0, texture)),
    ];
  }
  return [];
}

export class Terrain extends Component {
  private _blocks: Block[];
  private _mesh?: Mesh;
  private _texture?: GPUTexture;

  static SIZE_X = 40;
  static SIZE_Y = 8;
  static SIZE_Z = 40;

  constructor() {
    super();
    this._blocks = Array.from({length: Terrain.SIZE_X * Terrain.SIZE_Y * Terrain.SIZE_Z}).map((_, index) => {
      const c = Terrain.coordinates(index);
      if (c.y == 0) {
        return Block.Dirt;
      }
      if (c.y > 2 * (-Math.cos(c.x * 0.15) + Math.sin(c.z * 0.25 + 0.5))) {
        return Block.Air;
      }
      return Block.Dirt;
    });
  }

  init(ctx: InitContext): void {
    const {world} = ctx;
    this._mesh = this.getComponent(Mesh)!;
    this._texture = world.getResource(GpuResources)!.texture;
    this._mesh.vertices = this.generateVertices(this._texture);
  }

  private generateVertices(texture: GPUTexture): Vertex[] {
    return Array.from({length: Terrain.SIZE_X * Terrain.SIZE_Y * Terrain.SIZE_Z}).map((_, index) => {
      if (this._blocks[index] == Block.Air) {
        return [];
      }
      const c = Terrain.coordinates(index);
      return cardinalDirections.map(d => {
        if (this.hasNeighbor(c, d)) {
          return [];
        }
        return cubePlane(texture, 2, 3, d).map(a => {
          const b = a.clone();
          b.position.x += c.x;
          b.position.y += c.y;
          b.position.z += c.z;
          if (d.y == 1) {
            let darken = (c.x + c.z) % 2 == 0;
            if (darken) {
              b.color = b.color.mul(0.95);
            }
          }
          return b;
        });
      }).flat();
    }).flat();
  }

  setBlock(coord: Vec3, block: Block) {
    const index = Terrain.index(coord.x, coord.y, coord.z);
    if (index !== undefined) {
      if (this._blocks[index] !== block) {
        this._blocks[index] = block;
      }
    }
  }

  getBlock(coord: Vec3): Block | undefined {
    const index = Terrain.index(coord.x, coord.y, coord.z);
    if (index !== undefined) {
      return this._blocks[index];
    }
  }

  hasNeighbor(coord: Vec3, offset: Vec3): boolean {
    const block = this.getBlock(coord.add(offset));
    if (block !== undefined && block !== Block.Air) {
      return true;
    }
    return false;
  }

  static coordinates(index: number): Vec3 {
    return new Vec3(
      index % Terrain.SIZE_X,
      Math.floor(index / Terrain.SIZE_X) % Terrain.SIZE_Y,
      Math.floor(Math.floor(index / Terrain.SIZE_X) / Terrain.SIZE_Y),
    );
  }

  static index(x: number, y: number, z: number): number | undefined {
    if (x < 0 || y < 0 || z < 0 || x >= Terrain.SIZE_X || y >= Terrain.SIZE_Y || z >= Terrain.SIZE_Z) {
      return undefined;
    }
    return x + (Terrain.SIZE_X * (y + Terrain.SIZE_Y * z));
  }
}
