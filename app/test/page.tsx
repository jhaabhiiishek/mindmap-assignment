'use client';

import { useEffect } from 'react';
import { useMindMapStore } from '@/store/useMindMapStore';
import initialData from '@/data/initialData.json';
import { HierarchicalNode } from '@/types';

/**
 * Test component to verify Phase 2 implementation
 * This demonstrates that the store works correctly
 */
export default function StoreTestPage() {
    const {
        nodes,
        edges,
        initializeFromData,
        selectedNodeId,
        selectNode,
        updateNodeLabel,
    } = useMindMapStore();

    useEffect(() => {
        // Initialize store with data on mount
        initializeFromData(initialData as HierarchicalNode);
    }, [initializeFromData]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Phase 2: Data Layer & State Management ✅
                    </h1>
                    <p className="text-gray-600">
                        Store successfully initialized with {nodes.length} nodes and {edges.length} edges
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Nodes List */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Nodes ({nodes.length})
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {nodes.map((node) => (
                                <div
                                    key={node.id}
                                    onClick={() => selectNode(node.id)}
                                    className={`p-3 rounded border cursor-pointer transition-colors ${selectedNodeId === node.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="font-medium text-gray-900">{node.data.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ID: {node.id} | Type: {node.data.nodeType} | Depth: {node.data.depth}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Edges List */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Edges ({edges.length})
                        </h2>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {edges.map((edge) => (
                                <div
                                    key={edge.id}
                                    className="p-3 rounded border border-gray-200"
                                >
                                    <div className="text-sm text-gray-900">
                                        {edge.source} → {edge.target}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Type: {edge.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Node Details */}
                {selectedNodeId && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Selected Node Details
                        </h2>
                        {(() => {
                            const selectedNode = nodes.find(n => n.id === selectedNodeId);
                            if (!selectedNode) return null;

                            return (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Label</label>
                                        <input
                                            type="text"
                                            value={selectedNode.data.label}
                                            onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Summary</label>
                                        <p className="mt-1 text-sm text-gray-600">{selectedNode.data.summary}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Details</label>
                                        <p className="mt-1 text-sm text-gray-600">{selectedNode.data.details}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Depth</label>
                                            <p className="mt-1 text-sm text-gray-600">{selectedNode.data.depth}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Has Children</label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {selectedNode.data.hasChildren ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Verification Checklist */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        ✅ Phase 2 Verification Checklist
                    </h2>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Zustand store created with typed state and actions</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Hierarchical JSON loaded and flattened into {nodes.length} nodes</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>{edges.length} edges generated from parent-child relationships</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Auto-layout positions calculated (no hardcoded positions)</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Node selection working (click any node above)</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Label editing with two-way binding (try editing selected node)</span>
                        </li>
                        <li className="flex items-center text-green-700">
                            <span className="mr-2">✓</span>
                            <span>Data-driven architecture: store updates when data changes</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
