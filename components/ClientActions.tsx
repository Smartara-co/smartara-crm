"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Client, ClientStatus } from "@/lib/data/types";
import { CLIENT_STATUSES, REGIONS } from "@/lib/data/types";
import { updateClient, updateClientStatus, deleteClient } from "@/app/actions/clients";
import { Pencil, Trash2, X } from "lucide-react";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

export function ClientActions({ client }: { client: Client }) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const router = useRouter();
  const closeEdit = useCallback(() => {
    setEditOpen(false);
    setError(null);
  }, []);
  useEscapeToClose(editOpen, closeEdit);

  function changeStatus(status: ClientStatus) {
    startTransition(async () => {
      try {
        await updateClientStatus(client.id, status);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't update status. Please try again.");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete client "${client.name}"? This removes their projects too.`)) return;
    startTransition(async () => {
      try {
        await deleteClient(client.id);
        router.push("/clients");
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Couldn't delete client. Please try again.");
      }
    });
  }

  async function handleEditSubmit(formData: FormData) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await updateClient(client.id, formData);
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
      <div className="flex items-center gap-2">
        <select
          aria-label="Client status"
          value={client.status}
          disabled={isPending}
          onChange={(e) => changeStatus(e.target.value as ClientStatus)}
          className="rounded-lg border px-2.5 py-1.5 text-xs font-medium bg-white capitalize"
          style={{ borderColor: "var(--color-line)" }}
        >
          {CLIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Edit client"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={remove}
          disabled={isPending}
          aria-label="Delete client"
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
          style={{ color: "var(--color-red)" }}
        >
          <Trash2 size={14} />
        </button>
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
            aria-labelledby="edit-client-title"
            className="w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--color-surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-client-title" className="font-display text-lg font-semibold">Edit client</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" name="name" defaultValue={client.name} required autoFocus />
                <Field label="Company" name="company" defaultValue={client.company ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" name="email" type="email" defaultValue={client.email ?? ""} />
                <Field label="Phone / WhatsApp" name="phone" defaultValue={client.phone ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Region" name="region" defaultValue={client.region}>
                  {REGIONS.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.flag} {r.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Status" name="status" defaultValue={client.status}>
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
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
                  rows={2}
                  defaultValue={client.notes ?? ""}
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
