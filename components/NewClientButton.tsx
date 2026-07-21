"use client";

import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { createClientRecord } from "@/app/actions/clients";
import { CLIENT_STATUSES } from "@/lib/data/types";

export function NewClientButton() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await createClientRecord(formData);
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
        className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white"
        style={{ background: "var(--color-orange)" }}
      >
        <Plus size={15} /> New client
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
              <h2 className="font-display text-lg font-semibold">New client</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} style={{ color: "var(--color-ink-muted)" }} />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" name="name" required />
                <Field label="Company" name="company" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" name="email" type="email" />
                <Field label="Phone / WhatsApp" name="phone" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Region" name="region" defaultValue="gambia">
                  <option value="gambia">🇬🇲 Gambia</option>
                  <option value="international">🌍 International</option>
                </SelectField>
                <SelectField label="Status" name="status" defaultValue="active">
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </SelectField>
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
                  {submitting ? "Adding…" : "Add client"}
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
