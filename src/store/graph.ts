import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LogicNodeData = {
  label: string;
  condition: string;
  isLooped: boolean;
};

export type LogicEdgeData = {
  isLooped: boolean;
};

export type LogicNode = Node<LogicNodeData>;
export type LogicEdge = Edge<LogicEdgeData>;

function dfs(
  node: string,
  graph: Record<string, string[]>,
  visited: Set<string>,
  pathStack: string[],
  pathSet: Set<string>,
  cycleNodes: Set<string>,
): void {
  visited.add(node);
  pathStack.push(node);
  pathSet.add(node);

  for (const nbr of graph[node] ?? []) {
    if (pathSet.has(nbr)) {
      const cycleStart = pathStack.indexOf(nbr);
      for (let i = cycleStart; i < pathStack.length; i++) {
        cycleNodes.add(pathStack[i]);
      }
    } else if (!visited.has(nbr)) {
      dfs(nbr, graph, visited, pathStack, pathSet, cycleNodes);
    }
  }

  // Backtrack
  pathStack.pop();
  pathSet.delete(node);
}

export function detectCycles(
  nodes: LogicNode[],
  edges: LogicEdge[],
): Set<string> {
  const nodeIds = nodes.map((n) => n.id);
  const graph: Record<string, string[]> = {};

  // Build adjacency list
  for (const edge of edges) {
    const { source, target } = edge;
    const sourceNode = graph[source] ?? [];
    sourceNode.push(target);
    graph[source] = sourceNode;
  }

  const visited = new Set<string>();
  const cycleNodes = new Set<string>(); // only nodes that ARE part of a cycle

  // Iterate over all nodes to cover disconnected components
  for (const nodeId of nodeIds) {
    if (visited.has(nodeId)) continue;
    dfs(nodeId, graph, visited, [], new Set(), cycleNodes);
  }

  return cycleNodes;
}

function nextId() {
  return `n-${Date.now()}`;
}

const DEFAULT_NODES: LogicNode[] = [
  {
    id: `n-${Date.now() + 1}`,
    type: "logicNode",
    position: { x: 200, y: 60 },
    data: { label: "Root", condition: "x > 0", isLooped: false },
  },
  {
    id: `n-${Date.now() + 2}`,
    type: "logicNode",
    position: { x: 50, y: 220 },
    data: { label: "Branch A", condition: "y === true", isLooped: false },
  },
];

const DEFAULT_EDGES: LogicEdge[] = [];

type LogicFlowState = {
  nodes: LogicNode[];
  edges: LogicEdge[];
  hasCycle: boolean;

  setNodes: (nodes: LogicNode[]) => void;
  setEdges: (edges: LogicEdge[]) => void;

  addNode: (position: { x: number; y: number }) => LogicNode;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<LogicNodeData>) => void;

  revalidate: (nodes?: LogicNode[], edges?: LogicEdge[]) => void;
  reset: () => void;
};

export const useLogicFlowStore = create<LogicFlowState>()(
  persist(
    (set, get) => ({
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      hasCycle: false,

      setNodes: (nodes) => {
        set({ nodes });
      },

      setEdges: (edges) => {
        // When edge change due to connection with existing edge, we need revalidate
        get().revalidate(get().nodes, edges);
      },

      addNode: (position) => {
        const id = nextId();
        const newNode: LogicNode = {
          id,
          type: "logicNode",
          position,
          data: { label: "New Node", condition: "", isLooped: false },
        };
        const nodes = [...get().nodes, newNode];
        get().revalidate(nodes, get().edges);
        return newNode;
      },

      deleteNode: (id) => {
        const allEdges = get().edges;

        // Remove the deleted node and all its connected edges
        const updatedNodes = get().nodes.filter((n) => n.id !== id).map((n) => ({ ...n, data: { ...n.data, isLooped: false } }));
        const remainingEdges = allEdges.filter(
          (e) => e.source !== id && e.target !== id,
        );

        if (get().hasCycle) {
          // Cycle present: just remove the node, no bridging
          get().revalidate(updatedNodes, remainingEdges);
        } else {
          // No cycle: bridge the single parent to the single child (if both exist)
          const parentEdge = allEdges.find((e) => e.target === id);
          const childEdge = allEdges.find((e) => e.source === id);

          const edges =
            parentEdge && childEdge
              ? [
                ...remainingEdges,
                {
                  id: `e-${parentEdge.source}-${childEdge.target}`,
                  source: parentEdge.source,
                  target: childEdge.target,
                  data: { isLooped: false },
                } satisfies LogicEdge,
              ]
              : remainingEdges;

          set({ nodes: updatedNodes, edges });
        }
      },

      updateNodeData: (id, data) => {
        const nodes = get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
        );
        set({ nodes });
      },

      revalidate: (nodes = get().nodes, edges = get().edges) => {
        const looped = detectCycles(nodes, edges);
        const hasCycle = looped.size > 0;
        const updatedNodes = nodes.map((n) => ({
          ...n,
          data: { ...n.data, isLooped: looped.has(n.id) },
        }));
        // Also mark edges
        const updatedEdges = edges.map((e) => ({
          ...e,
          data: {
            isLooped: looped.has(e.source) && looped.has(e.target),
          },
          animated: looped.has(e.source) && looped.has(e.target),
          style: {
            stroke:
              looped.has(e.source) && looped.has(e.target)
                ? "#ef4444"
                : undefined,
            strokeWidth:
              looped.has(e.source) && looped.has(e.target) ? 2 : undefined,
          },
        }));
        set({ nodes: updatedNodes, edges: updatedEdges, hasCycle });
      },

      reset: () =>
        set({ nodes: DEFAULT_NODES, edges: DEFAULT_EDGES, hasCycle: false }),
    }),
    {
      name: "logic-flow-storage",
      // Don't persist isLooped – recompute on load
      partialize: (s) => ({
        nodes: s.nodes.map((n) => ({
          ...n,
          data: { ...n.data, isLooped: false },
        })),
        edges: s.edges,
      }),
    },
  ),
);
