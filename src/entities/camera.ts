import {Camera} from "../components/camera";
import {Follow} from "../components/follow";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";

export function newCamera(): Entity {
  const transform = new Transform();
  transform.position.y = 20;
  const camera = new Camera();
  camera.yaw = toRadians(45);
  camera.pitch = toRadians(-45);
  return new Entity("camera")
    .withComponent(transform)
    .withComponent(new Follow("player", 14))
    .withComponent(camera);
}
