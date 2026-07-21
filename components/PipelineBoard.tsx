"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Lead, LeadStage } from "@/lib/data/types";
import { LEAD_STAGES, formatMoney } from "@/lib/data/types";
import { SignalMeter } from "@/components/SignalMeter";
import { RegionBadge } from "@/components/Badges";
import { updateLeadStage, convertLeadToClient } from "@/app/actions/leads";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function PipelineBoard({ leads }: { leads: Lead[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function advance(lead: Lead) {
    const order: LeadStage[] = [
      "new",
      "contacted",
      "qualified",
      "proposal_sent",
      "negotiation",
      "won",
    ];
    const idx = order.indexOf(lead.stage);
    const next = order[Math.min(idx + 1, order.length - 1)];
    setPendingId(lead.id);
    startTransition(async () => {
      await updateLeadStage(lead.id, next, lead.assigned_to);
      setPendingId(null);
    });
  }

  function markLost(lead: Lead) {
    const reason = window.prompt("Why was this lead lost? (optional)") ?? undefined;
    setPendingId(lead.id);
    startTransition(async () => {
      await updateLeadStage(lead.id, "lost", lead.assigned_to, reason);
      setPendingId(null);
    });
  }

  function convert(lead: Lead) {
    setPendingId(lead.id);
    startTransition(async () => {
      await convertLeadToClient(lead.id);
      setPendingId(null);
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.key);
        return (
          <div key={stage.key} className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <SignalMeter stage={stage.key} size="sm" />
                <h3 className="text-xs font-semibold" style={{ color: "var(--color-ink-muted)" }}>
                  {stage.label}
                </h3>
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--color-ink-faint)" }}>
                {stageLeads.length}
              </span>
            </div>

            <div className="space-y-2">
              {stageLeads.map((lead) => {
                const busy = isPending && pendingId === lead.id;
                return (
                  <div
                    key={lead.id}
                    className="rounded-lg p-3 group"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-line)",
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    <Link href={`/leads/${lead.id}`} className="block mb-1.5">
                      <div className="text-sm font-medium">{lead.name}</div>
                      {lead.company && (
                        <div className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
                          {lead.company}
                        </div>
                      )}
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                      <RegionBadge region={lead.region} />
                      <span className="text-xs font-mono font-medium">
                        {formatMoney(lead.estimated_value, lead.currency)}
                      </span>
                    </div>

                    {stage.key !== "won" && stage.key !== "lost" && (
                      <div className="flex gap-1.5 pt-2" style={{ borderTop: "1px solid var(--color-line)" }}>
                        <button
                          onClick={() => advance(lead)}
                          disabled={busy}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-md py-1 text-xs font-medium"
                          style={{ background: "var(--color-blue-soft)", color: "var(--color-blue)" }}
                        >
                          Advance <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={() => markLost(lead)}
                          disabled={busy}
                          className="rounded-md px-2 py-1 text-xs font-medium"
                          style={{ background: "var(--color-red-soft)", color: "var(--color-red)" }}
                        >
                          Lost
                        </button>
                      </div>
                    )}

                    {stage.key === "won" && (
                      <button
                        onClick={() => convert(lead)}
                        disabled={busy}
                        className="w-full flex items-center justify-center gap-1 rounded-md py-1 text-xs font-medium mt-1"
                        style={{ background: "var(--color-teal-soft)", color: "var(--color-teal)" }}
                      >
                        <CheckCircle2 size={12} /> Convert to client
                      </button>
                    )}
                  </div>
                );
              })}

              {stageLeads.length === 0 && (
                <div
                  className="rounded-lg py-6 text-center text-xs"
                  style={{ border: "1px dashed var(--color-line)", color: "var(--color-ink-faint)" }}
                >
                  Empty
                </div>
              )}
            </div>

            {stageLeads.length > 0 && (
              <div className="mt-2 px-1 text-xs font-mono" style={{ color: "var(--color-ink-faint)" }}>
                {stageLeads.some((l) => l.currency === "GMD") &&
                  formatMoney(
                    stageLeads.filter((l) => l.currency === "GMD").reduce((s, l) => s + Number(l.estimated_value), 0),
                    "GMD"
                  )}
                {stageLeads.some((l) => l.currency === "GMD") && stageLeads.some((l) => l.currency === "USD") && " · "}
                {stageLeads.some((l) => l.currency === "USD") &&
                  formatMoney(
                    stageLeads.filter((l) => l.currency === "USD").reduce((s, l) => s + Number(l.estimated_value), 0),
                    "USD"
                  )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
