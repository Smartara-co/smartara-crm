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
      await updateLeadStage(lead.id, stage, lead.assigned_to, reason);
    });
  }

  function convert() {
    startTransition(async () => {
      const client = await convertLeadToClient(lead.id);
      if (client) router.push(`/clients/${client.id}`);
    });
  }

  function remove() {
    if (!window.confirm(`Delete lead "${lead.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteLead(lead.id);
      router.push("/leads");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
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
          style={{ background: "var(--color-teal-soft)", color: "var(--color-teal)" }}
        >
          <CheckCircle2 size={14} /> Convert to client
        </button>
      )}

      <button
        onClick={remove}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        style={{ color: "var(--color-red)" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
