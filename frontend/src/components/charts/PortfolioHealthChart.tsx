"use client";

import { Project } from "@/types/project";
import { Activity } from "lucide-react";

interface PortfolioHealthChartProps {
  projects: Project[];
}

export function PortfolioHealthChart({ projects }: PortfolioHealthChartProps) {
  const total = projects.length;

  let sanoCount = 0;
  let enRiesgoCount = 0;
  let bloqueadoCount = 0;

  projects.forEach((p) => {
    const h = (p.health || "").toLowerCase();
    if (h.includes("bloqueado")) {
      bloqueadoCount++;
    } else if (h.includes("riesgo")) {
      enRiesgoCount++;
    } else {
      sanoCount++;
    }
  });

  const sanoPct = total > 0 ? Math.round((sanoCount / total) * 100) : 0;
  const enRiesgoPct = total > 0 ? Math.round((enRiesgoCount / total) * 100) : 0;
  const bloqueadoPct = total > 0 ? Math.round((bloqueadoCount / total) * 100) : 0;

  // Donut SVG Math calculations (Radius = 40, Circumference = 2 * PI * 40 = 251.327)
  const R = 40;
  const C = 2 * Math.PI * R;

  const sanoLength = (sanoCount / (total || 1)) * C;
  const enRiesgoLength = (enRiesgoCount / (total || 1)) * C;
  const bloqueadoLength = (bloqueadoCount / (total || 1)) * C;

  const sanoOffset = 0;
  const enRiesgoOffset = -sanoLength;
  const bloqueadoOffset = -(sanoLength + enRiesgoLength);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Salud del Portafolio
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual por estado operativo</p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
          {total} Proyectos
        </div>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">No hay datos de proyectos.</div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          {/* Donut SVG */}
          <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r={R}
                className="stroke-slate-950 fill-none"
                strokeWidth="12"
              />

              {/* Sano Segment (Emerald) */}
              {sanoCount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  className="stroke-emerald-500 fill-none transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${sanoLength} ${C}`}
                  strokeDashoffset={sanoOffset}
                  strokeLinecap="round"
                />
              )}

              {/* En Riesgo Segment (Amber) */}
              {enRiesgoCount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  className="stroke-amber-500 fill-none transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${enRiesgoLength} ${C}`}
                  strokeDashoffset={enRiesgoOffset}
                  strokeLinecap="round"
                />
              )}

              {/* Bloqueado Segment (Rose) */}
              {bloqueadoCount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={R}
                  className="stroke-rose-500 fill-none transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${bloqueadoLength} ${C}`}
                  strokeDashoffset={bloqueadoOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-white tracking-tight">{sanoPct}%</span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Sano</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="w-full sm:w-auto space-y-3">
            {/* Sano */}
            <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-slate-950/60 border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-xs font-medium text-slate-300">Sano</span>
              </div>
              <div className="text-xs font-bold text-white">
                {sanoCount} <span className="text-slate-500 font-normal">({sanoPct}%)</span>
              </div>
            </div>

            {/* En riesgo */}
            <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-slate-950/60 border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-xs font-medium text-slate-300">En riesgo</span>
              </div>
              <div className="text-xs font-bold text-white">
                {enRiesgoCount} <span className="text-slate-500 font-normal">({enRiesgoPct}%)</span>
              </div>
            </div>

            {/* Bloqueado */}
            <div className="flex items-center justify-between sm:justify-start gap-4 p-2 rounded-xl bg-slate-950/60 border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-xs font-medium text-slate-300">Bloqueado</span>
              </div>
              <div className="text-xs font-bold text-white">
                {bloqueadoCount} <span className="text-slate-500 font-normal">({bloqueadoPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
