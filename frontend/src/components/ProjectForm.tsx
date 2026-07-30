"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/actions/project-actions";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ProjectFormProps {
  initialData?: Project;
  teamMembers: TeamMember[];
}

export function ProjectForm({ initialData, teamMembers }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = isEditing 
        ? await updateProject(initialData.project_code, formData)
        : await createProject(formData);

      if (!res.success) {
        setError(res.error || "Un error desconocido ocurrió");
      } else {
        router.push("/dashboard/projects");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6 max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="project_code" className="text-sm font-medium text-slate-300">
              Código del Proyecto
            </label>
            <input 
              id="project_code"
              name="project_code" 
              defaultValue={initialData?.project_code}
              required 
              disabled={isEditing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              placeholder="Ej: PRJ-10"
            />
            {isEditing && <p className="text-xs text-slate-500">El código no se puede modificar una vez creado.</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="project_name" className="text-sm font-medium text-slate-300">
              Nombre del Proyecto
            </label>
            <input 
              id="project_name"
              name="project_name" 
              defaultValue={initialData?.project_name}
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="client_alias" className="text-sm font-medium text-slate-300">
              Cliente
            </label>
            <input 
              id="client_alias"
              name="client_alias" 
              defaultValue={initialData?.client_alias}
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="engagement_type" className="text-sm font-medium text-slate-300">
              Tipo de Compromiso
            </label>
            <select 
              id="engagement_type"
              name="engagement_type" 
              defaultValue={initialData?.engagement_type || "Proyecto"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Proyecto">Proyecto</option>
              <option value="Mantenimiento o recurrente">Mantenimiento o recurrente</option>
              <option value="Diagnostico">Diagnostico</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="project_type_api" className="text-sm font-medium text-slate-300">
              Tipo API
            </label>
            <select 
              id="project_type_api"
              name="project_type_api" 
              defaultValue={initialData?.project_type_api || "Consultoria"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Consultoria">Consultoria</option>
              <option value="Automatizacion">Automatizacion</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="stage" className="text-sm font-medium text-slate-300">
              Etapa
            </label>
            <select 
              id="stage"
              name="stage" 
              defaultValue={initialData?.stage || "Descubrimiento"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Descubrimiento">Descubrimiento</option>
              <option value="Ejecucion">Ejecucion</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="owner_alias" className="text-sm font-medium text-slate-300">
              Owner
            </label>
            <select 
              id="owner_alias"
              name="owner_alias" 
              defaultValue={initialData?.owner_alias || ""}
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Seleccione un owner</option>
              {teamMembers.map(member => (
                <option key={member.member_alias} value={member.member_alias}>
                  {member.member_alias}
                </option>
              ))}
            </select>
          </div>

          {/* If Editing, we can also show Status and Health */}
          {isEditing && (
            <>
               <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-slate-300">
                  Estado
                </label>
                <select 
                  id="status"
                  name="status" 
                  defaultValue={initialData?.status}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Cerrado">Cerrado</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="health" className="text-sm font-medium text-slate-300">
                  Salud del Proyecto
                </label>
                <select 
                  id="health"
                  name="health" 
                  defaultValue={initialData?.health}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Sano">Sano</option>
                  <option value="En riesgo">En riesgo</option>
                  <option value="Bloqueado">Bloqueado</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-800">
          <Link 
            href="/dashboard/projects"
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditing ? "Actualizar Proyecto" : "Crear Proyecto"}
          </button>
        </div>
      </form>
    </div>
  );
}
