import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import { createShelf } from "./scene/shelf";
import { createGrimoire } from "./scene/grimoire";
import { client } from "./api/client";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);
createCauldron(scene.three);
createGrimoire(scene.three);

client.getInventory().then((inv) => {
  createShelf(scene.three, inv);
});
