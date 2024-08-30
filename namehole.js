import { OrbitControls } from "jsm/controls/OrbitControls.js";
import spline from "./spline.js";
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";
import { FontLoader } from "jsm/loaders/FontLoader.js";
import { TextGeometry } from "jsm/geometries/TextGeometry.js";
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

// post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 100);
bloomPass.threshold = 0.002;
bloomPass.strength = 1.9;
bloomPass.radius = 0.1;
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const tubeGeometry = new THREE.TubeGeometry(spline, 222, 0.65, 16, true);
const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true
});
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
// scene.add(tubeMesh)

const edges = new THREE.EdgesGeometry(tubeGeometry, 0.2);
const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
const tubeLines = new THREE.LineSegments(edges, lineMat);
scene.add(tubeLines);

// Font and Text Setup
const loader = new FontLoader();
loader.load('/Roboto_Regular.json', function (font) {
    const numLetters = 40;
    const text = "NAGRA";
    const size = 0.3;
    const height = 0.1;
    const curveSegments = 12;
    const bevelEnabled = false;

    for (let i = 0; i < numLetters; i += 1) {
        const letter = text[i % text.length];
        const textGeo = new TextGeometry(letter, {
            font: font,
            size: size,
            height: height,
            curveSegments: curveSegments,
            bevelEnabled: bevelEnabled
        });

        const textMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            // wireframe: true
        });

        const textMesh = new THREE.Mesh(textGeo, textMat);
        const p = (i / numLetters + Math.random() * 0.1) % 1;
        const pos = tubeGeometry.parameters.path.getPointAt(p);
        pos.x += Math.random() - 0.4;
        pos.z += Math.random() - 0.4;
        textMesh.position.copy(pos);

        const rote = new THREE.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        textMesh.rotation.set(rote.x, rote.y, rote.z);

        const edges = new THREE.EdgesGeometry(textGeo);
        const color = new THREE.Color().setHSL(1.0 - p, 1, 0.5);
        const lineMat = new THREE.LineBasicMaterial({ color});
        const textLines = new THREE.LineSegments(edges, lineMat);

        textLines.position.copy(pos);
        textLines.rotation.set(rote.x, rote.y, rote.z);

        // scene.add(textMesh);
        scene.add(textLines);
    }
});

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(hemiLight);

function updateCamera(t) {
    const time = t * 0.5;
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
    composer.render(); // Render using the composer
    controls.update();
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size
}
window.addEventListener("resize", handleWindowResize, false);
