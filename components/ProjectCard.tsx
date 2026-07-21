"use client";

import { useTransition } from "react";
import type { Project, ProjectStatus } from "@/lib/data/types";
import { PROJECT_STATUSES, formatMoney } from "@/lib/data/types";
import { ProductBadge } from "@/components/Badges";
import { updateProjectStatus, deleteProject } from "@/app/actions/projects";
import { Trash2, Calendar } from "lucide-react";

export function ProjectCard({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();

  function changeStatus(status: ProjectStatus) {
    startTransition(async () => {
      await updateProjectStatus(project.id, project.client_id, status);
    });
  }

  function remove() {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    startTransition(async () => {
      await deleteProject(project.id, project.client_id);
    });
  }

  return (
    <div
      className="rounded-lg p-3.5"
      style={{ border: "1px solid var(--color-line)", opacity: isPending ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-medium">{project.name}</div>
          <div className="mt-1">
            <ProductBadge product={project.product} />
          </div>
        </div>
        <span className="text-xs font-mono font-medium">
          {formatMoney(project.value, project.currency)}
        </span>
      </div>

      {(project.start_date || project.deadline) && (
        <div
          className="flex items-center gap-1 text-xs mb-2"
          style={{ color: "var(--color-ink-faint)" }}
        >
          <Calendar size={12} />
          {project.start_date ?? "—"} → {project.deadline ?? "—"}
        </div>
      )}

      {project.notes && (
        <p className="text-xs mb-2" style={{ color: "var(--color-ink-muted)" }}>
          {project.notes}
        </p>
      )}

      <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--color-line)" }}>
        <select
          value={project.status}
          disabled={isPending}
          onChange={(e) => changeStatus(e.target.value as ProjectStatus)}
          className="rounded-md border px-2 py-1 text-xs bg-white"
          style={{ borderColor: "var(--color-line)" }}
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={remove}
          disabled={isPending}
          style={{ color: "var(--color-red)" }}
          aria-label="Delete project"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
