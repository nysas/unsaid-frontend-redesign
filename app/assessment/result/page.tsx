"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import Button from "@/components/Button";
import AuthGate from "@/components/AuthGate";
import { User } from "@/lib/types";

function ResultContent({ user }: { user: User }) {
  const recentlyCompleted = [...user.replier.qualifications]
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, 5);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <p className="font-display text-4xl text-ink">Assessment complete.</p>
        <p className="mt-3 text-ink-muted">Your responses have been recorded.</p>

        <div className="my-10">
          <Divider />
        </div>

        {recentlyCompleted.length > 0 && (
          <div className="mb-10 flex flex-col divide-y divide-border">
            {recentlyCompleted.map((q) => (
              <div key={q.domain} className="flex items-center justify-between py-3">
                <span className="text-sm text-ink">{q.domain}</span>
                <span className="eyebrow text-gold">
                  {q.status === "qualified" ? "Qualified" : q.status === "not_qualified" ? "Reviewed" : "Submitted · in review"}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mb-10 text-sm text-ink-faint">
          You can start sharing perspectives in these domains right away. A reviewer
          will read your answers, and once you&apos;re marked Qualified your perspectives
          show a badge. We&apos;ll notify you.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link href="/replier/questions">
            <Button size="lg">See who needs a perspective →</Button>
          </Link>
          <Link href="/you">
            <Button size="lg" variant="secondary">Back to You</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AssessmentResultPage() {
  return <AuthGate>{(user) => <ResultContent user={user} />}</AuthGate>;
}
