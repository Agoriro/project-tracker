"use server";

import { serverFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createTeamMember(formData: FormData) {
  try {
    const payload = {
      member_alias: formData.get("member_alias") as string,
      role: formData.get("role") as string,
    };

    const res = await serverFetch("/team", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido del servidor.";
      try {
        const errorData = await res.json();
        if (typeof errorData.detail === "string") {
          if (errorData.detail.includes("already exists")) {
            errorMessage = "Ya existe un miembro con este alias. Intenta con uno diferente.";
          } else {
            errorMessage = errorData.detail;
          }
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err: any) => `${err.loc ? err.loc.join(".") : "Campo"}: ${err.msg}`)
            .join(", ");
        } else if (typeof errorData.detail === "object" && errorData.detail !== null) {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } catch {
        const errorText = await res.text();
        errorMessage = `Error: ${errorText}`;
      }
      return { success: false, error: errorMessage };
    }

    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (error: any) {
    console.error("Create team member error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}

export async function updateTeamMember(member_alias: string, formData: FormData) {
  try {
    const payload = {
      role: formData.get("role") as string,
    };

    const res = await serverFetch(`/team/${encodeURIComponent(member_alias)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido del servidor.";
      try {
        const errorData = await res.json();
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err: any) => `${err.loc ? err.loc.join(".") : "Campo"}: ${err.msg}`)
            .join(", ");
        } else if (typeof errorData.detail === "object" && errorData.detail !== null) {
          errorMessage = JSON.stringify(errorData.detail);
        }
      } catch {
        const errorText = await res.text();
        errorMessage = `Error: ${errorText}`;
      }
      return { success: false, error: errorMessage };
    }

    revalidatePath("/dashboard/team");
    revalidatePath("/dashboard/projects");
    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/team/${encodeURIComponent(member_alias)}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("Update team member error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
