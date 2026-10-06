"use client";
import clsx from "clsx";
import { Domain, DOMAINS } from "@/lib/types";

export default function DomainSelector({
  selected,
  onToggle,
  domains = DOMAINS,
}: {
  selected: Domain[];
  onToggle: (d: Domain) => void;
  domains?: Domain[];
}) {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
      {domains.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onToggle(d)}
            aria-pressed={active}
            className={clsx(
              "group flex items-center justify-between px-5 py-4 text-left transition-colors duration-200",
              active ? "bg-forest-tint" : "bg-surface hover:bg-surface-sunken"
            )}
          >
            <span
              className={clsx(
                "text-[15px] transition-colors",
                active ? "text-forest font-medium" : "text-ink"
              )}
            >
              {d}
            </span>
            <span
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-opacity",
                active ? "bg-forest opacity-100" : "opacity-0"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
