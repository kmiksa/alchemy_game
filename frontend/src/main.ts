import * as THREE from "three";
import { ApiError, client } from "./api/client";
import type { Customer } from "./api/client";
import { makeWsClient } from "./api/ws-client";
import { session } from "./state/session";
import { initScene } from "./scene/scene";
import { createCauldron } from "./scene/cauldron";
import { createShelf, type Jar } from "./scene/shelf";
import { createGrimoire } from "./scene/grimoire";
import { createDoor } from "./scene/door";
import { arcToCauldron } from "./scene/animations";
import { createCustomerDialog } from "./ui/customer-dialog";
import { createGrimoirePanel } from "./ui/grimoire-panel";
import { createBrewResult } from "./ui/brew-result";
import { createInventoryBar } from "./ui/inventory-bar";
import { showToast } from "./ui/toast";
import "./styles/main.css";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const scene = initScene(canvas);

const cauldron = createCauldron(scene.three);
const grimoireMesh = createGrimoire(scene.three);
const door = createDoor(scene.three);

const customerDialog = createCustomerDialog();
const grimoirePanel = createGrimoirePanel();
const brewResult = createBrewResult();
const inventoryBar = createInventoryBar();

let shelfJars: Jar[] = [];

const ingredientColors = new Map<string, string>();

void boot();

async function boot(): Promise<void> {
  try {
    const [inventory, recipes] = await Promise.all([
      client.getInventory(),
      client.getRecipes(),
    ]);
    const shelf = createShelf(scene.three, inventory);
    shelfJars = shelf.jars;
    grimoirePanel.setRecipes(recipes);

    inventory.forEach((i) => {
      const m = (
        shelfJars.find((j) => j.ingredient.slug === i.slug)?.mesh.children[0] as
          | THREE.Mesh
          | undefined
      )?.material as THREE.MeshStandardMaterial | undefined;
      if (m) ingredientColors.set(i.slug, "#" + m.color.getHexString());
    });

    enableJarPicking();
    wireOverlays();
    connectWs();
  } catch (err) {
    const msg = err instanceof ApiError ? err.detail : String(err);
    showToast(`Failed to start: ${msg}`, "error");
  }
}

function enableJarPicking(): void {
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    scene.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    scene.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    scene.raycaster.setFromCamera(scene.pointer, scene.camera);

    const bookHits = scene.raycaster.intersectObject(grimoireMesh.hitMesh, true);
    if (bookHits.length > 0) {
      grimoirePanel.toggle();
      return;
    }

    const jarMeshes = shelfJars.map((j) => j.mesh);
    const jarHits = scene.raycaster.intersectObjects(jarMeshes, true);
    if (jarHits.length > 0) {
      const jar = shelfJars.find(
        (j) =>
          jarHits[0].object === j.mesh.children[0] || jarHits[0].object.parent === j.mesh,
      );
      if (jar) addJarToCauldron(jar);
    }
  });
}

function addJarToCauldron(jar: Jar): void {
  const flying = jar.mesh.clone();
  scene.three.add(flying);
  arcToCauldron(
    flying,
    jar.basePosition.clone(),
    cauldron.liquidPosition.clone(),
    0.7,
    () => {
      scene.three.remove(flying);
      session.addIngredient(jar.ingredient.slug);
      cauldron.setLiquidColor(blendedCauldronColor());
    },
  );
}

function blendedCauldronColor(): string {
  const slugs = session.get().cauldronContents;
  if (slugs.length === 0) return "#2a3a3a";
  const c = new THREE.Color("#000");
  let n = 0;
  for (const s of slugs) {
    const hex = ingredientColors.get(s);
    if (hex) {
      c.add(new THREE.Color(hex));
      n += 1;
    }
  }
  if (n === 0) return "#2a3a3a";
  c.multiplyScalar(1 / n);
  return "#" + c.getHexString();
}

function wireOverlays(): void {
  inventoryBar.onBrew(async () => {
    const slugs = session.get().cauldronContents;
    if (slugs.length === 0) return;
    try {
      const r = await client.brew(slugs);
      brewResult.showBrew(r);
    } catch (err) {
      showToast(errorText(err), "error");
    }
  });

  inventoryBar.onClear(() => {
    session.clearCauldron();
    cauldron.resetColor();
  });

  inventoryBar.onGrimoire(() => {
    grimoirePanel.toggle();
  });

  customerDialog.onServe(async () => {
    const c = session.get().currentCustomer;
    if (!c) return;
    const slugs = session.get().cauldronContents;
    if (slugs.length === 0) {
      showToast("Add ingredients before serving");
      return;
    }
    try {
      const r = await client.serve(c.id, slugs);
      brewResult.showServe(r);
      session.setReputation(r.new_reputation);
      session.setCurrentCustomer(null);
      session.clearCauldron();
      cauldron.resetColor();
      customerDialog.hide();
      door.hideSilhouette();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        showToast("That customer has left the shop");
        session.setCurrentCustomer(null);
        customerDialog.hide();
        door.hideSilhouette();
      } else {
        showToast(errorText(err), "error");
      }
    }
  });
}

function connectWs(): void {
  const ws = makeWsClient();
  ws.onStatus((connected) => {
    if (!connected) showToast("Live updates paused — game still works");
  });
  ws.on((event) => {
    if (event.type === "customer.arrived") {
      const c: Customer = {
        id: event.id,
        name: event.name,
        persona: event.persona,
        ailment_narrative: event.ailment_narrative,
        ailment_category: event.ailment_category,
        expected_recipe_slug: "",
      };
      if (!session.get().currentCustomer) {
        session.setCurrentCustomer(c);
        customerDialog.show(c);
        door.showSilhouette();
      }
    }
  });
  ws.connect();
}

function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.detail || `HTTP ${err.status}`;
  return err instanceof Error ? err.message : String(err);
}
