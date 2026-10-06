export default function ProgressIndicator({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow whitespace-nowrap">
        {String(value).padStart(2, "0")} / {String(max).padStart(2, "0")}
      </span>
      <div className="h-px flex-1 bg-border">
        <div
          className="h-px bg-forest transition-all duration-500 ease-out"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}
