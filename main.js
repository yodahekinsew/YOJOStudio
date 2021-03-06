import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("canvas");
const app = document.getElementById("app");

let scene, camera, renderer, directionalLight;

// === DOM elements setup ===
const volverIcon = document.getElementById("volver-icon");
const movementumIcon = document.getElementById("movementum-icon");
const hopporIcon = document.getElementById("hoppor-icon");
const volverVideo = document.getElementById("volver-video");
const movementumVideo = document.getElementById("movementum-video");
const hopporVideo = document.getElementById("hoppor-video");
const dots = document.getElementById("loading-dots");
const loadingCover = document.getElementById("loading-cover");
const yojoLogo = document.getElementById("yojo-logo");
const yojoStudioLogo = document.getElementById("yojo-studio-logo");
const mouseIcon = document.getElementById("mouse");
const chevronIcon = document.getElementById("chevron-down");

// === Media Queries ===
var iPhoneOffsetFromCenter = 0.5;
var animateScreen = false;
var prefersReducedMotion = false;
var usingDarkColorScheme = false;
// Create a condition that targets viewports at least 768px wide
function makeQuery(queryString, offset, shouldAnimateScreen) {
  const query = window.matchMedia(queryString);
  const handleQuery = (e) => {
    if (e.matches) {
      iPhoneOffsetFromCenter = offset;
      animateScreen = prefersReducedMotion ? false : shouldAnimateScreen;
    }
  };
  query.addListener(handleQuery);
  handleQuery(query);
}
makeQuery("only screen and (max-aspect-ratio: 1/2)", 0, false);
makeQuery(
  "only screen and (min-aspect-ratio: 1/2) and (max-aspect-ratio: 2/3)",
  0.25,
  false
);
makeQuery("only screen and (min-aspect-ratio: 2/3)", 0.5, true);

const handlePrefersReducedMotion = (e) => {
  if (e.matches) {
    prefersReducedMotion = true;
    animateScreen = false;
  }
};
const prefersReducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
prefersReducedMotionQuery.addListener(handlePrefersReducedMotion);
handlePrefersReducedMotion(prefersReducedMotionQuery);

const handlePrefersColorScheme = (e) => {
  usingDarkColorScheme = e.matches;
  if (e.matches) {
    yojoLogo.src = "./static/YoJoLogoWhite.svg";
    yojoStudioLogo.src = "./static/YoJoStudioLogoWhite.svg";
    mouseIcon.src = "./static/mouse-white.svg";
    chevronIcon.src = "./static/down-arrow-white.svg";
  } else {
    yojoLogo.src = "./static/YoJoLogo.svg";
    yojoStudioLogo.src = "./static/YoJoStudioLogo.svg";
    mouseIcon.src = "./static/mouse.svg";
    chevronIcon.src = "./static/down-arrow.svg";
  }
};
const prefersColorSchemeQuery = window.matchMedia(
  "(prefers-color-scheme: dark)"
);
prefersColorSchemeQuery.addListener(handlePrefersColorScheme);
handlePrefersColorScheme(prefersColorSchemeQuery);

// === stuff for loading the iPhone ===
const loader = new GLTFLoader();

let iPhone, iPhoneScreen;
const iPhoneWorldDepth = 3.5;
const cameraHeight = 0;
var iPhoneTextures = [];
var currentTexture = -1;
function setiPhoneTexture(textureIndex) {
  if (currentTexture != -1) {
    iPhoneTextures[currentTexture].video.pause();
    iPhoneTextures[currentTexture].video.time = 0;
  }
  currentTexture = textureIndex;

  let videoTexture = iPhoneTextures[textureIndex];
  videoTexture.video.play();
  const newMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: videoTexture.texture,
  });
  iPhoneScreen.material = newMaterial;
}
function setiPhonePosition(x, y) {
  // TODO: Might need to remove the camera updates for performance sake
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const depth = new THREE.Vector3(0, 0, iPhoneWorldDepth).project(camera).z;
  const newPos = new THREE.Vector3(x, y, depth).unproject(camera);
  newPos.x -= camera.position.x;
  newPos.y -= camera.position.y;
  iPhone.position.copy(newPos);

  // Move directional light with phone so shadow is always in view
  directionalLight.position.set(newPos.x, 15, 10);
  directionalLight.target.position.set(newPos.x, 0, 0);
}

// Update (or animation) loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Scroll animation stuff
const scrollAnimation = {
  iPhonePosition: {
    setValue: (value) => setiPhonePosition(value.x, value.y),
    interpolateValue: (a, b, t) => new THREE.Vector2().lerpVectors(a, b, t),
    keyFrames: [
      // Transition from Start to Volver
      {
        scroll: 0,
        value: () => new THREE.Vector2(iPhoneOffsetFromCenter, -2.5),
      },
      {
        scroll: 1 / 6,
        value: () => new THREE.Vector2(iPhoneOffsetFromCenter, 0),
      },
      // Transition from Volver to Movementum
      {
        scroll: 1 / 3 + 1 / 6,
        value: () => new THREE.Vector2(iPhoneOffsetFromCenter, 0),
      },
      {
        scroll: 1 / 3 + 1 / 6 + 1 / 12,
        value: new THREE.Vector2(1.5, 0),
      },
      {
        scroll: 1 / 3 + 1 / 6 + 1 / 12,
        value: new THREE.Vector2(-1.5, 0),
      },
      {
        scroll: 2 / 3,
        value: () => new THREE.Vector2(-iPhoneOffsetFromCenter, 0),
      },
      // Transition from Movementum to Hoppor
      {
        scroll: 2 / 3 + 1 / 6,
        value: () => new THREE.Vector2(-iPhoneOffsetFromCenter, 0),
      },
      {
        scroll: 3 / 3,
        value: () => new THREE.Vector2(iPhoneOffsetFromCenter, 0),
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
        value: new THREE.Vector3(Math.PI / 2, 0, -Math.PI),
      },
      {
        scroll: 1 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, 0.0625 * Math.PI),
      },
      // Transition from Volver to Movementum
      {
        scroll: 1 / 3 + 1 / 6,
        value: new THREE.Vector3(Math.PI / 2, 0, 0.25 * Math.PI),
      },
      {
        scroll: 1 / 3 + 1 / 6 + 1 / 12,
        value: new THREE.Vector3(Math.PI / 2, 0, 1.25 * Math.PI),
      },
      {
        scroll: 1 / 3 + 1 / 6 + 1 / 12,
        value: new THREE.Vector3(Math.PI / 2, 0, -1.25 * Math.PI),
      },
      {
        scroll: 2 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, -0.125 * Math.PI),
      },
      // Transition from Movementum to Hoppor
      {
        scroll: 2 / 3 + 1 / 6,
        value: new THREE.Vector3(Math.PI / 2, 0, 0.125 * Math.PI),
      },
      {
        scroll: 3 / 3,
        value: new THREE.Vector3(Math.PI / 2, 0, 2.125 * Math.PI),
      },
    ],
  },
  iPhoneTexture: {
    setValue: setiPhoneTexture,
    interpolateValue: (a, b, t) => a,
    keyFrames: [
      { scroll: 0, value: 0 },
      { scroll: 1 / 3 + 1 / 6 + 1 / 12, value: 1 },
      { scroll: 2 / 3 + 1 / 6 + 1 / 12, value: 2 },
    ],
  },
  startPage: {
    setValue: (value) => {
      document.getElementById("heading").style.opacity = value;
      // document.getElementById("nav-dots").style.bottom = value ? "25%" : "7.5%";
      // document.documentElement.style.setProperty(
      //   "--dot-size",
      //   value ? "25px" : "35px"
      // );
      document.getElementById("heading").style.zIndex = value > 0 ? 1 : 0;
    },
    interpolateValue: (a, b, t) => a + (b - a) * t,
    keyFrames: [
      { scroll: 0, value: 1 },
      { scroll: 1 / 6, value: 0 },
    ],
  },
  volverPage: {
    setValue: (value) => {
      document.getElementById("volver").style.opacity = value;
      document.getElementById("volver-icon").style.opacity = value;
      document.getElementById("volver-icon").style.zIndex = value * 10;
      document.getElementById("volver-icon").style.pointerEvents = value
        ? "visible"
        : "none";
      document.getElementById("volver-app-store-link").style.zIndex =
        value * 10;
      document.getElementById("volver-app-store-link").style.pointerEvents =
        value ? "visible" : "none";
    },
    interpolateValue: (a, b, t) => a + (b - a) * t,
    keyFrames: [
      { scroll: 0, value: 0 },
      { scroll: 1 / 3, value: 0 },
      { scroll: 1 / 3, value: 1 },
      { scroll: 1 / 3 + 1 / 6, value: 1 },
      { scroll: 1 / 3 + 1 / 6, value: 0 },
    ],
  },
  movementumPage: {
    setValue: (value) => {
      document.getElementById("movementum").style.opacity = value;
      document.getElementById("movementum-icon").style.opacity = value;
      document.getElementById("movementum-icon").style.zIndex = value * 10;
      document.getElementById("movementum-icon").style.pointerEvents = value
        ? "visible"
        : "none";
      document.getElementById("movementum-app-store-link").style.zIndex =
        value * 10;
      document.getElementById("movementum-app-store-link").style.pointerEvents =
        value ? "visible" : "none";
    },
    interpolateValue: (a, b, t) => a + (b - a) * t,
    keyFrames: [
      { scroll: 0, value: 0 },
      { scroll: 2 / 3, value: 0 },
      { scroll: 2 / 3, value: 1 },
      { scroll: 2 / 3 + 1 / 6, value: 1 },
      { scroll: 2 / 3 + 1 / 6, value: 0 },
    ],
  },
  hopporPage: {
    setValue: (value) => {
      document.getElementById("hoppor").style.opacity = value;
      document.getElementById("hoppor-icon").style.opacity = value;
      document.getElementById("hoppor-icon").style.zIndex = value * 10;
      document.getElementById("hoppor-icon").style.pointerEvents = value
        ? "visible"
        : "none";
      document.getElementById("hoppor-app-store-link").style.zIndex =
        value * 10;
      document.getElementById("hoppor-app-store-link").style.pointerEvents =
        value ? "visible" : "none";
    },
    interpolateValue: (a, b, t) => a + (b - a) * t,
    keyFrames: [
      { scroll: 0, value: 0 },
      { scroll: 3 / 3, value: 0 },
      { scroll: 3 / 3, value: 1 },
    ],
  },
};
function inverseLerp(a, b, t) {
  return (t - a) / (b - a);
}
function getKeyFrameValue(keyFrame) {
  return typeof keyFrame.value == "function"
    ? keyFrame.value()
    : keyFrame.value;
}
// Scroll animations
function updateProperty(anim, scrollProgress) {
  // If there are no keyframes, we just leave
  if (anim.keyFrames.length == 0) return;

  // Find the current scroll keyframes we are in between
  var keyFrame = anim.keyFrames.length - 1;
  for (var i = 0; i < anim.keyFrames.length; i++) {
    if (anim.keyFrames[i].scroll > scrollProgress) {
      keyFrame = i - 1;
      break;
    }
  }

  // If we have a valid keyframe setup, get the new value
  let newValue;
  if (keyFrame == -1) newValue = getKeyFrameValue(anim.keyFrames[keyFrame + 1]);
  else if (keyFrame == anim.keyFrames.length - 1)
    newValue = getKeyFrameValue(anim.keyFrames[keyFrame]);
  else {
    let interpolant = inverseLerp(
      anim.keyFrames[keyFrame].scroll,
      anim.keyFrames[keyFrame + 1].scroll,
      scrollProgress
    );
    newValue = anim.interpolateValue(
      getKeyFrameValue(anim.keyFrames[keyFrame]),
      getKeyFrameValue(anim.keyFrames[keyFrame + 1]),
      interpolant
    );
  }

  if (anim.lastValue != newValue) {
    anim.lastValue = newValue;
    anim.setValue(newValue);
  }
}
function updateSceneOnScroll() {
  var scrollProgress = app.scrollTop / (app.scrollHeight - app.clientHeight);

  // Go through all animation properties
  Object.keys(scrollAnimation).forEach((property) => {
    updateProperty(scrollAnimation[property], scrollProgress);
  });
}

// Helper functions for making Three.js scene look good
function toScreenPosition(vector, camera) {
  var widthHalf = 0.5 * window.innerWidth;
  var heightHalf = 0.5 * window.innerHeight;

  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  vector.project(camera);

  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y,
  };
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  requestAnimationFrame(() => {
    updateAppIcons();
    updateSceneOnScroll();
  });
}
function updateAppIcons() {
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  var halfIconSize =
    (0.15 * Math.min(window.innerWidth, window.innerHeight)) / 2;
  const depth = new THREE.Vector3(0, 0, iPhoneWorldDepth).project(camera).z;
  var newPos = new THREE.Vector3(0.5, 0, depth).unproject(camera);
  newPos.x += 1;
  newPos.y -= 2.5;

  var screenPos = toScreenPosition(newPos, camera);
  if (screenPos.x - halfIconSize >= window.innerWidth)
    screenPos.x = window.innerWidth - 15;
  if (screenPos.y - halfIconSize >= window.innerHeight)
    screenPos.y = window.innerHeight - 15;

  volverIcon.style.left = `${screenPos.x - halfIconSize}px`;
  volverIcon.style.top = `${screenPos.y - halfIconSize}px`;
  hopporIcon.style.left = `${screenPos.x - halfIconSize}px`;
  hopporIcon.style.top = `${screenPos.y - halfIconSize}px`;

  newPos = new THREE.Vector3(-0.5, 0, depth).unproject(camera);
  newPos.x -= 1;
  newPos.y -= 2.5;

  screenPos = toScreenPosition(newPos, camera);
  if (screenPos.x - halfIconSize >= window.innerWidth)
    screenPos.x = window.innerWidth - 15;
  if (screenPos.y - halfIconSize >= window.innerHeight)
    screenPos.y = window.innerHeight - 15;

  movementumIcon.style.left = `${screenPos.x - halfIconSize}px`;
  movementumIcon.style.top = `${screenPos.y - halfIconSize}px`;
}

var finishedLoadingScene = false;
// Init function to start/setup everything else
function init() {
  console.log("Starting to load");
  loader.load(
    "/iPhone/min-model.glb",
    (gltf) => {
      console.log("Loaded iPhone Model");
      iPhone = gltf.scene;

      // === Setting up scene ===
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        63.5,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      // renderer.setClearColor(0x000000, 0);
      // Enable shadows in renderer
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Setting up camera
      camera.position.set(0, cameraHeight, 10);

      // Adding the spot light (main light)
      directionalLight = new THREE.DirectionalLight(
        usingDarkColorScheme ? "#19191a" : "#ffffff"
      );
      directionalLight.position.set(0, 15, 10);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera = new THREE.OrthographicCamera(
        -5,
        5,
        5,
        -10,
        0.1,
        50
      );
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);
      scene.add(directionalLight.target);

      // Adding an ambient light (basically controls the shadow color since all materials are white)
      const ambientLight = new THREE.AmbientLight(
        usingDarkColorScheme ? 0x202124 : 0xeeeeee
      );
      scene.add(ambientLight);

      // Floor
      var wallGeometry = new THREE.BoxGeometry(1024, 0.01, 10);
      var wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
      const topFloor = new THREE.Mesh(wallGeometry, wallMaterial);
      topFloor.position.set(0, -3.25, -5 + iPhoneWorldDepth - 0.2);
      topFloor.receiveShadow = true;
      scene.add(topFloor);
      const backFloor = new THREE.Mesh(wallGeometry, wallMaterial);
      backFloor.position.set(0, -3.25, 5 + iPhoneWorldDepth + 0.2);
      scene.add(backFloor);

      // iPhone
      const volverVideoTex = new THREE.VideoTexture(volverVideo);
      const movementumVideoTex = new THREE.VideoTexture(movementumVideo);
      const hopporVideoTex = new THREE.VideoTexture(hopporVideo);

      iPhoneTextures.push(
        { video: volverVideo, texture: volverVideoTex },
        { video: movementumVideo, texture: movementumVideoTex },
        { video: hopporVideo, texture: hopporVideoTex }
      );

      iPhoneScreen =
        iPhone.children[0].children[0].children[0].children[0].children[10]
          .children[0];
      setiPhoneTexture(0);

      iPhone.scale.set(5, 5, 5);
      iPhone.rotation.set(Math.PI / 2, 0, 0);
      setiPhonePosition(0, 5);

      iPhone.traverse((o) => {
        if (o.isMesh) {
          o.material.metalness = 0;
          o.castShadow = true;
          o.receiveShadow = false;
        }
      });

      const appleLogo =
        iPhone.children[0].children[0].children[0].children[0].children[14]
          .children[0];
      const newMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
      });
      appleLogo.material = newMaterial;

      scene.add(iPhone);

      requestAnimationFrame(() => {
        updateAppIcons();
        updateSceneOnScroll();
        animate();
      });

      window.addEventListener("resize", onWindowResize);
      var scrollDeltaBuildup = 0;
      const simulatedScrollSpeed = 15;
      const simulateScrolling = () => {
        const simulatedScrollAmount = Math.min(
          simulatedScrollSpeed,
          Math.abs(scrollDeltaBuildup)
        );
        if (scrollDeltaBuildup > 0) {
          if (app.scrollTop >= app.scrollHeight - app.clientHeight) {
            scrollDeltaBuildup = 0;
          } else {
            app.scrollTop += simulatedScrollAmount;
            scrollDeltaBuildup -= simulatedScrollAmount;
          }
        }
        if (scrollDeltaBuildup < 0) {
          if (app.scrollTop <= 0) {
            scrollDeltaBuildup = 0;
          } else {
            app.scrollTop -= simulatedScrollAmount;
            scrollDeltaBuildup += simulatedScrollAmount;
          }
        }
        requestAnimationFrame(simulateScrolling);
      };
      simulateScrolling();
      app.onwheel = (e) => {
        e.preventDefault(); // Prevent the default scroll for mouse (not touch)
        if (Math.sign(e.deltaY) != Math.sign(scrollDeltaBuildup))
          scrollDeltaBuildup = 0;
        scrollDeltaBuildup += e.deltaY;
      };
      app.onscroll = updateSceneOnScroll;
      window.onmousemove = (e) => {
        if (animateScreen) {
          camera.position.set(
            0.15 * (2 * (e.clientX / window.innerWidth - 0.5)),
            cameraHeight - 0.15 * (2 * (e.clientY / window.innerHeight - 0.5)),
            10
          );
        }
      };

      console.log("Finished loading scene!");
      finishedLoadingScene = true;
    },
    undefined,
    (err) => {
      console.error(err);
    }
  );
}

init();

volverVideo.load();
movementumVideo.load();
hopporVideo.load();
var initialInterval = setInterval(() => {
  console.log(
    "Ready States",
    volverVideo.readyState,
    movementumVideo.readyState,
    hopporVideo.readyState
  );
  if (
    volverVideo.readyState >= 1 &&
    movementumVideo.readyState >= 1 &&
    hopporVideo.readyState >= 1 &&
    finishedLoadingScene
  ) {
    clearInterval(initialInterval);
    volverVideo.play();
    movementumVideo.play();
    hopporVideo.play();
    dots.id = "nav-dots";
    setTimeout(() => {
      loadingCover.style.opacity = 0;
      // animate will call itself every frame after this
      setTimeout(() => {
        loadingCover.style.display = "none";
        loadingCover.style.zIndex = -10;
        app.style.overflowY = "auto";
        // if (!forceSmoothScrolling) app.style.overflowY = "auto";
      }, 500);
    }, 500);
  }
}, 1200);
