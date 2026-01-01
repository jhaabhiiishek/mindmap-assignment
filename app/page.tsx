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
  const {
    maps,
    activeMapId,
    createMap,
    switchMap,
    deleteMap,
    initializeFromData,
  } = useMindMapStore();

  useEffect(() => {
    // Initialize with first map if no maps exist
    if (maps.length === 0) {
      createMap('Enterprise Software Architecture', initialData as any);
    } else if (activeMapId && maps.find((m) => m.id === activeMapId)) {
      // Load active map
      const activeMap = maps.find((m) => m.id === activeMapId);
      if (activeMap) {
        initializeFromData(activeMap.hierarchicalData);
      }
    }
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
