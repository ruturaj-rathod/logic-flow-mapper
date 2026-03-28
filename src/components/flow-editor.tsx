import { useCallback } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  Position,
  ReactFlow,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type OnConnectEnd,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import LogicNodeComponent from "@/components/logic-node";
import {
  useLogicFlowStore,
  type LogicEdge,
  type LogicNode,
} from "@/store/graph";

// Custom node
const NODE_TYPES = { logicNode: LogicNodeComponent };

function FlowEditor() {
  const { edges, nodes, setEdges, setNodes, addNode } = useLogicFlowStore();
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange<LogicNode>[]) =>
      setNodes(applyNodeChanges(changes, nodes)),
    [setNodes, nodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<LogicEdge>[]) =>
      setEdges(applyEdgeChanges(changes, edges)),
    [setEdges, edges],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Before adding, remove any existing edge that uses the same source + sourceHandle
      const filtered = edges.filter(
        (e) =>
          !(
            e.source === params.source && e.sourceHandle === params.sourceHandle
          ),
      );
      setEdges(addEdge(params, filtered));
    },
    [setEdges, edges],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      // Only fire when dropped on empty canvas
      if (connectionState.isValid) return;

      // Not create node when dropped on top handle
      if (connectionState.fromPosition === Position.Top) return;

      const target = event as MouseEvent | TouchEvent;
      const clientX =
        "clientX" in target
          ? target.clientX
          : (target as TouchEvent).touches[0].clientX;
      const clientY =
        "clientY" in target
          ? target.clientY
          : (target as TouchEvent).touches[0].clientY;

      const position = screenToFlowPosition({ x: clientX, y: clientY });
      const newNode = addNode(position);

      const fromNode = connectionState.fromNode?.id;
      const fromHandle = connectionState.fromHandle?.id;
      if (!fromNode || !fromHandle) return;

      const params: Connection = {
        source: fromNode,
        sourceHandle: fromHandle,
        target: newNode.id,
        targetHandle: "in",
      };

      // Enforce single connection on the source handle
      const filtered = edges.filter(
        (e) => !(e.source === fromNode && e.sourceHandle === fromHandle),
      );
      setEdges(addEdge(params, filtered));
    },
    [screenToFlowPosition, addNode, edges, setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      fitView
      deleteKeyCode="Delete"
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "smoothstep" }}
    >
      <Controls />
    </ReactFlow>
  );
}

export default FlowEditor;
