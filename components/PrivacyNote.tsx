/** Calm, reassuring privacy messaging — never legal-copy tone. */
export default function PrivacyNote({ anonymous }: { anonymous: boolean }) {
  return (
    <p className="text-sm text-ink-faint">
      {anonymous
        ? "You can say this without being known."
        : "Your username will appear with this — your real identity never will."}
    </p>
  );
}
