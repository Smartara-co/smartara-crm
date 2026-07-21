"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import type { Project, ProjectStatus } from "@/lib/data/types";
import { PROJECT_STATUSES, PRODUCTS, CURRENCIES, formatMoney } from "@/lib/data/types";
import { ProductBadge } from "@/components/Badges";
import { updateProject, updateProjectStatus, deleteProject } from "@/app/actions/projects";
import { Trash2, Calendar, Pencil, X } from "lucide-react";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

export function ProjectCard({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setError(null);
  }, []);
  useEscapeToClose(editOpen, closeEdit);

  function changeStatus(status: ProjectStatus) {
    startTransition(async () => {
      try {
        await updateProjectStatus(project.id, project.client_id, status);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't update status. Please try again.");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteProject(project.id, project.client_id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't delete project. Please try again.");
      }
    });
  }

  async function handleEditSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await updateProject(project.id, project.client_id, formData);
      setEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
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
            aria-label="Project status"
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Edit project"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Pencil size={14} />
            </button>
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
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(13,21,38,0.5)" }}
          onClick={closeEdit}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-project-title"
            className="w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--color-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-project-title" className="font-display text-lg font-semibold">Edit project</h2>
              <button onClick={closeEdit} aria-label="Close">
                <X size={18} style={{ color: "var(--color-ink-muted)" }} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="text-xs rounded-lg px-3 py-2 mb-3"
                style={{ background: "var(--color-red-soft)", color: "var(--color-red-strong)" }}
              >
                {error}
              </p>
            )}

            <form ref={formRef} action={handleEditSubmit} className="space-y-3">
              <Field label="Project name" name="name" defaultValue={project.name} required autoFocus />

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Product" name="product" defaultValue={project.product}>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Status" name="status" defaultValue={project.status}>
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Value" name="value" type="number" defaultValue={String(project.value)} />
                <SelectField label="Currency" name="currency" defaultValue={project.currency}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" name="start_date" type="date" defaultValue={project.start_date ?? ""} />
                <Field label="Deadline" name="deadline" type="date" defaultValue={project.deadline ?? ""} />
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  defaultValue={project.notes ?? ""}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--color-line)" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: "var(--color-orange)" }}
                >
                  {submitting ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  autoFocus = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
        style={{ borderColor: "var(--color-line)" }}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none bg-white"
        style={{ borderColor: "var(--color-line)" }}
      >
        {children}
      </select>
    </div>
  );
}
