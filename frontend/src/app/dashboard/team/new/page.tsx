import { TeamForm } from "@/components/TeamForm";
import { UserPlus } from "lucide-react";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-indigo-400" />
          Nuevo Miembro del Equipo
        </h1>
        <p className="text-sm text-slate-400 mt-1">Registra a un nuevo integrante para asignarle proyectos y tareas.</p>
      </div>

      <TeamForm />
    </div>
  );
}
