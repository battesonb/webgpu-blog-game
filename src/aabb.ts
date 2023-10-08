import {Vec3} from "./math/vec3";

interface IntersectionResult {
  normal: Vec3,
  depth: number,
}

export class Aabb {
  center: Vec3;
  halfExtents: Vec3;

  constructor(center: Vec3, extents: Vec3) {
    this.center = center;
    this.halfExtents = extents.div(2);
  }

  get minX(): number {
    return this.center.x - this.halfExtents.x;
  }

  get maxX(): number {
    return this.center.x + this.halfExtents.x;
  }

  get minY(): number {
    return this.center.y - this.halfExtents.y;
  }

  get maxY(): number {
    return this.center.y + this.halfExtents.y;
  }

  get minZ(): number {
    return this.center.z - this.halfExtents.z;
  }

  get maxZ(): number {
    return this.center.z + this.halfExtents.z;
  }

  /**
   * Returns a vector of least penetration (most likely collision point).
   */
  intersection(other: Aabb): IntersectionResult {
    const axes = [
      [this.minX, this.maxX, other.minX, other.maxX, Vec3.unitX()],
      [this.minY, this.maxY, other.minY, other.maxY, Vec3.unitY()],
      [this.minZ, this.maxZ, other.minZ, other.maxZ, Vec3.unitZ()],
    ] as const;

    let normal = Vec3.zero();
    let depth = Number.MAX_VALUE;
    for (const [aMin, aMax, bMin, bMax, axisNormal] of axes) {
      if (aMax < bMin || bMax < aMin) {
        return { normal: Vec3.zero(), depth: 0 };
      }

      const axisDepth = Math.min(bMax - aMin, aMax - bMin);

      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axisNormal;
      }
    }

    const direction = other.center.sub(this.center);
    if (direction.dot(normal) < 0) {
      normal = normal.mul(-1);
    }

    return { normal, depth };
  }
}
