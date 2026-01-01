'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
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
import TopToolbar from './TopToolbar';
import { JsonUpload } from './JsonUpload';
import { HierarchicalNode } from '@/types';

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
        expandAll,
        collapseAll,
        drillDown,
        drillUp,
        downloadMap,
        drillStack,
    } = useMindMapStore();

    const reactFlowInstance = useReactFlow();

    // Hover state for HoverCard
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // JSON Upload ref
    const jsonUploadRef = useRef<HTMLInputElement>(null);

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

    // Handle JSON upload
    const handleJsonLoad = useCallback((data: HierarchicalNode) => {
        useMindMapStore.getState().initializeFromData(data);
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

    // Get edge color based on target node depth and selection - Matching node theme
    const getEdgeStyle = (edge: any, isHighlighted: boolean) => {
        const targetNode = nodes.find((n) => n.id === edge.target);
        const depth = targetNode?.data?.depth || 0;

        let stroke = '#52525b'; // Zinc-600 default
        let strokeWidth = 2;

        switch (depth) {
            case 1:
                stroke = '#60a5fa'; // Blue-400 (from Root)
                strokeWidth = 3;
                break;
            case 2:
                stroke = '#4ade80'; // Green-400 (from Child)
                strokeWidth = 2.5;
                break;
            case 3:
                stroke = '#fb923c'; // Orange-400 (from Grandchild)
                strokeWidth = 2;
                break;
            default:
                stroke = '#a1a1aa'; // Zinc-400
                strokeWidth = 2;
        }

        if (isHighlighted) {
            stroke = '#22d3ee'; // Cyan-400 highlight
            strokeWidth += 2;
            return {
                stroke,
                strokeWidth,
                filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))',
            };
        }

        return { stroke, strokeWidth };
    };

    const styledEdges = useMemo(() => {
        // Helper to find all ancestors/descendants for highlighting
        const relatedNodeIds = new Set<string>();
        if (selectedNodeId) {
            relatedNodeIds.add(selectedNodeId);

            // 1. Ancestors (Traverse up)
            let currentId = selectedNodeId;
            let parentFound = true;
            while (parentFound) {
                const parentEdge = edges.find((e) => e.target === currentId);
                if (parentEdge) {
                    relatedNodeIds.add(parentEdge.source);
                    currentId = parentEdge.source;
                } else {
                    parentFound = false;
                }
            }

            // 2. Descendants (Traverse down fully)
            const stack = [selectedNodeId];
            while (stack.length > 0) {
                const current = stack.pop()!;
                const childEdges = edges.filter((e) => e.source === current);
                childEdges.forEach((e) => {
                    relatedNodeIds.add(e.target);
                    stack.push(e.target);
                });
            }
        }

        return edges.map((edge) => {
            // Highlight if BOTH source and target are in the related set
            // AND we have a selected node (otherwise no highlight)
            const isHighlighted = selectedNodeId
                ? relatedNodeIds.has(edge.source) && relatedNodeIds.has(edge.target)
                : false;

            return {
                ...edge,
                style: getEdgeStyle(edge, isHighlighted),
                animated: true,
                // Ensure highlighted edges are rendered on top
                zIndex: isHighlighted ? 10 : 0,
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
                    type: 'step', // Cleaner orthogonal lines
                    animated: false, // Remove animation by default for cleaner look, or keep if preferred. User didn't specify, but static lines are often cleaner. Let's keep animation as it's a nice touch, but maybe slower.
                    // Actually, 'step' edges with animation look fine.
                }}
                className="react-flow-custom"
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={16}
                    color="#475569"
                />

                {/* Hidden File Input for JSON Upload */}
                <div style={{ display: 'none' }}>
                    <div ref={jsonUploadRef as any}>
                        <JsonUpload onJsonLoad={handleJsonLoad} />
                    </div>
                </div>

                {/* Controls for zoom/pan */}
                <Controls
                    position="bottom-right"
                    className="bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-lg shadow-xl"
                />

                {/* Minimap for navigation */}
                <MiniMap
                    position="bottom-left"
                    className="bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-lg shadow-xl"
                    nodeStrokeWidth={3}
                    nodeColor={(node) => {
                        const depth = node.data?.depth || 0;
                        switch (depth) {
                            case 0:
                                return '#60a5fa'; // Blue
                            case 1:
                                return '#4ade80'; // Green
                            case 2:
                                return '#fb923c'; // Orange
                            default:
                                return '#c084fc'; // Purple
                        }
                    }}
                    maskColor="rgba(0, 0, 0, 0.8)"
                />

                <Panel position="top-center" className="pointer-events-auto">
                    <TopToolbar
                        onExpandAll={expandAll}
                        onCollapseAll={collapseAll}
                        onDrillDown={() => drillDown()}
                        onDrillUp={drillUp}
                        onFitView={() => reactFlowInstance.fitView({ padding: 0.15, maxZoom: 1, duration: 400 })}
                        onResetLayout={resetLayout}
                        onAddNode={() => {
                            if (selectedNodeId) {
                                const newNode = {
                                    id: `node-${Date.now()}`,
                                    label: 'New Node',
                                    type: 'grandchild' as const,
                                    summary: 'New node summary',
                                    details: 'New node details',
                                };
                                useMindMapStore.getState().addNode(selectedNodeId, newNode);
                            } else {
                                alert('Please select a parent node first');
                            }
                        }}
                        onFullDocumentation={() => {
                            // Trigger file upload
                            jsonUploadRef.current?.click();
                        }}
                        onDownloadJson={downloadMap}
                        onDownloadImage={(format) => {
                            const viewport = document.querySelector('.react-flow') as HTMLElement;
                            if (!viewport) return;

                            const bg = '#2d3748'; // Matching background color
                            let promise: Promise<string>;

                            switch (format) {
                                case 'png':
                                    promise = toPng(viewport, { backgroundColor: bg, pixelRatio: 2 });
                                    break;
                                case 'jpeg':
                                    promise = toJpeg(viewport, { backgroundColor: bg, pixelRatio: 2 });
                                    break;
                                case 'svg':
                                    promise = toSvg(viewport, { backgroundColor: bg });
                                    break;
                            }

                            promise.then((dataUrl) => {
                                const link = document.createElement('a');
                                link.download = `mindmap.${format}`;
                                link.href = dataUrl;
                                link.click();
                            }).catch((err) => {
                                console.error('Failed to download image', err);
                                alert('Failed to generate image. Please try again.');
                            });
                        }}
                        canDrillUp={drillStack.length > 0}
                    />
                </Panel>

                <Panel position="top-right">
                    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-lg shadow-xl p-3 space-y-2">
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
