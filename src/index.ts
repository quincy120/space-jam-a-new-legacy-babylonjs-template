import {
  Scene,
  HemisphericLight,
  Vector3,
  Engine,
  ArcRotateCamera,
  CannonJSPlugin,
  MeshBuilder,
  StandardMaterial,
  PhotoDome,
  PhysicsImpostor
} from "babylonjs";
import * as cannon from "cannon";
import { WoodProceduralTexture } from "babylonjs-procedural-textures";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Load the 3D engine
var engine: Engine = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
};

// Function to create a scene with camera, lights, an environment, and a Mixed Reality experience
var createScene = async function () {
  // Create the scene and the camera
  var scene = new Scene(engine);
  var camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, -2, 3), scene);
  camera.wheelDeltaPercentage = 0.01;
  camera.attachControl(canvas, true);

  // Create a basic hemispheric light source and add it to the scene
  var light = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );

  // Reduce the light intensity to 70%
  light.intensity = 0.7;

  // Create the physics engine
  var cannonPlugin = new CannonJSPlugin(true, 10, cannon);

  //enable physics and set gravity force.
  scene.enablePhysics(new Vector3(0, -3, 0), cannonPlugin);

  // Create the default environment
  const env = scene.createDefaultEnvironment();

  // Create a floor in the scene and position it to the center
  var gymFloor = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
  gymFloor.position = new Vector3(0, -3.5, 0);

  // Create wood materials and texture in the scene
  var woodMaterial = new StandardMaterial("woodMaterial", scene);
  var woodTexture = new WoodProceduralTexture("text", 1024, scene);

  // Adjust the texture to look more realistic 
  woodTexture.ampScale = 80.0;

  // Apply the texture to the material
  woodMaterial.diffuseTexture = woodTexture;

  // Apply the material to the gym floor mesh object
  gymFloor.material = woodMaterial;

  // Add physics that simulates the ground
  gymFloor.physicsImpostor = new PhysicsImpostor(gymFloor, PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 1 }, scene);

  // Create PhotoDome with a .png image and add it to the scene
  var dome = new PhotoDome(
    "mydome",
    "src/assets/Looney-Court.png",
    {
        resolution: 32,
        size: 100
    },
    scene
  );

  // Create the default XR experience
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [gymFloor],
  });

  // Return the completed scene with camera, lights, an environment, and a Mixed Reality experience
  return scene;
};

// Create a default engine to load the scene
try {
  engine = createDefaultEngine();
} catch (e) {
  console.log(
    "the available createEngine function failed. Creating the default engine instead"
  );
  engine = createDefaultEngine();
}
if (!engine) throw "engine should not be null.";

// Create the scene
createScene().then((returnedScene) => {
  sceneToRender = returnedScene;
});

// Render the scene by using the engine
engine.runRenderLoop(function () {
  if (sceneToRender) {
    sceneToRender.render();
  }
});

// Resize the engine to fit the scene
window.addEventListener("resize", function () {
  engine.resize();
});