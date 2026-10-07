"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import { EmptyState } from "@/components/EmptyState";
import { ReplierGate } from "@/components/ProfileGate";
import AuthGate from "@/components/AuthGate";
import { Loading, LoadError } from "@/components/LoadState";
import { fetchMatchedQuestions } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { User } from "@/lib/types";
import { MessageCircle } from "lucide-react";

function ReplierHomeContent({ user }: { user: User }) {
  const router = useRouter();
  const matched = useAsync(
    () => (user.replier.active ? fetchMatchedQuestions() : Promise.resolve([])),
    [user.replier.active]
  );

  if (!user.replier.active) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <ReplierGate onBecome={() => router.push("/become-replier")} />
        </div>
      </main>
    );
  }

  const questions = matched.data ?? [];

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <p className="font-display text-3xl text-ink sm:text-4xl">
          Someone is looking for a perspective.
        </p>
        <p className="mt-3 text-sm text-ink-faint">
          Matched from the domains you&apos;ve been assessed in.
        </p>

        <div className="mt-10">
          <Divider />
        </div>

        <div className="flex flex-col">
          {matched.loading ? (
            <Loading />
          ) : matched.error ? (
            <LoadError message={matched.error} onRetry={matched.reload} />
          ) : questions.length > 0 ? (
            questions.map((q, i) => (
              <div key={q.id}>
                <div className="py-9">
                  <span className="eyebrow text-forest">{q.domain}</span>
                  <p className="mt-3 font-display text-2xl leading-snug text-ink sm:text-3xl">
                    &ldquo;{q.body.length > 160 ? q.body.slice(0, 160).trim() + "…" : q.body}&rdquo;
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                      <MessageCircle size={13} />
                      {q.answerCount} perspective{q.answerCount === 1 ? "" : "s"} so far
                    </span>
                    <Link href={`/question/${q.id}`} className="eyebrow text-forest hover:opacity-75">
                      Share your perspective →
                    </Link>
                  </div>
                </div>
                {i < questions.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState
              title="Nothing to match right now"
              description="Once someone asks about a domain you've been assessed in, it'll show up here."
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default function ReplierQuestionsPage() {
  return <AuthGate>{(user) => <ReplierHomeContent user={user} />}</AuthGate>;
}
