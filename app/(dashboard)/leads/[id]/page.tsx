import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead, getActivities } from "@/lib/data/queries";
import { formatMoney } from "@/lib/data/types";
import { SignalMeter } from "@/components/SignalMeter";
import { RegionBadge, ProductBadge } from "@/components/Badges";
import { LeadActions } from "@/components/LeadActions";
import { LeadActivitySection } from "@/components/LeadActivitySection";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ArrowLeft } from "@/components/icons";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const activities = await getActivities("lead", id);

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-4xl">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-5"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={13} /> Back to pipeline
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-semibold">{lead.name}</h1>
            <SignalMeter stage={lead.stage} />
          </div>
          {lead.company && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {lead.company}
            </p>
          )}
        </div>
        <LeadActions lead={lead} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="md:col-span-1 rounded-xl p-5 space-y-4 h-fit"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
        >
          <InfoRow label="Estimated value">
            <span className="font-mono font-medium">
              {formatMoney(lead.estimated_value, lead.currency)}
            </span>
          </InfoRow>
          <InfoRow label="Region">
            <RegionBadge region={lead.region} />
          </InfoRow>
          <InfoRow label="Product interest">
            <ProductBadge product={lead.product_interest} />
          </InfoRow>
          <InfoRow label="Source">{lead.source}</InfoRow>
          <InfoRow label="Assigned to">{lead.assigned_to}</InfoRow>
          {lead.email && <InfoRow label="Email">{lead.email}</InfoRow>}
          {lead.phone && <InfoRow label="Phone">{lead.phone}</InfoRow>}
          {lead.lost_reason && (
            <InfoRow label="Lost reason">
              <span style={{ color: "var(--color-red)" }}>{lead.lost_reason}</span>
            </InfoRow>
          )}
          {lead.notes && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--color-ink-faint)" }}>
                Notes
              </div>
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <LeadActivitySection leadId={lead.id} />
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
          >
            <h2 className="font-display text-sm font-semibold">Activity</h2>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
        {label}
      </span>
      <span className="text-sm">{children}</span>
    </div>
  );
}
