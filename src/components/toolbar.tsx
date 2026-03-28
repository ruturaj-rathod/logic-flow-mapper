import { useLogicFlowStore } from "@/store/graph";
import HeroCheckCircleIcon from "@/icons/check-circle";
import HeroExclamationTriangleIcon from "@/icons/exclamation-triangle";

function Toolbar() {
  const { hasCycle, reset } = useLogicFlowStore();

  return (
    <div className="bg-slate-800/90 backdrop-blur border border-white/10 rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-xl">
      {hasCycle ? (
        <span className="flex items-center gap-2 text-red-400 text-sm font-bold">
          <HeroExclamationTriangleIcon className="size-4" />
          Cycle Detected
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
          <HeroCheckCircleIcon className="size-4" />
          No Cycles
        </span>
      )}

      <div className="w-px h-5 bg-white/10" />

      <button
        disabled={hasCycle}
        className={`
               px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all
              ${
                hasCycle
                  ? "bg-slate-700 text-white/30 cursor-not-allowed"
                  : "cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
              }
            `}
      >
        Simulate Logic
      </button>

      <button
        onClick={reset}
        className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold text-white/50 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/40"
      >
        Reset
      </button>
    </div>
  );
}

export default Toolbar;
