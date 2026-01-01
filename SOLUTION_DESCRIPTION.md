# Interactive Mindmap Solution Description

## 1. Technologies Used
- **Framework**: [Next.js 16.1.1 (App Router)](https://nextjs.org/) - Chosen for its robustness, server-side capabilities, and easy deployment.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Correctness and maintainability through strong typing.
- **Visualization**: [React Flow (@xyflow/react)](https://reactflow.dev/) - A powerful library for node-based applications. It provides the canvas, zooming, panning, and event handling out of the box.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight, unopinionated state management. Used with `persist` middleware to save mindmaps to LocalStorage.
- **Layout Engine**: [Dagre](https://github.com/dagrejs/dagre) - Directed graph layout algorithm used to automatically calculate node positions based on hierarchy.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS for rapid, maintainable, and responsive design.
- **Icons**: [Lucide React](https://lucide.dev/) - Clean, consistent iconography.

## 2. Architecture & Approach

### Component Structure
- **`Page.tsx`**: Main entry point. Handles initial data loading and hydration checks.
- **`Sidebar.tsx`**: Manages the list of saved mindmaps and navigation.
- **`MindMap.tsx`**: The core visualization wrapper. Handles React Flow initialization, global events, and toolbars.
- **`MindMapNode.tsx`**: Custom node component. Renders different visual styles (Blue/Green/Orange/Purple) based on hierarchy depth. Handles local interactions like expand/collapse.
- **`TopToolbar.tsx`**: Provides global actions: Expand/Collapse All, Drill Down/Up, Fit View, Add Node, etc.
- **`SidePanel.tsx`**: Displays detailed information for the selected node and allows editing.

### State Management (Store)
The application uses a centralized `useMindMapStore` which handles:
- **Multi-map management**: Storing multiple distinct mindmaps.
- **Active map state**: Nodes, edges, and currently selected node.
- **Hierarchical Data**: The "source of truth" recursive data structure.
- **Layout Calculation**: Whenever the hierarchy changes (expand/collapse/add), the store recalculates positions using Dagre and updates the flat `nodes` and `edges` arrays used by React Flow.

## 3. Data Flow

1. **Input (JSON)**: The app accepts a hierarchical JSON object.
   ```json
   {
     "id": "root",
     "label": "Root Topic",
     "children": [...]
   }
   ```
2. **Flattening**: The `flattenHierarchy` utility converts this recursive tree into flat arrays of `nodes` and `edges` that React Flow understands.
3. **Layout**: The `calculateLayout` utility uses Dagre to assign x/y coordinates to each node based on the graph structure.
4. **Filtering**: The `filterCollapsedNodes` utility checks the `collapsedNodeIds` set and excludes children of collapsed nodes from the final render.
5. **Rendering**: React Flow renders the processed nodes and edges.
6. **Interaction**:
   - **Click Node**: Updates `selectedNodeId` -> Triggers `SidePanel` update.
   - **Expand/Collapse**: Updates `collapsedNodeIds` -> Triggers re-flattening/re-layout -> Updates View.
   - **Edit Node**: Updates the source hierarchical data -> Triggers re-layout -> Updates View.

This **Data-Driven** approach ensures that the visual representation always strictly reflects the underlying JSON data.

## 4. Key Features Implemented
- **Dynamic Hierarchy**: Fully collapsible/expandable branches.
- **Drill Down/Up**: Focus mode to view specific subtrees.
- **Editable Content**: Edit labels, summaries, and details directly in the UI.
- **Multi-Map Support**: Create and switch between different mindmaps.
- **JSON Import/Export**: Fully supports the data-driven requirement.
- **Visual Feedback**: Hover effects, edge highlighting, and depth-based color coding.
