import toposort from "toposort";

export function topologicalSort(nodes: any[], edges: any[]) {
    if (edges.length === 0) return nodes;

    const edgesForSort: [string, string][] = edges.map((edge) => [
        edge.source,
        edge.target,
    ]);

    const sortedIds = toposort(edgesForSort);

    // Map sorted IDs back to original node objects
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const sortedNodes = sortedIds
        .map((id) => nodeMap.get(id))
        .filter((node) => !!node);

    // Add nodes that weren't part of any edges
    const connectedIds = new Set(sortedIds);
    const unconnectedNodes = nodes.filter((node) => !connectedIds.has(node.id));

    return [...unconnectedNodes, ...sortedNodes];
}
