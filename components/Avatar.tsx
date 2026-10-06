import clsx from "clsx";

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export default function Avatar({
  seed,
  size = "md",
  anonymous = false,
  className,
}: {
  seed: string;
  size?: "sm" | "md" | "lg";
  anonymous?: boolean;
  className?: string;
}) {
  const dims = { sm: 26, md: 38, lg: 60 }[size];
  if (anonymous) {
    return (
      <div
        style={{ width: dims, height: dims }}
        className={clsx(
          "flex items-center justify-center rounded-full border border-border-strong text-ink-faint",
          className
        )}
        aria-label="Anonymous"
      >
        <svg width={dims * 0.42} height={dims * 0.42} viewBox="0 0 24 24" fill="none">
          <path d="M4 18c0-3 3.5-5 8-5s8 2 8 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
    );
  }
  const h = hashSeed(seed);
  const hue = h % 360;
  return (
    <div
      style={{
        width: dims,
        height: dims,
        backgroundColor: `hsl(${hue}, 22%, 32%)`,
      }}
      className={clsx(
        "flex items-center justify-center rounded-full font-display text-cream text-sm",
        className
      )}
      aria-hidden="true"
    >
      <span style={{ color: "#F1E7D6" }}>{seed.slice(0, 1).toUpperCase()}</span>
    </div>
  );
}
