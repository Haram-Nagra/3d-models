import * as THREE from 'three';
import {OrbitControls} from 'jsm/controls/OrbitControls.js'

const w= window.innerWidth;
const h= window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias:true})
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement)

// camera

const fov=75;
const aspect =w/h;
const near =0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov,aspect,near,far)
camera.position.z=2;

//controls

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=0.03;




// scene

const scene =new THREE.Scene();
const geo= new THREE.IcosahedronGeometry(1,2);
const mat = new THREE.MeshStandardMaterial({
    color:0xffffff,
    flatShading:true
})



const mesh =new THREE.Mesh(geo,mat);
scene.add(mesh)

//wire frame

const wiremat= new THREE.MeshBasicMaterial({
    color :"gold",
    wireframe: true
}
);

const wiremesh =new THREE.Mesh(geo,wiremat);
wiremesh.scale.setScalar(1.1);


scene.add(wiremesh)
mesh.add(wiremesh)
// light

const hemiLight =new THREE.HemisphereLight('red','white')
scene.add(hemiLight)

function animate(t=0){
    requestAnimationFrame(animate);
    mesh.rotation.y=t*0.001;
    renderer.render(scene,camera)
}


animate();
