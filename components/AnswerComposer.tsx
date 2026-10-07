"use client";
import { useState } from "react";
import Link from "next/link";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import clsx from "clsx";
import { useProfile } from "@/components/UserProfileProvider";
import { Domain } from "@/lib/types";

export default function AnswerComposer({
  questionId,
  domain,
  isOwnQuestion,
  alreadyAnswered,
  onPosted,
}: {
  questionId: string;
  domain: Domain;
  isOwnQuestion: boolean;
  alreadyAnswered: boolean;
  onPosted: () => void;
}) {
  const { user, isLoggedIn, mounted, shareAnswer } = useProfile();
  const [value, setValue] = useState("");
  const [posted, setPosted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showOnProfile, setShowOnProfile] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) return null;
  if (isOwnQuestion) {
    return (
      <p className="border border-dashed border-border py-4 text-center text-sm text-ink-faint">
        This is your question. You&apos;ll get a notification when someone shares a perspective.
      </p>
    );
  }
  if (alreadyAnswered && !posted) return null;

  if (!isLoggedIn) {
    return (
      <div className="border border-dashed border-border py-4 text-center text-sm text-ink-faint">
        <Link href="/login" className="text-forest">Log in</Link> to share a perspective.
      </div>
    );
  }

  if (!user?.replier.active) {
    return (
      <div className="border border-dashed border-border py-4 text-center text-sm text-ink-faint">
        <Link href="/become-replier" className="text-forest">Become a Replier</Link> to share a perspective here.
      </div>
    );
  }

  const domainAccess = user?.replier.qualifications.find((q) => q.domain === domain);
  if (!domainAccess || domainAccess.status === "not_qualified") {
    return (
      <div className="border border-dashed border-border py-4 text-center text-sm text-ink-faint">
        {domainAccess ? (
          <>You can share perspectives in your other domains.</>
        ) : (
          <>
            <Link href={`/assessment?domains=${encodeURIComponent(domain)}`} className="text-forest">
              Take the {domain} assessment
            </Link>{" "}
            to share a perspective here.
          </>
        )}
      </div>
    );
  }

  async function post() {
    setSending(true);
    setError(null);
    const res = await shareAnswer({ questionId, body: value, visibleOnProfile: showOnProfile });
    setSending(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't post your perspective.");
      return;
    }
    setPosted(true);
    onPosted();
  }

  if (posted) {
    return (
      <div>
        <p className="text-sm text-forest">Your perspective was posted.</p>
        <div className="mt-6">
          <Divider />
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-dashed border-border py-4 text-left eyebrow text-ink-faint transition-colors hover:border-border-strong hover:text-ink-muted"
      >
        Share a perspective
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Textarea
        placeholder="Try to understand the situation before jumping to a conclusion."
        rows={5}
        maxLength={2000}
        showCount
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-base"
      />

      <div>
        <p className="eyebrow mb-2">Show this on my profile?</p>
        <div className="flex flex-col gap-2 text-sm">
          <button
            onClick={() => setShowOnProfile(false)}
            className={clsx("flex items-center gap-2 text-left", !showOnProfile ? "text-ink" : "text-ink-faint")}
          >
            <span>{!showOnProfile ? "●" : "○"}</span> Keep private
          </button>
          <button
            onClick={() => setShowOnProfile(true)}
            className={clsx("flex items-center gap-2 text-left", showOnProfile ? "text-ink" : "text-ink-faint")}
          >
            <span>{showOnProfile ? "●" : "○"}</span> Show on my profile
          </button>
        </div>
        {showOnProfile && (
          <p className="mt-2 text-xs text-ink-faint">
            The question stays anonymous either way — only your answer would appear on your profile.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button disabled={value.trim().length < 20 || sending} onClick={post} className="self-start">
        {sending ? "Posting…" : "Post Perspective"}
      </Button>
    </div>
  );
}
