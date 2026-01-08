// ABOUTME: Three.js materials for graph visualization nodes and edges
// ABOUTME: Provides color-coded materials based on scrap type

import * as THREE from 'three';
import type { ScrapType } from '@/types';

// Node colors by type (matching implementation plan)
export const NODE_COLORS: Record<ScrapType, number> = {
  thought: 0x8b5cf6, // violet
  link: 0x06b6d4, // cyan
  image: 0xf59e0b, // amber
  snippet: 0x10b981, // emerald
  note: 0xec4899, // pink
};

// Edge color
export const EDGE_COLOR = 0x475569; // slate-600
export const EDGE_HIGHLIGHT_COLOR = 0x94a3b8; // slate-400

export interface NodeMaterial {
  normal: THREE.MeshStandardMaterial;
  hover: THREE.MeshStandardMaterial;
  selected: THREE.MeshStandardMaterial;
}

const materialCache = new Map<ScrapType, NodeMaterial>();

export function getNodeMaterials(type: ScrapType): NodeMaterial {
  if (materialCache.has(type)) {
    return materialCache.get(type)!;
  }

  const color = NODE_COLORS[type];

  const materials: NodeMaterial = {
    normal: new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.7,
    }),
    hover: new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.5,
    }),
    selected: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0.4,
      roughness: 0.3,
    }),
  };

  materialCache.set(type, materials);
  return materials;
}

export function createEdgeMaterial(highlighted = false): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: highlighted ? EDGE_HIGHLIGHT_COLOR : EDGE_COLOR,
    transparent: true,
    opacity: highlighted ? 0.8 : 0.4,
  });
}

export function disposeAllMaterials(): void {
  for (const materials of materialCache.values()) {
    materials.normal.dispose();
    materials.hover.dispose();
    materials.selected.dispose();
  }
  materialCache.clear();
}
