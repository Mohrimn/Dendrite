// ABOUTME: Three.js utilities barrel export
// ABOUTME: Exports scene setup, materials, and geometries for graph visualization

export { createGraphScene, type GraphScene, type GraphSceneConfig } from './setup';
export {
  NODE_COLORS,
  EDGE_COLOR,
  EDGE_HIGHLIGHT_COLOR,
  getNodeMaterials,
  createEdgeMaterial,
  disposeAllMaterials,
  type NodeMaterial,
} from './materials';
export {
  NODE_RADIUS,
  NODE_SEGMENTS,
  createNodeMesh,
  createEdgeLine,
  updateEdgeLine,
  disposeSharedGeometries,
  type NodeMesh,
} from './geometries';
