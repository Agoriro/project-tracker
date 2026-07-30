import { serverFetch } from "@/lib/api";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar } from "lucide-react";

async function getTasks(): Promise<Task[]> {
  const res = await serverFetch("/tasks/");
  if (!res.ok) {
    console.error("Failed to fetch tasks", await res.text());
    return [];
  }
  return res.json();
}

function getPriorityVariant(priority: string) {
  const p = priority.toLowerCase();
  if (p === "alta" || p === "crítica") return "destructive";
  if (p === "media") return "warning";
  if (p === "baja") return "success";
  return "secondary";
}

function getStatusVariant(status: string) {
  const s = status.toLowerCase();
  if (s === "completada") return "success";
  if (s === "en progreso") return "warning";
  if (s === "bloqueada") return "destructive";
  return "secondary";
}

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tareas Operativas</h1>
          <p className="text-sm text-slate-400 mt-1">Seguimiento y priorización de tareas a nivel portafolio.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-400">
            {tasks.length} Tareas Totales
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Tarea</th>
                <th className="px-6 py-4 font-medium">Proyecto</th>
                <th className="px-6 py-4 font-medium">Asignado</th>
                <th className="px-6 py-4 font-medium">Prioridad</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay tareas registradas o no se pudieron cargar.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.task_code} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.task_code}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{task.project_code}</div>
                      {task.project_name && <div className="text-xs text-slate-500">{task.project_name}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {task.assignee_alias}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPriorityVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {task.due_date ? (
                          <>
                            <Calendar className={`w-4 h-4 ${task.is_overdue ? 'text-red-500' : 'text-slate-500'}`} />
                            <span className={task.is_overdue ? 'text-red-400 font-medium' : 'text-slate-300'}>
                              {task.due_date}
                            </span>
                            {task.is_overdue && (
                              <AlertCircle className="w-4 h-4 text-red-500" title="Tarea Vencida" />
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
