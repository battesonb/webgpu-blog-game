import {Camera} from "../components/camera";
import {Follow} from "../components/follow";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";
import {Vec3} from "../math/vec3";

export function newCamera(): Entity {
  const transform = new Transform();
  const camera = new Camera();
  camera.yaw = toRadians(45);
  camera.pitch = toRadians(-45);
  return new Entity("camera")
    .withComponent(transform)
    .withComponent(new Follow("player", new Vec3(14, 20, 14)))
    .withComponent(camera);
}
