import type {
  Region,
  ClientStatus,
  ProjectStatus,
  Product,
} from "@/lib/data/types";

export function RegionBadge({ region }: { region: Region }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      {region === "gambia" ? "🇬🇲" : "🌍"}
      <span style={{ color: "var(--color-ink-muted)" }}>
        {region === "gambia" ? "Gambia" : "International"}
      </span>
    </span>
  );
}

const CLIENT_STATUS_STYLES: Record<ClientStatus, { bg: string; fg: string }> = {
  active: { bg: "var(--color-teal-soft)", fg: "var(--color-teal)" },
  paused: { bg: "var(--color-amber-soft)", fg: "var(--color-amber)" },
  completed: { bg: "var(--color-blue-soft)", fg: "var(--color-blue)" },
  churned: { bg: "var(--color-red-soft)", fg: "var(--color-red)" },
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  const style = CLIENT_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: style.bg, color: style.fg }}
    >
      {status}
    </span>
  );
}

const PROJECT_STATUS_STYLES: Record<ProjectStatus, { bg: string; fg: string; label: string }> = {
  scoping: { bg: "var(--color-navy-soft)", fg: "var(--color-ink-muted)", label: "Scoping" },
  in_progress: { bg: "var(--color-blue-soft)", fg: "var(--color-blue)", label: "In Progress" },
  review: { bg: "var(--color-amber-soft)", fg: "var(--color-amber)", label: "Review" },
  delivered: { bg: "var(--color-teal-soft)", fg: "var(--color-teal)", label: "Delivered" },
  on_hold: { bg: "var(--color-red-soft)", fg: "var(--color-red)", label: "On Hold" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const style = PROJECT_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: "var(--color-orange-soft)", color: "var(--color-orange)" }}
    >
      {product}
    </span>
  );
}
