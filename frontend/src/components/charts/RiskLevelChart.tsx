"use client";

import { Project } from "@/types/project";
import { ShieldAlert } from "lucide-react";

interface RiskLevelChartProps {
  projects: Project[];
}

export function RiskLevelChart({ projects }: RiskLevelChartProps) {
  const total = projects.length;

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  projects.forEach((p) => {
    const level = (p.risk_level || "").toLowerCase();
    if (level === "high") {
      highCount++;
    } else if (level === "medium") {
      mediumCount++;
    } else {
      lowCount++;
    }
  });

  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;
  const mediumPct = total > 0 ? Math.round((mediumCount / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Niveles de Riesgo
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            Risk Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Clasificación por severidad del motor de riesgos</p>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">No hay datos de proyectos.</div>
      ) : (
        <div className="grid grid-cols-3 gap-3 py-2">
          {/* Low */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-1"></span>
            <span className="text-[11px] font-medium text-slate-400">Bajo (Low)</span>
            <span className="text-xl font-bold text-white mt-1">{lowCount}</span>
            <span className="text-[10px] text-slate-500">{lowPct}%</span>
          </div>

          {/* Medium */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mb-1"></span>
            <span className="text-[11px] font-medium text-slate-400">Medio (Med)</span>
            <span className="text-xl font-bold text-white mt-1">{mediumCount}</span>
            <span className="text-[10px] text-slate-500">{mediumPct}%</span>
          </div>

          {/* High */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mb-1"></span>
            <span className="text-[11px] font-medium text-slate-400">Alto (High)</span>
            <span className="text-xl font-bold text-white mt-1">{highCount}</span>
            <span className="text-[10px] text-slate-500">{highPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
