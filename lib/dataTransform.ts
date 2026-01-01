import dagre from 'dagre';
import { forceSimulation, forceManyBody, forceCenter, forceLink } from 'd3-force';
import { HierarchicalNode, MindMapNode, MindMapEdge } from '@/types';

/**
 * Configuration for dagre layout
 */
const LAYOUT_CONFIG = {
    rankdir: 'TB', // Top to Bottom
    nodesep: 200,  // Increased horizontal spacing for step edges
    ranksep: 200,  // Increased vertical spacing for step edges
    nodeWidth: 250,
    nodeHeight: 80,
    radialStep: 350, // Radius step for radial layout
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
            type: 'step', // Orthogonal lines
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
 * Calculate layout positions for nodes using dagre (Tree View)
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
 * Calculate layout positions using d3-force (Graph View)
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges connecting nodes
 * @returns Nodes with updated positions
 */
export function calculateGraphLayout(
    nodes: MindMapNode[],
    edges: MindMapEdge[]
): MindMapNode[] {
    // Clone nodes and edges to avoid mutating original state directly during simulation
    const simulationNodes = nodes.map(n => ({ ...n }));
    const simulationEdges = edges.map(e => ({ ...e }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const simulation = forceSimulation(simulationNodes as any)
        .force('charge', forceManyBody().strength(-2000)) // Strong repulsion
        .force('center', forceCenter(0, 0)) // Center at 0,0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .force('link', forceLink(simulationEdges as any).id((d: any) => d.id).distance(250)) // Distance for links
        .stop();

    // Run simulation synchronously
    // 300 ticks is usually enough for it to stabilize
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Update original nodes with new positions
    return nodes.map((node, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const simNode = simulationNodes[index] as any;
        return {
            ...node,
            position: {
                x: simNode.x - LAYOUT_CONFIG.nodeWidth / 2,
                y: simNode.y - LAYOUT_CONFIG.nodeHeight / 2,
            }
        };
    });

}

/**
 * Calculate layout positions using a deterministic Radial algorithm
 * @param nodes - Array of nodes to layout
 * @param edges - Array of edges connecting nodes
 * @returns Nodes with updated positions
 */
export function calculateRadialLayout(
    nodes: MindMapNode[],
    edges: MindMapEdge[]
): MindMapNode[] {
    // 1. Identify Root
    const root = nodes.find(n => n.data.depth === 0) || nodes[0];
    if (!root) return nodes;

    // 2. Build adjacency map for quick child lookup
    const childrenMap = new Map<string, string[]>();
    edges.forEach(edge => {
        const source = edge.source;
        const target = edge.target;
        if (!childrenMap.has(source)) {
            childrenMap.set(source, []);
        }
        childrenMap.get(source)?.push(target);
    });

    // 3. Map to store positions
    const positions = new Map<string, { x: number, y: number }>();
    positions.set(root.id, { x: 0, y: 0 }); // Root at center

    // 4. Recursive positioning function (Sector based)
    const positionChildren = (
        parentId: string,
        startAngle: number,
        endAngle: number,
        depth: number
    ) => {
        const children = childrenMap.get(parentId) || [];
        if (children.length === 0) return;

        // Sort children if needed (e.g. by label?) - Keeping unstable order is fine for now
        // But stable order is better. Let's sort by ID to be deterministic.
        children.sort();

        // Calculate available angle per child
        const totalAngle = endAngle - startAngle;
        const anglePerChild = totalAngle / children.length;

        children.forEach((childId, index) => {
            const childStart = startAngle + index * anglePerChild;
            const childEnd = childStart + anglePerChild;
            const midAngle = childStart + anglePerChild / 2;

            // Calculate Position
            // Radius increases with depth
            const R = depth * LAYOUT_CONFIG.radialStep;

            // Convert polar to cartesian
            // Subtract PI/2 to start from top (12 o'clock) instead of right (3 o'clock)
            const x = R * Math.cos(midAngle - Math.PI / 2);
            const y = R * Math.sin(midAngle - Math.PI / 2);

            positions.set(childId, {
                x: x - LAYOUT_CONFIG.nodeWidth / 2, // Center correction
                y: y - LAYOUT_CONFIG.nodeHeight / 2
            });

            // Recursively position grandchildren
            positionChildren(childId, childStart, childEnd, depth + 1);
        });
    };

    // Start recursion for Root's children
    // Give full 360 degrees (2 * PI) to root's children
    positionChildren(root.id, 0, 2 * Math.PI, 1);

    // 5. Update nodes
    return nodes.map(node => {
        const pos = positions.get(node.id) || node.position;
        return {
            ...node,
            position: pos
        };
    });
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
 *
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
