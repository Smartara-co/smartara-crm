import type { LeadStage } from "@/lib/data/types";

const STAGE_BARS: Record<LeadStage, number> = {
  new: 1,
  contacted: 2,
  qualified: 3,
  proposal_sent: 4,
  negotiation: 5,
  won: 5,
  lost: 0,
};

const BAR_HEIGHTS = [4, 7, 10, 13, 16];

export function SignalMeter({
  stage,
  size = "md",
}: {
  stage: LeadStage;
  size?: "sm" | "md";
}) {
  const filled = STAGE_BARS[stage];
  const isWon = stage === "won";
  const isLost = stage === "lost";
  const barWidth = size === "sm" ? 2 : 3;
  const gap = size === "sm" ? 1.5 : 2;

  if (isLost) {
    return (
      <div className="flex items-end gap-[2px] h-4" aria-label="Lost">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              width: barWidth,
              height: h * (size === "sm" ? 0.7 : 1),
              background: "var(--color-red-soft)",
            }}
            className="rounded-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-end"
      style={{ gap }}
      aria-label={`Signal strength: ${filled} of 5`}
    >
      {BAR_HEIGHTS.map((h, i) => {
        const isFilled = i < filled;
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: h * (size === "sm" ? 0.7 : 1),
              background: isFilled
                ? isWon
                  ? "var(--color-teal)"
                  : "var(--color-blue)"
                : "var(--color-line)",
            }}
            className="rounded-sm transition-colors"
          />
        );
      })}
    </div>
  );
}
