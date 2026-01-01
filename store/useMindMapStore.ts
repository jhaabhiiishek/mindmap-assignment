import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { MindMapNode, MindMapEdge, HierarchicalNode } from '@/types';
import {
    flattenHierarchy,
    calculateLayout,
    filterCollapsedNodes,
    updateHierarchicalData,
    addNodeToHierarchy,
} from '@/lib/dataTransform';

interface MapData {
    id: string;
    name: string;
    createdAt: Date;
    hierarchicalData: HierarchicalNode;
    collapsedNodeIds: Set<string>;
}

interface MultiMapStore {
    // Multi-map state
    maps: MapData[];
    activeMapId: string;

    // Current map state
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    selectedNodeId: string | null;
    hierarchicalData: HierarchicalNode | null;
    collapsedNodeIds: Set<string>;

    // Multi-map actions
    createMap: (name?: string, template?: HierarchicalNode) => void;
    switchMap: (mapId: string) => void;
    deleteMap: (mapId: string) => void;

    // Existing actions
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

// Default template for new maps
const createDefaultTemplate = (name: string): HierarchicalNode => ({
    id: 'root',
    label: name,
    type: 'root',
    summary: 'New mindmap',
    details: 'Click nodes to expand and explore',
    children: [],
});

export const useMindMapStore = create<MultiMapStore>()(
    persist(
        (set, get) => ({
            // Initial state
            maps: [],
            activeMapId: '',
            nodes: [],
            edges: [],
            selectedNodeId: null,
            hierarchicalData: null,
            collapsedNodeIds: new Set<string>(),

            // Multi-map actions
            createMap: (name?: string, template?: HierarchicalNode) => {
                const mapId = `map-${Date.now()}`;
                const mapName = name || `Map ${get().maps.length + 1}`;
                const hierarchicalData = template || createDefaultTemplate(mapName);

                const newMap: MapData = {
                    id: mapId,
                    name: mapName,
                    createdAt: new Date(),
                    hierarchicalData,
                    collapsedNodeIds: new Set(),
                };

                set((state) => ({
                    maps: [...state.maps, newMap],
                    activeMapId: mapId,
                }));

                // Load the new map
                get().initializeFromData(hierarchicalData);
            },

            switchMap: (mapId: string) => {
                const { maps } = get();
                const map = maps.find((m) => m.id === mapId);

                if (!map) return;

                // Set active map ID first
                set({ activeMapId: mapId });

                // Ensure collapsedNodeIds is a Set (might be array from localStorage)
                const collapsedIds = map.collapsedNodeIds instanceof Set
                    ? map.collapsedNodeIds
                    : new Set(map.collapsedNodeIds || []);

                // Flatten the hierarchical data to get all nodes and edges
                const { nodes: allNodes, edges: allEdges } = flattenHierarchy(map.hierarchicalData);

                // Filter based on collapsed state
                const { nodes: visibleNodes, edges: visibleEdges } = filterCollapsedNodes(
                    allNodes,
                    allEdges,
                    collapsedIds
                );

                // Calculate layout for visible nodes
                const layoutedNodes = calculateLayout(visibleNodes, visibleEdges);

                // Update state with the new map data
                set({
                    hierarchicalData: map.hierarchicalData,
                    nodes: layoutedNodes,
                    edges: visibleEdges,
                    collapsedNodeIds: collapsedIds,
                    selectedNodeId: null, // Clear selection when switching maps
                });
            },

            deleteMap: (mapId: string) => {
                const { maps, activeMapId } = get();

                if (maps.length <= 1) {
                    alert('Cannot delete the last map');
                    return;
                }

                const newMaps = maps.filter((m) => m.id !== mapId);
                set({ maps: newMaps });

                // If deleting active map, switch to first remaining map
                if (activeMapId === mapId) {
                    get().switchMap(newMaps[0].id);
                }
            },

            // Existing actions (updated to sync with active map)
            initializeFromData: (data: HierarchicalNode) => {
                const { nodes, edges } = flattenHierarchy(data);
                const layoutedNodes = calculateLayout(nodes, edges);

                set({
                    hierarchicalData: data,
                    nodes: layoutedNodes,
                    edges,
                    selectedNodeId: null,
                });

                // Save to active map
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId
                        ? { ...m, hierarchicalData: data }
                        : m
                );
                set({ maps: updatedMaps });
            },

            setNodes: (nodes: MindMapNode[]) => {
                set({ nodes });
            },

            setEdges: (edges: MindMapEdge[]) => {
                set({ edges });
            },

            onNodesChange: (changes: NodeChange[]) => {
                set({ nodes: applyNodeChanges(changes, get().nodes) });
            },

            onEdgesChange: (changes: EdgeChange[]) => {
                set({ edges: applyEdgeChanges(changes, get().edges) });
            },

            updateNodeLabel: (nodeId: string, newLabel: string) => {
                const { hierarchicalData, nodes } = get();
                if (!hierarchicalData) return;

                const updatedHierarchy = updateHierarchicalData(hierarchicalData, nodeId, {
                    label: newLabel,
                });

                const updatedNodes = nodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, label: newLabel } }
                        : node
                );

                set({
                    hierarchicalData: updatedHierarchy,
                    nodes: updatedNodes,
                });

                // Sync with maps
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, hierarchicalData: updatedHierarchy } : m
                );
                set({ maps: updatedMaps });
            },

            updateNodeSummary: (nodeId: string, newSummary: string) => {
                const { hierarchicalData, nodes } = get();
                if (!hierarchicalData) return;

                const updatedHierarchy = updateHierarchicalData(hierarchicalData, nodeId, {
                    summary: newSummary,
                });

                const updatedNodes = nodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, summary: newSummary } }
                        : node
                );

                set({
                    hierarchicalData: updatedHierarchy,
                    nodes: updatedNodes,
                });

                // Sync with maps
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, hierarchicalData: updatedHierarchy } : m
                );
                set({ maps: updatedMaps });
            },

            updateNodeDetails: (nodeId: string, newDetails: string) => {
                const { hierarchicalData, nodes } = get();
                if (!hierarchicalData) return;

                const updatedHierarchy = updateHierarchicalData(hierarchicalData, nodeId, {
                    details: newDetails,
                });

                const updatedNodes = nodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, details: newDetails } }
                        : node
                );

                set({
                    hierarchicalData: updatedHierarchy,
                    nodes: updatedNodes,
                });

                // Sync with maps
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, hierarchicalData: updatedHierarchy } : m
                );
                set({ maps: updatedMaps });
            },

            selectNode: (nodeId: string | null) => {
                set({ selectedNodeId: nodeId });
            },

            toggleNodeExpansion: (nodeId: string) => {
                const { collapsedNodeIds, hierarchicalData } = get();
                if (!hierarchicalData) return;

                const newCollapsedIds = new Set(collapsedNodeIds);

                if (newCollapsedIds.has(nodeId)) {
                    newCollapsedIds.delete(nodeId);
                } else {
                    newCollapsedIds.add(nodeId);
                }

                const { nodes: allNodes, edges: allEdges } = flattenHierarchy(hierarchicalData);

                const updatedNodes = allNodes.map((node) =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, isExpanded: !node.data.isExpanded } }
                        : node
                );

                const { nodes: visibleNodes, edges: visibleEdges } = filterCollapsedNodes(
                    updatedNodes,
                    allEdges,
                    newCollapsedIds
                );

                const layoutedNodes = calculateLayout(visibleNodes, visibleEdges);

                set({
                    collapsedNodeIds: newCollapsedIds,
                    nodes: layoutedNodes,
                    edges: visibleEdges,
                });

                // Sync collapsed state with active map
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, collapsedNodeIds: newCollapsedIds } : m
                );
                set({ maps: updatedMaps });
            },

            addNode: (parentId: string, newNodeData: Partial<HierarchicalNode>) => {
                const { hierarchicalData, nodes, edges } = get();
                if (!hierarchicalData) return;

                const newNode: HierarchicalNode = {
                    id: newNodeData.id || `node-${Date.now()}`,
                    label: newNodeData.label || 'New Node',
                    type: newNodeData.type || 'grandchild',
                    summary: newNodeData.summary || 'New node summary',
                    details: newNodeData.details || 'New node details',
                    children: [],
                };

                const updatedHierarchy = addNodeToHierarchy(hierarchicalData, parentId, newNode);

                const { nodes: newNodes, edges: newEdges } = flattenHierarchy(updatedHierarchy);
                const layoutedNodes = calculateLayout(newNodes, newEdges);

                set({
                    hierarchicalData: updatedHierarchy,
                    nodes: layoutedNodes,
                    edges: newEdges,
                });

                // Sync with maps
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, hierarchicalData: updatedHierarchy } : m
                );
                set({ maps: updatedMaps });
            },

            deleteNode: (nodeId: string) => {
                const { hierarchicalData, selectedNodeId } = get();
                if (!hierarchicalData) return;
                if (nodeId === hierarchicalData.id) return;

                const removeNodeFromHierarchy = (node: HierarchicalNode, targetId: string): HierarchicalNode => {
                    if (node.children) {
                        node.children = node.children.filter((child) => child.id !== targetId);
                        node.children = node.children.map((child) => removeNodeFromHierarchy(child, targetId));
                    }
                    return node;
                };

                const updatedHierarchy = removeNodeFromHierarchy({ ...hierarchicalData }, nodeId);

                const { nodes: newNodes, edges: newEdges } = flattenHierarchy(updatedHierarchy);
                const layoutedNodes = calculateLayout(newNodes, newEdges);

                set({
                    hierarchicalData: updatedHierarchy,
                    nodes: layoutedNodes,
                    edges: newEdges,
                    selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
                });

                // Sync with maps
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, hierarchicalData: updatedHierarchy } : m
                );
                set({ maps: updatedMaps });
            },

            resetLayout: () => {
                const { nodes, edges } = get();
                const layoutedNodes = calculateLayout(nodes, edges);
                set({ nodes: layoutedNodes });
            },
        }),
        {
            name: 'mindmap-storage',
            partialize: (state) => ({
                maps: state.maps.map((m) => ({
                    ...m,
                    collapsedNodeIds: Array.from(m.collapsedNodeIds),
                })),
                activeMapId: state.activeMapId,
            }),
        }
    )
);
