import { serverFetch } from "@/lib/api";
import { Project } from "@/types/project";
import { ProjectsTable } from "@/components/ProjectsTable";
import { RunRiskEngineButton } from "@/components/RunRiskEngineButton";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getProjects(): Promise<Project[]> {
  const res = await serverFetch("/projects/");
  if (!res.ok) {
    if (res.status === 401) {
      redirect("/login");
    }
    console.error("Failed to fetch projects", await res.text());
    return [];
  }
  return res.json();
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  // Sort projects by risk score descending (highest risk first)
  projects.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Proyectos</h1>
          <p className="text-sm text-slate-400 mt-1">Vista operativa y nivel de riesgo del portafolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <RunRiskEngineButton />
          <Link 
            href="/dashboard/projects/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </Link>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400 font-medium">
            {projects.length} Proyectos Totales
          </div>
        </div>
      </div>

      <ProjectsTable projects={projects} />
    </div>
  );
}
