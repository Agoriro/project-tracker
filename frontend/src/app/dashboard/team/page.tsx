import { serverFetch, handleUnauthorizedRedirect } from "@/lib/api";
import { TeamMember } from "@/types/team";
import { Users, Briefcase, CheckSquare, AlertTriangle, AlertCircle, UserPlus, Edit, Info } from "lucide-react";
import Link from "next/link";

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await serverFetch("/team/");
  if (!res.ok) {
    if (res.status === 401) await handleUnauthorizedRedirect();
    console.error("Failed to fetch team members", await res.text());
    return [];
  }
  return res.json();
}

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Equipo</h1>
          <p className="text-sm text-slate-400 mt-1">Carga de trabajo y métricas por miembro del equipo.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/team/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Miembro
          </Link>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400 font-medium">
            {team.length} Miembros
          </div>
        </div>
      </div>

      {/* Leyenda explicativa de las abreviaturas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Leyenda — Desglose de Proyectos por Tipo de Compromiso:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400">DG</span>
            <span className="text-slate-300">Diagnóstico</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400">PR</span>
            <span className="text-slate-300">Proyecto</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="font-bold text-indigo-400">MT</span>
            <span className="text-slate-300">Mantenimiento o Recurrente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No hay miembros de equipo registrados.
          </div>
        ) : (
          team.map((member) => (
            <div key={member.member_alias} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{member.member_alias}</h3>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/team/${encodeURIComponent(member.member_alias)}/edit`}
                  className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Editar Miembro"
                >
                  <Edit className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                    <div className="flex items-center text-slate-400 mb-1">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs font-medium">Proyectos</span>
                    </div>
                    <div className="text-xl font-bold text-white">{member.projects_in_portfolio}</div>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                    <div className="flex items-center text-slate-400 mb-1">
                      <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                      <span className="text-xs font-medium">Tareas</span>
                    </div>
                    <div className="text-xl font-bold text-white">{member.open_tasks_assigned}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-2 text-rose-500" /> 
                      Tareas Bloqueadas
                    </span>
                    <span className="font-medium text-slate-300">{member.blocked_tasks_assigned}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-2 text-amber-500" /> 
                      Tareas Críticas
                    </span>
                    <span className="font-medium text-slate-300">{member.high_or_critical_open}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/50">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Desglose de Proyectos</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-950 border border-slate-800/50 rounded flex flex-col items-center p-1.5" title="Diagnóstico">
                      <span className="text-[10px] text-slate-400 mb-0.5">DG</span>
                      <span className="text-sm font-semibold text-slate-300">{member.diagnostico_projects}</span>
                    </div>
                    <div className="flex-1 bg-slate-950 border border-slate-800/50 rounded flex flex-col items-center p-1.5" title="Proyecto">
                      <span className="text-[10px] text-slate-400 mb-0.5">PR</span>
                      <span className="text-sm font-semibold text-slate-300">{member.proyecto_projects}</span>
                    </div>
                    <div className="flex-1 bg-slate-950 border border-slate-800/50 rounded flex flex-col items-center p-1.5" title="Mantenimiento">
                      <span className="text-[10px] text-slate-400 mb-0.5">MT</span>
                      <span className="text-sm font-semibold text-slate-300">{member.mantenimiento_projects}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
