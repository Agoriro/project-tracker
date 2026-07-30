import { TaskForm } from "@/components/TaskForm";
import { PlusSquare } from "lucide-react";
import { serverFetch } from "@/lib/api";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";

async function getProjects(): Promise<Project[]> {
  const res = await serverFetch("/projects/");
  if (!res.ok) return [];
  return res.json();
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await serverFetch("/team/");
  if (!res.ok) return [];
  return res.json();
}

export default async function NewTaskPage() {
  const [projects, teamMembers] = await Promise.all([
    getProjects(),
    getTeamMembers()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <PlusSquare className="w-6 h-6 text-indigo-400" />
          Nueva Tarea
        </h1>
        <p className="text-sm text-slate-400 mt-1">Crea una nueva tarea operativa y asígnala a un proyecto.</p>
      </div>
      
      <TaskForm projects={projects} teamMembers={teamMembers} />
    </div>
  );
}
