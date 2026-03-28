import type { Edge, Node } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LogicNodeData = {
  label: string;
  condition: string;
  isLooped: boolean;
};

export type LogicEdgeData = {
  edgeType: "if" | "else";
  isLooped: boolean;
};

export type LogicNode = Node<LogicNodeData>;
export type LogicEdge = Edge<LogicEdgeData>;

function dfs(
  node: string,
  graph: Record<string, string[]>,
  visited: Set<string>,
  currentPath: Set<string>,
): boolean {
  visited.add(node);

  currentPath.add(node);
  for (const nbr of graph[node] ?? []) {
    // if nbr is already in the current path, we found a cycle
    if (currentPath.has(nbr)) return true;

    // if nbr is already fully visited and didn't lead to a cycle, skip
    if (visited.has(nbr)) continue;

    // recursively visit nbr
    if (dfs(nbr, graph, visited, currentPath)) return true;
  }
  // backtrack: remove node from current path before returning
  currentPath.delete(node);

  return false;
}

export function detectCycles(
  nodes: LogicNode[],
  edges: LogicEdge[],
): Set<string> {
  const nodeIds = nodes.map((n) => n.id);
  const graph: Record<string, string[]> = {};

  // build a graph
  for (const edge of edges) {
    const { source, target } = edge;
    const sourceNode = graph[source] ?? [];

    sourceNode.push(target);
    graph[source] = sourceNode;
  }

  // track visited nodes
  const visited = new Set<string>();
  // track nodes in the current path for cycle detection
  const currentPath = new Set<string>();

  // Need to iterate over all nodes to cover disconnected components
  for (const nodeId of nodeIds) {
    if (visited.has(nodeId)) continue;
    dfs(nodeId, graph, visited, currentPath);
  }

  return currentPath;
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
        get().revalidate(nodes, get().edges);
      },

      setEdges: (edges) => {
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
        const nodes = get().nodes.filter((n) => n.id !== id);
        const edges = get().edges.filter(
          (e) => e.source !== id && e.target !== id,
        );
        get().revalidate(nodes, edges);
      },

      updateNodeData: (id, data) => {
        const nodes = get().nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
        );
        get().revalidate(nodes, get().edges);
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
            ...(e.data ?? { edgeType: "if" as const }),
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
