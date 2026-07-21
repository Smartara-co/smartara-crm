import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getProjectsForClient, getActivities } from "@/lib/data/queries";
import { RegionBadge, ClientStatusBadge } from "@/components/Badges";
import { ClientActions } from "@/components/ClientActions";
import { NewProjectButton } from "@/components/NewProjectButton";
import { ProjectCard } from "@/components/ProjectCard";
import { ClientActivitySection } from "@/components/ClientActivitySection";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ArrowLeft, Briefcase } from "@/components/icons";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [projects, activities] = await Promise.all([
    getProjectsForClient(id),
    getActivities("client", id),
  ]);

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-4xl">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-5"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft size={13} /> Back to clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-semibold">{client.name}</h1>
            <ClientStatusBadge status={client.status} />
          </div>
          {client.company && (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {client.company}
            </p>
          )}
        </div>
        <ClientActions client={client} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="md:col-span-1 rounded-xl p-5 space-y-4 h-fit"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
        >
          <InfoRow label="Region">
            <RegionBadge region={client.region} />
          </InfoRow>
          {client.email && <InfoRow label="Email">{client.email}</InfoRow>}
          {client.phone && <InfoRow label="Phone">{client.phone}</InfoRow>}
          {client.converted_from_lead && (
            <InfoRow label="Origin">
              <Link
                href={`/leads/${client.converted_from_lead}`}
                className="hover:underline"
                style={{ color: "var(--color-blue)" }}
              >
                Converted lead
              </Link>
            </InfoRow>
          )}
          {client.notes && (
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--color-ink-faint)" }}>
                Notes
              </div>
              <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold">Projects</h2>
              <NewProjectButton clientId={client.id} />
            </div>

            {projects.length === 0 ? (
              <div
                className="rounded-lg py-8 text-center"
                style={{ border: "1px dashed var(--color-line)" }}
              >
                <Briefcase size={18} className="mx-auto mb-2" style={{ color: "var(--color-ink-faint)" }} />
                <p className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
                  No projects yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </div>

          <ClientActivitySection clientId={client.id} />

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
