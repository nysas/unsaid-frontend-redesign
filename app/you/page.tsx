"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import AnonymousMark from "@/components/AnonymousMark";
import QualificationRow, { NotAssessedRow } from "@/components/QualificationRow";
import EditProfileModal from "@/components/EditProfileModal";
import AuthGate from "@/components/AuthGate";
import { useProfile } from "@/components/UserProfileProvider";
import { DOMAINS, User } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { fetchFeedbackReceived, setAnswerVisibility } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

function YouContent({ user }: { user: User }) {
  const { activateAsker, refresh } = useProfile();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const notes = useAsync(
    () => (user.replier.active ? fetchFeedbackReceived() : Promise.resolve([])),
    [user.replier.active, user.replier.helpfulRatings]
  );
  const kindWords = (notes.data ?? []).filter((f) => f.note).slice(0, 5);

  async function toggleVisibility(id: string, visible: boolean) {
    await setAnswerVisibility(id, visible);
    await refresh();
  }

  const { asker, replier } = user;
  const unassessedDomains = DOMAINS.filter(
    (d) => !replier.qualifications.some((q) => q.domain === d)
  );

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        {/* Identity hero */}
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong">
            <AnonymousMark seed={user.avatarSeed} size="lg" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-ink">@{user.username}</h1>
            {user.bio && (
              <p className="mt-1 font-display italic text-ink-muted">&ldquo;{user.bio}&rdquo;</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-6">
          <button onClick={() => setEditOpen(true)} className="eyebrow text-forest hover:opacity-75">
            Edit profile →
          </button>
          {replier.active && (
            <Link href={`/u/${user.username}`} className="eyebrow text-ink-faint hover:text-ink">
              View public profile
            </Link>
          )}
        </div>

        <div className="my-12">
          <Divider />
        </div>

        {/* Status */}
        <p className="eyebrow mb-6 text-forest">You on Unsaid</p>
        <div className="flex flex-col">
          <div className="py-6">
            <div className="mb-2 flex items-center gap-3">
              <p className="text-ink">Asker</p>
              <span className="eyebrow text-ink-faint">
                {asker.active ? "Active" : "Not set up"}
              </span>
            </div>
            {asker.active ? (
              <>
                <p className="text-sm text-ink-faint">
                  {asker.questionsAsked.length} question{asker.questionsAsked.length === 1 ? "" : "s"} asked
                </p>
                <Link href="/home" className="mt-3 inline-block eyebrow text-forest hover:opacity-75">
                  Go to Ask →
                </Link>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-muted">Want to ask something?</p>
                <button onClick={() => void activateAsker()} className="eyebrow text-forest hover:opacity-75">
                  Start Asking →
                </button>
              </>
            )}
          </div>
          <Divider />
          <div className="py-6">
            <div className="mb-2 flex items-center gap-3">
              <p className="text-ink">Replier</p>
              <span className="eyebrow text-ink-faint">
                {replier.active ? "Active" : "Not set up"}
              </span>
            </div>
            {replier.active ? (
              <>
                <p className="text-sm text-ink-faint">
                  {replier.perspectivesShared.length} perspective{replier.perspectivesShared.length === 1 ? "" : "s"} shared
                </p>
                <Link
                  href="/replier/questions"
                  className="mt-3 inline-block eyebrow text-forest hover:opacity-75"
                >
                  Go to Help →
                </Link>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink-muted">Want to share your perspective?</p>
                <button
                  onClick={() => router.push("/become-replier")}
                  className="eyebrow text-forest hover:opacity-75"
                >
                  Become a Replier →
                </button>
              </>
            )}
          </div>
          <Divider />
        </div>

        {/* Your questions */}
        {asker.active && (
          <>
            <div className="mt-12 mb-6">
              <p className="eyebrow text-forest">Your questions</p>
            </div>
            {asker.questionsAsked.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {asker.questionsAsked.map((q) => (
                  <Link key={q.id} href={`/question/${q.id}`} className="group block py-4">
                    <span className="eyebrow text-forest">{q.domain}</span>
                    {q.status !== "visible" && <span className="ml-2 eyebrow text-danger">In review</span>}
                    <p className="mt-2 text-[15px] leading-relaxed text-ink transition-colors group-hover:text-forest">
                      &ldquo;{q.body.length > 140 ? q.body.slice(0, 140).trim() + "…" : q.body}&rdquo;
                    </p>
                    <p className="mt-2 eyebrow text-ink-faint">
                      {q.answerCount} perspective{q.answerCount === 1 ? "" : "s"} · {timeAgo(q.createdAt)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-4">
                <p className="mb-3 text-sm text-ink-muted">You haven&apos;t asked anything yet.</p>
                <Link href="/ask" className="eyebrow text-forest hover:opacity-75">
                  Ask Something →
                </Link>
              </div>
            )}
          </>
        )}

        {/* Qualification */}
        {replier.active && (
          <>
            <div className="mt-12 mb-6">
              <p className="eyebrow text-forest">What I can help with</p>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {replier.qualifications.map((q) => (
                <QualificationRow key={q.domain} q={q} />
              ))}
              {unassessedDomains.map((d) => (
                <NotAssessedRow key={d} domain={d} />
              ))}
            </div>
            <Link
              href="/become-replier"
              className="mt-5 inline-block eyebrow text-ink-faint hover:text-ink"
            >
              + Add another domain
            </Link>

            <div className="my-12">
              <Divider />
            </div>

            {/* Community */}
            <p className="eyebrow mb-6 text-forest">Community</p>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-ink-faint">{replier.helpfulRatings} helpful ratings</p>
              <p className="text-sm text-ink-faint">
                {replier.perspectivesShared.length} perspective{replier.perspectivesShared.length === 1 ? "" : "s"} shared
              </p>
            </div>
            {kindWords.length > 0 && (
              <div className="mt-8 flex flex-col gap-4">
                <p className="eyebrow text-ink-faint">What people said</p>
                {kindWords.map((f) => (
                  <p key={f.id} className="font-display italic text-ink-muted">&ldquo;{f.note}&rdquo;</p>
                ))}
              </div>
            )}

            <div className="my-12">
              <Divider />
            </div>

            <p className="eyebrow mb-6 text-forest">Perspectives I&apos;ve shared</p>
            {replier.perspectivesShared.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {replier.perspectivesShared.map((a) => (
                  <div key={a.id} className="py-6">
                    <p className="eyebrow mb-2 text-ink-faint">
                      {a.domain}
                      {a.status !== "visible" && <span className="ml-2 text-danger">In review</span>}
                    </p>
                    <Link href={`/question/${a.questionId}`} className="block">
                      <p className="mb-3 text-[15px] leading-relaxed text-ink hover:text-forest">
                        &ldquo;{a.body.length > 160 ? a.body.slice(0, 160).trim() + "…" : a.body}&rdquo;
                      </p>
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <span className="eyebrow text-ink-faint">
                        {a.helpfulCount} {a.helpfulCount === 1 ? "person" : "people"} found this helpful
                      </span>
                      <button
                        onClick={() => void toggleVisibility(a.id, !a.visibleOnProfile)}
                        className="eyebrow text-forest hover:opacity-75"
                      >
                        {a.visibleOnProfile ? "Shown on profile · hide" : "Private · show on profile"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">You haven&apos;t shared a perspective yet.</p>
            )}
          </>
        )}

        <div className="my-12">
          <Divider />
        </div>

        <Link href="/settings" className="eyebrow text-ink-faint hover:text-ink">
          Settings
        </Link>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </main>
  );
}

export default function YouPage() {
  return <AuthGate>{(user) => <YouContent user={user} />}</AuthGate>;
}
