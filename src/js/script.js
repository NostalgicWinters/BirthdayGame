import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.y = 1.6;

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener('click', () => {
    controls.lock();
});

/* ---------------- Lights ---------------- */
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

/* ---------------- Floor ---------------- */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI / 2;

/* ---------------Roof --------------------*/
const roof = new THREE.Mesh(
    new THREE.PlaneGeometry(200,200),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
);
roof.rotation.x = Math.PI / 2;
roof.position.y = 6

scene.add(floor);
scene.add(roof)

/* ---------------- Test Box ---------------- */
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
box.position.set(0, 0.5, -5);
scene.add(box);

/* ---------------- Keyboard Input ---------------- */
const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

/* ---------------- Movement Physics ---------------- */
const moveSpeed = 0.1;
let velocityY = 0;
const gravity = -0.015;
const jumpStrength = 0.3;
let isGrounded = true;
const groundHeight = 1.6;
const direction = new THREE.Vector3();

const collidableObjects = [box];
const raycaster = new THREE.Raycaster();

function canMove(dir, distance) {
    raycaster.set(camera.position, dir.normalize());
    const hits = raycaster.intersectObjects(collidableObjects, false);
    return hits.length === 0 || hits[0].distance > distance;
}

const stepWidth = 3;
const stepHeight = 0.3;
const stepDepth = 0.6;
const stepCount = 10;

const stairMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });

const stairs = new THREE.Group();

for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(
        new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
        stairMaterial
    );

    step.position.set(
        0,
        (i * stepHeight) + stepHeight / 2,
        -i * stepDepth
    );

    stairs.add(step);

    // If you use collision:
    collidableObjects.push(step);
}

scene.add(stairs);

/* ---------------- Animation Loop ---------------- */
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {

        if (keys.KeyW) {
            controls.getDirection(direction);
            if (canMove(direction, moveSpeed)) controls.moveForward(moveSpeed);
        }

        if (keys.KeyS) {
            controls.getDirection(direction);
            direction.negate();
            if (canMove(direction, moveSpeed)) controls.moveForward(-moveSpeed);
        }

        if (keys.KeyA) {
            direction.setFromMatrixColumn(camera.matrix, 0).negate();
            if (canMove(direction, moveSpeed)) controls.moveRight(-moveSpeed);
        }

        if (keys.KeyD) {
            direction.setFromMatrixColumn(camera.matrix, 0);
            if (canMove(direction, moveSpeed)) controls.moveRight(moveSpeed);
        }

        // Jump
        if (keys.Space && isGrounded) {
            velocityY = jumpStrength;
            isGrounded = false;
        }

        // Gravity
        velocityY += gravity;
        camera.position.y += velocityY;

        // Ground collision
        if (camera.position.y <= groundHeight) {
            camera.position.y = groundHeight;
            velocityY = 0;
            isGrounded = true;
        }


    }

    renderer.render(scene, camera);
}

animate();

/* ---------------- Resize ---------------- */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});