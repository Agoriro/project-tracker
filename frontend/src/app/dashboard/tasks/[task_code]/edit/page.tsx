import { TaskForm } from "@/components/TaskForm";
import { serverFetch } from "@/lib/api";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { Edit } from "lucide-react";
import { notFound } from "next/navigation";

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

export default async function EditTaskPage({ params }: { params: { task_code: string } }) {
  const resolvedParams = await params;
  const taskCode = resolvedParams.task_code;

  const [taskRes, projects, teamMembers] = await Promise.all([
    serverFetch(`/tasks/${taskCode}`),
    getProjects(),
    getTeamMembers()
  ]);
  
  if (!taskRes.ok) {
    if (taskRes.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch task: ${taskRes.statusText}`);
  }

  const task: Task = await taskRes.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Edit className="w-6 h-6 text-indigo-400" />
          Editar Tarea: {task.task_code}
        </h1>
        <p className="text-sm text-slate-400 mt-1">Modifica los detalles y estado de la tarea.</p>
      </div>
      
      <TaskForm initialData={task} projects={projects} teamMembers={teamMembers} />
    </div>
  );
}
