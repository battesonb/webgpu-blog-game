import {Camera} from "../components/camera";
import {DirectionalLight} from "../components/directional-light";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";

export function newDirectionalLight(): Entity {
  const camera = new Camera();
  return new Entity("directionalLight")
    .withComponentDefault(Transform)
    .withComponentDefault(DirectionalLight)
    .withComponent(camera);
}
