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
camera.position.set(0,1.5,4);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

// Scene
const scene = new THREE.Scene();

// Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xff0000, 10);
scene.add(hemiLight);

const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(1, 4, 2);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Load GLTF Model
const loader = new GLTFLoader();
let model = null;
loader.load('src/models/drum_set/grand_piano/scene.gltf', function(gltf) {
    model = gltf.scene;
    scene.add(model);

    // Position and scale the model if needed
    model.position.set(-0.2, -1, 0);
    model.scale.set(1, 0.5, 0.5); // Adjust the scale as needed
}, undefined, function(error) {
    console.error('An error occurred while loading the model:', error);
});

function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // Rotate the model around the Y-axis
        model.rotation.y += 0.001;
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();


// src/models/drum_set/scene.gltf