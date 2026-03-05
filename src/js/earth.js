import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const fov = 75
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1
const far = 100;
const camera = new THREE.PerspectiveCamera(fov , aspect , near, far)
camera.position.z = 3

const orbitControls = new OrbitControls(camera, renderer.domElement)

const scene = new THREE.Scene()

const texLoader = new THREE.TextureLoader()
const geo = new THREE.IcosahedronGeometry(1,12)
const mat = new THREE.MeshStandardMaterial(
    {
        map: texLoader.load("../src/resources/textureMaps/earthmap1k.jpg")
    }
)
const earthMesh = new THREE.Mesh(geo, mat);
scene.add(earthMesh);

// const wireMat = new THREE.MeshBasicMaterial(
//     {
//         color: 0x00ccff,
//         wireframe: true
//     }
// )

// const wireMesh = new THREE.Mesh(geo,wireMat)

// wireMesh.scale.setScalar(1.001)
// earthMesh.add(wireMesh)

const hemilight = new THREE.AmbientLight(0xffffff,0.5)

function animate() {
  requestAnimationFrame(animate)
  earthMesh.rotation.y += 0.005
  earthMesh.rotation.z =-( 23.5 * Math.PI / 180)
  orbitControls.update()
  renderer.render(scene, camera)
}
scene.add(hemilight)

const geoStar = new THREE.IcosahedronGeometry(1, 12)
const matStar = new THREE.MeshBasicMaterial(
    {
        color: 0xffffff
    }
)

function addStars(count) {
    for (let i = 0; i < count; i++) {
        const star = new THREE.Mesh(geoStar, matStar);
        star.position.set(
            THREE.MathUtils.randFloatSpread(50),
            THREE.MathUtils.randFloatSpread(50),
            THREE.MathUtils.randFloatSpread(50)
        );
        star.scale.setScalar(0.02);
        scene.add(star);
    }
}

addStars(1000)

animate()