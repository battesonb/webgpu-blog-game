export class Vec2 {
  /**
   * Internal layout of the vector data.
   */
  rep: [number, number];

  constructor(x: number, y: number) {
    this.rep = [x, y];
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  get x(): number {
    return this.rep[0];
  }

  get y(): number {
    return this.rep[1];
  }

  set x(value: number) {
    this.rep[0] = value;
  }

  set y(value: number) {
    this.rep[1] = value;
  }

  sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  div(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  normal(): Vec2 {
    return this.div(this.magnitude());
  }

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }
}
