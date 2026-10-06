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
}: {
  questionId: string;
  domain: Domain;
}) {
  const { user, isLoggedIn, mounted, shareAnswer } = useProfile();
  const [value, setValue] = useState("");
  const [posted, setPosted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showOnProfile, setShowOnProfile] = useState(false);

  if (!mounted) return null;

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

      <Button
        disabled={value.trim().length < 20}
        onClick={() => {
          shareAnswer({ questionId, domain, body: value, visibleOnProfile: showOnProfile });
          setPosted(true);
        }}
        className="self-start"
      >
        Post Perspective
      </Button>
    </div>
  );
}
