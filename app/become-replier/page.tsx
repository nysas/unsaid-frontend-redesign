"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import DomainSelector from "@/components/DomainSelector";
import AuthGate from "@/components/AuthGate";
import { useProfile } from "@/components/UserProfileProvider";
import { DOMAINS, Domain } from "@/lib/types";
import { questionCountLabel } from "@/lib/assessment-questions";

export default function BecomeReplierPage() {
  const [selected, setSelected] = useState<Domain[]>([]);
  const router = useRouter();
  const { user } = useProfile();

  function toggle(d: Domain) {
    setSelected((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  function begin() {
    if (selected.length === 0) return;
    router.push(`/assessment?domains=${encodeURIComponent(selected.join("|"))}`);
  }

  const alreadyAssessed = new Set(user?.replier.qualifications.map((q) => q.domain) ?? []);
  const availableDomains = DOMAINS.filter((d) => !alreadyAssessed.has(d));

  return (
    <AuthGate>
      {() => (
        <main>
          <Navbar />
          <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
            <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              What do you want to help with?
            </p>
            <p className="mt-4 text-ink-muted">
              Choose the parts of life where you&apos;d like to share your perspective.
            </p>

            <div className="my-10">
              {availableDomains.length > 0 ? (
                <DomainSelector selected={selected} onToggle={toggle} domains={availableDomains} />
              ) : (
                <p className="text-sm text-ink-faint">
                  You&apos;ve already started an assessment for every domain.
                </p>
              )}
            </div>

            {selected.length > 0 && (
              <div className="mb-8 flex flex-col gap-1.5">
                {selected.map((d) => (
                  <div key={d} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{d}</span>
                    <span className="text-ink-faint">{questionCountLabel(d)}</span>
                  </div>
                ))}
              </div>
            )}

            <Divider className="mb-8" />

            <p className="mb-8 text-sm text-ink-faint">
              You&apos;ll take a separate assessment for each domain you choose.
            </p>

            <Button size="lg" disabled={selected.length === 0} onClick={begin}>
              Continue →
            </Button>
          </div>
        </main>
      )}
    </AuthGate>
  );
}
