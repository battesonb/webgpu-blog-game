import {Camera} from "../components/camera";
import {DirectionalLight} from "../components/directional-light";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {toRadians} from "../math/helpers";

export function newDirectionalLight(): Entity {
  const camera = new Camera();
  camera.yaw = toRadians(-15);
  camera.pitch = toRadians(-50);
  return new Entity("directionalLight")
    .withComponentDefault(Transform)
    .withComponentDefault(DirectionalLight)
    .withComponent(camera);
}
