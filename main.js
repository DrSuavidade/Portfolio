import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(20, 30, 0); // Starting point
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Fix the canvas to avoid scrolling it
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1"; // Send it behind other content

const BLOOM_SCENE = 1; // Define a bloom layer
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

// Bloom parameters
const bloomParams = {
  exposure: 4,
  bloomStrength: 0.7,
  bloomThreshold: 0.8,
  bloomRadius: 0.5,
};

// Configure the renderer and composer
renderer.toneMappingExposure = bloomParams.exposure;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomParams.bloomStrength,
  bloomParams.bloomRadius,
  bloomParams.bloomThreshold
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const hoverModels = [];

// Array to track hover states for each model
const hoverStates = [];

// Array to store all children of the models for raycasting
const raycastTargets = [];

// Raycaster and mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Rocket cursor setup
const rocketCursor = document.getElementById("rocket-cursor");
document.body.style.cursor = "none"; // Hide the default cursor

// Previous mouse position to calculate direction
let prevMousePosition = { x: 0, y: 0 };

// Function to handle mouse movement
function onMouseMove(event) {
  // Convert mouse coordinates to normalized device coordinates (NDC)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update rocket cursor position and rotation
  if (rocketCursor) {
    rocketCursor.style.left = `${event.clientX}px`;
    rocketCursor.style.top = `${event.clientY}px`;

    // Calculate the angle of movement
    const deltaX = event.clientX - prevMousePosition.x;
    const deltaY = event.clientY - prevMousePosition.y;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90; // Adjust by 90° to align with the rocket's "up"

    // Apply rotation and keep scale/hover effects
    rocketCursor.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${hovered ? 1.2 : 1})`;

    // Update previous mouse position
    prevMousePosition.x = event.clientX;
    prevMousePosition.y = event.clientY;
  }
}

// Track hover state for clickable objects
let hovered = false;

// Update the raycaster for hover effect
function updateCursorHover() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([...clickableBeans, ...clickableImages], true);
  handleRocketHover(intersects);
}

// Handle hover effects for the rocket cursor
function handleRocketHover(intersects) {
  hovered = intersects.length > 0; // Update hover state
}

// Event listener for mouse movement
window.addEventListener("mousemove", onMouseMove);

import LegendaryCursor from "legendary-cursor"; // Only needed if using npm or modules

window.addEventListener("load", () => {
  LegendaryCursor.init({
    lineSize: 0.05,           // Adjust the thickness of the trailing line
    opacityDecrement: 0.9,   // How quickly the line fades (higher = faster fade)
    speedExpFactor: 0.8,     // Adjusts the speed factor of the trail
    lineExpFactor: 0.9,      // Adjusts how smooth the trail appears
    sparklesCount: 5,        // Set to 0 to remove sparkles
    maxOpacity: 0.7,         // Maximum opacity of the line
    // Uncomment the lines below and replace with valid texture URLs for customization (optional)
    // texture1: "path_to_texture1.png",  // Texture for hover (optional)
    // texture2: "path_to_texture2.png",  // Texture for click (optional)
    // texture3: "path_to_texture3.png",  // Texture for sparkles (optional)
  });
});




const originalPositions = [];

// GLTF Loader setup
const loader = new GLTFLoader();

// Function to load a model and add it to hoverModels
function loadModel(path, position, scale, rotation) {
  loader.load(
    path,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(position.x, position.y, position.z);
      originalPositions.push(model.position.clone());
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      scene.add(model);

      hoverModels.push(model); // Add to hover tracking
      hoverStates.push(false); // Initialize hover state

      // Add all child meshes to raycasting targets
      model.traverse((child) => {
        if (child.isMesh) {
          raycastTargets.push(child);
        }
      });
    },
    undefined,
    (error) => {
      console.error(`Error loading model from ${path}:`, error);
    }
  );
}

// Load the models
loadModel(
  "/model/Gengar.glb",
  { x: -70, y: -45, z: -160 },
  { x: 1, y: 1, z: 1 },
  { x: 0, y: Math.PI / 2, z: 0 }
);
loadModel(
  "/model/Charizard.glb",
  { x: -80, y: -45, z: -130 },
  { x: 8, y: 8, z: 8 },
  { x: 0, y: Math.PI / 2, z: 0 }
);
loadModel(
  "/model/Mario.glb",
  { x: -60, y: -45, z: -220 },
  { x: 6, y: 6, z: 6 },
  { x: 0, y: Math.PI / 4, z: 0 }
);
loadModel(
  "/model/Ditto.glb",
  { x: -60, y: -45, z: -175 },
  { x: 7, y: 7, z: 7 },
  { x: 0, y: Math.PI / 16, z: 0 }
);
loadModel(
  "/model/Magnemite.glb",
  { x: -80, y: -15, z: -200 },
  { x: 7, y: 7, z: 7 },
  { x: 0, y: Math.PI / -4, z: 0 }
);
loadModel(
  "/model/Magneton.glb",
  { x: -70, y: 5, z: -230 },
  { x: 7, y: 7, z: 7 },
  { x: 0, y: Math.PI / -6, z: 0 }
);

// Load the third model (Portfolio)
let model4;
loader.load(
  "/model/Portfolio.glb",
  (gltf) => {
    model4 = gltf.scene;
    model4.position.set(18, -3, 180); // Position the third model
    model4.scale.set(5, 5, 5); // Adjust scale
    model4.rotation.y = Math.PI / 1.5;
    // Enable bloom layer
    model4.traverse((child) => {
      if (child.isMesh) {
        child.layers.enable(BLOOM_SCENE);
      }
    });
    scene.add(model4);
  },
  undefined,
  (error) => {
    console.error("Error loading Portfolio:", error);
  }
);

// Load the fourth model (Pedro)
let model6;
loader.load(
  "/model/Pedro.glb",
  (gltf) => {
    model6 = gltf.scene;
    model6.position.set(20, -8, 177); // Position the fourth model
    model6.scale.set(5, 5, 5); // Adjust scale
    model6.rotation.y = Math.PI / 1.5;
    scene.add(model6);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

// Load the fourth model (Pedro)
let model1;
loader.load(
  "/model/Dev.glb",
  (gltf) => {
    model1 = gltf.scene;
    model1.position.set(20, -5, 177); // Position the fourth model
    model1.scale.set(5, 5, 5); // Adjust scale
    model1.rotation.y = Math.PI / 1.5;
    scene.add(model1);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

const movingModels = []; // Store Monitor, Tablet, and Phone models
const originalModelPositions = []; // Store original positions of these models
const originalModelScales = []; // Array to store the original scales


let model7;
loader.load(
  "/model/Monitor.glb",
  (gltf) => {
    model7 = gltf.scene;
    model7.position.set(-100, -10, 30); // Position the fourth model
    model7.scale.set(12, 12, 12); // Adjust scale
    model7.rotation.y = Math.PI / 2;
    movingModels.push(model7); // Add to movingModels
    originalModelPositions.push(model7.position.clone());
    originalModelScales.push(model7.scale.clone());
    scene.add(model7);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model8;
loader.load(
  "/model/Tablet.glb",
  (gltf) => {
    model8 = gltf.scene;
    model8.position.set(-90, -10, 10); // Position the fourth model
    model8.scale.set(0.8, 0.8, 0.8); // Adjust scale
    model8.rotation.z = Math.PI / -2;
    model8.rotation.x = Math.PI;
    model8.rotation.y = Math.PI / 4;
    movingModels.push(model8); // Add to movingModels
    originalModelPositions.push(model8.position.clone());
    originalModelScales.push(model8.scale.clone());
    scene.add(model8);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model9;
loader.load(
  "/model/Phone.glb",
  (gltf) => {
    model9 = gltf.scene;
    model9.position.set(-90, -20, 30); // Position the fourth model
    model9.scale.set(7, 7, 7); // Adjust scale
    model9.rotation.y = Math.PI / 2;
    movingModels.push(model9); // Add to movingModels
    originalModelPositions.push(model9.position.clone());
    originalModelScales.push(model9.scale.clone());
    scene.add(model9);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model13;
loader.load(
  "/model/Unity.glb",
  (gltf) => {
    model13 = gltf.scene;
    model13.position.set(130, -30, -260); // Position the fourth model
    model13.scale.set(7, 7, 7); // Adjust scale

    scene.add(model13);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model14;
loader.load(
  "/model/Controller.glb",
  (gltf) => {
    model14 = gltf.scene;
    model14.position.set(180, -10, -240); // Position the fourth model
    model14.scale.set(1, 1, 1); // Adjust scale
    model14.rotation.x = Math.PI / 2;

    scene.add(model14);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model15;
loader.load(
  "/model/Pmodel.glb",
  (gltf) => {
    model15 = gltf.scene;
    model15.position.set(64, -20, 180); // Position the fourth model
    model15.scale.set(-1, 1, 1); // Adjust scale
    model15.rotation.y = Math.PI;
    

    scene.add(model15);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model19;
loader.load(
  "/model/Spaceship.glb",
  (gltf) => {
    model19 = gltf.scene;
    model19.position.set(56, -20, 173); // Position the fourth model
    model19.scale.set(5, 5, 5); // Adjust scale
    model19.rotation.y = Math.PI;

    scene.add(model19);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

const additionalMovingModels = []; // New set of moving models
const additionalOriginalModelPositions = []; // Store their original positions
const additionalOriginalModelScales = []; // Store their original scales


let model16;
loader.load(
  "/model/Robot.glb",
  (gltf) => {
    model16 = gltf.scene;
    model16.position.set(330, -20, -20); // Position the fourth model
    model16.scale.set(18, 18, 18); // Adjust scale
    model16.rotation.y = Math.PI / -1.3;
    additionalMovingModels.push(model16);
    additionalOriginalModelPositions.push(model16.position.clone());
    additionalOriginalModelScales.push(model16.scale.clone());
    scene.add(model16);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model17;
loader.load(
  "/model/Cpu.glb",
  (gltf) => {
    model17 = gltf.scene;
    model17.position.set(350, 10, -30); // Position the fourth model
    model17.scale.set(5, 5, 5); // Adjust scale
    model17.rotation.z = Math.PI / 3;
    additionalMovingModels.push(model17);
    additionalOriginalModelPositions.push(model17.position.clone());
    additionalOriginalModelScales.push(model17.scale.clone());
    scene.add(model17);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

let model18;
loader.load(
  "/model/Chat.glb",
  (gltf) => {
    model18 = gltf.scene;
    model18.position.set(360, -20, -30); // Position the fourth model
    model18.scale.set(1, 1, 1); // Adjust scale
    model18.rotation.x = Math.PI / 2;
    model18.rotation.z = Math.PI / 1.5;
    additionalMovingModels.push(model18);
    additionalOriginalModelPositions.push(model18.position.clone());
    additionalOriginalModelScales.push(model18.scale.clone());
    scene.add(model18);
  },
  undefined,
  (error) => {
    console.error("Error loading Pedro:", error);
  }
);

// Load the fifth model (Repeated Instances with Variations)
let model5;
const numInstances = 12; // Number of instances to create
const instances = []; // Store all instances for reference
const clickableBeans = [];
const beanOriginalPositions = [];
const beanTargetPosition = new THREE.Vector3(0, -100, -200);

loader.load(
  "/model/Bean.glb", // Path to the fifth model
  (gltf) => {
    model5 = gltf.scene;

    for (let i = 0; i < numInstances; i++) {
      const instance = model5.clone(); // Clone the model

      // Generate a random position within the specified range
      const distance = Math.random() * 10 + 10; // Random distance between 10 and 20
      const angle = Math.random() * Math.PI * 2; // Random angle in radians

      const x = 30 + distance * Math.cos(angle); // X position
      const z = 130 + distance * Math.sin(angle) + (Math.random() * 20 - 10); // Z position with more variation
      const y = Math.random() * 20 - 5; // Y position between -5 and 5 for vertical variation

      instance.position.set(x, y, z); // Set random position

      // Apply random rotation
      instance.rotation.set(
        Math.random() * Math.PI * 2, // Random rotation around X-axis
        Math.random() * Math.PI * 2, // Random rotation around Y-axis
        Math.random() * Math.PI * 2 // Random rotation around Z-axis
      );

      // Assign random color to the material
      instance.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(Math.random(), Math.random(), Math.random()), // Random RGB color
          });
        }
      });

      instance.scale.set(1.6, 1.6, 1.6); // Adjust scale for all instances

      instances.push(instance); // Store the instance for reference
      beanOriginalPositions.push(new THREE.Vector3(x, y, z));
      clickableBeans.push(instance); // Add to clickable list for raycasting
      scene.add(instance); // Add to the scene
    }
  },
  undefined,
  (error) => {
    console.error("Error loading FifthModel:", error);
  }
);

function animateBeans(scrollProgress) {
  const movementStart = 0.0; // Movement starts at the beginning
  const movementEnd = 0.8;  // Movement ends at 80%
  const resetStart = 0.9;   // Reset starts at 90%
  const resetEnd = 1.0;     // Reset ends at 100%

  const totalMovementDuration = movementEnd - movementStart;
  const totalResetDuration = resetEnd - resetStart;

  instances.forEach((bean, index) => {
    if (scrollProgress >= movementStart && scrollProgress <= movementEnd) {
      // Interpolate position during movement phase
      const t = (scrollProgress - movementStart) / totalMovementDuration;
      bean.position.lerpVectors(
        beanOriginalPositions[index],
        beanTargetPosition,
        t
      );
    } else if (scrollProgress >= resetStart && scrollProgress <= resetEnd) {
      // Interpolate position back to original during reset phase
      const t = (scrollProgress - resetStart) / totalResetDuration;
      bean.position.lerpVectors(beanTargetPosition, beanOriginalPositions[index], t);
    } else if (scrollProgress < movementStart) {
      // Keep beans in original position before movement
      bean.position.copy(beanOriginalPositions[index]);
    } else if (scrollProgress > resetEnd) {
      // Keep beans in original position after reset
      bean.position.copy(beanOriginalPositions[index]);
    }
  });
}



// Array of image paths, positions, sizes, and rotations
const images = [
  {
    path: "/images/Screen3.png",
    position: { x: 150, y: 0, z: -270 },
    size: { width: 50, height: 30 },
    rotation: { x: 0, y: Math.PI / 4, z: 0 },
    link: "http://193.137.7.33/~aluno26240/ficha/10/", // Add link property
  },
  {
    path: "/images/Screen2.png",
    position: { x: 180, y: -25, z: -250 },
    size: { width: 40, height: 25 },
    rotation: { x: 0, y: Math.PI / 12, z: 0 },
    link: "http://193.137.7.33/~aluno26240/tarefa/grupo/2/",
  },
  {
    path: "/images/Screen1.png",
    position: { x: 190, y: 5, z: -260 },
    size: { width: 30, height: 20 },
    rotation: { x: 0, y: Math.PI / -6, z: 0 },
    link: "http://193.137.7.33/~aluno26240/ficha/9/",
  },
  {
    path: "/images/Verde.png",
    position: { x:300, y:-20, z:130 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "http://193.137.7.33/~aluno26240/VerDeCor/index-color.html",
  },
  {
    path: "/images/Viseu.png",
    position: { x:295, y:-20, z:170 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "http://193.137.7.33/~aluno26240/ViseuScout/index-color.html",
  },
  {
    path: "/images/ese.png",
    position: { x:290, y:-20, z:210 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "https://www.instagram.com/docese_se?igsh=MWx3cnllMmVmcmVnNA==",
  },
  {
    path: "/images/Unity.jpg",
    position: { x:285, y:-20, z:250 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "http://193.137.7.33/~aluno26240/tarefa/individual/2/",
  },
  {
    path: "/images/Blender.png",
    position: { x:280, y:-20, z:290 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "http://193.137.7.33/~aluno26240/Blendeer/index-color.html",
  },
  {
    path: "/images/Ecos.png",
    position: { x:275, y:-20, z:330 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "http://193.137.7.33/~aluno26240/Ecos/index-color.html",
  },
  {
    path: "/images/Ware.png",
    position: { x:270, y:-20, z:370 },
    size: { width: 20, height: 40 },
    rotation: { x: 0, y: Math.PI / -1.8, z: 0 }, // 90° rotation around Z-axis
    link: "https://frontend-o9wj.onrender.com",
  },
  // Add more images here
];

const clickableImages = []; // Store clickable image meshes
const hoverStatesImages = []; // Track hover states for images
const originalScales = []; // Store original scales for images

// Function to load and add multiple images
function addImages(imageArray) {
  const textureLoader = new THREE.TextureLoader();

  imageArray.forEach((imageData) => {
    textureLoader.load(
      imageData.path,
      (texture) => {
        const planeGeometry = new THREE.PlaneGeometry(
          imageData.size.width,
          imageData.size.height
        );
        const planeMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // Set position
        plane.position.set(
          imageData.position.x,
          imageData.position.y,
          imageData.position.z
        );

        // Set rotation
        plane.rotation.set(
          imageData.rotation.x || 0, // Default to 0 if not provided
          imageData.rotation.y || 0,
          imageData.rotation.z || 0
        );

        // Store the link in userData for interactivity
        plane.userData.link = imageData.link;

        // Add to interactive arrays
        clickableImages.push(plane);
        hoverStatesImages.push(false);
        originalScales.push(plane.scale.clone());
        scene.add(plane);
      },
      undefined,
      (error) => {
        console.error("Error loading image texture:", error);
      }
    );
  });
}

// Add all images to the scene
addImages(images);

// Create a canvas and draw a gradient on it
const canvas = document.createElement("canvas");
canvas.width = 1024; // Set the canvas resolution
canvas.height = 1024;

const ctx = canvas.getContext("2d");

// Create the gradient
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); // Vertical gradient
gradient.addColorStop(0, "#040826"); // Start color
gradient.addColorStop(1, "#000000"); // End color

// Fill the canvas with the gradient
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Convert the canvas into a texture
const gradientTexture = new THREE.CanvasTexture(canvas);

// Assign the texture as the scene background
scene.background = gradientTexture;

// Raycaster and mouse setup
const raycaste = new THREE.Raycaster();
const mousee = new THREE.Vector2();

function onMouseClick(event) {
  // Convert mouse coordinates to normalized device coordinates (NDC)
  mousee.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousee.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaste.setFromCamera(mouse, camera);

  // Check for intersections with the Bean instances
  const intersects = raycaste.intersectObjects(clickableBeans, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object; // Get the first intersected object
    if (clickedObject.material) {
      // Change color of the clicked object
      clickedObject.material.color.set(
        new THREE.Color(Math.random(), Math.random(), Math.random())
      );
    }
  }
}

// Function to handle image clicks
function onImageClick(event) {
  // Convert mouse coordinates to normalized device coordinates (NDC)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with the clickable images
  const intersects = raycaster.intersectObjects(clickableImages, true);

  if (intersects.length > 0) {
    const clickedImage = intersects[0].object; // Get the first intersected object

    // Open the corresponding link stored in userData
    if (clickedImage.userData.link) {
      window.open(clickedImage.userData.link, "_blank");
    }
  }
}



window.addEventListener("click", (event) => {
  // Handle image clicks
  onImageClick(event);

  // Optionally keep the existing bean click functionality
  onMouseClick(event);
});

// Define gradient stops with ranges and fixed colors for each range
const gradientStops = [
  { range: [0, 0.1], topColor: { r: 0, g: 0, b: 20 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.12, 0.22], topColor: { r: 6, g: 6, b: 64 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.24, 0.4], topColor: { r: 50, g: 0, b: 0 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.42, 0.55], topColor: { r: 100, g: 30, b: 0 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.57, 0.69], topColor: { r: 0, g: 20, b: 20 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.71, 0.89], topColor: { r: 10, g: 0, b: 30 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.91, 0.97], topColor: { r: 15, g: 35, b: 15 }, bottomColor: { r: 0, g: 0, b: 0 } },
  { range: [0.99, 1], topColor: { r: 0, g: 0, b: 20 }, bottomColor: { r: 0, g: 0, b: 0 } },
];

// Define transition ranges for smooth transitions between fixed gradients
const transitionRanges = [
  { start: 0.1, end: 0.12 },
  { start: 0.22, end: 0.24 },
  { start: 0.4, end: 0.42 },
  { start: 0.55, end: 0.57 },
  { start: 0.69, end: 0.71 },
  { start: 0.89, end: 0.91 },
  { start: 0.97, end: 0.99 },
];

// Function to interpolate between two colors
function lerpColor(color1, color2, t) {
  const r = color1.r + (color2.r - color1.r) * t;
  const g = color1.g + (color2.g - color1.g) * t;
  const b = color1.b + (color2.b - color1.b) * t;
  return { r, g, b };
}

// Function to convert color object to CSS-compatible format
function colorToHex(color) {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
}

// Function to create and update the canvas gradient
function updateGradientTexture(progress) {
  // Fixed gradient ranges
  for (const stop of gradientStops) {
    const [start, end] = stop.range;
    if (progress >= start && progress <= end) {
      createCanvasGradient(stop.topColor, stop.bottomColor);
      return;
    }
  }

  // Transition ranges
  for (const transition of transitionRanges) {
    const { start, end } = transition;
    if (progress >= start && progress < end) {
      const t = (progress - start) / (end - start); // Normalize progress within the transition range

      // Find the previous and next stops
      const prevStop = gradientStops.find((stop) => stop.range[1] === start);
      const nextStop = gradientStops.find((stop) => stop.range[0] === end);

      if (prevStop && nextStop) {
        // Interpolate top and bottom colors
        const interpolatedTop = lerpColor(prevStop.topColor, nextStop.topColor, t);
        const interpolatedBottom = lerpColor(prevStop.bottomColor, nextStop.bottomColor, t);

        // Create the interpolated gradient
        createCanvasGradient(interpolatedTop, interpolatedBottom);
        return;
      }
    }
  }
}

// Helper function to create the gradient on a canvas
function createCanvasGradient(topColor, bottomColor) {
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colorToHex(topColor));
  gradient.addColorStop(1, colorToHex(bottomColor));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mark the texture as needing an update
  gradientTexture.needsUpdate = true;
}

// Scroll progress
let scrollProgress = 0;
document.body.style.height = "2200vh";

window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = window.scrollY / maxScroll; // Normalize scroll position (0 to 1)

  // Reset scroll when reaching the end or start
  if (scrollProgress >= 1) {
    window.scrollTo({ top: 1, behavior: 'auto' }); // Reset to the start of the page
  } else if (scrollProgress <= 0) {
    window.scrollTo({ top: maxScroll - 1, behavior: 'auto' }); // Reset to the end of the page
  }

  // Update gradient background based on scroll progress
  updateGradientTexture(scrollProgress);
});



function getBezierPoint(t, p0, p1, p2) {
  const oneMinusT = 1 - t;
  return {
    x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
    z: oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z,
  };
}

// Function to create white dots
function createWhiteDots(numDots, radius) {
  const dotGeometry = new THREE.SphereGeometry(0.5, 8, 8); // Small sphere for the dots
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color

  for (let i = 0; i < numDots; i++) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

    // Generate random spherical coordinates
    const theta = Math.random() * Math.PI * 2; // Random angle around Y-axis
    const phi = Math.acos(2 * Math.random() - 1); // Random angle from Z-axis

    // Convert spherical coordinates to Cartesian
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    dot.position.set(x, y, z); // Set position
    dot.layers.enable(BLOOM_SCENE);
    scene.add(dot); // Add to the scene
  }
}

function moveModelCloser(model, offset) {
  // Calculate the direction from the camera to the model
  const direction = new THREE.Vector3();
  direction.subVectors(model.position, camera.position).normalize();

  // Apply the offset along the direction
  const newPosition = new THREE.Vector3();
  newPosition.addVectors(model.position, direction.multiplyScalar(offset));

  // Update the model's position
  model.position.copy(newPosition);
}

const scrollSections = [
  { range: [0, 0.03], divId: "text1" },
  { range: [0, 0.03], divId: "imageDiv" },
  { range: [0.12, 0.2], divId: "text2" },
  { range: [0.12, 0.2], divId: "text3" },
  { range: [0.3, 0.38], divId: "text4" },
  { range: [0.3, 0.38], divId: "text5" },
  { range: [0.3, 0.38], divId: "text" },
  { range: [0.43, 0.46], divId: "text6" },
  { range: [0.43, 0.46], divId: "text7" },
  { range: [0.43, 0.46], divId: "text77" },
  { range: [0.58, 0.64], divId: "text8" },
  { range: [0.58, 0.64], divId: "text9" },
  { range: [0.72, 0.9], divId: "text10" },
  { range: [0.72, 0.9], divId: "text11" },
  { range: [0.948, 0.97], divId: "text12" },
  { range: [0.948, 0.97], divId: "imageDiv1" },
  { range: [0.948, 0.97], divId: "imageDiv2" },
];

function updateTextVisibility() {
  scrollSections.forEach((section) => {
    const div = document.getElementById(section.divId);

    // Check if the scroll is in the current range
    if (
      scrollProgress >= section.range[0] &&
      scrollProgress < section.range[1]
    ) {
      div.classList.add("visible"); // Add the visible class to fade in
    } else {
      div.classList.remove("visible"); // Remove the visible class to fade out
    }
  });
}

// Add 50 white dots at a distance of 1000 units from the origin
createWhiteDots(50, 200);
createWhiteDots(100, 500);

function animate() {

  updateCursorHover();

  const targetOffset = new THREE.Vector3(10, -10, -20); // Movement offset for the first set
  const additionalTargetOffset = new THREE.Vector3(10, -10, 20); // Offset for the second set

  const scaleFactorStart = 0.0001; // Almost invisible scale
  const scaleChangeStart1 = 0.1; // Start scaling for the first set
  const scaleChangeEnd1 = 0.145; // End scaling for the first set
  const animationStart1 = 0.15; // Start moving for the first set
  const animationEnd1 = 0.2; // End movement for the first set

  const scaleChangeStart2 = 0.55; // Start scaling for the second set
  const scaleChangeEnd2 = 0.58; // End scaling for the second set
  const animationStart2 = 0.6; // Start moving for the second set
  const animationEnd2 = 0.65; // End movement for the second set

  // Animate the first set of models
  movingModels.forEach((model, index) => {
    const originalPosition = originalModelPositions[index];
    const originalScale = originalModelScales[index];

    // Scale animation
    if (scrollProgress <= scaleChangeStart1) {
      model.scale.set(
        originalScale.x * scaleFactorStart,
        originalScale.y * scaleFactorStart,
        originalScale.z * scaleFactorStart
      );
    } else if (scrollProgress > scaleChangeStart1 && scrollProgress <= scaleChangeEnd1) {
      const t =
        (scrollProgress - scaleChangeStart1) / (scaleChangeEnd1 - scaleChangeStart1);
      model.scale.set(
        THREE.MathUtils.lerp(originalScale.x * scaleFactorStart, originalScale.x, t),
        THREE.MathUtils.lerp(originalScale.y * scaleFactorStart, originalScale.y, t),
        THREE.MathUtils.lerp(originalScale.z * scaleFactorStart, originalScale.z, t)
      );
    } else {
      model.scale.copy(originalScale);
    }

    // Position animation
    if (scrollProgress <= animationStart1) {
      model.position.copy(originalPosition);
    } else if (scrollProgress > animationStart1 && scrollProgress <= animationEnd1) {
      const t =
        (scrollProgress - animationStart1) / (animationEnd1 - animationStart1);
      model.position.set(
        originalPosition.x + targetOffset.x * t,
        originalPosition.y + targetOffset.y * t,
        originalPosition.z + targetOffset.z * t
      );
    } else {
      model.position.set(
        originalPosition.x + targetOffset.x,
        originalPosition.y + targetOffset.y,
        originalPosition.z + targetOffset.z
      );
    }
  });

  // Animate the second set of models
  additionalMovingModels.forEach((model, index) => {
    const originalPosition = additionalOriginalModelPositions[index];
    const originalScale = additionalOriginalModelScales[index];

    // Scale animation
    if (scrollProgress <= scaleChangeStart2) {
      model.scale.set(
        originalScale.x * scaleFactorStart,
        originalScale.y * scaleFactorStart,
        originalScale.z * scaleFactorStart
      );
    } else if (scrollProgress > scaleChangeStart2 && scrollProgress <= scaleChangeEnd2) {
      const t =
        (scrollProgress - scaleChangeStart2) / (scaleChangeEnd2 - scaleChangeStart2);
      model.scale.set(
        THREE.MathUtils.lerp(originalScale.x * scaleFactorStart, originalScale.x, t),
        THREE.MathUtils.lerp(originalScale.y * scaleFactorStart, originalScale.y, t),
        THREE.MathUtils.lerp(originalScale.z * scaleFactorStart, originalScale.z, t)
      );
    } else {
      model.scale.copy(originalScale);
    }

    // Position animation
    if (scrollProgress <= animationStart2) {
      model.position.copy(originalPosition);
    } else if (scrollProgress > animationStart2 && scrollProgress <= animationEnd2) {
      const t =
        (scrollProgress - animationStart2) / (animationEnd2 - animationStart2);
      model.position.set(
        originalPosition.x + additionalTargetOffset.x * t,
        originalPosition.y + additionalTargetOffset.y * t,
        originalPosition.z + additionalTargetOffset.z * t
      );
    } else {
      model.position.set(
        originalPosition.x + additionalTargetOffset.x,
        originalPosition.y + additionalTargetOffset.y,
        originalPosition.z + additionalTargetOffset.z
      );
    }
  });

    
  // Define all 14 curves as an array of objects
  const curves = [
    {
      start: { x: 30, y: 0, z: 120 },
      control: { x: 35, y: 0, z: 100 },
      end: { x: 30, y: 0, z: 80 },
    },
    {
      start: { x: 30, y: 0, z: 80 },
      control: { x: 0, y: 0, z: 40 },
      end: { x: -60, y: 0, z: 20 },
    },
    {
      start: { x: -60, y: 0, z: 20 },
      control: { x: -50, y: -10, z: 10 },
      end: { x: -40, y: -20, z: 0 },
    },
    {
      start: { x: -40, y: -20, z: 0 },
      control: { x: 20, y: -25, z: -50 },
      end: { x: 0, y: -30, z: -100 },
    },
    {
      start: { x: 0, y: -30, z: -100 },
      control: { x: 10, y: -30, z: -120 },
      end: { x: 20, y: -30, z: -140 },
    },
    {
      start: { x: 20, y: -30, z: -140 },
      control: { x: 100, y: -20, z: -170 },
      end: { x: 180, y: -10, z: -200 },
    },
    {
      start: { x: 180, y: -10, z: -200 },
      control: { x: 200, y: -10, z: -190 },
      end: { x: 220, y: -10, z: -180 },
    },
    {
      start: { x: 220, y: -10, z: -180 },
      control: { x: 260, y: -5, z: -120 },
      end: { x: 300, y: 0, z: -60 },
    },
    {
      start: { x: 300, y: 0, z: -60 },
      control: { x: 310, y: -10, z: -50 },
      end: { x: 320, y: -20, z: -40 },
    },
    {
      start: { x: 320, y: -20, z: -40 },
      control: { x: 300, y: -20, z: -10 },
      end: { x: 280, y: -20, z: 20 },
    },
    {
      start: { x: 280, y: -20, z: 20 },
      control: { x: 240, y: -20, z: 180 },
      end: { x: 200, y: -20, z: 340 },
    },
    {
      start: { x: 200, y: -20, z: 340 },
      control: { x: 160, y: -20, z: 280 },
      end: { x: 120, y: -20, z: 220 },
    },
    {
      start: { x: 120, y: -20, z: 220 },
      control: { x: 100, y: -25, z: 210 },
      end: { x: 80, y: -20, z: 200 },
    },
    {
      start: { x: 80, y: -20, z: 200 },
      control: { x: 55, y: -10, z: 160 },
      end: { x: 30, y: 0, z: 120 },
    },
  ];

  // Map focus points to specific scroll ranges (percentages)
  const focusMapping = [
    { range: [0, 0.2], point: { x: 0, y: 0, z: 140 } },
    { range: [0.2, 0.38], point: { x: -200, y: -20, z: 20 } },
    { range: [0.38, 0.41], point: { x: -200, y: -20, z: -300 } },
    { range: [0.41, 0.74], point: { x: 140, y: -10, z: -300 } },
    { range: [0.74, 0.78], point: { x: 630, y: 0, z: 200 } },
    { range: [0.78, 0.89], point: { x: 1200, y: -20, z: 660 } },
    { range: [0.89, 0.99], point: { x: 90, y: -10, z: 440 } },
    { range: [0.99, 1], point: { x: 0, y: 0, z: 140 } },
  ];

  const numCurves = curves.length;

  const segmentProgress = scrollProgress * numCurves; // Map to the number of curves
  const activeCurveIndex = Math.floor(segmentProgress); // Get the active curve index
  const t = segmentProgress - activeCurveIndex; // Normalize progress within the current curve

  const currentCurve = curves[Math.min(activeCurveIndex, numCurves - 1)];
  const position = getBezierPoint(
    t,
    currentCurve.start,
    currentCurve.control,
    currentCurve.end
  );
  camera.position.set(position.x, position.y, position.z);

  // Determine the active focus point based on scroll progress
  let startFocus, endFocus, localT;

  for (let i = 0; i < focusMapping.length - 1; i++) {
    const currentRange = focusMapping[i].range;
    const nextRange = focusMapping[i + 1].range;

    if (scrollProgress >= currentRange[0] && scrollProgress < nextRange[0]) {
      startFocus = new THREE.Vector3(
        focusMapping[i].point.x,
        focusMapping[i].point.y,
        focusMapping[i].point.z
      );
      endFocus = new THREE.Vector3(
        focusMapping[i + 1].point.x,
        focusMapping[i + 1].point.y,
        focusMapping[i + 1].point.z
      );
      // Normalize t for the focus transition
      localT =
        (scrollProgress - currentRange[0]) / (nextRange[0] - currentRange[0]);
      break;
    }
  }

  if (!startFocus || !endFocus) {
    // Default to last point if no range matches
    startFocus = new THREE.Vector3(
      focusMapping[focusMapping.length - 1].point.x,
      focusMapping[focusMapping.length - 1].point.y,
      focusMapping[focusMapping.length - 1].point.z
    );
    endFocus = startFocus.clone();
    localT = 0;
  }

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Reset hover states and restore original positions
  hoverStatesImages.fill(false);
  hoverStates.fill(false);
  hoverModels.forEach((model, index) => {
    model.position.copy(originalPositions[index]); // Reset position
  });

  // Check for intersections with the raycast targets
  const intersects = raycaster.intersectObjects(raycastTargets, true);

  // Process the closest intersected object (if any)
  if (intersects.length > 0) {
    const closestIntersect = intersects[0].object; // Get the closest intersected object
    hoverModels.forEach((model, index) => {
      model.traverse((child) => {
        if (child === closestIntersect) {
          hoverStates[index] = true; // Mark only the closest model as hovered
        }
      });
    });
  }

  // Apply hover effects
  hoverModels.forEach((model, index) => {
    if (hoverStates[index]) {
      model.rotation.y += 0.03; // Rotate hovered model
      moveModelCloser(model, -25); // Move hovered model closer by 25 units
    }
  });

  // Check for intersections with the image meshes
  const intersectss = raycaster.intersectObjects(clickableImages, true);

  if (intersectss.length > 0) {
    const hoveredImage = intersectss[0].object; // Get the first intersected object
    clickableImages.forEach((image, index) => {
      if (image === hoveredImage) {
        hoverStatesImages[index] = true; // Mark only the hovered image
      }
    });
  }

  // Apply hover effects (pulse)
  clickableImages.forEach((image, index) => {
    if (hoverStatesImages[index]) {
      const scaleFactor = 1 + Math.sin(Date.now() * 0.005) * 0.1; // Create pulse effect
      image.scale.set(
        originalScales[index].x * scaleFactor,
        originalScales[index].y * scaleFactor,
        originalScales[index].z * scaleFactor
      );
    } else {
      image.scale.copy(originalScales[index]); // Reset scale
    }
  });

  

  // Update text visibility based on scroll position
  updateTextVisibility();

  animateBeans(scrollProgress);
  

  const interpolatedFocus = new THREE.Vector3().lerpVectors(
    startFocus,
    endFocus,
    localT
  );
  camera.lookAt(interpolatedFocus);

  composer.render();
}

renderer.setAnimationLoop(animate);
