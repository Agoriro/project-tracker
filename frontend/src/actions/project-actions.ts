"use server";

import { serverFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  try {
    const payload = {
      project_code: formData.get("project_code") as string,
      project_name: formData.get("project_name") as string,
      client_alias: formData.get("client_alias") as string,
      engagement_type: formData.get("engagement_type") as string,
      project_type_api: formData.get("project_type_api") as string,
      stage: formData.get("stage") as string,
      status: formData.get("status") as string || "Activo",
      health: formData.get("health") as string || "Sano",
      owner_alias: formData.get("owner_alias") as string,
      owner_role: formData.get("owner_role") as string || "PM",
      next_step: formData.get("next_step") as string || "",
    };

    const res = await serverFetch("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido del servidor.";
      try {
        const errorData = await res.json();
        // If the backend says the project already exists
        if (errorData.detail && errorData.detail.includes("already exists")) {
          errorMessage = "Ya existe un proyecto con este código. Intenta con uno diferente.";
        } else {
          errorMessage = errorData.detail || errorText;
        }
      } catch {
        const errorText = await res.text();
        errorMessage = `Error: ${errorText}`;
      }
      return { success: false, error: errorMessage };
    }

    // Trigger Risk Engine to recalculate all metrics after new project creation
    await serverFetch("/risk/evaluate", { method: "POST" }).catch(err => 
      console.error("Failed to trigger Risk Engine after project creation", err)
    );

    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}

export async function updateProject(project_code: string, formData: FormData) {
  try {
    // Only extract fields that were actually submitted
    const payload: Record<string, string> = {};
    const fields = [
      "project_name", "client_alias", "engagement_type", 
      "project_type_api", "stage", "status", "health", 
      "owner_alias", "owner_role", "next_step"
    ];

    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) {
        payload[field] = val as string;
      }
    }

    const res = await serverFetch(`/projects/${project_code}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido del servidor.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || "Error al actualizar el proyecto.";
      } catch {
        const errorText = await res.text();
        errorMessage = `Error: ${errorText}`;
      }
      return { success: false, error: errorMessage };
    }

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${project_code}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("Update project error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
