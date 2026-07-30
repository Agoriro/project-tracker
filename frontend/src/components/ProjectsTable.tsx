"use client";

import { useState, useMemo } from "react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Edit 
} from "lucide-react";
import Link from "next/link";

interface ProjectsTableProps {
  projects: Project[];
}

const PAGE_SIZE = 25;

function getHealthBadgeVariant(health?: string) {
  if (!health) return "secondary";
  const h = health.toLowerCase();
  if (h.includes("bloqueado")) return "destructive";
  if (h.includes("riesgo")) return "warning";
  if (h.includes("track") || h.includes("bien") || h.includes("sano")) return "success";
  return "secondary";
}

function getRiskLevelVariant(level?: string) {
  if (!level) return "secondary";
  const l = level.toLowerCase();
  if (l === "high") return "destructive";
  if (l === "medium") return "warning";
  if (l === "low") return "success";
  return "secondary";
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("ALL");
  const [selectedApiType, setSelectedApiType] = useState("ALL");
  const [selectedOwner, setSelectedOwner] = useState("ALL");
  const [selectedHealth, setSelectedHealth] = useState("ALL");
  const [selectedRisk, setSelectedRisk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique options dynamically from projects data
  const clients = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.client_alias) set.add(p.client_alias);
    });
    return Array.from(set).sort();
  }, [projects]);

  const apiTypes = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.project_type_api) set.add(p.project_type_api);
    });
    return Array.from(set).sort();
  }, [projects]);

  const owners = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.owner_alias) set.add(p.owner_alias);
    });
    return Array.from(set).sort();
  }, [projects]);

  // Filter projects based on all search criteria
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Text Search (project_code, project_name, client_alias)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesCode = project.project_code.toLowerCase().includes(query);
        const matchesName = project.project_name.toLowerCase().includes(query);
        const matchesClient = project.client_alias.toLowerCase().includes(query);
        if (!matchesCode && !matchesName && !matchesClient) {
          return false;
        }
      }

      // 2. Client Filter
      if (selectedClient !== "ALL" && project.client_alias !== selectedClient) {
        return false;
      }

      // 3. API Type Filter
      if (selectedApiType !== "ALL" && project.project_type_api !== selectedApiType) {
        return false;
      }

      // 4. Owner Filter
      if (selectedOwner !== "ALL" && project.owner_alias !== selectedOwner) {
        return false;
      }

      // 5. Health Filter
      if (selectedHealth !== "ALL" && project.health.toLowerCase() !== selectedHealth.toLowerCase()) {
        return false;
      }

      // 6. Risk Level Filter
      if (selectedRisk !== "ALL" && project.risk_level?.toLowerCase() !== selectedRisk.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [projects, search, selectedClient, selectedApiType, selectedOwner, selectedHealth, selectedRisk]);

  const handleFilterChange = (setter: (val: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedClient("ALL");
    setSelectedApiType("ALL");
    setSelectedOwner("ALL");
    setSelectedHealth("ALL");
    setSelectedRisk("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    search !== "" || 
    selectedClient !== "ALL" || 
    selectedApiType !== "ALL" || 
    selectedOwner !== "ALL" || 
    selectedHealth !== "ALL" || 
    selectedRisk !== "ALL";

  // Pagination calculation
  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + PAGE_SIZE);

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
              placeholder="Buscar por código, proyecto o cliente..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {/* Filter: Cliente */}
            <select
              value={selectedClient}
              onChange={(e) => handleFilterChange(setSelectedClient, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Clientes</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filter: Tipo API */}
            <select
              value={selectedApiType}
              onChange={(e) => handleFilterChange(setSelectedApiType, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Tipos API</option>
              {apiTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Filter: Owner */}
            <select
              value={selectedOwner}
              onChange={(e) => handleFilterChange(setSelectedOwner, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Owners</option>
              {owners.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            {/* Filter: Salud */}
            <select
              value={selectedHealth}
              onChange={(e) => handleFilterChange(setSelectedHealth, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Toda la Salud</option>
              <option value="Sano">Sano</option>
              <option value="En riesgo">En riesgo</option>
              <option value="Bloqueado">Bloqueado</option>
            </select>

            {/* Filter: Riesgo */}
            <select
              value={selectedRisk}
              onChange={(e) => handleFilterChange(setSelectedRisk, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Riesgos</option>
              <option value="High">Alto (High)</option>
              <option value="Medium">Medio (Medium)</option>
              <option value="Low">Bajo (Low)</option>
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
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium text-left">Proyecto</th>
                <th className="px-6 py-4 font-medium text-left">Cliente</th>
                <th className="px-6 py-4 font-medium text-left">Tipo API</th>
                <th className="px-6 py-4 font-medium text-left">Owner</th>
                <th className="px-6 py-4 font-medium">Salud</th>
                <th className="px-6 py-4 font-medium text-center">Tareas Abiertas</th>
                <th className="px-6 py-4 font-medium text-center">Riesgo</th>
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="font-medium text-slate-400">No se encontraron proyectos</p>
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
                paginatedProjects.map((project) => (
                  <tr key={project.project_code} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {project.project_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{project.project_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{project.engagement_type}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {project.client_alias}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {project.project_type_api || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {project.owner_alias || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getHealthBadgeVariant(project.health)}>
                        {project.health}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center text-slate-400" title="Tareas Abiertas">
                          <CheckCircle2 className="w-4 h-4 mr-1 text-slate-500" />
                          <span>{project.open_tasks}</span>
                        </div>
                        {project.overdue_tasks > 0 && (
                          <div className="flex items-center text-amber-400 font-medium" title="Tareas Vencidas">
                            <Clock className="w-4 h-4 mr-1 text-amber-500" />
                            <span>{project.overdue_tasks}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Badge variant={getRiskLevelVariant(project.risk_level)}>
                          {project.risk_level}
                        </Badge>
                        {project.risk_score !== undefined && project.risk_score !== null && (
                          <span className="text-xs font-semibold text-slate-500">
                            Score: {project.risk_score}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`/dashboard/projects/${project.project_code}/edit`}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar Proyecto"
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
        {filteredProjects.length > 0 && (
          <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Mostrando <span className="font-semibold text-white">{startIndex + 1}</span> a{" "}
              <span className="font-semibold text-white">
                {Math.min(startIndex + PAGE_SIZE, filteredProjects.length)}
              </span>{" "}
              de <span className="font-semibold text-white">{filteredProjects.length}</span> proyectos
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
