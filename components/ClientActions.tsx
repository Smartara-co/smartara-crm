"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Client, ClientStatus } from "@/lib/data/types";
import { CLIENT_STATUSES } from "@/lib/data/types";
import { updateClientStatus, deleteClient } from "@/app/actions/clients";
import { Trash2 } from "lucide-react";

export function ClientActions({ client }: { client: Client }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeStatus(status: ClientStatus) {
    startTransition(async () => {
      await updateClientStatus(client.id, status);
    });
  }

  function remove() {
    if (!window.confirm(`Delete client "${client.name}"? This removes their projects too.`)) return;
    startTransition(async () => {
      await deleteClient(client.id);
      router.push("/clients");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
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
        onClick={remove}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
        style={{ color: "var(--color-red)" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
