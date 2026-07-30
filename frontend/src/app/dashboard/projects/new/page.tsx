import { ProjectForm } from "@/components/ProjectForm";
import { FolderPlus } from "lucide-react";
import { serverFetch } from "@/lib/api";
import { TeamMember } from "@/types/team";

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await serverFetch("/team/");
  if (!res.ok) return [];
  return res.json();
}

export default async function NewProjectPage() {
  const teamMembers = await getTeamMembers();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderPlus className="w-6 h-6 text-indigo-400" />
          Nuevo Proyecto
        </h1>
        <p className="text-sm text-slate-400 mt-1">Crea un nuevo proyecto para agregarlo al portafolio.</p>
      </div>
      
      <ProjectForm teamMembers={teamMembers} />
    </div>
  );
}
