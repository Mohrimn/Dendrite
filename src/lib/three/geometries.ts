// ABOUTME: Three.js geometries for graph visualization nodes and edges
// ABOUTME: Creates sphere nodes and line edges for the knowledge graph

import * as THREE from 'three';
import type { GraphNode, GraphLink } from '@/services/graph';
import { getNodeMaterials, createEdgeMaterial } from './materials';

export const NODE_RADIUS = 2;
export const NODE_SEGMENTS = 16;

// Shared geometry for all nodes (instancing efficiency)
let sharedSphereGeometry: THREE.SphereGeometry | null = null;

function getSharedSphereGeometry(): THREE.SphereGeometry {
  if (!sharedSphereGeometry) {
    sharedSphereGeometry = new THREE.SphereGeometry(
      NODE_RADIUS,
      NODE_SEGMENTS,
      NODE_SEGMENTS
    );
  }
  return sharedSphereGeometry;
}

export interface NodeMesh extends THREE.Mesh {
  userData: {
    nodeId: string;
    nodeType: string;
    label: string;
  };
}

export function createNodeMesh(node: GraphNode): NodeMesh {
  const geometry = getSharedSphereGeometry();
  const materials = getNodeMaterials(node.type);
  const mesh = new THREE.Mesh(geometry, materials.normal);

  mesh.position.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
  mesh.userData = {
    nodeId: node.id,
    nodeType: node.type,
    label: node.label,
  };

  return mesh as unknown as NodeMesh;
}

export function createEdgeLine(
  link: GraphLink,
  sourcePos: THREE.Vector3,
  targetPos: THREE.Vector3
): THREE.Line {
  const points = [sourcePos, targetPos];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = createEdgeMaterial();
  const line = new THREE.Line(geometry, material);

  line.userData = {
    linkId: link.id,
    source: link.source,
    target: link.target,
    type: link.type,
    strength: link.strength,
  };

  return line;
}

export function updateEdgeLine(
  line: THREE.Line,
  sourcePos: THREE.Vector3,
  targetPos: THREE.Vector3
): void {
  const positions = line.geometry.attributes.position;
  if (positions) {
    positions.setXYZ(0, sourcePos.x, sourcePos.y, sourcePos.z);
    positions.setXYZ(1, targetPos.x, targetPos.y, targetPos.z);
    positions.needsUpdate = true;
  }
}

export function disposeSharedGeometries(): void {
  if (sharedSphereGeometry) {
    sharedSphereGeometry.dispose();
    sharedSphereGeometry = null;
  }
}
