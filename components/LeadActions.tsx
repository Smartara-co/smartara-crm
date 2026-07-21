"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStage } from "@/lib/data/types";
import { LEAD_STAGES } from "@/lib/data/types";
import { updateLeadStage, convertLeadToClient, deleteLead } from "@/app/actions/leads";
import { CheckCircle2, Trash2 } from "lucide-react";

export function LeadActions({ lead }: { lead: Lead }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeStage(stage: LeadStage) {
    let reason: string | undefined;
    if (stage === "lost") {
      reason = window.prompt("Why was this lead lost? (optional)") ?? undefined;
    }
    startTransition(async () => {
      try {
        await updateLeadStage(lead.id, stage, lead.assigned_to, reason);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't update stage. Please try again.");
      }
    });
  }

  function convert() {
    startTransition(async () => {
      try {
        const client = await convertLeadToClient(lead.id);
        if (client) router.push(`/clients/${client.id}`);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't convert lead. Please try again.");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete lead "${lead.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteLead(lead.id);
        router.push("/leads");
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't delete lead. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Lead stage"
        value={lead.stage}
        disabled={isPending}
        onChange={(e) => changeStage(e.target.value as LeadStage)}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-medium bg-white"
        style={{ borderColor: "var(--color-line)" }}
      >
        {LEAD_STAGES.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      {lead.stage === "won" && (
        <button
          onClick={convert}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ background: "var(--color-teal-soft)", color: "var(--color-teal-strong)" }}
        >
          <CheckCircle2 size={14} /> Convert to client
        </button>
      )}

      <button
        onClick={remove}
        disabled={isPending}
        aria-label="Delete lead"
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        style={{ color: "var(--color-red)" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
