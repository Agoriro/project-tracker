"use client";

import { useState, useMemo } from "react";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { TeamMember } from "@/types/team";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Calendar, 
  Edit, 
  Flame 
} from "lucide-react";
import Link from "next/link";

interface TasksTableProps {
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
}

const PAGE_SIZE = 25;

function getPriorityVariant(priority: string) {
  const p = priority.toLowerCase();
  if (p === "alta" || p === "critica" || p === "crítica") return "destructive";
  if (p === "media") return "warning";
  if (p === "baja") return "success";
  return "secondary";
}

function getStatusVariant(status: string) {
  const s = status.toLowerCase();
  if (s === "completada") return "success";
  if (s === "en progreso" || s === "en revision" || s === "por hacer") return "warning";
  if (s === "bloqueada") return "destructive";
  return "secondary";
}

export function TasksTable({ tasks, projects, teamMembers }: TasksTableProps) {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("ALL");
  const [selectedAssignee, setSelectedAssignee] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter tasks based on all criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Text Search (title, task_code, project_code, project_name)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCode = task.task_code.toLowerCase().includes(query);
        const matchesProjectCode = task.project_code.toLowerCase().includes(query);
        const matchesProjectName = task.project_name?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesCode && !matchesProjectCode && !matchesProjectName) {
          return false;
        }
      }

      // 2. Project Filter
      if (selectedProject !== "ALL" && task.project_code !== selectedProject) {
        return false;
      }

      // 3. Assignee Filter
      if (selectedAssignee !== "ALL" && task.assignee_alias !== selectedAssignee) {
        return false;
      }

      // 4. Priority Filter
      if (selectedPriority !== "ALL") {
        const taskP = task.priority.toLowerCase();
        const selP = selectedPriority.toLowerCase();
        if (selP === "critica" && !(taskP === "critica" || taskP === "crítica")) return false;
        if (selP !== "critica" && taskP !== selP) return false;
      }

      // 5. Status Filter
      if (selectedStatus !== "ALL" && task.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [tasks, search, selectedProject, selectedAssignee, selectedPriority, selectedStatus]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedProject("ALL");
    setSelectedAssignee("ALL");
    setSelectedPriority("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    search !== "" || 
    selectedProject !== "ALL" || 
    selectedAssignee !== "ALL" || 
    selectedPriority !== "ALL" || 
    selectedStatus !== "ALL";

  // Pagination calculation
  const totalPages = Math.ceil(filteredTasks.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Buscar por tarea, código o proyecto..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Filter: Proyecto */}
            <select
              value={selectedProject}
              onChange={(e) => handleFilterChange(setSelectedProject, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Proyectos</option>
              {projects.map((p) => (
                <option key={p.project_code} value={p.project_code}>
                  {p.project_code} - {p.project_name}
                </option>
              ))}
            </select>

            {/* Filter: Asignado */}
            <select
              value={selectedAssignee}
              onChange={(e) => handleFilterChange(setSelectedAssignee, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Asignados</option>
              {teamMembers.map((m) => (
                <option key={m.member_alias} value={m.member_alias}>
                  {m.member_alias}
                </option>
              ))}
            </select>

            {/* Filter: Prioridad */}
            <select
              value={selectedPriority}
              onChange={(e) => handleFilterChange(setSelectedPriority, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Prioridades</option>
              <option value="Critica">Crítica 🔥</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            {/* Filter: Estado */}
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="Por hacer">Por hacer</option>
              <option value="En progreso">En progreso</option>
              <option value="En revision">En revisión</option>
              <option value="Bloqueada">Bloqueada</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors shrink-0"
              title="Limpiar todos los filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
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
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="font-medium text-slate-400">No se encontraron tareas</p>
                      <p className="text-xs text-slate-600">Intenta cambiar los filtros o el término de búsqueda.</p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 text-xs text-indigo-400 hover:underline"
                        >
                          Limpiar filtros aplicados
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task.task_code} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{task.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.task_code}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="font-medium">{task.project_code}</div>
                      {task.project_name && <div className="text-xs text-slate-500">{task.project_name}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {task.assignee_alias}
                    </td>
                    <td className="px-6 py-4">
                      {["critica", "crítica"].includes(task.priority.toLowerCase()) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/90 text-rose-300 border border-rose-500/80 shadow-md shadow-rose-900/50 tracking-wider uppercase">
                          <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-500/50 animate-pulse" />
                          Crítica
                        </span>
                      ) : (
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      )}
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
                              <span title="Tarea Vencida"><AlertCircle className="w-4 h-4 text-red-500" /></span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/dashboard/tasks/${task.task_code}/edit`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar Tarea"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredTasks.length > 0 && (
          <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Mostrando <span className="font-semibold text-white">{startIndex + 1}</span> a{" "}
              <span className="font-semibold text-white">
                {Math.min(startIndex + PAGE_SIZE, filteredTasks.length)}
              </span>{" "}
              de <span className="font-semibold text-white">{filteredTasks.length}</span> tareas
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="px-3 py-1.5 font-medium text-slate-300">
                Página {currentPage} de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
