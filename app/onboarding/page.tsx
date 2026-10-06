"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Divider from "@/components/Divider";
import { useProfile } from "@/components/UserProfileProvider";
import AuthGate from "@/components/AuthGate";

type Choice = "ask" | "help" | "both";

const OPTIONS: { id: Choice; label: string; body: string }[] = [
  {
    id: "ask",
    label: "Ask",
    body: "I want to ask questions and hear different perspectives.",
  },
  {
    id: "help",
    label: "Help",
    body: "I want to share my perspective with people who need it.",
  },
  {
    id: "both",
    label: "Both",
    body: "I want to ask questions and help others.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useProfile();
  const [selected, setSelected] = useState<Choice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function proceed() {
    if (!selected) return;
    setSubmitting(true);
    completeOnboarding(selected);
    setTimeout(() => {
      if (selected === "ask") router.push("/home");
      else router.push("/become-replier");
    }, 400);
  }

  return (
    <AuthGate>
      {() => (
        <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
          <div className="w-full max-w-md">
            <p className="mb-2 text-center font-display text-3xl text-ink sm:text-4xl">
              How do you want to use UNSAID?
            </p>
            <p className="mb-12 text-center text-sm text-ink-faint">
              You can always change this later.
            </p>

            <div className="flex flex-col">
              <Divider />
              {OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.id)}
                  className={clsx(
                    "flex flex-col gap-1 border-b border-border px-1 py-6 text-left transition-colors",
                    selected === opt.id && "bg-forest-tint/60"
                  )}
                >
                  <span
                    className={clsx(
                      "eyebrow",
                      selected === opt.id ? "text-forest" : "text-ink"
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="text-ink-muted">{opt.body}</span>
                </button>
              ))}
            </div>

            <button
              onClick={proceed}
              disabled={!selected || submitting}
              className="mt-10 w-full bg-cta-bg py-4 text-sm font-medium uppercase tracking-wide text-cta-text transition-opacity disabled:opacity-40"
            >
              {submitting ? "One moment…" : "Continue"}
            </button>
          </div>
        </main>
      )}
    </AuthGate>
  );
}
