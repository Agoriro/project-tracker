"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { triggerRiskEngine } from "@/actions/risk-actions";

export function RunRiskEngineButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const runRiskEngine = async () => {
    setIsPending(true);
    try {
      const res = await triggerRiskEngine();
      
      if (!res.success) {
        console.error("Failed to run risk engine:", res.error);
      } else {
        // Refresh the page data
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={runRiskEngine}
      disabled={isPending}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
    >
      {isPending ? (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Play className="w-4 h-4 fill-current" />
      )}
      {isPending ? "Calculando..." : "Recalcular Riesgos"}
    </button>
  );
}
