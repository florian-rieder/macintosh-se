import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const insideModelPath = "models/MacInside.glb";
const outsideModelPath = "models/MacOutside.glb";
const openingDistance = 20;

let scene, camera, renderer, controls;
let insideModel, outsideModel;
let isCaseOpen = false;

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
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // Load models
    const loader = new GLTFLoader();
    loader.load(insideModelPath, function (gltf) {
        insideModel = gltf.scene;
        scene.add(insideModel);
    });

    loader.load(outsideModelPath, function (gltf) {
        outsideModel = gltf.scene;
        scene.add(outsideModel);
    });

    // Add event listener for case opening
    document.addEventListener('keydown', onDocumentKeyDown, false);

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
        if (event.key === 'o') { // Press 'o' to toggle open/close
            isCaseOpen = !isCaseOpen;
            if (insideModel && outsideModel) {
                if (isCaseOpen) {
                    insideModel.visible = true;
                    gsap.to(outsideModel.position, { x: openingDistance, duration: 1, ease: "power2.inOut" });
                } else {
                    gsap.to(outsideModel.position, { x: 0, duration: 1, ease: "power2.inOut" });
                }
            }
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
