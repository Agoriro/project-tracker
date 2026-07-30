import { serverFetch } from "@/lib/api";
import { Project } from "@/types/project";
import { Task } from "@/types/task";
import { Briefcase, AlertTriangle, Users } from "lucide-react";

async function getDashboardData() {
  const [projectsRes, tasksRes, teamRes] = await Promise.all([
    serverFetch("/projects/"),
    serverFetch("/tasks/"),
    serverFetch("/team/")
  ]);

  const projects: Project[] = projectsRes.ok ? await projectsRes.json() : [];
  const tasks: Task[] = tasksRes.ok ? await tasksRes.json() : [];
  const team = teamRes.ok ? await teamRes.json() : [];

  const activeProjects = projects.filter(p => p.status.toLowerCase() !== "completado" && p.status.toLowerCase() !== "cerrado").length;
  const overdueTasks = tasks.filter(t => t.is_overdue).length;
  const teamSize = team.length;

  return { activeProjects, overdueTasks, teamSize };
}

export default async function DashboardOverview() {
  const { activeProjects, overdueTasks, teamSize } = await getDashboardData();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back to Aztec PM. Here's a snapshot of your portfolio.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-4 right-4 text-slate-700 group-hover:text-indigo-500/20 transition-colors">
            <Briefcase className="w-12 h-12" />
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Proyectos Activos</h3>
          <p className="text-4xl font-bold text-white mt-2">{activeProjects}</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div className="absolute top-4 right-4 text-slate-700 group-hover:text-red-500/20 transition-colors">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Tareas Vencidas</h3>
          <p className="text-4xl font-bold text-red-400 mt-2">{overdueTasks}</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-4 right-4 text-slate-700 group-hover:text-emerald-500/20 transition-colors">
            <Users className="w-12 h-12" />
          </div>
          <h3 className="text-slate-400 text-sm font-medium">Miembros del Equipo</h3>
          <p className="text-4xl font-bold text-white mt-2">{teamSize}</p>
        </div>
      </div>
    </div>
  );
}
