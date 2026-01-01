import React, { useState, useRef, useEffect } from 'react';
import {
    Maximize2,
    Minimize2,
    ArrowDownCircle,
    ArrowUpCircle,
    Expand,
    Plus,
    FileText,
    Download,
    ChevronDown,
    Image as ImageIcon,
    FileJson,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopToolbarProps {
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onDrillDown: () => void;
    onDrillUp: () => void;
    onFitView: () => void;
    onResetLayout: () => void;
    onAddNode: () => void;
    onFullDocumentation: () => void;
    onDownloadJson: () => void;
    onDownloadImage: (format: 'png' | 'jpeg' | 'svg') => void;
    canDrillUp?: boolean;
}

export default function TopToolbar({
    onExpandAll,
    onCollapseAll,
    onDrillDown,
    onDrillUp,
    onFitView,
    onResetLayout,
    onAddNode,
    onFullDocumentation,
    onDownloadJson,
    onDownloadImage,
    canDrillUp = false,
}: TopToolbarProps) {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setShowDownloadMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const buttonClass = cn(
        'px-3 py-1.5 rounded-lg font-medium text-xs whitespace-nowrap', // Smaller, no wrap
        'flex items-center gap-2',
        'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600', // Unified dark theme
        'transition-all duration-200',
        'hover:scale-105 active:scale-95',
        'shadow-md hover:shadow-lg'
    );

    const activeIconClass = "w-3.5 h-3.5 text-cyan-400"; // Colored icons

    return (
        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl px-4 py-2">
            {/* Expand All */}
            <button
                onClick={onExpandAll}
                className={buttonClass}
                title="Expand all nodes"
            >
                <Maximize2 className={activeIconClass} />
                Expand All
            </button>

            {/* Collapse All */}
            <button
                onClick={onCollapseAll}
                className={buttonClass}
                title="Collapse all nodes"
            >
                <Minimize2 className={activeIconClass} />
                Collapse All
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            {/* Drill Down */}
            <button
                onClick={onDrillDown}
                className={buttonClass}
                title="Focus on selected node"
            >
                <ArrowDownCircle className={activeIconClass} />
                Drill Down
            </button>

            {/* Drill Up */}
            <button
                onClick={onDrillUp}
                className={cn(
                    buttonClass,
                    !canDrillUp && 'opacity-50 cursor-not-allowed hover:bg-slate-700 hover:scale-100'
                )}
                title="Return to parent view"
                disabled={!canDrillUp}
            >
                <ArrowUpCircle className={activeIconClass} />
                Drill Up
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            {/* Fit View */}
            <button
                onClick={onFitView}
                className={buttonClass}
                title="Fit view to canvas"
            >
                <Expand className="w-3.5 h-3.5 text-pink-400" />
                Fit View
            </button>

            {/* Reset Layout */}
            <button
                onClick={onResetLayout}
                className={buttonClass}
                title="Reset layout to hierarchy"
            >
                <Layout className="w-3.5 h-3.5 text-purple-400" />
                Reset Layout
            </button>

            {/* Add Node */}
            <button
                onClick={onAddNode}
                className={buttonClass}
                title="Add new node"
            >
                <Plus className="w-3.5 h-3.5 text-green-400" />
                Add Node
            </button>



            {/* Download Dropdown */}
            <div className="relative" ref={downloadMenuRef}>
                <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className={cn(buttonClass, 'pr-2')}
                    title="Download options"
                >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    Download
                    <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
                </button>

                {showDownloadMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                        <button
                            onClick={() => {
                                onDownloadJson();
                                setShowDownloadMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2"
                        >
                            <FileJson className="w-4 h-4 text-yellow-400" />
                            Download JSON
                        </button>
                        <div className="h-px bg-slate-700 my-1" />
                        <button
                            onClick={() => {
                                onDownloadImage('png');
                                setShowDownloadMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2"
                        >
                            <ImageIcon className="w-4 h-4 text-blue-400" />
                            Download PNG
                        </button>
                        <button
                            onClick={() => {
                                onDownloadImage('jpeg');
                                setShowDownloadMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2"
                        >
                            <ImageIcon className="w-4 h-4 text-green-400" />
                            Download JPEG
                        </button>
                        <button
                            onClick={() => {
                                onDownloadImage('svg');
                                setShowDownloadMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-slate-700 flex items-center gap-2"
                        >
                            <ImageIcon className="w-4 h-4 text-pink-400" />
                            Download SVG
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
