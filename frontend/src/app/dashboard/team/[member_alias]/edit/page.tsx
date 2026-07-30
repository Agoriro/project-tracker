import { TeamForm } from "@/components/TeamForm";
import { serverFetch } from "@/lib/api";
import { TeamMember } from "@/types/team";
import { UserCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function EditTeamMemberPage({
  params,
}: {
  params: { member_alias: string };
}) {
  const resolvedParams = await params;
  const alias = decodeURIComponent(resolvedParams.member_alias);

  const res = await serverFetch(`/team/${encodeURIComponent(alias)}`);

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    if (res.status === 401) {
      redirect("/login");
    }
    throw new Error(`Failed to fetch team member: ${res.statusText}`);
  }

  const member: TeamMember = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-400" />
          Editar Miembro: {member.member_alias}
        </h1>
        <p className="text-sm text-slate-400 mt-1">Modifica el rol o la información del miembro.</p>
      </div>

      <TeamForm initialData={member} />
    </div>
  );
}
