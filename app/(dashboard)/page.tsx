import Link from "next/link";
import { getLeads, getClients, getAllProjects, getRecentActivities } from "@/lib/data/queries";
import { formatMoney, timeAgo, LEAD_STAGES } from "@/lib/data/types";
import { SignalMeter } from "@/components/SignalMeter";
import { TrendingUp, Users, CircleDollarSign } from "@/components/icons";

export default async function DashboardPage() {
  const [leads, clients, projects, activities] = await Promise.all([
    getLeads(),
    getClients(),
    getAllProjects(),
    getRecentActivities(10),
  ]);

  const openLeads = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const openGmd = openLeads
    .filter((l) => l.currency === "GMD")
    .reduce((sum, l) => sum + Number(l.estimated_value), 0);
  const openMad = openLeads
    .filter((l) => l.currency === "MAD")
    .reduce((sum, l) => sum + Number(l.estimated_value), 0);
  const openUsd = openLeads
    .filter((l) => l.currency === "USD")
    .reduce((sum, l) => sum + Number(l.estimated_value), 0);

  const thisMonth = new Date();
  const wonThisMonth = leads.filter(
    (l) =>
      l.stage === "won" &&
      new Date(l.updated_at).getMonth() === thisMonth.getMonth() &&
      new Date(l.updated_at).getFullYear() === thisMonth.getFullYear()
  ).length;

  const activeClients = clients.filter((c) => c.status === "active").length;
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "review"
  ).length;

  const nameLookup = new Map<string, string>();
  leads.forEach((l) => nameLookup.set(`lead:${l.id}`, l.name));
  clients.forEach((c) => nameLookup.set(`client:${c.id}`, c.name));

  const stageCounts = LEAD_STAGES.filter((s) => s.key !== "lost" && s.key !== "won").map(
    (s) => ({
      ...s,
      count: leads.filter((l) => l.stage === s.key).length,
    })
  );

  return (
    <div className="px-4 py-5 md:px-8 md:py-7 max-w-6xl">
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-ink-muted)" }}>
          Everything moving across leads and client work, in one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<CircleDollarSign size={16} />}
          label="Open pipeline · GMD"
          value={formatMoney(openGmd, "GMD")}
          accent="orange"
        />
        <StatCard
          icon={<CircleDollarSign size={16} />}
          label="Open pipeline · MAD"
          value={formatMoney(openMad, "MAD")}
          accent="amber"
        />
        <StatCard
          icon={<CircleDollarSign size={16} />}
          label="Open pipeline · USD"
          value={formatMoney(openUsd, "USD")}
          accent="blue"
        />
        <StatCard
          icon={<Users size={16} />}
          label="Active clients"
          value={String(activeClients)}
          accent="teal"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Won this month"
          value={String(wonThisMonth)}
          accent="navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline by stage */}
        <div
          className="lg:col-span-3 rounded-xl p-5"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold">Pipeline by stage</h2>
            <Link href="/leads" className="text-xs font-medium" style={{ color: "var(--color-orange-strong)" }}>
              View pipeline →
            </Link>
          </div>
          <div className="space-y-3">
            {stageCounts.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-28 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                  {s.label}
                </div>
                <SignalMeter stage={s.key} size="sm" />
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-navy-soft)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: leads.length ? `${(s.count / leads.length) * 100}%` : "0%",
                      background: "var(--color-blue)",
                    }}
                  />
                </div>
                <div className="w-6 text-xs text-right font-mono">{s.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 flex items-center justify-between text-xs" style={{ borderTop: "1px solid var(--color-line)" }}>
            <span style={{ color: "var(--color-ink-muted)" }}>
              {activeProjects} active project{activeProjects === 1 ? "" : "s"} in delivery
            </span>
            <Link href="/clients" className="font-medium" style={{ color: "var(--color-blue)" }}>
              View clients →
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
        >
          <h2 className="font-display text-sm font-semibold mb-4">Recent activity</h2>
          {activities.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
              Nothing logged yet — activity from leads and clients will show up here.
            </p>
          ) : (
            <ul className="space-y-3.5">
              {activities.map((a) => (
                <li key={a.id} className="text-xs">
                  <div style={{ color: "var(--color-ink)" }}>
                    <span className="font-medium">
                      {nameLookup.get(`${a.related_type}:${a.related_id}`) ?? "Unknown"}
                    </span>{" "}
                    <span style={{ color: "var(--color-ink-muted)" }}>{a.content}</span>
                  </div>
                  <div className="mt-0.5" style={{ color: "var(--color-ink-faint)" }}>
                    {a.created_by} · {timeAgo(a.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "orange" | "blue" | "teal" | "navy" | "amber";
}) {
  const colors: Record<string, string> = {
    orange: "var(--color-orange)",
    blue: "var(--color-blue)",
    teal: "var(--color-teal)",
    navy: "var(--color-navy)",
    amber: "var(--color-amber-strong)",
  };
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-line)" }}
    >
      <div className="flex items-center gap-1.5 mb-2" style={{ color: colors[accent] }}>
        {icon}
        <span className="text-xs font-medium" style={{ color: "var(--color-ink-muted)" }}>
          {label}
        </span>
      </div>
      <div className="font-display font-mono text-xl font-semibold">{value}</div>
    </div>
  );
}
