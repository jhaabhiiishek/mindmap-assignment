# Demo Video Script - Interactive Mindmap Application

**Duration:** 5-6 minutes  
**Resolution:** 1920×1080  
**Frame Rate:** 60fps  
**Audio:** Clear voice narration

---

## Pre-Recording Checklist

- [ ] Open application at http://localhost:3000
- [ ] Close all other browser tabs for clean recording
- [ ] Set browser zoom to 100%
- [ ] Enable cursor highlighting (optional)
- [ ] Test microphone audio levels
- [ ] Clear browser console
- [ ] Prepare screen recording software (OBS, Loom, etc.)

---

## Script Outline

### 🎬 Introduction (0:00 - 0:30)

**Visual:** Full mindmap view on screen

**Narration:**
> "Hello! I'm excited to present my Interactive Mindmap Application - a production-grade, data-driven visualization built with Next.js, TypeScript, and React Flow.
> 
> This application demonstrates advanced frontend development capabilities including component architecture, state management, and interactive UI design.
> 
> Let me show you what makes this mindmap special."

**Actions:**
- Show the full mindmap with all 17 nodes visible
- Pan slightly to show the entire visualization
- Pause to let viewer see the visual hierarchy

---

### 📊 Data-Driven Architecture (0:30 - 1:30)

**Visual:** Code editor showing initialData.json

**Narration:**
> "The most important feature of this mindmap is that it's completely data-driven. The entire visualization is generated from a single JSON file.
> 
> Here's the initialData.json file that defines our enterprise software architecture mindmap. Notice the hierarchical structure - we have a root node with children, and those children have their own children.
> 
> Each node contains an ID, label, type, summary for quick reference, and detailed descriptions. This structure is what drives the entire visualization."

**Actions:**
1. Open VS Code or file explorer
2. Navigate to `data/initialData.json`
3. Scroll through the JSON structure
4. Highlight key fields: id, label, summary, details, children
5. Show 2-3 different nodes (root, child, grandchild)

**Narration (continued):**
> "The beauty of this approach is that I can modify just this JSON file - add nodes, change text, reorganize the hierarchy - and the mindmap updates automatically without touching any UI code. This is true data-driven architecture."

**Actions:**
- Briefly show how adding a node in JSON would work
- Switch back to browser

---

### 🎨 Visual Hierarchy (1:30 - 2:00)

**Visual:** Return to mindmap application

**Narration:**
> "Back in the application, you can see how the data translates into a beautiful visual hierarchy. The mindmap uses depth-based gradient styling.
> 
> The root node 'Enterprise Software Architecture' is styled with a purple-to-blue gradient and is the largest. The four main children - Frontend Development, Backend Systems, Infrastructure, and Data Management - use blue-to-cyan gradients. And the twelve grandchildren use cyan-to-teal gradients.
> 
> All node positions are calculated automatically using the Dagre layout algorithm - there are zero hardcoded coordinates."

**Actions:**
- Pan to show root node (purple gradient)
- Pan to child nodes (blue gradients)
- Pan to grandchild nodes (cyan gradients)
- Use fit view to show entire graph

---

### 🖱️ Interactive Feature: HoverCard (2:00 - 2:30)

**Visual:** Hovering over different nodes

**Narration:**
> "Now let me demonstrate the interactive features. First, the hover card.
> 
> When I hover over any node, a floating card appears showing the node's label and a summary description. This gives you quick context without cluttering the visualization.
> 
> The card follows my cursor and disappears when I move away."

**Actions:**
1. Hover over "Frontend Development" - show HoverCard
2. Move to "Backend Systems" - show different summary
3. Hover over "React Ecosystem" grandchild
4. Move mouse away to hide card
5. Hover over 2-3 more nodes to demonstrate

---

### 📋 Interactive Feature: SidePanel & Editing (2:30 - 3:30)

**Visual:** Clicking nodes and opening side panel

**Narration:**
> "Clicking on any node opens a detailed side panel that slides in from the right. Let's click on 'Backend Systems'.
> 
> The panel shows comprehensive information: the node label which is editable, node type badge color-coded by depth, depth number, full summary text, detailed description, and the unique node ID.
> 
> Here's the really cool part - watch what happens when I edit the label."

**Actions:**
1. Click "Backend Systems" node
2. Wait for side panel to slide in
3. Point out each section:
   - Label input field
   - Type badge (blue "child")
   - Depth: 1
   - Summary section
   - Details section
   - Node ID

**Narration (continued):**
> "I'm going to change 'Backend Systems' to 'Backend Architecture'. Notice how the node label updates in real-time as I type. This is true two-way data binding between the UI and the Zustand store."

**Actions:**
4. Click in label input field
5. Select all text (Ctrl+A)
6. Type "Backend Architecture"
7. Show the node updating in the background
8. Click X to close panel

---

### ⚡ Interactive Feature: Edge Highlighting (3:30 - 4:00)

**Visual:** Selecting nodes to show edge highlighting

**Narration:**
> "Another interactive feature is edge highlighting. When I select a node, all connected edges - both to parents and children - become thicker and gain a glow effect.
> 
> This helps you understand the relationships in the mindmap at a glance."

**Actions:**
1. Click "Frontend Development" - show edge highlighting
2. Point out the highlighted edges (root → frontend, frontend → children)
3. Click "Data Management" - show different edges highlighted
4. Click "Databases" grandchild - show parent edge highlighted
5. Click background to deselect

---

### 🔽 Interactive Feature: Expand/Collapse (4:00 - 4:45)

**Visual:** Collapsing and expanding branches

**Narration:**
> "For managing large hierarchies, I've implemented expand and collapse functionality. Notice the small circular buttons on nodes that have children.
> 
> When I click the chevron button on 'Frontend Development', all its children disappear. The layout automatically recalculates to fill the space.
> 
> Clicking again expands it back. The icon toggles between a down chevron and right chevron to show the state."

**Actions:**
1. Point out expand/collapse button on "Frontend Development"
2. Click to collapse - children disappear
3. Show the chevron icon changed to Right
4. Show the layout recalculated (no gaps)
5. Click again to expand - children reappear
6. Try collapsing "Infrastructure & DevOps" as well
7. Expand it back

---

### 🎮 Navigation Controls (4:45 - 5:15)

**Visual:** Using pan, zoom, and controls

**Narration:**
> "The mindmap is fully interactive. You can pan by dragging, zoom with the mouse wheel or the zoom controls, and drag individual nodes to reposition them.
> 
> The minimap in the bottom left shows your current viewport position. The controls on the bottom right let you zoom in, zoom out, and fit the entire graph to view.
> 
> If nodes get messy from dragging, the Reset Layout button recalculates all positions using the Dagre algorithm."

**Actions:**
1. Click and drag canvas to pan
2. Use mouse wheel to zoom in
3. Use mouse wheel to zoom out
4. Click zoom + button
5. Click zoom - button
6. Click fit view button
7. Drag a node to move it
8. Click "Reset Layout" button - show it recalculate
9. Point to minimap showing overview

---

### 🏗️ Architecture Summary (5:15 - 5:45)

**Visual:** Quick code glimpse or diagram

**Narration:**
> "Under the hood, this application uses a clean, scalable architecture. Next.js handles the framework, React Flow renders the interactive graph, Zustand manages state with zero boilerplate, and Dagre calculates optimal layouts.
> 
> The data flows from the JSON file through a transformation pipeline that flattens the hierarchy, calculates positions, and stores everything in Zustand. React Flow subscribes to that state and renders the visualization.
> 
> All interactions - hover, click, edit - update the store, which triggers re-renders with the new state."

**Actions:**
- Optionally show quick glimpse of:
  - Folder structure
  - MindMap.tsx component
  - useMindMapStore.ts
- Or just show the architecture diagram from README

---

### ✅ Conclusion (5:45 - 6:00)

**Visual:** Full mindmap view

**Narration:**
> "To summarize: this Interactive Mindmap Application demonstrates data-driven architecture, where the entire visualization is generated from JSON. It features hover cards, detailed panels, real-time editing, edge highlighting, and expand/collapse functionality.
> 
> Built with Next.js, TypeScript, React Flow, and Zustand, this project showcases production-grade frontend development with clean architecture, type safety, and excellent user experience.
> 
> Thank you for watching!"

**Actions:**
1. Return to full mindmap view
2. Do a final slow pan across the visualization
3. Fade out

---

## Recording Tips

### Before Recording
1. **Clean Desktop** - Close unnecessary applications
2. **Browser Setup** - Only have the mindmap tab open
3. **Console** - Clear any errors (F12 → Console → Clear)
4. **Audio** - Test mic, reduce background noise
5. **Cursor** - Use cursor highlighting tool if available

### During Recording
1. **Speak Clearly** - Moderate pace, avoid filler words
2. **Smooth Mouse** - Move cursor deliberately, not erratically  
3. **Pause** - Brief pauses between sections
4. **Demonstrate** - Actually perform actions, don't skip
5. **Zoom Level** - Keep browser at 100% zoom

### After Recording
1. **Review** - Watch entire video
2. **Check Audio** - Ensure narration is audible
3. **Verify Features** - All core features demonstrated
4. **Edit** - Trim dead air, add transitions if needed
5. **Export** - 1920×1080, 60fps, MP4 format

---

## Alternative: No-Narration Version

If you prefer a silent video with text overlays:

1. **Use on-screen text** for each section
2. **Slow down** actions so viewer can read
3. **Highlight** with arrows or circles
4. **Add captions** explaining each feature
5. **Background music** (optional, keep subtle)

---

## Submission Format

**Video File:**
- Format: MP4 or WebM
- Resolution: 1920×1080 (minimum 1280×720)
- Duration: 5-6 minutes
- Size: Under 100MB (use compression if needed)

**Upload Options:**
- YouTube (unlisted link)
- Google Drive (public link)
- Loom
- Vimeo

**Include in Submission:**
- Video link in README.md
- Timestamp markers (optional)
- Transcript (this script can serve as one)

---

## Key Points to Emphasize

1. ✅ **Data-Driven** - Show JSON driving the visualization
2. ✅ **No Hardcoding** - Emphasize dynamic generation
3. ✅ **Interactive** - Demonstrate all 5 key features
4. ✅ **Real-Time Updates** - Show label editing instantly updating
5. ✅ **Clean Architecture** - Mention tech stack and design
6. ✅ **Production Quality** - Highlight polish and UX

---

Good luck with your recording! 🎥🚀
