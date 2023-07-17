import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";

export function newCamera(): Entity {
  const transform = new Transform();
  transform.position.y = 5;
  transform.position.z = 3;
  transform.position.x = 3;
  const camera = new Camera();
  camera.yaw = toRadians(45);
  camera.pitch = toRadians(-45);
  return new Entity("camera")
    .withComponent(Transform, transform)
    .withComponent(Camera, camera);
}
