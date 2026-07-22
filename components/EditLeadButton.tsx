"use client";

import { useState, useRef, useCallback } from "react";
import { Pencil, X } from "lucide-react";
import { updateLead } from "@/app/actions/leads";
import type { Lead } from "@/lib/data/types";
import { LEAD_SOURCES, PRODUCTS, TEAM_MEMBERS, REGIONS, CURRENCIES } from "@/lib/data/types";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

export function EditLeadButton({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const close = useCallback(() => {
    setOpen(false);
    setError(null);
  }, []);
  useEscapeToClose(open, close);

  async function handleSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await updateLead(lead.id, formData);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Edit lead"
        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium"
        style={{ borderColor: "var(--color-line)", color: "var(--color-ink-muted)" }}
      >
        <Pencil size={13} /> Edit
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(13,21,38,0.5)" }}
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-lead-title"
            className="w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--color-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-lead-title" className="font-display text-lg font-semibold">Edit lead</h2>
              <button onClick={close} aria-label="Close">
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

            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" name="name" defaultValue={lead.name} required autoFocus />
                <Field label="Company" name="company" defaultValue={lead.company ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" name="email" type="email" defaultValue={lead.email ?? ""} />
                <Field label="Phone / WhatsApp" name="phone" defaultValue={lead.phone ?? ""} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Region" name="region" defaultValue={lead.region}>
                  {REGIONS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.flag} {r.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Currency" name="currency" defaultValue={lead.currency}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Estimated value"
                  name="estimated_value"
                  type="number"
                  defaultValue={String(lead.estimated_value)}
                />
                <SelectField label="Source" name="source" defaultValue={lead.source}>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Product interest" name="product_interest" defaultValue={lead.product_interest}>
                  {PRODUCTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Assigned to" name="assigned_to" defaultValue={lead.assigned_to}>
                  {TEAM_MEMBERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink-muted)" }}>
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={lead.notes ?? ""}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--color-line)" }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={close}
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
  autoFocus = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  defaultValue?: string;
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
        autoFocus={autoFocus}
        defaultValue={defaultValue}
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
