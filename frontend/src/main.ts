import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);
createCauldron(scene.three);
