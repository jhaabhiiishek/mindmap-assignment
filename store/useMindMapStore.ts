import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { MindMapNode, MindMapEdge, HierarchicalNode } from '@/types';
import {
    flattenHierarchy,
    calculateLayout,
    calculateGraphLayout,
    calculateRadialLayout,
    filterCollapsedNodes,
    updateHierarchicalData,
    addNodeToHierarchy,
} from '@/lib/dataTransform';

// Helper to apply the correct layout based on mode
const computeLayout = (nodes: MindMapNode[], edges: MindMapEdge[], mode: 'tree' | 'graph' | 'radial') => {
    switch (mode) {
        case 'graph':
            return calculateGraphLayout(nodes, edges);
        case 'radial':
            return calculateRadialLayout(nodes, edges);
        case 'tree':
        default:
            return calculateLayout(nodes, edges);
    }
};

interface MapData {
    id: string;
    name: string;
    createdAt: Date;
    hierarchicalData: HierarchicalNode;
    collapsedNodeIds: Set<string>;
    layoutMode?: 'tree' | 'graph' | 'radial';
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
    layoutMode: 'tree' | 'graph' | 'radial'; // New state

    // Drill state
    drillStack: string[]; // Stack of node IDs for drill navigation
    currentDrillNodeId: string | null;

    // Multi-map actions
    createMap: (name?: string, template?: HierarchicalNode) => void;
    switchMap: (mapId: string) => void;
    deleteMap: (mapId: string) => void;

    // Existing actions
    initializeFromData: (data: HierarchicalNode) => void;
    setNodes: (nodes: MindMapNode[]) => void;
    setEdges: (edges: MindMapEdge[]) => void;
    setLayoutMode: (mode: 'tree' | 'graph' | 'radial') => void; // New action
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

    // Toolbar actions
    expandAll: () => void;
    collapseAll: () => void;
    drillDown: (nodeId?: string) => void;
    drillUp: () => void;
    downloadMap: () => void;
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
            drillStack: [],
            currentDrillNodeId: null,
            layoutMode: 'tree',

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
                    collapsedNodeIds: new Set<string>(),
                    layoutMode: 'tree',
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
                let collapsedIds = new Set<string>();
                if (map.collapsedNodeIds instanceof Set) {
                    collapsedIds = map.collapsedNodeIds;
                } else if (Array.isArray(map.collapsedNodeIds)) {
                    collapsedIds = new Set(map.collapsedNodeIds);
                } else {
                    collapsedIds = new Set(map.collapsedNodeIds as unknown as string[] || []);
                }

                // Restore layout mode
                const layoutMode = map.layoutMode || 'tree';

                // Flatten the hierarchical data to get all nodes and edges
                const { nodes: allNodes, edges: allEdges } = flattenHierarchy(map.hierarchicalData);

                // Filter based on collapsed state
                const { nodes: visibleNodes, edges: visibleEdges } = filterCollapsedNodes(
                    allNodes,
                    allEdges,
                    collapsedIds
                );

                // Calculate layout for visible nodes
                const layoutedNodes = computeLayout(visibleNodes, visibleEdges, layoutMode);

                // Update state with the new map data
                set({
                    hierarchicalData: map.hierarchicalData,
                    nodes: layoutedNodes,
                    edges: visibleEdges,
                    collapsedNodeIds: collapsedIds,
                    selectedNodeId: null, // Clear selection when switching maps
                    layoutMode: layoutMode,
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
                const mode = get().layoutMode;
                const { nodes, edges } = flattenHierarchy(data);
                const layoutedNodes = computeLayout(nodes, edges, mode);

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

            setLayoutMode: (mode: 'tree' | 'graph' | 'radial') => {
                set({ layoutMode: mode });

                // Recalculate layout immediately
                const { nodes, edges } = get();
                const layoutedNodes = computeLayout(nodes, edges, mode);
                set({ nodes: layoutedNodes });

                // Sync with active map
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, layoutMode: mode } : m
                );
                set({ maps: updatedMaps });
            },

            onNodesChange: (changes: NodeChange[]) => {
                set({ nodes: applyNodeChanges(changes, get().nodes) as MindMapNode[] });
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
                const { collapsedNodeIds, hierarchicalData, layoutMode } = get();
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

                const layoutedNodes = computeLayout(visibleNodes, visibleEdges, layoutMode);

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
                const { hierarchicalData, nodes, edges, layoutMode } = get();
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
                const layoutedNodes = computeLayout(newNodes, newEdges, layoutMode);

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
                const { hierarchicalData, selectedNodeId, layoutMode } = get();
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
                const layoutedNodes = computeLayout(newNodes, newEdges, layoutMode);

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
                const { nodes, edges, layoutMode } = get();
                const layoutedNodes = computeLayout(nodes, edges, layoutMode);
                set({ nodes: layoutedNodes });
            },

            // Toolbar Actions
            expandAll: () => {
                const { hierarchicalData, layoutMode } = get();
                if (!hierarchicalData) return;

                // Clear all collapsed nodes
                const { nodes: allNodes, edges: allEdges } = flattenHierarchy(hierarchicalData);
                const layoutedNodes = computeLayout(allNodes, allEdges, layoutMode);

                set({
                    collapsedNodeIds: new Set<string>(),
                    nodes: layoutedNodes,
                    edges: allEdges,
                });

                // Sync with active map
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, collapsedNodeIds: new Set<string>() } : m
                );
                set({ maps: updatedMaps });
            },

            collapseAll: () => {
                const { hierarchicalData, nodes, layoutMode } = get();
                if (!hierarchicalData) return;

                // Collapse all nodes except root
                const nodesToCollapse = new Set<string>();
                nodes.forEach((node) => {
                    if (node.id !== hierarchicalData.id && node.data.hasChildren) {
                        nodesToCollapse.add(node.id);
                    }
                });

                const { nodes: allNodes, edges: allEdges } = flattenHierarchy(hierarchicalData);
                const { nodes: visibleNodes, edges: visibleEdges } = filterCollapsedNodes(
                    allNodes,
                    allEdges,
                    nodesToCollapse
                );

                const layoutedNodes = computeLayout(visibleNodes, visibleEdges, layoutMode);

                set({
                    collapsedNodeIds: nodesToCollapse,
                    nodes: layoutedNodes,
                    edges: visibleEdges,
                });

                // Sync with active map
                const { maps, activeMapId } = get();
                const updatedMaps = maps.map((m) =>
                    m.id === activeMapId ? { ...m, collapsedNodeIds: nodesToCollapse } : m
                );
                set({ maps: updatedMaps });
            },

            drillDown: (nodeId?: string) => {
                const { hierarchicalData, selectedNodeId, drillStack, currentDrillNodeId, layoutMode } = get();
                if (!hierarchicalData) return;

                const targetNodeId = nodeId || selectedNodeId;
                if (!targetNodeId) {
                    alert('Please select a node to drill down into');
                    return;
                }

                // Find the node in hierarchical data
                const findNode = (node: HierarchicalNode, id: string): HierarchicalNode | null => {
                    if (node.id === id) return node;
                    if (node.children) {
                        for (const child of node.children) {
                            const found = findNode(child, id);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const targetNode = findNode(hierarchicalData, targetNodeId);
                if (!targetNode || !targetNode.children || targetNode.children.length === 0) {
                    alert('Selected node has no children to drill into');
                    return;
                }

                // Add current node to drill stack
                const newStack = currentDrillNodeId
                    ? [...drillStack, currentDrillNodeId]
                    : drillStack;

                // Flatten and layout only the subtree
                const { nodes: subNodes, edges: subEdges } = flattenHierarchy(targetNode);
                const layoutedNodes = computeLayout(subNodes, subEdges, layoutMode);

                set({
                    drillStack: newStack,
                    currentDrillNodeId: targetNodeId,
                    nodes: layoutedNodes,
                    edges: subEdges,
                    selectedNodeId: null,
                });
            },

            drillUp: () => {
                const { hierarchicalData, drillStack, layoutMode } = get();
                if (!hierarchicalData) return;

                if (drillStack.length === 0) {
                    // Return to root view
                    const { nodes: allNodes, edges: allEdges } = flattenHierarchy(hierarchicalData);
                    const layoutedNodes = computeLayout(allNodes, allEdges, layoutMode);

                    set({
                        drillStack: [],
                        currentDrillNodeId: null,
                        nodes: layoutedNodes,
                        edges: allEdges,
                    });
                    return;
                }

                // Pop from stack and drill to that node
                const newStack = [...drillStack];
                const parentNodeId = newStack.pop();

                if (parentNodeId) {
                    // Re-drill to parent
                    get().drillDown(parentNodeId);
                    // Fix the stack (drillDown adds to stack, but we want to use our popped stack)
                    set({ drillStack: newStack });
                }
            },

            downloadMap: () => {
                const { hierarchicalData, activeMapId, maps } = get();
                if (!hierarchicalData) return;

                const activeMap = maps.find((m) => m.id === activeMapId);
                const fileName = activeMap ? `${activeMap.name.replace(/\s+/g, '_')}.json` : 'mindmap.json';

                // Create downloadable JSON
                const dataStr = JSON.stringify(hierarchicalData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);

                // Trigger download
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            },
        }),
        {
            name: 'mindmap-storage',
            partialize: (state) => ({
                maps: state.maps.map((m) => ({
                    ...m,
                    collapsedNodeIds: Array.from(m.collapsedNodeIds as Set<string>),
                })),
                activeMapId: state.activeMapId,
            }),
        }
    )
);
