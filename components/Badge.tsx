import clsx from "clsx";
import { Domain } from "@/lib/types";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "forest" | "gold" | "danger";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "eyebrow inline-flex items-center gap-1 rounded-[2px] border px-2 py-1",
        {
          "border-border text-ink-faint": tone === "neutral",
          "border-forest/40 text-forest": tone === "forest",
          "border-gold/40 text-gold": tone === "gold",
          "border-danger/40 text-danger": tone === "danger",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function DomainBadge({ domain }: { domain: Domain }) {
  return <Badge tone="forest">{domain}</Badge>;
}
