"use server";

import { serverFetch } from "@/lib/api";

export async function triggerRiskEngine() {
  try {
    const res = await serverFetch("/risk/evaluate", {
      method: "POST",
    });
    
    if (!res.ok) {
      return { success: false, error: "Failed to evaluate risk" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Risk Engine error:", error);
    return { success: false, error: "Internal server error" };
  }
}
