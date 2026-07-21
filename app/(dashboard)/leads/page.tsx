import { getLeads } from "@/lib/data/queries";
import { PipelineBoard } from "@/components/PipelineBoard";
import { NewLeadButton } from "@/components/NewLeadButton";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="px-4 py-5 md:px-8 md:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-muted)" }}>
            {leads.length} lead{leads.length === 1 ? "" : "s"} across Gambia and international outreach.
          </p>
        </div>
        <NewLeadButton />
      </div>

      <PipelineBoard leads={leads} />
    </div>
  );
}
