import { ReactFlowProvider } from "@xyflow/react";

import FlowEditor from "@/components/flow-editor";
import Toolbar from "@/components/toolbar";

const FlowMapper = () => {
  return (
    <div className="w-screen h-screen bg-gray-900 relative">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <Toolbar />
      </div>

      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/25 text-xs text-center select-none">
        Drag from <span className="text-emerald-400/60 font-semibold">If</span>{" "}
        or <span className="text-orange-400/60 font-semibold">Else</span>{" "}
        handles to connect or create nodes &nbsp;·&nbsp;{" "}
        <kbd className="font-mono">Del</kbd> to remove selected
      </div>
    </div>
  );
};

export default FlowMapper;
