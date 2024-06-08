import {Camera} from "../components/camera";
import {Follow} from "../components/follow";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";
import {Vec3} from "../math/vec3";
import {OrthographicProjection} from "../resources/orthographic-projection";

export function newDirectionalLight(): Entity {
  const transform = new Transform();
  const camera = new Camera();
  camera.yaw = toRadians(15);
  camera.pitch = toRadians(-35);
  return new Entity("directionalLight")
    .withComponent(new OrthographicProjection(-20, 20, -20, 20, 0.1, 500))
    .withComponent(transform)
    .withComponent(new Follow("camera", new Vec3(-10, 0, 20)))
    .withComponent(camera);
}
