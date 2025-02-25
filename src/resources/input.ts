import {Terrain} from "../components/terrain";
import {Transform} from "../components/transform";
import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";
import {Vec2} from "../math/vec2";
import {Vec3} from "../math/vec3";
import {Vec4} from "../math/vec4";
import {Renderer} from "./renderer";

export class Input extends Resource {
  private keysPressed: Set<string> = new Set();
  private keysReleased: Set<string> = new Set();
  private readonly canvas: HTMLCanvasElement;
  private _mouseDown: boolean;
  /**
   * The normalized mouse position (x and y in range [-1,1]).
   */
  private _mousePosition: Vec2;
  /**
   * The mouse position in world-space, at the near clipping plane.
   */
  private _mouseWorldPosition: Vec3;
  /**
   * The position of the mouse in world coordinates, as it interacts with the
   * terrain.
   */
  private _mouseWorldPickedPosition: Vec3;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
    this._mouseDown = false;
    this._mousePosition = Vec2.zero();
    this._mouseWorldPosition = Vec3.zero();
    this._mouseWorldPickedPosition = Vec3.zero();

    this.keydownEvent = this.keydownEvent.bind(this);
    this.keyupEvent = this.keyupEvent.bind(this);
    this.mousedownEvent = this.mousedownEvent.bind(this);
    this.mouseupEvent = this.mouseupEvent.bind(this);
    this.mousemoveEvent = this.mousemoveEvent.bind(this);
    window.addEventListener("keydown", this.keydownEvent);
    window.addEventListener("keyup", this.keyupEvent);
    canvas.addEventListener("mousedown", this.mousedownEvent);
    canvas.addEventListener("mouseup", this.mouseupEvent);
    canvas.addEventListener("mousemove", this.mousemoveEvent);
  }

  keyDown(key: string): boolean {
    return this.keysPressed.has(key);
  }

  keyReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }

  get mouseDown() {
    return this._mouseDown;
  }

  get mousePosition() {
    return this._mousePosition;
  }

  get mouseWorldPosition() {
    return this._mouseWorldPosition;
  }

  get mouseWorldPickedPosition() {
    return this._mouseWorldPickedPosition;
  }

  preUpdate(ctx: UpdateContext): void {
    const {world} = ctx;
    const renderer = world.getResource(Renderer);
    const viewProjInv = renderer?.viewProjInv!;
    const mousePosition = new Vec4(this.mousePosition.x, this.mousePosition.y, 0, 1);
    const mouseWorldPosition = viewProjInv.mul(mousePosition);

    this._mouseWorldPosition = mouseWorldPosition.xyz.div(mouseWorldPosition.w);

    const cameraPosition = world.getByName("camera")!.getComponent(Transform)!.position;
    const direction = this._mouseWorldPosition.sub(cameraPosition).normal();
    let mousePositionOnGround = this._mouseWorldPosition;
    const terrain = world.getByName("terrain")!.getComponent(Terrain)!;
    let i = 0;
    for (i = 0; i < 100; i++) {
      if (terrain.getBlock(mousePositionOnGround)) {
        break;
      }
      mousePositionOnGround = mousePositionOnGround.add(direction);
    }

    this._mouseWorldPickedPosition = mousePositionOnGround;
  }

  postUpdate(_ctx: UpdateContext): void {
    this.keysReleased.clear();
    this._mouseDown = false;
  }

  destroy() {
    window.removeEventListener("keydown", this.keydownEvent);
    window.removeEventListener("keyup", this.keyupEvent);
    this.canvas.removeEventListener("mousemove", this.mousemoveEvent);
    this.canvas.removeEventListener("mousedown", this.mousedownEvent);
    this.canvas.removeEventListener("mouseup", this.mouseupEvent);
  }

  private keydownEvent(e: KeyboardEvent) {
    this.keysPressed.add(e.key);
  }

  private keyupEvent(e: KeyboardEvent) {
    this.keysPressed.delete(e.key);
    this.keysReleased.add(e.key);
  }

  private mousedownEvent(e: MouseEvent) {
    this._mouseDown = e.button == 0;
  }

  private mouseupEvent(e: MouseEvent) {
    if (e.button == 0) {
      this._mouseDown = false;
    }
  }

  private mousemoveEvent(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xRatio = x / rect.width;
    const yRatio = y / rect.height;
    this._mousePosition.x = (xRatio * 2 - 1);
    this._mousePosition.y = -(yRatio * 2 - 1);
  }
}
