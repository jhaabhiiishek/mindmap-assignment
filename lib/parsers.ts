import { HierarchicalNode } from '@/types';

/**
 * Validates and parses a JSON string into a HierarchicalNode
 */
export function parseJson(content: string): HierarchicalNode {
    try {
        const json = JSON.parse(content);
        if (!json.id || !json.label) {
            throw new Error('Invalid JSON structure. Root node must have "id" and "label" fields.');
        }
        return json as HierarchicalNode;
    } catch (error) {
        throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parses indented text (tabs or spaces) or Markdown lists into a HierarchicalNode structure
 * 
 * Example Input:
 * Root Node
 *   Child 1
 *     Grandchild A
 *   Child 2
 */
export function parseIndentedText(content: string): HierarchicalNode {
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
        throw new Error('Content is empty');
    }

    // Helper to calculate indentation level
    const getLevel = (line: string): number => {
        // Remove markdown list markers if present (- or *)
        const cleanLine = line.replace(/^[\t ]*[-*][\t ]+/, (match) => ' '.repeat(match.length));

        const match = cleanLine.match(/^[\t ]*/);
        if (!match) return 0;

        // Count tabs as 4 spaces, spaces as 1
        const whitespace = match[0];
        const tabCount = (whitespace.match(/\t/g) || []).length;
        const spaceCount = (whitespace.match(/ /g) || []).length;

        return tabCount + Math.floor(spaceCount / 2); // Assume 2 spaces per indent roughly
    };

    // Helper to clean label
    const getLabel = (line: string): string => {
        return line.trim().replace(/^[-*]\s+/, '').trim();
    };

    const rootLabel = getLabel(lines[0]);
    const root: HierarchicalNode = {
        id: 'root',
        label: rootLabel,
        type: 'root',
        summary: '',
        details: '',
        children: []
    };

    const stack: { node: HierarchicalNode; level: number }[] = [{ node: root, level: 0 }];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const level = getLevel(line);
        const label = getLabel(line);

        const newNode: HierarchicalNode = {
            id: `node-${Date.now()}-${i}`,
            label,
            type: level === 1 ? 'child' : 'grandchild', // Simple depth mapping
            summary: '',
            details: '',
            children: []
        };

        // Find parent
        // Pop stack until we find a node with level < current level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        if (stack.length === 0) {
            // Should not happen if indented correctly relative to root, but fallback to root
            // Treat as another root? No, treating as child of root for safety
            root.children?.push(newNode);
            stack.push({ node: newNode, level });
        } else {
            const parent = stack[stack.length - 1].node;
            if (!parent.children) parent.children = [];
            parent.children.push(newNode);
            stack.push({ node: newNode, level });
        }
    }

    return root;
}
