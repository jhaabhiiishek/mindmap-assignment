'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps {
    visible: boolean;
    summary: string;
    label: string;
    position: { x: number; y: number };
}

/**
 * HoverCard component that displays node summary on hover
 * Follows the mouse cursor and shows contextual information
 */
export default function HoverCard({ visible, summary, label, position }: HoverCardProps) {
    if (!visible) return null;

    return (
        <div
            className={cn(
                'fixed pointer-events-none z-50',
                'bg-slate-900/95 backdrop-blur-md',
                'border border-white/20',
                'rounded-lg shadow-2xl',
                'px-4 py-3 max-w-xs',
                'animate-in fade-in duration-200'
            )}
            style={{
                left: `${position.x + 20}px`,
                top: `${position.y - 10}px`,
            }}
        >
            <div className="text-sm font-semibold text-white mb-1">
                {label}
            </div>
            <div className="text-xs text-gray-300 leading-relaxed">
                {summary}
            </div>
        </div>
    );
}
