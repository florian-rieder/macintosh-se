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

let isMouseOverInfo = false;
let isMouseOverToggle = false;

const goToComponentDuration = 1.0;
const components = {
    'alimentation': {
        position: {
            "x": 0.907613725557793,
            "y": 8.37295610947459,
            "z": -0.3725824608550772
        },
        direction: {
            "x": -0.3692057687832432,
            "y": 5.9250512320451785,
            "z": 19.098624426851714
        },
        distance: 0.5
    },
    'memory': {
        // more to come
    },
    'disk_bay': {
        "position": {
          "x": -3.266067974558781,
          "y": 8.857150144196915,
          "z": 6.752223265150003
        },
        "direction": {
          "x": 0.4874648127345709,
          "y": 0.617606394035524,
          "z": 0.6172036927887639
        },
        "distance": 6.05695064751393
      },
    'monitor': {
        "position": {
            "x": -3.5678488235839767,
            "y": 16.21985108941862,
            "z": 5.26089833947976
        },
        "direction": {
            "x": 0.5499328331703301,
            "y": 0.32516330600412713,
            "z": 0.7693131374347643
        },
        "distance": 13.488942459166836
    },
    'ports': {
        position: {
            "x": 5.984320381232469,
            "y": 1.913330958936625,
            "z": 2.7629085454204887
        },
        direction: {
            "x": 0.9808188487442726,
            "y": 0.18926959290694165,
            "z": 0.04659835993680714
        },
        distance: 10
    }
}

// Used to find out the position and direction of components
document.addEventListener('click', (e) => {
    // Get the intersection point on the component
    let intersects = mouseIntersectsModel(e, insideModel);
    if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;

        // Calculate the direction from the intersect point to the camera
        const direction = new THREE.Vector3().subVectors(camera.position, intersectPoint).normalize();

        // Calculate the distance from the camera to the intersect point
        const distance = camera.position.distanceTo(intersectPoint);

        // Log the result in the desired format
        const componentInfo = {
            position: {
                x: intersectPoint.x,
                y: intersectPoint.y,
                z: intersectPoint.z
            },
            direction: {
                x: direction.x,
                y: direction.y,
                z: direction.z
            },
            distance: distance // Distance between the camera and the component
        };

        console.log(componentInfo);
    }
}, false);

init();
animate();

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-50, 10, 1.5);

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    controls.maxDistance = 100;
    controls.target.set(0, 10, 1.5); // Set center of the orbit
    controls.enablePan = true;

    // Add light
    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-4, 5, 0).normalize();
    scene.add(directionalLight);

    // Initialize raycaster and mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Load models
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(insideModelPath, function (gltf) {
        insideModel = gltf.scene;
        scene.add(insideModel);
        // Hide the loader
        document.getElementById('loader-container').style.display = 'none';
        // Only start rotating once the model has loaded
        controls.autoRotate = true;
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
    document.addEventListener('mousemove', onMouseMove, false);

    document.querySelector('#info').addEventListener('mouseover', () => isMouseOverInfo = true, false);
    document.querySelector('#info').addEventListener('mouseout', () => isMouseOverInfo = false, false);
    document.querySelector('#toggle-info').addEventListener('mouseover', () => isMouseOverToggle = true, false);
    document.querySelector('#toggle-info').addEventListener('mouseout', () => isMouseOverToggle = false, false);

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function onDocumentKeyDown(event) {
    if (event.key === 'o') { // Press 'o' to toggle open/close
        toggleCase();
    }
    if (event.key === 'a') {
        goToComponent('alimentation');
    }
    if (event.key === 'p') {
        goToComponent('ports');
    }
    if (event.key === 'd') {
        goToComponent('disk_bay');
    }
    if (event.key === 'm') {
        goToComponent('monitor');
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
        if (!isMouseOverInfo && !isMouseOverToggle && mouseIntersectsModel(event, outsideModel).length > 0) {
            toggleCase();
        }
    }
}

function toggleCase() {
    if (insideModel && outsideModel) {
        isCaseOpen = !isCaseOpen;

        if (isCaseOpen) {
            controls.autoRotate = false;
            insideModel.visible = true;
            gsap.to(outsideModel.position, {
                x: openingDistance,
                duration: 1,
                ease: "power4.inOut"
            });
        } else {
            controls.autoRotate = true;
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

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    renderer.render(scene, camera);
}

function onMouseMove(event) {
    if (!outsideModel) return;

    // Show pointer cursor if the mouse is hovering over the Mac case
    if (!isMouseOverInfo && !isMouseOverToggle && mouseIntersectsModel(event, outsideModel).length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'inherit';
    }
}

function mouseIntersectsModel(event, model) {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObject(model, true);

    return intersects
}

function goToComponent(componentName) {
    const component = components[componentName];

    if (!component) {
        console.error(`Component ${componentName} not found !`);
        return;
    }

    const pos = component.position;
    const dir = new THREE.Vector3(component.direction.x, component.direction.y, component.direction.z);
    const dist = component.distance;

    // Open the case if it was closed
    if (!isCaseOpen) {
        toggleCase();
    }

    // Calculate the new camera position based on the direction vector and desired distance
    const newCameraPosition = new THREE.Vector3().copy(pos).add(dir.multiplyScalar(dist));

    // Animate the camera position and controls target
    gsap.to(camera.position, {
        x: newCameraPosition.x,
        y: newCameraPosition.y,
        z: newCameraPosition.z,
        duration: goToComponentDuration,
        ease: "power4.inOut",
        onUpdate: () => {
            camera.lookAt(pos);
            controls.update();
        }
    });

    gsap.to(controls.target, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: goToComponentDuration,
        ease: "power4.inOut",
        onUpdate: () => {
            controls.update();
        }
    });
}
