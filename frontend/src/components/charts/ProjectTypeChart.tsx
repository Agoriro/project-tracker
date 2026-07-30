"use client";

import { Project } from "@/types/project";
import { Layers } from "lucide-react";

interface ProjectTypeChartProps {
  projects: Project[];
}

export function ProjectTypeChart({ projects }: ProjectTypeChartProps) {
  const total = projects.length;

  let diagnosticoCount = 0;
  let proyectoCount = 0;
  let mantenimientoCount = 0;

  projects.forEach((p) => {
    const type = (p.engagement_type || "").toLowerCase();
    if (type.includes("diagnostico") || type.includes("diagnóstico")) {
      diagnosticoCount++;
    } else if (type.includes("mantenimiento") || type.includes("recurrente")) {
      mantenimientoCount++;
    } else {
      proyectoCount++;
    }
  });

  const dgPct = total > 0 ? Math.round((diagnosticoCount / total) * 100) : 0;
  const prPct = total > 0 ? Math.round((proyectoCount / total) * 100) : 0;
  const mtPct = total > 0 ? Math.round((mantenimientoCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Tipo de Compromiso
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
            Portafolio
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Diagnósticos vs Proyectos vs Mantenimiento</p>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">No hay datos de proyectos.</div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Proyectos (PR) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
                Proyecto (PR)
              </span>
              <span className="text-white font-semibold">
                {proyectoCount} <span className="text-slate-500 font-normal">({prPct}%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${prPct}%` }}
              ></div>
            </div>
          </div>

          {/* Mantenimiento (MT) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500"></span>
                Mantenimiento / Recurrente (MT)
              </span>
              <span className="text-white font-semibold">
                {mantenimientoCount} <span className="text-slate-500 font-normal">({mtPct}%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${mtPct}%` }}
              ></div>
            </div>
          </div>

          {/* Diagnóstico (DG) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500"></span>
                Diagnóstico (DG)
              </span>
              <span className="text-white font-semibold">
                {diagnosticoCount} <span className="text-slate-500 font-normal">({dgPct}%)</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${dgPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
