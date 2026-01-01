'use client';

import React, { useState } from 'react';
import { X, Info, Layers, Hash, Plus, Trash2, Edit2, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindMapStore } from '@/store/useMindMapStore';
import { MindMapNode, HierarchicalNode } from '@/types';

interface SidePanelProps {
    visible: boolean;
    onClose: () => void;
}

// Inner component to handle state resetting via key
function NodeDetails({
    node,
    onClose,
    onUpdateLabel,
    onUpdateSummary,
    onUpdateDetails,
    onAddNode,
    onDeleteNode,
    isRoot
}: {
    node: MindMapNode;
    onClose: () => void;
    onUpdateLabel: (id: string, v: string) => void;
    onUpdateSummary: (id: string, v: string) => void;
    onUpdateDetails: (id: string, v: string) => void;
    onAddNode: (id: string, data: Partial<HierarchicalNode>) => void;
    onDeleteNode: (id: string) => void;
    isRoot: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({
        label: node.data.label,
        summary: node.data.summary,
        details: node.data.details,
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { data } = node;
    const { label, nodeType, summary, details, depth, hasChildren } = data;

    const handleSave = () => {
        onUpdateLabel(node.id, editValues.label);
        onUpdateSummary(node.id, editValues.summary);
        onUpdateDetails(node.id, editValues.details);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValues({
            label: node.data.label,
            summary: node.data.summary,
            details: node.data.details,
        });
        setIsEditing(false);
    };

    const getNodeTypeColor = () => {
        switch (depth) {
            case 0:
                return 'bg-blue-600/30 text-blue-200 border-blue-500/40';
            case 1:
                return 'bg-green-600/20 text-green-300 border-green-600/30';
            case 2:
                return 'bg-orange-600/20 text-orange-300 border-orange-600/30';
            default:
                return 'bg-slate-800/50 text-slate-300 border-slate-700';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-cyan-400" />
                        Node Details
                    </h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400"
                                title="Edit Node"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
                {/* Label - Editable */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Hash className="w-3 h-3" />
                        Label
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editValues.label}
                            onChange={(e) => setEditValues({ ...editValues, label: e.target.value })}
                            className={cn(
                                'w-full px-3 py-2 rounded-lg',
                                'bg-slate-950/50 border border-slate-700',
                                'text-white placeholder-slate-600',
                                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
                                'transition-all duration-200',
                                'font-medium'
                            )}
                            placeholder="Enter node label..."
                        />
                    ) : (
                        <div className="text-lg font-bold text-white px-1">
                            {editValues.label || label}
                        </div>
                    )}
                </div>

                {/* Node Info Badges */}
                <div className="flex flex-wrap gap-2">
                    <div className={cn(
                        'px-2.5 py-1 rounded-md border text-xs font-medium',
                        getNodeTypeColor()
                    )}>
                        <Layers className="w-3 h-3 inline mr-1" />
                        {nodeType}
                    </div>
                    <div className="px-2.5 py-1 rounded-md border bg-slate-800 text-slate-300 border-slate-600 text-xs font-medium">
                        Depth: {depth}
                    </div>
                    {hasChildren && (
                        <div className="px-2.5 py-1 rounded-md border bg-cyan-900/30 text-cyan-300 border-cyan-700/50 text-xs font-medium">
                            Has Children
                        </div>
                    )}
                </div>

                {/* Summary - Editable */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Summary
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editValues.summary}
                            onChange={(e) => setEditValues({ ...editValues, summary: e.target.value })}
                            className={cn(
                                'w-full px-3 py-2 rounded-lg',
                                'bg-slate-950/50 border border-slate-700',
                                'text-slate-300 placeholder-slate-600',
                                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
                                'transition-all duration-200',
                                'text-sm leading-relaxed',
                                'min-h-[80px] resize-y'
                            )}
                            placeholder="Enter node summary..."
                        />
                    ) : (
                        <div className="text-sm text-slate-300 leading-relaxed px-1 whitespace-pre-wrap">
                            {editValues.summary || summary || <span className="text-slate-500 italic">No summary provided</span>}
                        </div>
                    )}
                </div>

                {/* Details - Editable */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Details
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editValues.details}
                            onChange={(e) => setEditValues({ ...editValues, details: e.target.value })}
                            className={cn(
                                'w-full px-3 py-2 rounded-lg',
                                'bg-slate-950/50 border border-slate-700',
                                'text-slate-300 placeholder-slate-600',
                                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
                                'transition-all duration-200',
                                'text-sm leading-relaxed',
                                'min-h-[120px] resize-y'
                            )}
                            placeholder="Enter node details..."
                        />
                    ) : (
                        <div className="text-sm text-slate-300 leading-relaxed px-1 whitespace-pre-wrap">
                            {editValues.details || details || <span className="text-slate-500 italic">No details provided</span>}
                        </div>
                    )}
                </div>

                {/* Save/Cancel Actions */}
                {isEditing && (
                    <div className="flex gap-2 pt-2 pb-2">
                        <button
                            onClick={handleSave}
                            className="flex-1 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Structure Actions
                    </label>

                    {/* Add Child Node Button */}
                    <button
                        onClick={() => {
                            onAddNode(node.id, {
                                label: `New Child`,
                                summary: 'A newly created node',
                                details: 'This node was created dynamically',
                                type: depth === 0 ? 'child' : 'grandchild',
                            });
                        }}
                        className={cn(
                            'w-full px-3 py-2 rounded-lg',
                            'bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30',
                            'text-cyan-400 font-medium text-sm',
                            'flex items-center justify-center gap-2',
                            'transition-all duration-200',
                            'hover:scale-[1.02] active:scale-95'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        Add Child Node
                    </button>

                    {/* Delete Node Button */}
                    {!isRoot && (
                        <>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className={cn(
                                        'w-full px-3 py-2 rounded-lg',
                                        'bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30',
                                        'text-red-400 font-medium text-sm',
                                        'flex items-center justify-center gap-2',
                                        'transition-all duration-200',
                                        'hover:scale-[1.02] active:scale-95'
                                    )}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Node
                                </button>
                            ) : (
                                <div className="space-y-2 bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                                    <div className="text-xs text-red-300 font-medium text-center">
                                        Delete this node and all descendants?
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                onDeleteNode(node.id);
                                                setShowDeleteConfirm(false);
                                            }}
                                            className="flex-1 px-2 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 px-2 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

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

    if (!visible || !selectedNodeId) return null;

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    if (!selectedNode) return null;

    const isRoot = selectedNode.id === hierarchicalData?.id;

    return (
        <div
            className={cn(
                'fixed right-4 top-20 bottom-4 w-96 z-50', // Positioned as a floating card
                'bg-slate-900/95 backdrop-blur-xl',
                'border border-slate-700 rounded-xl',
                'shadow-2xl shadow-black/50',
                'animate-in slide-in-from-right duration-300',
                'overflow-hidden' // handled by inner scroll
            )}
        >
            <NodeDetails
                key={selectedNode.id} // Forces reset when selecting different node
                node={selectedNode}
                onClose={onClose}
                onUpdateLabel={updateNodeLabel}
                onUpdateSummary={updateNodeSummary}
                onUpdateDetails={updateNodeDetails}
                onAddNode={addNode}
                onDeleteNode={deleteNode}
                isRoot={isRoot}
            />
        </div>
    );
}
