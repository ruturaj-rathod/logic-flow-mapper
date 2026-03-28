import { Handle, Position, type NodeProps } from "@xyflow/react";

import { useLogicFlowStore, type LogicNode } from "@/store/graph";
import HeroTrashIcon from "@/icons/trash";
import EditableField from "./editable-field";

function LogicNodeComponent(props: NodeProps<LogicNode>) {
  const { id, data } = props;
  const { deleteNode, updateNodeData } = useLogicFlowStore();
  const isLooped = data.isLooped;

  return (
    <div
      className={`
        relative rounded-xl shadow-2xl border transition-all duration-300 min-w-50 max-w-65
        ${
          isLooped
            ? "border-red-500 bg-linear-to-br from-red-950/90 to-red-900/80 shadow-red-500/30"
            : "border-white/10 bg-linear-to-br from-slate-800/95 to-slate-900/95 shadow-black/40"
        }
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ transform: "none" }}
        className="w-3! h-3! bg-slate-400! border-2! border-slate-600! hover:bg-indigo-400! transition-colors"
      />

      <div
        className={`flex items-center justify-between px-3 pt-3 pb-1 border-b ${
          isLooped ? "border-red-500/30" : "border-white/10"
        }`}
      >
        <div className="flex-1">
          <EditableField
            value={data.label}
            onChange={(v) => updateNodeData(id, { label: v })}
            placeholder="Node name"
            className="font-semibold text-sm text-white truncate"
          />
        </div>

        <button
          onClick={() => deleteNode(id)}
          className="ml-2 cursor-pointer text-white/30 hover:text-red-400 transition-colors shrink-0"
          title="Delete node"
        >
          <HeroTrashIcon className="size-5" />
        </button>
      </div>

      <div className="px-3 py-2">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
          Condition
        </p>
        <EditableField
          value={data.condition}
          onChange={(v) => updateNodeData(id, { condition: v })}
          placeholder="Enter condition…"
          className="text-xs text-white/80 font-mono leading-snug"
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="if"
        style={{ position: "static", transform: "none" }}
        className="relative! w-3! h-3! bg-emerald-500! border-2! border-emerald-700! hover:bg-emerald-300! transition-colors"
      />

      <div className="absolute -top-5 left-0 text-[9px] text-white/20 px-1">
        {id}
      </div>
    </div>
  );
}

export default LogicNodeComponent;
