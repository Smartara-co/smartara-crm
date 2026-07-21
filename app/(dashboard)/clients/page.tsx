import Link from "next/link";
import { getClients, getAllProjects } from "@/lib/data/queries";
import { RegionBadge, ClientStatusBadge } from "@/components/Badges";
import { NewClientButton } from "@/components/NewClientButton";
import { Building2 } from "@/components/icons";

export default async function ClientsPage() {
  const [clients, projects] = await Promise.all([getClients(), getAllProjects()]);

  const projectCountByClient = new Map<string, number>();
  const activeProjectCountByClient = new Map<string, number>();
  projects.forEach((p) => {
    projectCountByClient.set(p.client_id, (projectCountByClient.get(p.client_id) ?? 0) + 1);
    if (p.status === "in_progress" || p.status === "review") {
      activeProjectCountByClient.set(
        p.client_id,
        (activeProjectCountByClient.get(p.client_id) ?? 0) + 1
      );
    }
  });

  return (
    <div className="px-4 py-5 md:px-8 md:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clients</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-muted)" }}>
            {clients.length} client{clients.length === 1 ? "" : "s"} on the books.
          </p>
        </div>
        <NewClientButton />
      </div>

      {clients.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: "1px dashed var(--color-line)" }}
        >
          <Building2 size={24} className="mx-auto mb-2" style={{ color: "var(--color-ink-faint)" }} />
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            No clients yet — convert a won lead, or add one directly.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-x-auto"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
        >
          <table className="w-full text-sm min-w-140">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-line)" }}>
                <Th>Client</Th>
                <Th>Region</Th>
                <Th>Status</Th>
                <Th>Projects</Th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--color-line)" }}
                  className="last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                    {c.company && (
                      <div className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
                        {c.company}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RegionBadge region={c.region} />
                  </td>
                  <td className="px-4 py-3">
                    <ClientStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {projectCountByClient.get(c.id) ?? 0} total
                    {(activeProjectCountByClient.get(c.id) ?? 0) > 0 && (
                      <span style={{ color: "var(--color-blue)" }}>
                        {" "}
                        · {activeProjectCountByClient.get(c.id)} active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-4 py-2.5 text-xs font-medium"
      style={{ color: "var(--color-ink-faint)" }}
    >
      {children}
    </th>
  );
}
