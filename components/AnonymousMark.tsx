const SYMBOLS = ["○", "◐", "✦", "☾", "⌁", "◇"];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** A quiet abstract mark for an anonymous or pseudonymous identity — never a photo, never initials-as-avatar branding. */
export default function AnonymousMark({
  seed,
  size = "md",
}: {
  seed: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];
  const symbol = SYMBOLS[hashSeed(seed) % SYMBOLS.length];
  return (
    <span className={`${dims} leading-none text-forest`} aria-hidden="true">
      {symbol}
    </span>
  );
}
