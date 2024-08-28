import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Camera
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0,1.5,2);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Scene
const scene = new THREE.Scene();

// Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 10);
scene.add(hemiLight);

const spotLight = new THREE.SpotLight(0xffffff, 10);
spotLight.position.set(1, 4, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Load GLTF Model
const loader = new GLTFLoader();
let model = null;
loader.load('src/models/drum_set/scene.gltf', function(gltf) {
    model = gltf.scene;
    scene.add(model);

    // Position and scale the model if needed
    model.position.set(-0.2, -1, 0);
    model.scale.set(0.5, 0.5, 0.5); // Adjust the scale as needed
}, undefined, function(error) {
    console.error('An error occurred while loading the model:', error);
});

let startTime = null;
const oscillationDuration = 5000; // Duration of the full oscillation in milliseconds

function updateCamera(t) {
    if (model) {
        if (startTime === null) {
            startTime = t;
        }

        // Calculate the elapsed time since the start of the oscillation
        const elapsedTime = t - startTime;

        // Normalize elapsed time to a range of [0, 1]
        const normalizedTime = Math.min(elapsedTime / oscillationDuration, 1);

        // Calculate the position based on the normalized time using a sine wave
        const originalPosition = new THREE.Vector3(0, 1.5, 1); // Original position
        const targetPosition = new THREE.Vector3(0, 1.5, 8); // Target position
        const lerpFactor = (Math.sin(normalizedTime * Math.PI) + 1) / 2; // Smooth oscillation
        const currentPosition = new THREE.Vector3().lerpVectors(originalPosition, targetPosition, lerpFactor);

        // Smoothly update camera position
        const moveSpeed = 0.01;
        camera.position.lerp(currentPosition, moveSpeed);

        // Move the controls target towards the model position
        const panSpeed = 0.01;
        controls.target.lerp(model.position, panSpeed);

        // Update the camera's lookAt position
        camera.lookAt(controls.target);

        // Stop the animation after one complete oscillation
        if (normalizedTime >= 100) {
            return; // Stop updating the camera
        }
    }
}


function animate(t=0) {
    requestAnimationFrame(animate);
    updateCamera(t);
    controls.update();
    renderer.render(scene, camera);
}

animate();
