"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(clientId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_id: clientId,
    name: String(formData.get("name") ?? ""),
    product: String(formData.get("product") ?? "Client Services"),
    status: String(formData.get("status") ?? "scoping"),
    value: Number(formData.get("value") ?? 0),
    currency: String(formData.get("currency") ?? "GMD"),
    start_date: (formData.get("start_date") as string) || null,
    deadline: (formData.get("deadline") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("projects").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath(`/clients/${clientId}`);
}

export async function updateProjectStatus(
  projectId: string,
  clientId: string,
  status: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteProject(projectId: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}
