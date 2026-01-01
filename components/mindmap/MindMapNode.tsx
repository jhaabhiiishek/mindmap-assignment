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
    const label = (data as any).label as string;
    const nodeType = (data as any).nodeType as 'root' | 'child' | 'grandchild';
    const depth = (data as any).depth as number;
    const hasChildren = (data as any).hasChildren as boolean;
    const isExpanded = (data as any).isExpanded as boolean;

    const { toggleNodeExpansion } = useMindMapStore();

    // Determine styling based on depth - X/Grok inspired black/white/red theme
    const getNodeStyles = () => {
        switch (depth) {
            case 0: // Root node - Bold red accent
                return {
                    container: cn(
                        'w-[300px] min-h-[110px] rounded-xl',
                        'bg-gradient-to-br from-red-600 via-red-500 to-red-700',
                        'border-2 border-red-400',
                        'shadow-2xl shadow-red-500/30',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-red-400 ring-offset-2 ring-offset-black' : '',
                        'hover:scale-105 hover:shadow-red-500/50'
                    ),
                    text: 'text-2xl font-bold text-white',
                    badge: 'bg-red-400/30 text-red-100',
                };

            case 1: // Child nodes - Dark with red border
                return {
                    container: cn(
                        'w-[260px] min-h-[95px] rounded-xl',
                        'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black',
                        'border-2 border-red-500/60',
                        'shadow-xl shadow-black/50',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-red-400 ring-offset-2 ring-offset-black' : '',
                        'hover:scale-105 hover:shadow-red-500/30 hover:border-red-400'
                    ),
                    text: 'text-xl font-semibold text-white',
                    badge: 'bg-red-500/20 text-red-200',
                };

            default: // Grandchild - Lighter dark with subtle red
                return {
                    container: cn(
                        'w-[240px] min-h-[85px] rounded-xl',
                        'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900',
                        'border border-zinc-600',
                        'shadow-lg shadow-black/40',
                        'transition-all duration-300 ease-out',
                        selected ? 'ring-4 ring-red-400 ring-offset-2 ring-offset-black' : '',
                        'hover:scale-105 hover:shadow-red-500/20 hover:border-red-500/40'
                    ),
                    text: 'text-lg font-medium text-gray-100',
                    badge: 'bg-zinc-700/50 text-gray-300',
                };
        }
    };

    const styles = getNodeStyles();

    return (
        <div className={cn(styles.container, 'relative')}>
            {/* Expand/Collapse Button - Red themed */}
            {hasChildren && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleNodeExpansion(id);
                    }}
                    className={cn(
                        'absolute -top-3 -right-3 z-10',
                        'w-7 h-7 rounded-full',
                        'bg-red-600 hover:bg-red-500',
                        'border-2 border-red-400',
                        'flex items-center justify-center',
                        'transition-all duration-200',
                        'hover:scale-110',
                        'shadow-lg shadow-red-500/30'
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
                        'bg-red-600 border border-red-400',
                        'text-[10px] font-bold text-white',
                        'shadow-lg shadow-red-500/30',
                        'animate-pulse'
                    )}
                >
                    {(data as any).childCount || 0}+ hidden
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
