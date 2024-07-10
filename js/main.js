import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const insideModelPath = "models/MacInside.glb";
const outsideModelPath = "models/MacOutside.glb";
const openingDistance = 20;

let scene, camera, renderer, controls;
let insideModel, outsideModel;
let isCaseOpen = false;
let raycaster, mouse;

let mouseDownPosition = new THREE.Vector2();
let mouseUpPosition = new THREE.Vector2();
// Threshold in pixels to differentiate between click and drag
const moveThreshold = 5;

init();
animate();

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 1, 2);

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add light
    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-3, 5, 0).normalize();
    scene.add(directionalLight);

    // Initialize raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Load models
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(insideModelPath, function (gltf) {
        insideModel = gltf.scene;
        scene.add(insideModel);
    });

    gltfLoader.load(outsideModelPath, function (gltf) {
        outsideModel = gltf.scene;
        scene.add(outsideModel);
    });

    // Load skybox
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      '/images/Skybox.png',
      () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
      });

    // Add event listeners for case opening
    document.addEventListener('keydown', onDocumentKeyDown, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);

    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function onDocumentKeyDown(event) {
    if (event.key === 'o') { // Press 'o' to toggle open/close
        toggleCase();
    }
}

function onDocumentMouseDown(event) {
    mouseDownPosition.set(event.clientX, event.clientY);
}

function onDocumentMouseUp(event) {
    mouseUpPosition.set(event.clientX, event.clientY);

    // Calculate the distance moved
    const distance = mouseDownPosition.distanceTo(mouseUpPosition);

    // Only consider it a click if the mouse hasn't moved significantly
    if (distance < moveThreshold) {
        // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObject(outsideModel, true);

        if (intersects.length > 0) {
            toggleCase();
        }
    }
}

function toggleCase() {
    isCaseOpen = !isCaseOpen;
    if (insideModel && outsideModel) {
        if (isCaseOpen) {
            insideModel.visible = true;
            gsap.to(outsideModel.position, {
                x: openingDistance,
                duration: 1,
                ease: "power4.inOut"
            });
        } else {
            gsap.to(outsideModel.position, {
                x: 0,
                duration: 1,
                ease: "power4.inOut"
            });
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);
}
