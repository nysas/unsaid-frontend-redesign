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
                <span className="eyebrow text-gold">Assessment completed</span>
              </div>
            ))}
          </div>
        )}

        <p className="mb-10 text-sm text-ink-faint">
          Qualification results will appear here later. You can check back on
          your profile any time.
        </p>

        <Link href="/you">
          <Button size="lg">Back to You →</Button>
        </Link>
      </div>
    </main>
  );
}

export default function AssessmentResultPage() {
  return <AuthGate>{(user) => <ResultContent user={user} />}</AuthGate>;
}
