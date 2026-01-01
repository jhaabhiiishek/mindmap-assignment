# Interactive Hierarchical Mindmap

A data-driven, interactive mindmap visualization built with Next.js, React Flow, and Zustand.

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Features

- **Interactive Visualization**: Zoom, pan, and explore hierarchical data.
- **Collapsible Branches**: Click node handles or use the toolbar to collapse branches.
- **Drill Down/Up**: Focus on specific sub-trees for better clarity.
- **Data Driven**: Fully generated from JSON data. Load your own files!
- **Editing**: Add nodes, delete nodes, and edit content directly in the UI.
- **Multiple Maps**: Create and manage multiple mindmaps.
- **Local Persistence**: Work is automatically saved to your browser.

## 📁 Project Structure

- `components/mindmap/` - Core visualization components
  - `MindMap.tsx` - Main canvas wrapper
  - `MindMapNode.tsx` - Custom node renderer
  - `TopToolbar.tsx` - Action buttons
- `store/` - Zustand state management
  - `useMindMapStore.ts` - All logic for hierarchy, layout, and interaction
- `lib/` - Utilities
  - `dataTransform.ts` - Logic for flattening trees and calculating Dagre layouts

## 🛠️ Data Format

The application expects a recursive JSON structure:

```json
{
  "id": "root",
  "label": "Main Topic",
  "type": "root",
  "summary": "Brief summary",
  "details": "Detailed description...",
  "children": [
    {
      "id": "child-1",
      "label": "Sub Topic",
      "children": [...]
    }
  ]
}
```

## 📝 Assignment Requirements Checked

- [x] Hierarchical Mindmap Visualization
- [x] Hover Interactions (HoverCard)
- [x] Click Interactions (Selection/Collapse)
- [x] Data-Driven Rendering (JSON)
- [x] Side Panel for Details
- [x] Add/Delete/Edit Capabilities
- [x] Export/Download Functionality
