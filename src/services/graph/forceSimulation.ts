// ABOUTME: Force-directed graph simulation using d3-force-3d
// ABOUTME: Positions graph nodes in 3D space using physics simulation

import {
  forceSimulation as d3ForceSimulation,
  forceLink as d3ForceLink,
  forceManyBody as d3ForceManyBody,
  forceCenter as d3ForceCenter,
} from 'd3-force-3d';
import type { GraphNode, GraphLink, GraphData } from './graphBuilder';

// d3-force-3d types (library doesn't have TypeScript definitions)
interface SimulationNode extends GraphNode {
  index?: number;
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
}

interface SimulationLink extends Omit<GraphLink, 'source' | 'target'> {
  source: SimulationNode | string;
  target: SimulationNode | string;
  index?: number;
}

type Simulation = ReturnType<typeof d3ForceSimulation>;

export interface ForceSimulationConfig {
  linkDistance?: number;
  linkStrength?: number;
  chargeStrength?: number;
  centerStrength?: number;
  alphaDecay?: number;
  velocityDecay?: number;
}

export interface ForceSimulationResult {
  simulation: Simulation;
  nodes: SimulationNode[];
  links: SimulationLink[];
  stop: () => void;
  restart: () => void;
  reheat: () => void;
  tick: () => void;
}

const DEFAULT_CONFIG: Required<ForceSimulationConfig> = {
  linkDistance: 30,
  linkStrength: 0.5,
  chargeStrength: -100,
  centerStrength: 0.05,
  alphaDecay: 0.01,
  velocityDecay: 0.3,
};

export function createForceSimulation(
  data: GraphData,
  config: ForceSimulationConfig = {}
): ForceSimulationResult {
  const {
    linkDistance,
    linkStrength,
    chargeStrength,
    centerStrength,
    alphaDecay,
    velocityDecay,
  } = { ...DEFAULT_CONFIG, ...config };

  // Initialize node positions with random spread
  const nodes: SimulationNode[] = data.nodes.map((node) => ({
    ...node,
    x: node.x ?? (Math.random() - 0.5) * 100,
    y: node.y ?? (Math.random() - 0.5) * 100,
    z: node.z ?? (Math.random() - 0.5) * 100,
  }));

  // Create links with references to nodes
  const links: SimulationLink[] = data.links.map((link) => ({
    ...link,
    source: link.source,
    target: link.target,
  }));

  // Create simulation
  const simulation = d3ForceSimulation(nodes, 3) // 3 dimensions
    .force(
      'link',
      d3ForceLink(links)
        .id((d) => (d as SimulationNode).id)
        .distance(linkDistance)
        .strength(linkStrength)
    )
    .force('charge', d3ForceManyBody().strength(chargeStrength))
    .force('center', d3ForceCenter(0, 0, 0).strength(centerStrength))
    .alphaDecay(alphaDecay)
    .velocityDecay(velocityDecay);

  const stop = () => {
    simulation.stop();
  };

  const restart = () => {
    simulation.restart();
  };

  const reheat = () => {
    simulation.alpha(1).restart();
  };

  const tick = () => {
    simulation.tick();
  };

  return {
    simulation,
    nodes,
    links,
    stop,
    restart,
    reheat,
    tick,
  };
}

export function getNodePosition(
  node: SimulationNode
): { x: number; y: number; z: number } {
  return {
    x: node.x,
    y: node.y,
    z: node.z,
  };
}
