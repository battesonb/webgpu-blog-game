import "./style.css";
import {PerspectiveProjection} from "./resources/perspective-projection";
import {toRadians} from "./math/helpers";
import {SCREEN_HEIGHT, SCREEN_WIDTH, SHADOW_DEPTH_TEXTURE_SIZE} from "./config";
import {Renderer} from "./resources/renderer";
import {World} from "./ec/world";
import {newCamera} from "./entities/camera";
import {newPlayer} from "./entities/player";
import {newTerrain} from "./entities/terrain";
import {Input} from "./resources/input";
import {newSpawner} from "./entities/spawner";
import {newDirectionalLight} from "./entities/directional-light";
import {Textures} from "./resources/textures";
import {ShadowPipeline} from "./pipelines/shadow-pipeline";
import {BasicPipeline} from "./pipelines/basic-pipeline";
import {Meshes} from "./resources/meshes";

async function initialize() {
  const world = new World();
  const renderer = await new Promise<Renderer>(resolve => {
    return new Renderer(resolve);
  });
  world.addResource(renderer);

  const textures = new Textures();
  await Promise.all([
    textures.loadTexture(renderer.device, "tileset", {
      baseMipLevel: 0,
      mipLevelCount: 1,
    }),
    textures.loadTexture(renderer.device, "tileset_normal", {
      baseMipLevel: 0,
      mipLevelCount: 1,
    }),
    textures.loadTexture(renderer.device, "tileset_gloss", {
      baseMipLevel: 0,
      mipLevelCount: 1,
    }),
    textures.createDepthTexture(renderer.device, "depth", SCREEN_WIDTH, SCREEN_HEIGHT),
    textures.createDepthTexture(renderer.device, "shadow_depth", SHADOW_DEPTH_TEXTURE_SIZE, SHADOW_DEPTH_TEXTURE_SIZE),
  ]);
  world.addResource(textures);

  renderer.pipelines.push(
    new ShadowPipeline(world),
    new BasicPipeline(world),
  );

  const projection = new PerspectiveProjection(SCREEN_WIDTH, SCREEN_HEIGHT, toRadians(35), 0.1, 225);
  const input = new Input(renderer.canvas);

  world
    .withResourceDefault(Meshes)
    .withResource(projection)
    .withResource(input);

  world.addEntities(
    newCamera(),
    newDirectionalLight(),
    ...newPlayer(world),
    newTerrain(world),
    newSpawner(),
  );

  let pause = false;
  function update(now: number) {
    const dt = (now - lastTime) / 1000;
    if (input.keyReleased("p")) {
      pause = !pause;
    }
    world.update({
      now,
      dt: pause ? 0 : dt,
      world,
    });
  }

  let lastTime = performance.now();
  function eventLoop() {
    const now = performance.now();

    update(now)

    lastTime = now;

    requestAnimationFrame(eventLoop);
  }

  // Kick things off
  requestAnimationFrame(eventLoop);

}

initialize();

export {};
