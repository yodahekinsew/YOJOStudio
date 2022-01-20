import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("canvas");
const app = document.getElementById("app");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
// Enable shadows in renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// var sphereGeometry = new THREE.SphereBufferGeometry(3, 32, 32);
// var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
// var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// sphere.castShadow = true; //default is false
// sphere.receiveShadow = false; //default
// scene.add(sphere);

var geometry = new THREE.BoxGeometry(1024, 1, 1024);
var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
var cube = new THREE.Mesh(geometry, material);
cube.position.set(0, -3.25, 0);
cube.receiveShadow = true;
scene.add(cube);

geometry = new THREE.BoxGeometry(2048, 2048, 1);
material = new THREE.MeshPhongMaterial({ color: 0xffffff });
cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, -512);
cube.receiveShadow = true;
scene.add(cube);

// Setting up scene
camera.position.setZ(10); // Setting up camera

// Adding a point light
var pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.castShadow = true; // default = false
pointLight.shadow.radius = 1;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.set(0, 10, 5);
// scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 10, 5);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// directionalLight.position.set(0, 0, 1);
// scene.add(directionalLight);

// Adding an ambient light
const ambientLight = new THREE.AmbientLight(0xeeeeee);
scene.add(ambientLight);

// const lightHelper = new THREE.PointLightHelper(pointLight2);
// scene.add(lightHelper);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

// const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
var iPhone;
loader.load(
  // "./apple_iphone_11_pro/scene.gltf",
  "./iPhone/model.glb",
  (gltf) => {
    iPhone = gltf.scene;

    const texture = new THREE.TextureLoader().load(
      "./iPhone/textures/hoppor.png"
    );
    const newMaterial = new THREE.MeshBasicMaterial({ map: texture });
    iPhone.children[0].children[0].children[0].children[0].children[10].children[0].material =
      newMaterial;

    iPhone.scale.set(5, 5, 5);
    iPhone.rotation.set(Math.PI / 2, 0, 0);
    iPhone.position.set(0, 100, 0); // Load the iPhone out of frame
    iPhone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = false;
      }
    });

    scene.add(iPhone);
  },
  undefined,
  (err) => {
    console.error(err);
  }
);

// Update (or animation) loop
function animate() {
  requestAnimationFrame(animate);

  // controls.update();

  renderer.render(scene, camera);
}
animate();

const scrollAnimation = {
  iPhonePosition: {
    setValue: (value) => iPhone.position.copy(value),
    interpolateValue: (a, b, t) => new THREE.Vector3().lerpVectors(a, b, t),
    keyFrames: [
      // Transition from Start to Volver
      {
        scroll: 1 / 6,
        value: new THREE.Vector3(5, 15, 0),
      },
      {
        scroll: 1 / 3,
        value: new THREE.Vector3(5, 0, 0),
      },
      // Transition from Volver to Movementum
      {
        scroll: 1 / 3 + 1 / 6,
        value: new THREE.Vector3(5, 0, 0),
      },
      {
        scroll: 2 / 3,
        value: new THREE.Vector3(-5, 0, 0),
      },
      // Transition from Movementum to Hoppor
      {
        scroll: 2 / 3 + 1 / 6,
        value: new THREE.Vector3(-5, 0, 0),
      },
      {
        scroll: 3 / 3,
        value: new THREE.Vector3(5, 0, 0),
      },
    ],
  },
  iPhoneRotation: {
    setValue: (value) => iPhone.rotation.set(value.x, value.y, value.z),
    interpolateValue: (a, b, t) => new THREE.Vector3().lerpVectors(a, b, t),
    keyFrames: [
      // Transition from Start to Volver
      {
        scroll: 1 / 6,
        value: new THREE.Vector3(Math.PI / 2, 0, 2.125 * Math.PI),
      },
      {
        scroll: 1 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, 0.125 * Math.PI),
      },
      // Transition from Volver to Movementum
      {
        scroll: 1 / 3 + 1 / 6,
        value: new THREE.Vector3(Math.PI / 2, 0, 0.125 * Math.PI),
      },
      {
        scroll: 2 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, -0.125 * Math.PI),
      },
      // Transition from Movementum to Hoppor
      {
        scroll: 2 / 3 + 1 / 6,
        value: new THREE.Vector3(Math.PI / 2, 0, -0.125 * Math.PI),
      },
      {
        scroll: 3 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, 2.125 * Math.PI),
      },
    ],
  },
};

function inverseLerp(a, b, t) {
  return (t - a) / (b - a);
}

// Scroll animations
function UpdateProperty(anim, scroll) {
  // If there are no keyframes, we just leave
  if (anim.keyFrames.length == 0) return;

  // Find the current scroll keyframes we are in between
  var keyFrame = anim.keyFrames.length - 1;
  for (var i = 0; i < anim.keyFrames.length; i++) {
    if (anim.keyFrames[i].scroll > scroll.progress) {
      keyFrame = i - 1;
      break;
    }
  }

  // If we have a valid keyframe and there's a "next" frame, lerp
  if (keyFrame == -1) return anim.setValue(anim.keyFrames[keyFrame + 1].value);
  if (keyFrame == anim.keyFrames.length - 1)
    return anim.setValue(anim.keyFrames[keyFrame].value);
  let interpolant = inverseLerp(
    anim.keyFrames[keyFrame].scroll,
    anim.keyFrames[keyFrame + 1].scroll,
    scroll.progress
  );
  let interpolatedValue = anim.interpolateValue(
    anim.keyFrames[keyFrame].value,
    anim.keyFrames[keyFrame + 1].value,
    interpolant
  );
  return anim.setValue(interpolatedValue);
}
var lastScrollProgress = 0;
var scrollDirection = 1;
const maxScrollDelta = 0.01;
function UpdateSceneOnScroll(e) {
  var scrollProgress = app.scrollTop / (app.scrollHeight - app.clientHeight);

  // Get the scroll direction
  // 1 -> Scrolling down the page, -1 -> scrolling up the page
  if (lastScrollProgress != -1 && lastScrollProgress < scrollProgress)
    scrollDirection = -1;

  // Go through all animation properties
  Object.keys(scrollAnimation).forEach((property) => {
    UpdateProperty(scrollAnimation[property], {
      progress: scrollProgress,
      dir: scrollDirection,
    });
  });

  lastScrollProgress = scrollProgress;
}
app.onscroll = UpdateSceneOnScroll;
