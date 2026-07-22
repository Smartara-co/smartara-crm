import Link from "next/link";
import { getClients, getAllProjects } from "@/lib/data/queries";
import { RegionBadge, ClientStatusBadge } from "@/components/Badges";
import { NewClientButton } from "@/components/NewClientButton";
import { ClientFilters } from "@/components/ClientFilters";
import { Building2, ChevronUp, ChevronDown } from "@/components/icons";
import type { Region, ClientStatus } from "@/lib/data/types";

type SortKey = "name" | "region" | "status" | "projects" | "date" | "latest";
type SortDir = "asc" | "desc";

const SORT_KEYS: SortKey[] = ["name", "region", "status", "projects", "date", "latest"];

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; region?: string; status?: string; paid?: string }>;
}) {
  const params = await searchParams;
  const sort: SortKey = SORT_KEYS.includes(params.sort as SortKey)
    ? (params.sort as SortKey)
    : "date";
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";
  const regionFilter = params.region as Region | undefined;
  const statusFilter = params.status as ClientStatus | undefined;
  const paidFilter = params.paid === "paid" || params.paid === "founding" ? params.paid : undefined;

  const [allClients, projects] = await Promise.all([getClients(), getAllProjects()]);

  const projectCountByClient = new Map<string, number>();
  const activeProjectCountByClient = new Map<string, number>();
  const latestDeadlineByClient = new Map<string, string>();
  const totalValueByClient = new Map<string, number>();
  // A project with no deadline yet is still ongoing, so it counts as more recent than any delivered date.
  const ongoingProjectByClient = new Set<string>();
  projects.forEach((p) => {
    projectCountByClient.set(p.client_id, (projectCountByClient.get(p.client_id) ?? 0) + 1);
    if (p.status === "in_progress" || p.status === "review") {
      activeProjectCountByClient.set(
        p.client_id,
        (activeProjectCountByClient.get(p.client_id) ?? 0) + 1
      );
    }
    if (p.deadline) {
      const current = latestDeadlineByClient.get(p.client_id);
      if (!current || p.deadline > current) {
        latestDeadlineByClient.set(p.client_id, p.deadline);
      }
    } else {
      ongoingProjectByClient.add(p.client_id);
    }
    totalValueByClient.set(p.client_id, (totalValueByClient.get(p.client_id) ?? 0) + p.value);
  });

  // A founding client's projects were built for free, i.e. their total project value is 0.
  const isFounding = (clientId: string) => (totalValueByClient.get(clientId) ?? 0) === 0;

  const clients = allClients.filter(
    (c) =>
      (!regionFilter || c.region === regionFilter) &&
      (!statusFilter || c.status === statusFilter) &&
      (!paidFilter || (paidFilter === "founding" ? isFounding(c.id) : !isFounding(c.id)))
  );

  const sortedClients = [...clients].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "region":
        cmp = a.region.localeCompare(b.region);
        break;
      case "status":
        cmp = a.status.localeCompare(b.status);
        break;
      case "projects":
        cmp = (projectCountByClient.get(a.id) ?? 0) - (projectCountByClient.get(b.id) ?? 0);
        break;
      case "date":
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case "latest": {
        const aTime = ongoingProjectByClient.has(a.id)
          ? Infinity
          : latestDeadlineByClient.has(a.id)
            ? new Date(latestDeadlineByClient.get(a.id)!).getTime()
            : -Infinity;
        const bTime = ongoingProjectByClient.has(b.id)
          ? Infinity
          : latestDeadlineByClient.has(b.id)
            ? new Date(latestDeadlineByClient.get(b.id)!).getTime()
            : -Infinity;
        cmp = aTime === bTime ? 0 : aTime - bTime;
        break;
      }
    }
    return dir === "asc" ? cmp : -cmp;
  });

  const sortHref = (key: SortKey) => {
    const nextDir: SortDir = sort === key && dir === "asc" ? "desc" : "asc";
    const hrefParams = new URLSearchParams();
    hrefParams.set("sort", key);
    hrefParams.set("dir", nextDir);
    if (regionFilter) hrefParams.set("region", regionFilter);
    if (statusFilter) hrefParams.set("status", statusFilter);
    if (paidFilter) hrefParams.set("paid", paidFilter);
    return `/clients?${hrefParams.toString()}`;
  };

  return (
    <div className="px-4 py-5 md:px-8 md:py-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clients</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-ink-muted)" }}>
            {regionFilter || statusFilter || paidFilter
              ? `${clients.length} of ${allClients.length} clients match your filters.`
              : `${clients.length} client${clients.length === 1 ? "" : "s"} on the books.`}
          </p>
        </div>
        <NewClientButton />
      </div>

      <ClientFilters />

      {clients.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: "1px dashed var(--color-line)" }}
        >
          <Building2 size={24} className="mx-auto mb-2" style={{ color: "var(--color-ink-faint)" }} />
          <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {allClients.length === 0
              ? "No clients yet — convert a won lead, or add one directly."
              : "No clients match your filters."}
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
                <SortTh sortKey="name" label="Client" activeSort={sort} dir={dir} href={sortHref("name")} />
                <SortTh sortKey="region" label="Region" activeSort={sort} dir={dir} href={sortHref("region")} />
                <SortTh sortKey="status" label="Status" activeSort={sort} dir={dir} href={sortHref("status")} />
                <SortTh
                  sortKey="projects"
                  label="Projects"
                  activeSort={sort}
                  dir={dir}
                  href={sortHref("projects")}
                />
                <SortTh sortKey="latest" label="Latest" activeSort={sort} dir={dir} href={sortHref("latest")} />
                <SortTh sortKey="date" label="Added" activeSort={sort} dir={dir} href={sortHref("date")} />
              </tr>
            </thead>
            <tbody>
              {sortedClients.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--color-line)" }}
                  className="last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/clients/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                      {isFounding(c.id) && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ background: "var(--color-orange-soft)", color: "var(--color-orange-strong)" }}
                        >
                          Founding
                        </span>
                      )}
                    </div>
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
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-ink-faint)" }}>
                    {ongoingProjectByClient.has(c.id) ? (
                      <span style={{ color: "var(--color-blue)" }}>In progress</span>
                    ) : latestDeadlineByClient.has(c.id) ? (
                      new Date(latestDeadlineByClient.get(c.id)!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-ink-faint)" }}>
                    {new Date(c.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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

function SortTh({
  sortKey,
  label,
  activeSort,
  dir,
  href,
}: {
  sortKey: SortKey;
  label: string;
  activeSort: SortKey;
  dir: SortDir;
  href: string;
}) {
  const isActive = sortKey === activeSort;
  return (
    <th className="text-left px-4 py-2.5 text-xs font-medium" style={{ color: "var(--color-ink-faint)" }}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 hover:underline"
        style={isActive ? { color: "var(--color-ink)" } : undefined}
      >
        {label}
        {isActive &&
          (dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </Link>
    </th>
  );
}
