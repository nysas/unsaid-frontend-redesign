export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="py-16 text-center eyebrow text-ink-faint">{label}</p>;
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 eyebrow text-forest hover:opacity-75">
          Try again
        </button>
      )}
    </div>
  );
}
