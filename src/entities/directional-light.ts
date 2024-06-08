import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";

export function newDirectionalLight(): Entity {
  const camera = new Camera();
  camera.yaw = toRadians(15);
  camera.pitch = toRadians(-35);
  return new Entity("directionalLight")
    .withComponentDefault(Transform)
    .withComponent(camera);
}
