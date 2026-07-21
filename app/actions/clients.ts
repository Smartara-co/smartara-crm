"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TeamMember } from "@/lib/data/types";

export async function createClientRecord(formData: FormData) {
  const supabase = await createSupabaseClient();

  const payload = {
    name: String(formData.get("name") ?? ""),
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    region: String(formData.get("region") ?? "gambia"),
    status: String(formData.get("status") ?? "active"),
    notes: (formData.get("notes") as string) || null,
  };

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  return data;
}

export async function updateClient(clientId: string, formData: FormData) {
  const supabase = await createSupabaseClient();

  const payload = {
    name: String(formData.get("name") ?? ""),
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    region: String(formData.get("region") ?? "gambia"),
    status: String(formData.get("status") ?? "active"),
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("clients").update(payload).eq("id", clientId);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function updateClientStatus(clientId: string, status: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").update({ status }).eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
}

export async function addClientActivity(
  clientId: string,
  content: string,
  type: string,
  actor: TeamMember
) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("activities").insert({
    related_type: "client",
    related_id: clientId,
    type,
    content,
    created_by: actor,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}
