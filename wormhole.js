import { OrbitControls } from "jsm/controls/OrbitControls.js";
import spline from "./spline.js";
import * as THREE from "three";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.3);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
THREE.ColorManagement.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
// scene.add(tubeMesh);

const edges = new THREE.EdgesGeometry(tubeGeometry, 0.2);
const lineMat = new THREE.LineBasicMaterial({ color: 0xfffffff });
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);



const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

function updateCamera(t) {
    const time = t * 0.2;
    const looptime = 20 * 1000;
    const tNorm = (time % looptime) / looptime;
    const pos = tubeGeometry.parameters.path.getPointAt(tNorm);
    const lookAt = tubeGeometry.parameters.path.getPointAt((tNorm + 0.03) % 1);
    camera.position.copy(pos);
    camera.lookAt(lookAt);
}

function animate(t = 0) {
    requestAnimationFrame(animate);
    updateCamera(t);
    renderer.render(scene, camera);
    controls.update();
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
