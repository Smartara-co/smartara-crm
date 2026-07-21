import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-navy)" }}
    >
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <BrandMark size={32} />
          <span className="font-display text-xl font-bold text-white">
            Smart<span style={{ color: "var(--color-orange)" }}>ara</span>
          </span>
        </div>
        <h1 className="font-display text-lg font-semibold text-white mb-2">
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-on-dark-faint)" }}>
          That page doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--color-orange)" }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
