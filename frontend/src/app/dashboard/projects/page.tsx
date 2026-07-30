import { serverFetch } from "@/lib/api";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

async function getProjects(): Promise<Project[]> {
  const res = await serverFetch("/projects/");
  if (!res.ok) {
    console.error("Failed to fetch projects", await res.text());
    return [];
  }
  return res.json();
}

function getHealthBadgeVariant(health: string) {
  const h = health.toLowerCase();
  if (h.includes("bloqueado")) return "destructive";
  if (h.includes("riesgo")) return "warning";
  if (h.includes("track") || h.includes("bien")) return "success";
  return "secondary";
}

function getRiskLevelVariant(level: string) {
  const l = level.toLowerCase();
  if (l === "high") return "destructive";
  if (l === "medium") return "warning";
  if (l === "low") return "success";
  return "secondary";
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Proyectos</h1>
          <p className="text-sm text-slate-400 mt-1">Vista operativa y nivel de riesgo del portafolio.</p>
        </div>
        <div className="flex gap-3">
          {/* Future implementation: Filters or Export */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400">
            {projects.length} Proyectos Totales
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Proyecto</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Salud</th>
                <th className="px-6 py-4 font-medium text-center">Tareas Abiertas</th>
                <th className="px-6 py-4 font-medium text-center">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No hay proyectos registrados o no se pudieron cargar.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.project_code} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {project.project_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{project.project_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{project.engagement_type}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {project.client_alias}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {project.owner_alias || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getHealthBadgeVariant(project.health)}>
                        {project.health}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center text-slate-400" title="Tareas Abiertas">
                          <CheckCircle2 className="w-4 h-4 mr-1 text-slate-500" />
                          <span>{project.open_tasks}</span>
                        </div>
                        {project.overdue_tasks > 0 && (
                          <div className="flex items-center text-amber-400 font-medium" title="Tareas Vencidas">
                            <Clock className="w-4 h-4 mr-1 text-amber-500" />
                            <span>{project.overdue_tasks}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Badge variant={getRiskLevelVariant(project.risk_level)}>
                          {project.risk_level}
                        </Badge>
                        {project.risk_score > 0 && (
                          <span className="text-xs font-semibold text-slate-500">
                            Score: {project.risk_score}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
