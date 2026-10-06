import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-border px-6 py-16 text-center">
      {Icon && <Icon size={20} className="text-ink-faint" strokeWidth={1.5} />}
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="eyebrow animate-pulse">{label}</span>
    </div>
  );
}
