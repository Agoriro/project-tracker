"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, updateTask } from "@/actions/task-actions";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface TaskFormProps {
  initialData?: Task;
  projects: Project[];
  teamMembers: TeamMember[];
}

export function TaskForm({ initialData, projects, teamMembers }: TaskFormProps) {
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
        ? await updateTask(initialData.task_code, formData)
        : await createTask(formData.get("project_code") as string, formData);

      if (!res.success) {
        setError(res.error || "Un error desconocido ocurrió");
      } else {
        router.push("/dashboard/tasks");
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
            <label htmlFor="task_code" className="text-sm font-medium text-slate-300">
              Código de la Tarea
            </label>
            <input 
              id="task_code"
              name="task_code" 
              defaultValue={initialData?.task_code}
              required 
              disabled={isEditing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              placeholder="Ej: TSK-001"
            />
            {isEditing && <p className="text-xs text-slate-500">El código no se puede modificar.</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="project_code" className="text-sm font-medium text-slate-300">
              Proyecto
            </label>
            <select 
              id="project_code"
              name="project_code" 
              defaultValue={initialData?.project_code || ""}
              required 
              disabled={isEditing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="" disabled>Seleccione un proyecto</option>
              {projects.map(project => (
                <option key={project.project_code} value={project.project_code}>
                  {project.project_code} - {project.project_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-300">
              Título de la Tarea
            </label>
            <input 
              id="title"
              name="title" 
              defaultValue={initialData?.title}
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Implementar base de datos"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="assignee_alias" className="text-sm font-medium text-slate-300">
              Asignado a
            </label>
            <select 
              id="assignee_alias"
              name="assignee_alias" 
              defaultValue={initialData?.assignee_alias || ""}
              required 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Seleccione un miembro</option>
              {teamMembers.map(member => (
                <option key={member.member_alias} value={member.member_alias}>
                  {member.member_alias}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium text-slate-300">
              Prioridad
            </label>
            <select 
              id="priority"
              name="priority" 
              defaultValue={initialData?.priority || "Media"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Critica">Crítica</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="due_date" className="text-sm font-medium text-slate-300">
              Fecha de Vencimiento
            </label>
            <input 
              type="date"
              id="due_date"
              name="due_date" 
              defaultValue={initialData?.due_date}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dependency" className="text-sm font-medium text-slate-300">
              Dependencia (Opcional)
            </label>
            <input 
              id="dependency"
              name="dependency" 
              defaultValue={initialData?.dependency}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: TSK-001"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="detail" className="text-sm font-medium text-slate-300">
              Detalle
            </label>
            <textarea 
              id="detail"
              name="detail" 
              defaultValue={initialData?.detail}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descripción de la tarea..."
            />
          </div>

          {/* Status field is useful in creation and editing */}
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-slate-300">
              Estado
            </label>
            <select 
              id="status"
              name="status" 
              defaultValue={initialData?.status || "Por hacer"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Por hacer">Por hacer</option>
              <option value="En progreso">En progreso</option>
              <option value="En revision">En revisión</option>
              <option value="Bloqueada">Bloqueada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

        </div>

        <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-800">
          <Link 
            href="/dashboard/tasks"
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
            {isEditing ? "Actualizar Tarea" : "Crear Tarea"}
          </button>
        </div>
      </form>
    </div>
  );
}
