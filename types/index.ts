/**
 * TypeScript type definitions for the Mindmap Application
 */

import { NodeChange, EdgeChange } from '@xyflow/react';

/**
 * Position interface for node coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Hierarchical node structure as stored in JSON
 */
export interface HierarchicalNode {
  id: string;
  label: string;
  type: 'root' | 'child' | 'grandchild';
  summary: string;
  details: string;
  position?: Position;
  children?: HierarchicalNode[];
}

/**
 * Flat mindmap node compatible with React Flow
 * Extends React Flow's Node type with custom data
 */
export interface MindMapNode {
  id: string;
  type: string;
  position: Position;
  data: {
    label: string;
    nodeType: 'root' | 'child' | 'grandchild';
    summary: string;
    details: string;
    depth: number;
    hasChildren: boolean;
    isExpanded?: boolean;
    childCount?: number; // Number of direct children
  };
}

/**
 * Mindmap edge connecting nodes
 * Compatible with React Flow's Edge type
 */
export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
}

/**
 * Store state interface for Zustand
 */
export interface MindMapStore {
  // State
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  selectedNodeId: string | null;
  hierarchicalData: HierarchicalNode | null;
  collapsedNodeIds: Set<string>;

  // Actions
  initializeFromData: (data: HierarchicalNode) => void;
  setNodes: (nodes: MindMapNode[]) => void;
  setEdges: (edges: MindMapEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  updateNodeLabel: (nodeId: string, newLabel: string) => void;
  updateNodeSummary: (nodeId: string, newSummary: string) => void;
  updateNodeDetails: (nodeId: string, newDetails: string) => void;
  selectNode: (nodeId: string | null) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  addNode: (parentId: string, newNode: Partial<HierarchicalNode>) => void;
  deleteNode: (nodeId: string) => void;
  resetLayout: () => void;
}
