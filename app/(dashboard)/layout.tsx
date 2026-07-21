import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: "var(--color-canvas)" }}>
      <Sidebar userEmail={user.email ?? undefined} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
