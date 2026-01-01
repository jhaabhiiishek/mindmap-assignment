'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMindMapStore } from '@/store/useMindMapStore';
import initialData from '@/data/initialData.json';
import Sidebar from '@/components/layout/Sidebar';

// Dynamically import MindMap to avoid SSR issues
const MindMap = dynamic(() => import('@/components/mindmap/MindMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-white text-xl">Loading mindmap...</div>
    </div>
  ),
});

export default function Home() {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    maps,
    activeMapId,
    createMap,
    switchMap,
    deleteMap,
    initializeFromData,
  } = useMindMapStore();

  useEffect(() => {
    // Only run once on mount
    if (isInitialized) return;

    // Small delay to ensure zustand persist middleware has loaded from localStorage
    const timer = setTimeout(() => {
      const currentMaps = useMindMapStore.getState().maps;
      const currentActiveId = useMindMapStore.getState().activeMapId;

      // If no maps exist (first time user), create default map
      if (currentMaps.length === 0) {
        createMap('Enterprise Software Architecture', initialData as any);
      } else {
        // Maps exist from localStorage
        // If no active map is set, activate the first one
        if (!currentActiveId) {
          switchMap(currentMaps[0].id);
        } else {
          // Active map is set, just load it
          const activeMap = currentMaps.find((m) => m.id === currentActiveId);
          if (activeMap) {
            initializeFromData(activeMap.hierarchicalData);
            // Restore collapsed state
            let collapsedIds = new Set<string>();
            if (activeMap.collapsedNodeIds instanceof Set) {
              collapsedIds = activeMap.collapsedNodeIds;
            } else if (Array.isArray(activeMap.collapsedNodeIds)) {
              collapsedIds = new Set(activeMap.collapsedNodeIds);
            } else {
              collapsedIds = new Set(activeMap.collapsedNodeIds as unknown as string[] || []);
            }
            useMindMapStore.setState({ collapsedNodeIds: collapsedIds });
          }
        }
      }

      setIsInitialized(true);
    }, 100); // Small delay for persistence to load

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        maps={maps}
        activeMapId={activeMapId}
        onSelectMap={switchMap}
        onCreateMap={() => createMap()}
        onDeleteMap={deleteMap}
        onWidthChange={setSidebarWidth}
      />

      {/* Main Content - dynamically offset by sidebar width */}
      <div
        className="absolute left-0 top-0 w-full h-full transition-all duration-200"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <MindMap />
      </div>
    </div>
  );
}
