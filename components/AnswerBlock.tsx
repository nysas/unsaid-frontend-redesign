"use client";
import { useState } from "react";
import Link from "next/link";
import { Answer } from "@/lib/types";
import Reputation from "@/components/Reputation";
import { Badge } from "@/components/Badge";
import AnonymousMark from "@/components/AnonymousMark";
import FeedbackModal from "@/components/FeedbackModal";
import ReportModal from "@/components/ReportModal";
import { giveFeedback } from "@/lib/api";
import { friendlyError } from "@/lib/supabase";

export default function AnswerBlock({
  answer,
  viewerIsAsker,
  onChanged,
}: {
  answer: Answer;
  viewerIsAsker: boolean;
  onChanged: () => void;
}) {
  const [feedback, setFeedback] = useState<boolean | null>(answer.myFeedback);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function quick(helpful: boolean) {
    // The asker gets the full feedback form when something helped.
    if (helpful && viewerIsAsker) {
      setDetailOpen(true);
      return;
    }
    setError(null);
    setFeedback(helpful);
    try {
      await giveFeedback({ answerId: answer.id, helpful });
      onChanged();
    } catch (err) {
      setFeedback(null);
      setError(friendlyError(err));
    }
  }

  return (
    <div className="py-8">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <AnonymousMark seed={answer.replierAvatarSeed} size="sm" />
        <Link href={`/u/${answer.replierUsername}`} className="text-sm text-ink hover:text-forest">
          @{answer.replierUsername}
        </Link>
        {answer.isQualified ? <Badge tone="forest">Qualified</Badge> : <Badge>New Replier</Badge>}
        {answer.domains.length > 0 && (
          <>
            <span className="hidden text-ink-faint sm:inline">·</span>
            <span className="hidden text-xs text-ink-faint sm:inline">{answer.domains.join(" · ")}</span>
          </>
        )}
        {answer.reputation && (
          <>
            <span className="text-ink-faint">·</span>
            <Reputation reputation={answer.reputation} compact />
          </>
        )}
      </div>

      <p className="whitespace-pre-line text-[17px] leading-[1.75] text-ink">{answer.body}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        {answer.isMine ? (
          <span className="text-sm text-ink-faint">
            Your perspective
            {answer.status !== "visible" && " · hidden pending review"} · {answer.helpfulCount} found it helpful
          </span>
        ) : feedback === null ? (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-ink-faint">Was this perspective helpful?</span>
            <button onClick={() => quick(true)} className="eyebrow text-forest hover:opacity-75">
              Yes, it helped
            </button>
            <button onClick={() => quick(false)} className="eyebrow text-ink-faint hover:text-ink">
              Not really
            </button>
          </div>
        ) : (
          <span className="text-sm text-ink-faint">
            {feedback ? "Glad it helped." : "Thanks for letting us know."}
          </span>
        )}
        {!answer.isMine && (
          <button onClick={() => setReportOpen(true)} className="eyebrow text-ink-faint hover:text-danger">
            Report
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <FeedbackModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        answerId={answer.id}
        onSubmitted={() => {
          setFeedback(true);
          onChanged();
        }}
      />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="answer" targetId={answer.id} />
    </div>
  );
}
