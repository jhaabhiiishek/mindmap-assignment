import dagre from 'dagre';
import { HierarchicalNode, MindMapNode, MindMapEdge } from '@/types';

/**
 * Configuration for dagre layout
 */
const LAYOUT_CONFIG = {
    rankdir: 'TB', // Top to Bottom
    nodesep: 100,  // Horizontal spacing between nodes
    ranksep: 150,  // Vertical spacing between ranks
    nodeWidth: 250,
    nodeHeight: 80,
};

/**
 * Recursively flatten hierarchical data into nodes and edges
 * @param rootNode - The root of the hierarchical tree
 * @param depth - Current depth in the tree (0 for root)
 * @param parentId - ID of the parent node (null for root)
 * @returns Object containing flat arrays of nodes and edges
 */
export function flattenHierarchy(
    rootNode: HierarchicalNode,
    depth: number = 0,
    parentId: string | null = null
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
    const nodes: MindMapNode[] = [];
    const edges: MindMapEdge[] = [];

    // Create the current node
    const node: MindMapNode = {
        id: rootNode.id,
        type: 'mindmapNode', // Custom node type
        position: rootNode.position || { x: 0, y: 0 }, // Will be recalculated
        data: {
            label: rootNode.label,
            nodeType: rootNode.type,
            summary: rootNode.summary,
            details: rootNode.details,
            depth,
            hasChildren: !!rootNode.children && rootNode.children.length > 0,
            isExpanded: true, // Default to expanded
            childCount: rootNode.children?.length || 0, // For collapsed badge
        },
    };

    nodes.push(node);

    // Create edge to parent if not root
    if (parentId !== null) {
        const edge: MindMapEdge = {
            id: `e-${parentId}-${rootNode.id}`,
            source: parentId,
            target: rootNode.id,
            type: 'smoothstep',
            animated: false,
        };
        edges.push(edge);
    }

    // Recursively process children
    if (rootNode.children && rootNode.children.length > 0) {
        for (const child of rootNode.children) {
            const childResult = flattenHierarchy(child, depth + 1, rootNode.id);
            nodes.push(...childResult.nodes);
            edges.push(...childResult.edges);
        }
    }

    return { nodes, edges };
}

/**
 * Calculate layout positions for nodes using dagre
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges connecting nodes
 * @returns Nodes with updated positions
 */
export function calculateLayout(
    nodes: MindMapNode[],
    edges: MindMapEdge[]
): MindMapNode[] {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: LAYOUT_CONFIG.rankdir,
        nodesep: LAYOUT_CONFIG.nodesep,
        ranksep: LAYOUT_CONFIG.ranksep,
    });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: LAYOUT_CONFIG.nodeWidth,
            height: LAYOUT_CONFIG.nodeHeight,
        });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Update node positions based on dagre layout
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                // Center the node (dagre gives center position, we need top-left)
                x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2,
                y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2,
            },
        };
    });

    return layoutedNodes;
}

/**
 * Filter nodes and edges to hide descendants of collapsed nodes
 * @param nodes - All nodes
 * @param edges - All edges
 * @param collapsedNodeIds - Set of collapsed node IDs
 * @returns Filtered nodes and edges (only visible ones)
 */
export function filterCollapsedNodes(
    nodes: MindMapNode[],
    edges: MindMapEdge[],
    collapsedNodeIds: Set<string>
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
    if (collapsedNodeIds.size === 0) {
        return { nodes, edges };
    }

    // Build a map of node children for quick lookup
    const childrenMap = new Map<string, Set<string>>();
    edges.forEach((edge) => {
        if (!childrenMap.has(edge.source)) {
            childrenMap.set(edge.source, new Set());
        }
        childrenMap.get(edge.source)!.add(edge.target);
    });

    // Find all descendants of collapsed nodes (recursively)
    const hiddenNodeIds = new Set<string>();

    const addDescendants = (nodeId: string) => {
        const children = childrenMap.get(nodeId);
        if (children) {
            children.forEach((childId) => {
                hiddenNodeIds.add(childId);
                addDescendants(childId); // Recursively hide descendants
            });
        }
    };

    collapsedNodeIds.forEach((nodeId) => {
        addDescendants(nodeId);
    });

    // Filter nodes and edges
    const visibleNodes = nodes.filter((node) => !hiddenNodeIds.has(node.id));
    const visibleEdges = edges.filter(
        (edge) => !hiddenNodeIds.has(edge.source) && !hiddenNodeIds.has(edge.target)
    );

    return { nodes: visibleNodes, edges: visibleEdges };
}

/**
 * Update a node in the hierarchical data structure
 * @param hierarchicalData - The root node of the hierarchy
 * @param nodeId - ID of the node to update
 * @param updates - Partial updates to apply
 * @returns Updated hierarchical data (immutable)
 */
export function updateHierarchicalData(
    hierarchicalData: HierarchicalNode,
    nodeId: string,
    updates: Partial<HierarchicalNode>
): HierarchicalNode {
    if (hierarchicalData.id === nodeId) {
        return { ...hierarchicalData, ...updates };
    }

    if (hierarchicalData.children) {
        return {
            ...hierarchicalData,
            children: hierarchicalData.children.map((child) =>
                updateHierarchicalData(child, nodeId, updates)
            ),
        };
    }

    return hierarchicalData;
}

/**
 * Add a new node to the hierarchical data structure
 * @param hierarchicalData - The root node of the hierarchy
 * @param parentId - ID of the parent node
 * @param newNode - New node to add
 * @returns Updated hierarchical data (immutable)
 */
export function addNodeToHierarchy(
    hierarchicalData: HierarchicalNode,
    parentId: string,
    newNode: HierarchicalNode
): HierarchicalNode {
    if (hierarchicalData.id === parentId) {
        const existingChildren = hierarchicalData.children || [];
        return {
            ...hierarchicalData,
            children: [...existingChildren, newNode],
        };
    }

    if (hierarchicalData.children) {
        return {
            ...hierarchicalData,
            children: hierarchicalData.children.map((child) =>
                addNodeToHierarchy(child, parentId, newNode)
            ),
        };
    }

    return hierarchicalData;
}
