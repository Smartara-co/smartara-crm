"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, Building2, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { BrandMark } from "@/components/BrandMark";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/leads", label: "Pipeline", icon: Users },
  { href: "/clients", label: "Clients", icon: Building2 },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <BrandMark size={28} className="shrink-0" />
      <div>
        <div className="font-display text-sm font-bold text-white leading-tight">
          Smart<span style={{ color: "var(--color-orange)" }}>ara</span>
        </div>
        <div className="text-[10px] leading-tight" style={{ color: "var(--color-on-dark-faint)" }}>
          CRM
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 h-14 sticky top-0 z-30"
        style={{ background: "var(--color-navy)" }}
      >
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2"
          style={{ color: "var(--color-on-dark-faint)" }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`w-64 md:w-56 shrink-0 flex flex-col h-screen fixed md:sticky top-0 left-0 px-4 py-5 z-50 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--color-navy)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1"
            style={{ color: "var(--color-on-dark-faint)" }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: active ? "rgba(255,92,46,0.15)" : "transparent",
                  color: active ? "var(--color-orange)" : "var(--color-on-dark-faint)",
                }}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {userEmail && (
            <div className="px-3 mb-2 text-xs truncate" style={{ color: "var(--color-on-dark-faint)" }}>
              {userEmail}
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ color: "var(--color-on-dark-faint)" }}
            >
              <LogOut size={16} strokeWidth={2} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
