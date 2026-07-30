import { ProjectForm } from "@/components/ProjectForm";
import { serverFetch } from "@/lib/api";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { FolderEdit } from "lucide-react";
import { notFound } from "next/navigation";

async function getTeamMembers(): Promise<TeamMember[]> {
  const res = await serverFetch("/team/");
  if (!res.ok) return [];
  return res.json();
}

export default async function EditProjectPage({ params }: { params: { project_code: string } }) {
  // Await the params object in Next.js 15+ (if applicable), but we are on Next.js 16/React 19, 
  // so `params` is typically a Promise in App Router dynamic segments.
  const resolvedParams = await params;
  const projectCode = resolvedParams.project_code;

  const res = await serverFetch(`/projects/${projectCode}`);
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch project details");
  }

  const project: Project = await res.json();
  const teamMembers = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FolderEdit className="w-6 h-6 text-indigo-400" />
          Editar Proyecto: {project.project_code}
        </h1>
        <p className="text-sm text-slate-400 mt-1">Modifica los detalles operativos del proyecto.</p>
      </div>
      
      <ProjectForm initialData={project} teamMembers={teamMembers} />
    </div>
  );
}
