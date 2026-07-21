"use client";

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { createProject } from "@/app/actions/projects";
import { PRODUCTS, PROJECT_STATUSES } from "@/lib/data/types";

export function NewProjectButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await createProject(clientId, formData);
      setOpen(false);
      formRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
        style={{ background: "var(--color-orange-soft)", color: "var(--color-orange)" }}
      >
        <Plus size={13} /> New project
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(13,21,38,0.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--color-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">New project</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} style={{ color: "var(--color-ink-muted)" }} />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <Field label="Project name" name="name" required />

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Product" name="product" defaultValue="Client Services">
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Status" name="status" defaultValue="scoping">
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Value" name="value" type="number" />
                <SelectField label="Currency" name="currency" defaultValue="GMD">
                  <option value="GMD">GMD</option>
                  <option value="USD">USD</option>
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" name="start_date" type="date" />
                <Field label="Deadline" name="deadline" type="date" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--color-line)" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                  {submitting ? "Adding…" : "Add project"}
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
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
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
        {label}
      </label>
      <select
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
