'use client';

import React, { useState } from 'react';
import { X, Info, Layers, Hash, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindMapStore } from '@/store/useMindMapStore';

interface SidePanelProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * SidePanel component for displaying and editing node details
 * Slides in from the right when a node is selected
 */
export default function SidePanel({ visible, onClose }: SidePanelProps) {
    const {
        nodes,
        selectedNodeId,
        updateNodeLabel,
        updateNodeSummary,
        updateNodeDetails,
        addNode,
        deleteNode,
        hierarchicalData
    } = useMindMapStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    if (!visible || !selectedNode) return null;

    const { data } = selectedNode;
    const { label, nodeType, summary, details, depth, hasChildren } = data as any;

    const getNodeTypeColor = () => {
        switch (depth) {
            case 0:
                return 'bg-red-600/30 text-red-200 border-red-500/40';
            case 1:
                return 'bg-zinc-700/50 text-zinc-200 border-zinc-600';
            default:
                return 'bg-zinc-800/50 text-zinc-300 border-zinc-700';
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div
                className={cn(
                    'fixed right-0 top-0 h-full w-full sm:w-[450px] z-50',
                    'bg-zinc-950/95 backdrop-blur-xl',
                    'border-l border-zinc-800',
                    'shadow-2xl',
                    'animate-in slide-in-from-right duration-300',
                    'overflow-y-auto'
                )}
            >
                {/* Header */}
                <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Info className="w-6 h-6 text-red-500" />
                            Node Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Label - Editable */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Label
                        </label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg',
                                'bg-zinc-900/50 border border-zinc-700',
                                'text-white placeholder-zinc-500',
                                'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50',
                                'transition-all duration-200'
                            )}
                            placeholder="Enter node label..."
                        />
                    </div>

                    {/* Node Info Badges */}
                    <div className="flex flex-wrap gap-3">
                        <div className={cn(
                            'px-3 py-2 rounded-lg border text-xs font-medium',
                            getNodeTypeColor()
                        )}>
                            <Layers className="w-3 h-3 inline mr-1" />
                            {nodeType}
                        </div>
                        <div className="px-3 py-2 rounded-lg border bg-zinc-900/50 text-zinc-300 border-zinc-700 text-xs font-medium">
                            Depth: {depth}
                        </div>
                        {hasChildren && (
                            <div className="px-3 py-2 rounded-lg border bg-red-500/20 text-red-300 border-red-500/30 text-xs font-medium">
                                Has Children
                            </div>
                        )}
                    </div>

                    {/* Summary - Editable */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">
                            Summary
                        </label>
                        <textarea
                            value={summary}
                            onChange={(e) => updateNodeSummary(selectedNode.id, e.target.value)}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg',
                                'bg-zinc-900/50 border border-zinc-700',
                                'text-zinc-300 placeholder-zinc-500',
                                'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50',
                                'transition-all duration-200',
                                'text-sm leading-relaxed',
                                'min-h-[80px] resize-y'
                            )}
                            placeholder="Enter node summary..."
                        />
                    </div>

                    {/* Details - Editable */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">
                            Details
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => updateNodeDetails(selectedNode.id, e.target.value)}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg',
                                'bg-zinc-900/50 border border-zinc-700',
                                'text-zinc-300 placeholder-zinc-500',
                                'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50',
                                'transition-all duration-200',
                                'text-sm leading-relaxed',
                                'min-h-[120px] resize-y'
                            )}
                            placeholder="Enter node details..."
                        />
                    </div>

                    {/* Node ID */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">
                            Node ID
                        </label>
                        <div className="px-3 py-2 rounded bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 font-mono">
                            {selectedNode.id}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">
                            Actions
                        </label>

                        {/* Add Child Node Button */}
                        <button
                            onClick={() => {
                                addNode(selectedNode.id, {
                                    label: `New Child of ${label}`,
                                    summary: 'A newly created node',
                                    details: 'This node was created dynamically',
                                    type: depth === 0 ? 'child' : 'grandchild',
                                });
                            }}
                            className={cn(
                                'w-full px-4 py-3 rounded-lg',
                                'bg-red-600/20 hover:bg-red-600/30 border border-red-500/40',
                                'text-white font-medium',
                                'flex items-center justify-center gap-2',
                                'transition-all duration-200',
                                'hover:scale-105 active:scale-95'
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Add Child Node
                        </button>

                        {/* Delete Node Button - Only for non-root nodes */}
                        {selectedNode.id !== hierarchicalData?.id && (
                            <>
                                {!showDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className={cn(
                                            'w-full px-4 py-3 rounded-lg',
                                            'bg-zinc-800/50 hover:bg-red-600/20 border border-zinc-700 hover:border-red-500/40',
                                            'text-zinc-300 hover:text-red-300 font-medium',
                                            'flex items-center justify-center gap-2',
                                            'transition-all duration-200',
                                            'hover:scale-105 active:scale-95'
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Node
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-sm text-red-400 font-medium text-center">
                                            Delete this node and all its children?
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    deleteNode(selectedNode.id);
                                                    setShowDeleteConfirm(false);
                                                }}
                                                className={cn(
                                                    'flex-1 px-3 py-2 rounded-lg',
                                                    'bg-red-600 hover:bg-red-700',
                                                    'text-white text-sm font-medium',
                                                    'transition-all duration-200'
                                                )}
                                            >
                                                Confirm Delete
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className={cn(
                                                    'flex-1 px-3 py-2 rounded-lg',
                                                    'bg-zinc-700 hover:bg-zinc-600',
                                                    'text-white text-sm font-medium',
                                                    'transition-all duration-200'
                                                )}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Edit Instructions */}
                    <div className={cn(
                        'mt-8 p-4 rounded-lg',
                        'bg-red-500/10 border border-red-500/20'
                    )}>
                        <div className="text-sm text-red-300">
                            <strong>✏️ Editing:</strong> Changes to label, summary, and details are saved automatically and update the mindmap in real-time.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
