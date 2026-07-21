"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { LeadStage, TeamMember } from "@/lib/data/types";

export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") ?? ""),
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    source: String(formData.get("source") ?? "Other"),
    region: String(formData.get("region") ?? "gambia"),
    currency: String(formData.get("currency") ?? "GMD"),
    estimated_value: Number(formData.get("estimated_value") ?? 0),
    product_interest: String(formData.get("product_interest") ?? "Client Services"),
    assigned_to: String(formData.get("assigned_to") ?? "Muhammed"),
    notes: (formData.get("notes") as string) || null,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (data) {
    await supabase.from("activities").insert({
      related_type: "lead",
      related_id: data.id,
      type: "note",
      content: "Lead created",
      created_by: payload.assigned_to,
    });
  }

  revalidatePath("/leads");
  return data;
}

export async function updateLeadStage(
  leadId: string,
  stage: LeadStage,
  actor: TeamMember,
  lostReason?: string
) {
  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = { stage };
  if (stage === "lost" && lostReason) updatePayload.lost_reason = lostReason;

  const { error } = await supabase
    .from("leads")
    .update(updatePayload)
    .eq("id", leadId);

  if (error) throw new Error(error.message);

  await supabase.from("activities").insert({
    related_type: "lead",
    related_id: leadId,
    type: "stage_change",
    content: `Stage moved to "${stage.replace("_", " ")}"${lostReason ? ` — ${lostReason}` : ""}`,
    created_by: actor,
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function updateLead(leadId: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    name: String(formData.get("name") ?? ""),
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    source: String(formData.get("source") ?? "Other"),
    region: String(formData.get("region") ?? "gambia"),
    currency: String(formData.get("currency") ?? "GMD"),
    estimated_value: Number(formData.get("estimated_value") ?? 0),
    product_interest: String(formData.get("product_interest") ?? "Client Services"),
    assigned_to: String(formData.get("assigned_to") ?? "Muhammed"),
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("leads").update(payload).eq("id", leadId);
  if (error) throw new Error(error.message);

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
}

export async function deleteLead(leadId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", leadId);
  if (error) throw new Error(error.message);
  revalidatePath("/leads");
}

export async function convertLeadToClient(leadId: string) {
  const supabase = await createClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) throw new Error(leadError?.message ?? "Lead not found");

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      region: lead.region,
      status: "active",
      converted_from_lead: lead.id,
      notes: lead.notes,
    })
    .select("id")
    .single();

  if (clientError) throw new Error(clientError.message);

  await supabase.from("leads").update({ stage: "won" }).eq("id", leadId);

  await supabase.from("activities").insert([
    {
      related_type: "lead",
      related_id: leadId,
      type: "stage_change",
      content: "Converted to client",
      created_by: lead.assigned_to,
    },
    {
      related_type: "client",
      related_id: client.id,
      type: "note",
      content: `Converted from lead "${lead.name}"`,
      created_by: lead.assigned_to,
    },
  ]);

  revalidatePath("/leads");
  revalidatePath("/clients");
  return client;
}

export async function addLeadActivity(
  leadId: string,
  content: string,
  type: string,
  actor: TeamMember
) {
  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    related_type: "lead",
    related_id: leadId,
    type,
    content,
    created_by: actor,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/leads/${leadId}`);
}
