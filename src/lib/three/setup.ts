// ABOUTME: Three.js scene setup for the knowledge graph visualization
// ABOUTME: Creates and configures the 3D scene, camera, renderer, and controls

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface GraphSceneConfig {
  container: HTMLElement;
  backgroundColor?: number;
  cameraPosition?: { x: number; y: number; z: number };
  enableDamping?: boolean;
  ambientLightIntensity?: number;
  pointLightIntensity?: number;
}

export interface GraphScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  nodeGroup: THREE.Group;
  edgeGroup: THREE.Group;
  dispose: () => void;
  resize: () => void;
  render: () => void;
}

const DEFAULT_CONFIG: Required<Omit<GraphSceneConfig, 'container'>> = {
  backgroundColor: 0x0f172a, // slate-900
  cameraPosition: { x: 0, y: 0, z: 100 },
  enableDamping: true,
  ambientLightIntensity: 0.6,
  pointLightIntensity: 0.8,
};

export function createGraphScene(config: GraphSceneConfig): GraphScene {
  const {
    container,
    backgroundColor,
    cameraPosition,
    enableDamping,
    ambientLightIntensity,
    pointLightIntensity,
  } = { ...DEFAULT_CONFIG, ...config };

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);

  // Camera
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = enableDamping;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 300;
  controls.enablePan = true;
  controls.autoRotate = false;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, pointLightIntensity);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  // Groups for organized rendering
  const nodeGroup = new THREE.Group();
  const edgeGroup = new THREE.Group();
  scene.add(edgeGroup); // Add edges first so they render behind nodes
  scene.add(nodeGroup);

  // Resize handler
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };

  // Render function
  const render = () => {
    controls.update();
    renderer.render(scene, camera);
  };

  // Cleanup function
  const dispose = () => {
    controls.dispose();
    renderer.dispose();

    // Remove all objects from groups
    nodeGroup.clear();
    edgeGroup.clear();

    // Remove renderer from DOM
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    // Dispose geometries and materials in scene
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    nodeGroup,
    edgeGroup,
    dispose,
    resize,
    render,
  };
}
