// ABOUTME: Three.js scene setup for the knowledge graph visualization
// ABOUTME: Creates and configures the 3D scene, camera, renderer, and controls

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface GraphSceneConfig {
  container: HTMLElement;
  backgroundColor?: number;
  cameraPosition?: { x: number; y: number; z: number };
  enableDamping?: boolean;
  ambientLightIntensity?: number;
  pointLightIntensity?: number;
  enableBloom?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  enableParticles?: boolean;
  particleCount?: number;
}

export interface GraphScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  nodeGroup: THREE.Group;
  edgeGroup: THREE.Group;
  particleGroup: THREE.Group | null;
  composer: EffectComposer | null;
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
  enableBloom: true,
  bloomStrength: 0.8,
  bloomRadius: 0.4,
  bloomThreshold: 0.2,
  enableParticles: true,
  particleCount: 200,
};

export function createGraphScene(config: GraphSceneConfig): GraphScene {
  const {
    container,
    backgroundColor,
    cameraPosition,
    enableDamping,
    ambientLightIntensity,
    pointLightIntensity,
    enableBloom,
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    enableParticles,
    particleCount,
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

  // Post-processing with bloom
  let composer: EffectComposer | null = null;
  if (enableBloom) {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    composer.addPass(bloomPass);
  }

  // Ambient particles for atmosphere
  let particleGroup: THREE.Group | null = null;
  if (enableParticles) {
    particleGroup = new THREE.Group();
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread particles in a large sphere around the scene
      const radius = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Subtle blue/purple tint
      colors[i3] = 0.4 + Math.random() * 0.2;
      colors[i3 + 1] = 0.4 + Math.random() * 0.3;
      colors[i3 + 2] = 0.6 + Math.random() * 0.4;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particleGroup.add(particles);
    scene.add(particleGroup);
  }

  // Resize handler
  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    if (composer) {
      composer.setSize(width, height);
    }
  };

  // Render function
  const render = () => {
    controls.update();

    // Slowly rotate particles for ambient effect
    if (particleGroup) {
      particleGroup.rotation.y += 0.0002;
      particleGroup.rotation.x += 0.0001;
    }

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  };

  // Cleanup function
  const dispose = () => {
    controls.dispose();
    renderer.dispose();
    if (composer) {
      composer.dispose();
    }

    // Remove all objects from groups
    nodeGroup.clear();
    edgeGroup.clear();
    if (particleGroup) {
      particleGroup.clear();
    }

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
      if (object instanceof THREE.Points) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
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
    particleGroup,
    composer,
    dispose,
    resize,
    render,
  };
}
