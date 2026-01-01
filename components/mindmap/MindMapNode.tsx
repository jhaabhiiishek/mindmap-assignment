'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Network, ChevronDown, ChevronRight } from 'lucide-react';
import { useMindMapStore } from '@/store/useMindMapStore';

/**
 * Custom node component for the mindmap
 * Displays different styles based on node depth (hierarchy level)
 */
const MindMapNode = memo((props: NodeProps) => {
    const { data, selected, id } = props;
    const label = data.label as string;
    const nodeType = data.nodeType as 'root' | 'child' | 'grandchild';
    const depth = data.depth as number;
    const hasChildren = data.hasChildren as boolean;
    const isExpanded = data.isExpanded as boolean;

    const { toggleNodeExpansion } = useMindMapStore();

    // Determine styling based on depth - Reference theme: blue/green/orange/purple
    const getNodeStyles = () => {
        switch (depth) {
            case 0: // Root node - Large blue circle
                return {
                    container: cn(
                        'w-[220px] h-[220px] rounded-full', // Circular/oval for root
                        'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
                        'border-4 border-blue-300',
                        'shadow-2xl shadow-blue-500/40',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-700' : '',
                        'hover:scale-105 hover:shadow-blue-400/60'
                    ),
                    text: 'text-2xl font-bold text-gray-900',
                    badge: 'bg-blue-300/40 text-gray-800',
                };

            case 1: // Child nodes - Green ovals
                return {
                    container: cn(
                        'w-[180px] h-[100px] rounded-full', // Oval shape
                        'bg-gradient-to-br from-green-400 via-green-500 to-green-600',
                        'border-3 border-green-300',
                        'shadow-xl shadow-green-500/30',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-slate-700' : '',
                        'hover:scale-105 hover:shadow-green-400/50'
                    ),
                    text: 'text-lg font-semibold text-gray-900',
                    badge: 'bg-green-300/40 text-gray-800',
                };

            case 2: // Level 2 - Orange ovals
                return {
                    container: cn(
                        'w-[160px] h-[90px] rounded-full', // Oval shape
                        'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500',
                        'border-2 border-orange-200',
                        'shadow-lg shadow-orange-400/30',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-orange-400 ring-offset-2 ring-offset-slate-700' : '',
                        'hover:scale-105 hover:shadow-orange-400/50'
                    ),
                    text: 'text-base font-medium text-gray-900',
                    badge: 'bg-orange-200/40 text-gray-800',
                };

            default: // Level 3+ - Purple/Pink ovals
                return {
                    container: cn(
                        'w-[140px] h-[80px] rounded-full', // Oval shape
                        'bg-gradient-to-br from-purple-300 via-purple-400 to-pink-400',
                        'border-2 border-purple-200',
                        'shadow-lg shadow-purple-400/30',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-purple-400 ring-offset-2 ring-offset-slate-700' : '',
                        'hover:scale-105 hover:shadow-purple-400/50'
                    ),
                    text: 'text-sm font-medium text-gray-900',
                    badge: 'bg-purple-200/40 text-gray-800',
                };
        }
    };

    const styles = getNodeStyles();

    return (
        <div className={cn(styles.container, 'relative')}>
            {/* Expand/Collapse Button - Cyan themed to match toolbar */}
            {hasChildren && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeExpansion(id);
                    }}
                    className={cn(
                        'absolute -top-3 -right-3 z-10',
                        'w-7 h-7 rounded-full',
                        'bg-cyan-600 hover:bg-cyan-500',
                        'border-2 border-cyan-400',
                        'flex items-center justify-center',
                        'transition-all duration-200',
                        'hover:scale-110',
                        'shadow-lg shadow-cyan-500/30'
                    )}
                    title={isExpanded ? 'Collapse children' : 'Expand children'}
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-white" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-white" />
                    )}
                </button>
            )}

            {/* Collapsed Indicator Badge - Shows when children are hidden */}
            {hasChildren && !isExpanded && (
                <div
                    className={cn(
                        'absolute -bottom-2 left-1/2 -translate-x-1/2 z-10',
                        'px-2 py-0.5 rounded-full',
                        'bg-cyan-600 border border-cyan-400',
                        'text-[10px] font-bold text-white',
                        'shadow-lg shadow-cyan-500/30',
                        'animate-pulse'
                    )}
                >
                    {data.childCount || 0}+ hidden
                </div>
            )}

            {/* Top handle for incoming connections (all except root) */}
            {depth > 0 && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-3 h-3 !bg-white border-2 !border-gray-400 transition-all hover:scale-150"
                />
            )}

            {/* Node content */}
            <div className="flex flex-col items-center justify-center p-4 h-full">
                {/* Icon indicator for root */}
                {depth === 0 && (
                    <Network className="w-6 h-6 text-white mb-2" />
                )}

                {/* Label */}
                <div className={cn(styles.text, 'text-center leading-tight')}>
                    {label}
                </div>

                {/* Badge for nodes with children */}
                {hasChildren && (
                    <div className={cn(
                        'mt-2 px-2 py-1 rounded-full text-xs font-medium',
                        styles.badge
                    )}>
                        {nodeType === 'root' ? '4 domains' : '3 topics'}
                    </div>
                )}
            </div>

            {/* Bottom handle for outgoing connections - Always show if has children */}
            {hasChildren && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="w-3 h-3 !bg-white border-2 !border-gray-400 transition-all hover:scale-150"
                />
            )}
        </div>
    );
});

MindMapNode.displayName = 'MindMapNode';

export default MindMapNode;
