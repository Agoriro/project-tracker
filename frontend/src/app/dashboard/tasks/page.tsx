import { serverFetch, handleUnauthorizedRedirect } from "@/lib/api";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { TasksTable } from "@/components/TasksTable";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getTasks(): Promise<Task[]> {
  const res = await serverFetch("/tasks/");
  if (!res.ok) {
    if (res.status === 401) await handleUnauthorizedRedirect();
    console.error("Failed to fetch tasks", await res.text());
    return [];
  }
  return res.json();
}

async function getProjects(): Promise<Project[]> {
  const res = await serverFetch("/projects/");
  if (!res.ok) {
    if (res.status === 401) await handleUnauthorizedRedirect();
    return [];
  }
  return res.json();
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await serverFetch("/team/");
  if (!res.ok) {
    if (res.status === 401) await handleUnauthorizedRedirect();
    return [];
  }
  return res.json();
}

export default async function TasksPage() {
  const [tasks, projects, teamMembers] = await Promise.all([
    getTasks(),
    getProjects(),
    getTeamMembers()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tareas Operativas</h1>
          <p className="text-sm text-slate-400 mt-1">Seguimiento, búsqueda y priorización de tareas a nivel portafolio.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/tasks/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </Link>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400 font-medium">
            {tasks.length} Tareas Totales
          </div>
        </div>
      </div>

      <TasksTable tasks={tasks} projects={projects} teamMembers={teamMembers} />
    </div>
  );
}
