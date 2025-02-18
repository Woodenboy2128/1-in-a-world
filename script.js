// Set up the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create terrain using a plane with a heightmap
const size = 100;
const divisions = 50;
const geometry = new THREE.PlaneGeometry(size, size, divisions, divisions);

// Generate heightmap (realistic terrain with smooth hills and valleys)
for (let i = 0; i < geometry.attributes.position.count; i++) {
    let x = geometry.attributes.position.getX(i);
    let y = geometry.attributes.position.getY(i);
    let height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 5 + Math.random() * 3; // Adding some randomness for variety
    geometry.attributes.position.setZ(i, height);
}

geometry.computeVertexNormals(); // Make lighting work correctly

// Terrain Material (grass)
const material = new THREE.MeshStandardMaterial({ color: "green", wireframe: false });
const terrain = new THREE.Mesh(geometry, material);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5).normalize();
scene.add(light);

// Player movement & camera rotation
camera.position.y = 2; // Player's height from the ground (slightly above ground)
let moveSpeed = 0.3;
let lookSpeed = 0.02;
let keys = {};

// Camera tilt limits (we don't want to flip the camera upside down)
let cameraTiltX = 0; // Neutral tilt position (horizontal)
let cameraMaxTilt = Math.PI / 2 - 0.05; // Limit maximum tilt (looking down)
let cameraMinTilt = -Math.PI / 2 + 0.05; // Limit minimum tilt (looking up)

window.addEventListener("keydown", (event) => keys[event.key] = true);
window.addEventListener("keyup", (event) => keys[event.key] = false);

// Camera movement and rotation
function movePlayer() {
    let forward = new THREE.Vector3();
    camera.getWorldDirection(forward);

    // Move camera based on W/S keys (forward and backward movement)
    if (keys["w"]) camera.position.addScaledVector(forward, moveSpeed);
    if (keys["s"]) camera.position.addScaledVector(forward, -moveSpeed);

    // Left and Right movement (only horizontal turning, no tilt change)
    if (keys["a"]) camera.rotation.y += lookSpeed;
    if (keys["d"]) camera.rotation.y -= lookSpeed;

    // Left/Right Arrows should ONLY rotate horizontally (no tilt change)
    if (keys["ArrowLeft"]) camera.rotation.y += lookSpeed;
    if (keys["ArrowRight"]) camera.rotation.y -= lookSpeed;

    // Arrow Up/Down for tilt control
    // Look up (ArrowUp) - Increase the tilt (looking upwards)
    if (keys["ArrowUp"] && cameraTiltX < cameraMaxTilt) {
        cameraTiltX += lookSpeed;
        camera.rotation.x = cameraTiltX; // Apply tilt to camera
    }

    // Look down (ArrowDown) - Decrease the tilt (looking down)
    if (keys["ArrowDown"] && cameraTiltX > cameraMinTilt) {
        cameraTiltX -= lookSpeed;
        camera.rotation.x = cameraTiltX; // Apply tilt to camera
    }
}

// Game Loop
function animate() {
    requestAnimationFrame(animate);
    movePlayer();
    renderer.render(scene, camera);
}

animate();
