import React, { useState, useRef } from 'react';
import { X, Upload, FileJson, FileText, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMindMapStore } from '@/store/useMindMapStore';
import { parseJson, parseIndentedText } from '@/lib/parsers';

interface ImportModalProps {
    onClose: () => void;
}

export default function ImportModal({ onClose }: ImportModalProps) {
    const { createMap } = useMindMapStore();
    const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
    const [pasteContent, setPasteContent] = useState('');
    const [mapName, setMapName] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (content: string, type: 'json' | 'text') => {
        try {
            const name = mapName.trim() || 'Imported Map';
            let data;

            if (type === 'json') {
                data = parseJson(content);
            } else {
                data = parseIndentedText(content);
            }

            // If parsed data has a label and user didn't provide name, use data label
            const finalName = mapName.trim() || data.label || 'Imported Map';

            // Should add a createMapFromData action, but for now reuse createMap which takes a template
            // Assuming createMap(name, template) signature
            useMindMapStore.getState().createMap(finalName, data);

            onClose();
        } catch (error) {
            alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        readFile(file);
    };

    const readFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            // Simple heuristic to detect JSON
            const isJson = file.name.endsWith('.json') || content.trim().startsWith('{');
            handleImport(content, isJson ? 'json' : 'text');
        };
        reader.readAsText(file);
    };

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            readFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Import Map</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            New Map Name (Optional)
                        </label>
                        <input
                            type="text"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            placeholder="e.g. Project Plan"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-700">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'upload'
                                    ? 'text-cyan-400 border-cyan-400'
                                    : 'text-slate-400 border-transparent hover:text-slate-200'
                            )}
                        >
                            Upload File
                        </button>
                        <button
                            onClick={() => setActiveTab('paste')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'paste'
                                    ? 'text-cyan-400 border-cyan-400'
                                    : 'text-slate-400 border-transparent hover:text-slate-200'
                            )}
                        >
                            Paste Text
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'upload' ? (
                        <div
                            className={cn(
                                'h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors',
                                dragActive
                                    ? 'border-cyan-500 bg-cyan-900/10'
                                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="p-4 bg-slate-800 rounded-full">
                                <Upload className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-200">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    JSON, TXT, or Markdown files
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,.txt,.md"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Select File
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                                placeholder={`Paste your JSON or Indented text here...\n\nExample:\nRoot Node\n- Child 1\n  - Grandchild A\n- Child 2`}
                                className="w-full h-48 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono text-sm resize-none"
                            />
                            <button
                                onClick={() => handleImport(pasteContent, pasteContent.trim().startsWith('{') ? 'json' : 'text')}
                                disabled={!pasteContent.trim()}
                                className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Import Text
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
