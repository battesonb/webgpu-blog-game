import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";

export class Input extends Resource {
  keysPressed: Set<string> = new Set();
  keysReleased: Set<string> = new Set();

  constructor() {
    super();
    this.keydownEvent = this.keydownEvent.bind(this);
    this.keyupEvent = this.keyupEvent.bind(this);
    window.addEventListener("keydown", this.keydownEvent);
    window.addEventListener("keyup", this.keyupEvent);
  }

  keyDown(key: string): boolean {
    return this.keysPressed.has(key);
  }

  keyReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }
  
  postUpdate(_ctx: UpdateContext): void {
    this.keysReleased.clear();
  }

  destroy() {
    window.removeEventListener("keydown", this.keydownEvent);
    window.removeEventListener("keyup", this.keyupEvent);
  }

  private keydownEvent(e: KeyboardEvent) {
    this.keysPressed.add(e.key);
  }

  private keyupEvent(e: KeyboardEvent) {
      this.keysPressed.delete(e.key);
      this.keysReleased.add(e.key);
  }
}
