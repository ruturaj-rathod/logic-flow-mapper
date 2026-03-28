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
    </div>
  );
};

export default FlowMapper;
