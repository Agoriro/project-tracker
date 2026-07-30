"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createTeamMember, updateTeamMember } from "@/actions/team-actions";
import { TeamMember } from "@/types/team";
import { Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface TeamFormProps {
  initialData?: TeamMember;
}

const BASE_ROLES = [
  "Delivery",
  "PM",
  "Lead Engineer",
  "Senior Backend Developer",
  "Frontend Developer",
  "Fullstack Developer",
  "Solutions Architect",
  "QA Specialist",
  "DevOps Engineer",
  "Data Engineer",
];

export function TeamForm({ initialData }: TeamFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute all available role options (include initialData.role if unique)
  const roleOptions = useMemo(() => {
    const roles = [...BASE_ROLES];
    if (initialData?.role && !roles.includes(initialData.role)) {
      roles.unshift(initialData.role);
    }
    return roles;
  }, [initialData]);

  const [selectedRole, setSelectedRole] = useState<string>(
    initialData?.role || roleOptions[0]
  );
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // If custom role was chosen, use the custom input value
    if (isCustom) {
      const customRoleVal = formData.get("custom_role") as string;
      if (customRoleVal) {
        formData.set("role", customRoleVal);
      }
    }

    try {
      const res = isEditing
        ? await updateTeamMember(initialData.member_alias, formData)
        : await createTeamMember(formData);

      if (!res.success) {
        setError(res.error || "Un error desconocido ocurrió");
      } else {
        router.push("/dashboard/team");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          {/* Member Alias */}
          <div className="space-y-2">
            <label htmlFor="member_alias" className="text-sm font-medium text-slate-300">
              Alias / Nombre del Miembro
            </label>
            <input
              id="member_alias"
              name="member_alias"
              defaultValue={initialData?.member_alias}
              required
              disabled={isEditing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              placeholder="Ej: Santiago Vera"
            />
            {isEditing && (
              <p className="text-xs text-slate-500">El alias del miembro no se puede modificar.</p>
            )}
          </div>

          {/* Role Select */}
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-300">
              Rol en el Equipo
            </label>
            <select
              id="role"
              name="role"
              value={isCustom ? "CUSTOM" : selectedRole}
              onChange={(e) => {
                if (e.target.value === "CUSTOM") {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedRole(e.target.value);
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value="CUSTOM">+ Escribir rol personalizado...</option>
            </select>

            {isCustom && (
              <div className="mt-2">
                <input
                  type="text"
                  id="custom_role"
                  name="custom_role"
                  required
                  autoFocus
                  placeholder="Escribe el nombre del rol (ej: QA Automation Lead)"
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-800">
          <Link
            href="/dashboard/team"
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
            {isEditing ? "Actualizar Miembro" : "Crear Miembro"}
          </button>
        </div>
      </form>
    </div>
  );
}
