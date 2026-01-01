'use client';

import React, { useRef } from 'react';
import { HierarchicalNode } from '@/types';

interface JsonUploadProps {
    onJsonLoad: (data: HierarchicalNode) => void;
}

export default function JsonUpload({ onJsonLoad }: JsonUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                // Validate that it has required structure
                if (!json.id || !json.label) {
                    throw new Error('Invalid JSON structure. Must have "id" and "label" fields.');
                }
                onJsonLoad(json);
                alert('Mindmap loaded successfully!');
            } catch (error) {
                alert(`Error loading JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be loaded again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleFileChange}
            className="hidden"
        />
    );
}

export { JsonUpload };
