import * as THREE from 'three';
export function gameColors() {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => new THREE.Color(css.getPropertyValue(name).trim());
  return { rose: color('--arcade-coral'), gold: color('--arcade-yellow'), mint: color('--arcade-mint'), ice: color('--arcade-ice'), ink: color('--arcade-ink'), wood: color('--arcade-wood'), grass: color('--arcade-grass'), white: color('--arcade-white') };
}
export function createScene(host: HTMLElement, width: number, length: number) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0, 0);
  renderer.domElement.setAttribute('aria-label', 'Tablero tridimensional');
  renderer.domElement.style.touchAction = 'none';
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, length * 1.7, length * 0.7);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(gameColors().white, gameColors().ink, 2.6));
  const light = new THREE.DirectionalLight(gameColors().white, 3.5);
  light.position.set(-4, 10, 5); light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = -10; light.shadow.camera.right = 10;
  light.shadow.camera.top = 10; light.shadow.camera.bottom = -10;
  scene.add(light);
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / Math.max(h, 1);
    // Maintain a full field in portrait and landscape hosts.
    const fit = Math.max(length, width / camera.aspect);
    camera.position.set(0, fit * 1.65, fit * 0.7); camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  const raycaster = new THREE.Raycaster();
  function ray(event: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    return raycaster;
  }
  function point(event: PointerEvent) {
    const target = new THREE.Vector3();
    return ray(event).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), target);
  }
  let frame = 0, prev = 0;
  function animate(tick?: (dt: number) => void) {
    const loop = (now: number) => {
      const dt = Math.min((now - (prev || now)) / 1000, 0.04); prev = now;
      tick?.(dt); renderer.render(scene, camera); frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
  }
  function dispose() {
    cancelAnimationFrame(frame); observer.disconnect();
    scene.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        for (const m of Array.isArray(obj.material) ? obj.material : [obj.material]) m.dispose();
      }
    });
    renderer.dispose(); renderer.domElement.remove();
  }
  return { scene, renderer, camera, ray, point, animate, dispose };
}
export function box(width: number, height: number, depth: number, color: THREE.Color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.1 }));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
export function disc(radius: number, height: number, color: THREE.Color) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 40), new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.25 }));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
