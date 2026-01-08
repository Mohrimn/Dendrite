// ABOUTME: 3D graph visualization canvas using Three.js
// ABOUTME: Renders knowledge graph with force-directed layout

import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import type { Scrap } from '@/types';
import type { Connection } from '@/types/connection';
import {
  graphBuilder,
  createForceSimulation,
  type GraphNode,
  type ForceSimulationResult,
} from '@/services/graph';
import {
  createGraphScene,
  createNodeMesh,
  createEdgeLine,
  updateEdgeLine,
  getNodeMaterials,
  type GraphScene,
  type NodeMesh,
} from '@/lib/three';

// Stable empty array to prevent unnecessary re-renders
const EMPTY_CONNECTIONS: Connection[] = [];

interface GraphCanvasProps {
  scraps: Scrap[];
  connections?: Connection[];
  onNodeClick?: (scrapId: string) => void;
  onNodeHover?: (scrapId: string | null) => void;
  selectedNodeId?: string | null;
  className?: string;
}

export interface GraphCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  reheat: () => void;
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas(
    {
      scraps,
      connections = EMPTY_CONNECTIONS,
      onNodeClick,
      onNodeHover,
      selectedNodeId,
      className = '',
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<GraphScene | null>(null);
    const simulationRef = useRef<ForceSimulationResult | null>(null);
    const nodeMeshesRef = useRef<Map<string, NodeMesh>>(new Map());
    const edgeLinesRef = useRef<Map<string, THREE.Line>>(new Map());
    const animationFrameRef = useRef<number>(0);
    const hoveredNodeRef = useRef<string | null>(null);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const initialCameraPosition = useRef({ x: 0, y: 0, z: 100 });

    const [isInitialized, setIsInitialized] = useState(false);

    // Expose control methods via ref
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (sceneRef.current) {
          const camera = sceneRef.current.camera;
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          camera.position.addScaledVector(direction, 20);
        }
      },
      zoomOut: () => {
        if (sceneRef.current) {
          const camera = sceneRef.current.camera;
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          camera.position.addScaledVector(direction, -20);
        }
      },
      resetView: () => {
        if (sceneRef.current) {
          const camera = sceneRef.current.camera;
          camera.position.set(
            initialCameraPosition.current.x,
            initialCameraPosition.current.y,
            initialCameraPosition.current.z
          );
          camera.lookAt(0, 0, 0);
          sceneRef.current.controls.target.set(0, 0, 0);
        }
      },
      reheat: () => {
        if (simulationRef.current) {
          simulationRef.current.reheat();
        }
      },
    }));

    // Build graph and simulation
    const buildGraph = useCallback(() => {
      if (!sceneRef.current) return;

      const scene = sceneRef.current;
      const nodeMeshes = nodeMeshesRef.current;
      const edgeLines = edgeLinesRef.current;

      // Clear existing meshes
      for (const mesh of nodeMeshes.values()) {
        scene.nodeGroup.remove(mesh);
      }
      for (const line of edgeLines.values()) {
        scene.edgeGroup.remove(line);
      }
      nodeMeshes.clear();
      edgeLines.clear();

      // Stop existing simulation
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      if (scraps.length === 0) return;

      // Build graph data
      const allConnections =
        connections.length > 0 ? connections : graphBuilder.findConnections(scraps);
      const graphData = graphBuilder.build(scraps, allConnections);

      // Create simulation with tuned parameters
      simulationRef.current = createForceSimulation(graphData, {
        chargeStrength: -80,
        linkDistance: 40,
        alphaDecay: 0.02,
        velocityDecay: 0.4,
      });

      // Create node meshes
      for (const node of simulationRef.current.nodes) {
        const mesh = createNodeMesh(node as GraphNode);
        nodeMeshes.set(node.id, mesh);
        scene.nodeGroup.add(mesh);
      }

      // Create edge lines
      for (const link of simulationRef.current.links) {
        const sourceId =
          typeof link.source === 'string' ? link.source : link.source.id;
        const targetId =
          typeof link.target === 'string' ? link.target : link.target.id;

        const sourceMesh = nodeMeshes.get(sourceId);
        const targetMesh = nodeMeshes.get(targetId);

        if (sourceMesh && targetMesh) {
          const line = createEdgeLine(
            {
              id: link.id,
              source: sourceId,
              target: targetId,
              type: link.type,
              strength: link.strength,
            },
            sourceMesh.position,
            targetMesh.position
          );
          edgeLines.set(link.id, line);
          scene.edgeGroup.add(line);
        }
      }
    }, [scraps, connections]);

    // Animation loop
    const animate = useCallback(() => {
      if (!sceneRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const scene = sceneRef.current;
      const simulation = simulationRef.current;
      const nodeMeshes = nodeMeshesRef.current;
      const edgeLines = edgeLinesRef.current;

      // Only tick simulation if it's still active
      if (simulation) {
        const alpha = simulation.simulation.alpha();

        // Only update positions if simulation is still warm
        if (alpha > 0.001) {
          simulation.tick();

          // Update node positions
          for (const node of simulation.nodes) {
            const mesh = nodeMeshes.get(node.id);
            if (mesh) {
              mesh.position.set(node.x, node.y, node.z);
            }
          }

          // Update edge positions
          for (const link of simulation.links) {
            const sourceNode =
              typeof link.source === 'string'
                ? simulation.nodes.find((n) => n.id === link.source)
                : link.source;
            const targetNode =
              typeof link.target === 'string'
                ? simulation.nodes.find((n) => n.id === link.target)
                : link.target;

            if (sourceNode && targetNode) {
              const line = edgeLines.get(link.id);
              if (line) {
                updateEdgeLine(
                  line,
                  new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
                  new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z)
                );
              }
            }
          }
        }
      }

      // Always render (for orbit controls to work smoothly)
      scene.render();

      animationFrameRef.current = requestAnimationFrame(animate);
    }, []);

    // Handle mouse move for raycasting
    const handleMouseMove = useCallback(
      (event: MouseEvent) => {
        if (!containerRef.current || !sceneRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(
          mouseRef.current,
          sceneRef.current.camera
        );

        const intersects = raycasterRef.current.intersectObjects(
          Array.from(nodeMeshesRef.current.values())
        );

        const newHoveredId =
          intersects.length > 0
            ? (intersects[0].object as NodeMesh).userData.nodeId
            : null;

        if (newHoveredId !== hoveredNodeRef.current) {
          // Reset previous hover
          if (hoveredNodeRef.current) {
            const prevMesh = nodeMeshesRef.current.get(hoveredNodeRef.current);
            if (prevMesh && hoveredNodeRef.current !== selectedNodeId) {
              const materials = getNodeMaterials(
                prevMesh.userData.nodeType as Scrap['type']
              );
              prevMesh.material = materials.normal;
            }
          }

          // Set new hover
          if (newHoveredId && newHoveredId !== selectedNodeId) {
            const newMesh = nodeMeshesRef.current.get(newHoveredId);
            if (newMesh) {
              const materials = getNodeMaterials(
                newMesh.userData.nodeType as Scrap['type']
              );
              newMesh.material = materials.hover;
            }
          }

          hoveredNodeRef.current = newHoveredId;
          onNodeHover?.(newHoveredId);
        }
      },
      [onNodeHover, selectedNodeId]
    );

    // Handle click
    const handleClick = useCallback(() => {
      if (hoveredNodeRef.current) {
        onNodeClick?.(hoveredNodeRef.current);
      }
    }, [onNodeClick]);

    // Update selected node material
    useEffect(() => {
      const nodeMeshes = nodeMeshesRef.current;

      // Reset all materials
      for (const [nodeId, mesh] of nodeMeshes) {
        const materials = getNodeMaterials(
          mesh.userData.nodeType as Scrap['type']
        );
        if (nodeId === selectedNodeId) {
          mesh.material = materials.selected;
        } else if (nodeId === hoveredNodeRef.current) {
          mesh.material = materials.hover;
        } else {
          mesh.material = materials.normal;
        }
      }
    }, [selectedNodeId]);

    // Initialize scene
    useEffect(() => {
      if (!containerRef.current) return;

      sceneRef.current = createGraphScene({
        container: containerRef.current,
      });

      setIsInitialized(true);

      // Handle resize
      const handleResize = () => {
        sceneRef.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameRef.current);
        simulationRef.current?.stop();
        sceneRef.current?.dispose();
      };
    }, []);

    // Build graph when scraps change
    useEffect(() => {
      if (isInitialized) {
        buildGraph();
      }
    }, [isInitialized, buildGraph]);

    // Start animation loop
    useEffect(() => {
      if (isInitialized) {
        animate();
      }
      return () => {
        cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isInitialized, animate]);

    // Setup event listeners
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('click', handleClick);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('click', handleClick);
      };
    }, [handleMouseMove, handleClick]);

    return (
      <div
        ref={containerRef}
        className={`w-full h-full ${className}`}
        style={{ cursor: hoveredNodeRef.current ? 'pointer' : 'grab' }}
      />
    );
  }
);
