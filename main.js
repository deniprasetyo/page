import * as THREE from "three";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x161a24, 0.045);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 9);

// --- lighting: cold ambient moonlight + warm lantern glow ---
scene.add(new THREE.AmbientLight(0x3a4258, 1.1));

const moon = new THREE.DirectionalLight(0x8fa3c9, 0.6);
moon.position.set(-4, 6, 3);
scene.add(moon);

const lanternLeft = new THREE.PointLight(0xd99a4e, 2.2, 8);
lanternLeft.position.set(-2.3, 1.6, 2.4);
scene.add(lanternLeft);

const lanternRight = new THREE.PointLight(0xd99a4e, 2.2, 8);
lanternRight.position.set(2.3, 1.6, 2.4);
scene.add(lanternRight);

// --- materials ---
const woodMat = new THREE.MeshStandardMaterial({ color: 0x7a2e26, roughness: 0.85, metalness: 0.05 });
const capMat = new THREE.MeshStandardMaterial({ color: 0x1c1e24, roughness: 0.7, metalness: 0.1 });
const groundMat = new THREE.MeshStandardMaterial({ color: 0x11141c, roughness: 1 });

// --- torii gate group ---
const torii = new THREE.Group();

const pillarGeo = new THREE.CylinderGeometry(0.14, 0.16, 3.6, 12);
const pillarL = new THREE.Mesh(pillarGeo, woodMat);
pillarL.position.set(-1.9, 1.8, 0);
torii.add(pillarL);

const pillarR = new THREE.Mesh(pillarGeo, woodMat);
pillarR.position.set(1.9, 1.8, 0);
torii.add(pillarR);

const kasagiGeo = new THREE.BoxGeometry(4.6, 0.22, 0.34);
const kasagi = new THREE.Mesh(kasagiGeo, capMat);
kasagi.position.set(0, 3.5, 0);
torii.add(kasagi);

const kasagiTopGeo = new THREE.BoxGeometry(5.0, 0.16, 0.42);
const kasagiTop = new THREE.Mesh(kasagiTopGeo, capMat);
kasagiTop.position.set(0, 3.68, 0);
torii.add(kasagiTop);

const nukiGeo = new THREE.BoxGeometry(3.9, 0.18, 0.22);
const nuki = new THREE.Mesh(nukiGeo, woodMat);
nuki.position.set(0, 2.7, 0);
torii.add(nuki);

const gakuGeo = new THREE.BoxGeometry(0.55, 0.5, 0.08);
const gaku = new THREE.Mesh(gakuGeo, new THREE.MeshStandardMaterial({ color: 0x1a1c22 }));
gaku.position.set(0, 3.08, 0.18);
torii.add(gaku);

torii.position.z = 1.5;
scene.add(torii);

// ground plane
const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
scene.add(ground);

// --- fireflies / embers ---
const fireflyCount = 140;
const positions = new Float32Array(fireflyCount * 3);
for (let i = 0; i < fireflyCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 16;
  positions[i * 3 + 1] = Math.random() * 4 + 0.2;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
}
const fireflyGeo = new THREE.BufferGeometry();
fireflyGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const fireflyMat = new THREE.PointsMaterial({
  color: 0xd9b56a,
  size: 0.06,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
scene.add(fireflies);

// --- interaction: gentle parallax from scroll + pointer, no aggressive motion ---
let scrollFraction = 0;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollFraction = max > 0 ? window.scrollY / max : 0;
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

let pointerX = 0;
window.addEventListener("pointermove", (e) => {
  pointerX = (e.clientX / window.innerWidth) * 2 - 1;
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // camera drifts slowly downward and forward as the page scrolls,
  // as if walking further down the path toward the gate
  camera.position.y = 1.6 - scrollFraction * 0.6;
  camera.position.z = 9 - scrollFraction * 4;
  camera.position.x = reduceMotion ? 0 : pointerX * 0.4;
  camera.lookAt(0, 1.8, 0);

  lanternLeft.intensity = 2.0 + Math.sin(t * 2.1) * 0.3;
  lanternRight.intensity = 2.0 + Math.sin(t * 1.7 + 1.3) * 0.3;

  if (!reduceMotion) {
    const pos = fireflyGeo.attributes.position;
    for (let i = 0; i < fireflyCount; i++) {
      const idx = i * 3;
      pos.array[idx + 1] += Math.sin(t * 0.6 + i) * 0.0025;
      pos.array[idx] += Math.cos(t * 0.4 + i) * 0.0015;
    }
    pos.needsUpdate = true;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
