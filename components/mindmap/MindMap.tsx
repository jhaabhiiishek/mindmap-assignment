'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Panel,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMindMapStore } from '@/store/useMindMapStore';
import MindMapNode from './MindMapNode';
import HoverCard from './HoverCard';
import SidePanel from './SidePanel';

/**
 * Inner component that has access to React Flow instance
 */
function MindMapInner() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        selectNode,
        selectedNodeId,
        resetLayout,
        activeMapId,
    } = useMindMapStore();

    const reactFlowInstance = useReactFlow();

    // Hover state for HoverCard
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Register custom node types
    const nodeTypes = useMemo(() => ({ mindmapNode: MindMapNode }), []);

    // Fit view when switching maps
    useEffect(() => {
        if (nodes.length > 0 && activeMapId) {
            // Small delay to ensure nodes are rendered before fitting
            const timer = setTimeout(() => {
                reactFlowInstance.fitView({
                    padding: 0.15,
                    maxZoom: 1,
                    duration: 400
                });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [activeMapId, reactFlowInstance]);

    // Handle node click for selection
    const handleNodeClick = useCallback(
        (_event: React.MouseEvent, node: any) => {
            selectNode(node.id);
        },
        [selectNode]
    );

    // Handle pane click (deselect)
    const handlePaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    // Handle node hover
    const handleNodeMouseEnter = useCallback(
        (_event: React.MouseEvent, node: any) => {
            setHoveredNodeId(node.id);
        },
        []
    );

    const handleNodeMouseLeave = useCallback(() => {
        setHoveredNodeId(null);
    }, []);

    // Track mouse position for HoverCard
    const handleMouseMove = useCallback((event: React.MouseEvent) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    }, []);

    // Custom wheel handler for Shift+Scroll horizontal panning
    const handleWheel = useCallback(
        (event: React.WheelEvent) => {
            if (event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();

                const viewport = reactFlowInstance.getViewport();
                const panSpeed = 2; // Adjust for sensitivity

                // Scroll up/down becomes left/right when Shift is held
                const deltaX = event.deltaY * panSpeed;

                reactFlowInstance.setViewport({
                    x: viewport.x - deltaX,
                    y: viewport.y,
                    zoom: viewport.zoom,
                });
            }
        },
        [reactFlowInstance]
    );

    // Get hovered node data
    const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);

    // Get edge color based on target node depth and selection - X/Grok theme
    const getEdgeStyle = (edge: any, isHighlighted: boolean) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        const depth = targetNode?.data?.depth || 0;

        let stroke = '#71717a'; // Zinc-500 for default
        let strokeWidth = 2;

        switch (depth) {
            case 1:
                stroke = '#ef4444'; // Red-500 for root children
                strokeWidth = 2.5;
                break;
            case 2:
                stroke = '#f87171'; // Red-400 for grandchildren
                strokeWidth = 2;
                break;
            default:
                stroke = '#a1a1aa'; // Zinc-400 for deeper
                strokeWidth = 2;
        }

        if (isHighlighted) {
            stroke = '#dc2626'; // Bright red when highlighted
            strokeWidth += 1.5;
            return {
                stroke,
                strokeWidth,
                filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))',
            };
        }

        return { stroke, strokeWidth };
    };

    const styledEdges = useMemo(() => {
        return edges.map((edge) => {
            const isHighlighted =
                edge.source === selectedNodeId || edge.target === selectedNodeId;

            return {
                ...edge,
                style: getEdgeStyle(edge, isHighlighted),
                animated: true,
            };
        });
    }, [edges, nodes, selectedNodeId]);

    return (
        <div
            className="w-full h-full bg-black"
            onWheel={handleWheel}
        >
            <ReactFlow
                nodes={nodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                onNodeMouseEnter={handleNodeMouseEnter}
                onNodeMouseLeave={handleNodeMouseLeave}
                onMouseMove={handleMouseMove}
                nodeTypes={nodeTypes}
                nodesDraggable={true}
                fitView
                fitViewOptions={{ padding: 0.15, maxZoom: 1, duration: 400 }}
                minZoom={0.1}
                maxZoom={2}
                zoomOnScroll={true}
                zoomOnPinch={true}
                panOnScroll={false}
                panOnDrag={true}
                zoomOnDoubleClick={false}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                }}
                className="react-flow-custom"
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    className="bg-black"
                    color="#27272a"
                />

                <Controls
                    position="bottom-right"
                    className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg shadow-xl"
                    showInteractive={false}
                />

                <MiniMap
                    position="bottom-left"
                    className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg shadow-xl"
                    nodeStrokeWidth={3}
                    nodeColor={(node) => {
                        const depth = node.data?.depth || 0;
                        switch (depth) {
                            case 0:
                                return '#ef4444'; // Red
                            case 1:
                                return '#18181b'; // Zinc-900
                            default:
                                return '#3f3f46'; // Zinc-700
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.8)"
                />

                <Panel position="top-center" className="pointer-events-none">
                    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl px-8 py-4">
                        <h1 className="text-3xl font-bold text-white text-center">
                            Interactive Mindmap
                        </h1>
                        <p className="text-sm text-zinc-400 text-center mt-1">
                            {nodes.length} nodes • {edges.length} connections
                        </p>
                    </div>
                </Panel>

                <Panel position="top-right">
                    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg shadow-xl p-3 space-y-2">
                        <button
                            onClick={resetLayout}
                            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                        >
                            Reset Layout
                        </button>
                        <div className="text-xs text-zinc-500 text-center">
                            Shift+Scroll: Pan left/right
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            <HoverCard
                visible={!!hoveredNode && !selectedNodeId}
                summary={(hoveredNode?.data as any)?.summary || ''}
                label={(hoveredNode?.data as any)?.label || ''}
                position={mousePosition}
            />

            <SidePanel
                visible={!!selectedNodeId}
                onClose={() => selectNode(null)}
            />
        </div>
    );
}

/**
 * Main MindMap visualization component with ReactFlowProvider
 */
export default function MindMap() {
    return (
        <ReactFlowProvider>
            <MindMapInner />
        </ReactFlowProvider>
    );
}
