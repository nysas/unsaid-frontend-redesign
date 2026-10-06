"use client";
import Button from "@/components/Button";
import Divider from "@/components/Divider";

export function AskerGate({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="eyebrow mb-4 text-forest">Ask</p>
      <p className="font-display text-3xl leading-snug text-ink sm:text-4xl">
        You haven&apos;t asked anything yet.
      </p>
      <p className="mt-4 text-ink-muted">
        Have something on your mind? Someone here might see it differently
        than you do.
      </p>
      <div className="my-8">
        <Divider />
      </div>
      <Button size="lg" onClick={onActivate}>
        Start Asking →
      </Button>
      <p className="mt-6 text-sm text-ink-faint">You can always come back to helping.</p>
    </div>
  );
}

export function ReplierGate({ onBecome }: { onBecome: () => void }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="eyebrow mb-4 text-forest">Help</p>
      <p className="font-display text-3xl leading-snug text-ink sm:text-4xl">
        You haven&apos;t created a Replier profile yet.
      </p>
      <p className="mt-4 text-ink-muted">
        Have something to say? Someone here might need your perspective.
      </p>
      <div className="my-8">
        <Divider />
      </div>
      <Button size="lg" onClick={onBecome}>
        Become a Replier →
      </Button>
      <p className="mt-6 text-sm text-ink-faint">You can always come back to asking questions.</p>
    </div>
  );
}
