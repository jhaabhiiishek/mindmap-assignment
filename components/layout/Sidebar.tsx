'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Map, Trash2, ChevronLeft, ChevronRight, GripVertical, Upload } from 'lucide-react';
import ImportModal from '../mindmap/ImportModal';
import { cn } from '@/lib/utils';

interface SidebarProps {
    maps: Array<{ id: string; name: string; createdAt: Date }>;
    activeMapId: string;
    onSelectMap: (mapId: string) => void;
    onCreateMap: () => void;
    onDeleteMap: (mapId: string) => void;
    onWidthChange?: (width: number) => void;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const COLLAPSED_WIDTH = 48;

export default function Sidebar({
    maps,
    activeMapId,
    onSelectMap,
    onCreateMap,
    onDeleteMap,
    onWidthChange,
}: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [width, setWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onWidthChange?.(isCollapsed ? COLLAPSED_WIDTH : width);
    }, [isCollapsed, width, onWidthChange]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!sidebarRef.current) return;
            const newWidth = e.clientX;
            if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
                setWidth(newWidth);
                onWidthChange?.(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, onWidthChange]);

    if (isCollapsed) {
        return (
            <div className="fixed left-0 top-0 h-full w-12 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 z-50 flex flex-col">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="w-full h-12 flex items-center justify-center hover:bg-slate-800 transition-colors"
                    title="Expand sidebar"
                >
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* Vertical text */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="transform -rotate-90 whitespace-nowrap text-xs text-slate-500 font-medium">
                        My Maps ({maps.length})
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={sidebarRef}
            className="fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 z-50 flex"
            style={{ width: `${width}px` }}
        >
            {/* Import Modal */}
            {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}

            {/* Main sidebar content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Map className="w-5 h-5 text-cyan-400" />
                        My Maps
                    </h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded hover:bg-slate-800 transition-colors"
                        title="Collapse sidebar"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* New Map Button */}
                <div className="p-3 space-y-2">
                    <button
                        onClick={onCreateMap}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-cyan-600 hover:bg-cyan-500',
                            'text-white font-medium text-sm',
                            'flex items-center justify-center gap-2',
                            'transition-all duration-200',
                            'hover:scale-[1.02] active:scale-95',
                            'shadow-lg shadow-cyan-500/20'
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        New Map
                    </button>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-slate-800 hover:bg-slate-700 border border-slate-600',
                            'text-slate-200 font-medium text-sm',
                            'flex items-center justify-center gap-2',
                            'transition-all duration-200',
                            'hover:scale-[1.02] active:scale-95'
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        Import Map
                    </button>
                </div>

                {/* Map List */}
                <div className="flex-1 overflow-y-auto px-3 space-y-2">
                    {maps.map((map) => (
                        <div
                            key={map.id}
                            className={cn(
                                'group relative rounded-lg p-3 cursor-pointer transition-all',
                                'border',
                                map.id === activeMapId
                                    ? 'bg-cyan-900/30 border-cyan-500/40 ring-2 ring-cyan-500/30'
                                    : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600'
                            )}
                            onClick={() => onSelectMap(map.id)}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div
                                        className={cn(
                                            'font-medium text-sm truncate',
                                            map.id === activeMapId ? 'text-white' : 'text-slate-300'
                                        )}
                                    >
                                        {map.name}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {new Date(map.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                {maps.length > 1 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Delete "${map.name}"?`)) {
                                                onDeleteMap(map.id);
                                            }
                                        }}
                                        className={cn(
                                            'opacity-0 group-hover:opacity-100',
                                            'p-1.5 rounded hover:bg-red-900/50',
                                            'transition-all'
                                        )}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Stats */}
                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 text-center">
                        {maps.length} {maps.length === 1 ? 'map' : 'maps'} total
                    </div>
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className={cn(
                    'w-1 hover:w-1.5 bg-transparent hover:bg-cyan-500/50 cursor-col-resize transition-all',
                    isResizing && 'w-1.5 bg-cyan-500'
                )}
                onMouseDown={() => setIsResizing(true)}
                title="Drag to resize"
            >
                <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-slate-600" />
                </div>
            </div>
        </div>
    );
}
