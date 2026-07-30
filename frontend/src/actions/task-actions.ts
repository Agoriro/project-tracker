"use server";

import { serverFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createTask(project_code: string, formData: FormData) {
  try {
    const payload = {
      task_code: formData.get("task_code") as string,
      title: formData.get("title") as string,
      assignee_alias: formData.get("assignee_alias") as string,
      assignee_role: formData.get("assignee_role") as string || "Miembro",
      priority: formData.get("priority") as string,
      status: formData.get("status") as string || "Por hacer",
      due_date: formData.get("due_date") ? formData.get("due_date") as string : null,
      dependency: formData.get("dependency") ? formData.get("dependency") as string : null,
      detail: formData.get("detail") as string,
    };

    const res = await serverFetch(`/projects/${project_code}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = "Error desconocido del servidor.";
      try {
        const errorData = await res.json();
        if (typeof errorData.detail === "string") {
          if (errorData.detail.includes("already exists")) {
            errorMessage = "Ya existe una tarea con este código. Intenta con uno diferente.";
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

    // Trigger Risk Engine just in case
    await serverFetch("/risk/evaluate", { method: "POST" }).catch(() => {});

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/projects");
    return { success: true };
  } catch (error: any) {
    console.error("Create task error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}

export async function updateTask(task_code: string, formData: FormData) {
  try {
    const payload: Record<string, string | null> = {};
    const fields = [
      "title", "assignee_alias", "assignee_role", 
      "priority", "status", "due_date", "dependency", "detail"
    ];

    for (const field of fields) {
      const val = formData.get(field);
      if (val !== null) {
        payload[field] = val ? (val as string) : null;
      }
    }

    const res = await serverFetch(`/tasks/${task_code}`, {
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

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/tasks/${task_code}/edit`);
    return { success: true };
  } catch (error: any) {
    console.error("Update task error:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
}
