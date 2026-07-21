"use client";

import { ActivityComposer } from "@/components/ActivityComposer";
import { addClientActivity } from "@/app/actions/clients";
import type { TeamMember } from "@/lib/data/types";

export function ClientActivitySection({ clientId }: { clientId: string }) {
  return (
    <ActivityComposer
      onAdd={(content, type, actor: TeamMember) => addClientActivity(clientId, content, type, actor)}
    />
  );
}
