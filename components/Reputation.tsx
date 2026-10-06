import { Reputation as ReputationT } from "@/lib/types";

export default function Reputation({
  reputation,
  answered,
  compact = false,
}: {
  reputation?: ReputationT;
  answered?: number;
  compact?: boolean;
}) {
  if (!reputation) {
    return (
      <div className={compact ? "eyebrow" : "flex flex-col gap-0.5"}>
        <span className="eyebrow text-gold">New Replier</span>
        {!compact && (
          <span className="text-sm text-ink-faint">
            {answered ?? 0} questions answered
          </span>
        )}
      </div>
    );
  }
  if (compact) {
    return (
      <span className="text-sm text-ink-muted">
        {reputation.average.toFixed(1)} · {reputation.ratingsCount} ratings
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
      <span className="font-display text-2xl text-ink">
        {reputation.average.toFixed(1)}{" "}
        <span className="text-base text-ink-faint">/ 5</span>
      </span>
      <span className="eyebrow">{answered ?? 0} answers</span>
      <span className="eyebrow">{reputation.helpfulPercent}% found helpful</span>
    </div>
  );
}
