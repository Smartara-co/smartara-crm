export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{
          borderColor: "var(--color-line)",
          borderTopColor: "var(--color-orange)",
        }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
