"use client";
import { useState } from "react";
import Link from "next/link";
import { Answer } from "@/lib/types";
import Reputation from "@/components/Reputation";
import { Badge } from "@/components/Badge";
import AnonymousMark from "@/components/AnonymousMark";

export default function AnswerBlock({ answer }: { answer: Answer }) {
  const [feedback, setFeedback] = useState<"helped" | "not" | null>(null);

  return (
    <div className="py-8">
      <div className="mb-4 flex items-center gap-2.5">
        <AnonymousMark seed={answer.replierAvatarSeed} size="sm" />
        <Link href="/replier" className="text-sm text-ink hover:text-forest">
          @{answer.replierUsername}
        </Link>
        {answer.isQualified ? (
          <Badge tone="forest">Qualified</Badge>
        ) : (
          <Badge>New Replier</Badge>
        )}
        <span className="hidden text-ink-faint sm:inline">·</span>
        <span className="hidden text-xs text-ink-faint sm:inline">
          {answer.domains.join(" · ")}
        </span>
        {answer.reputation && (
          <>
            <span className="text-ink-faint">·</span>
            <Reputation reputation={answer.reputation} compact />
          </>
        )}
      </div>

      <p className="text-[17px] leading-[1.75] text-ink">{answer.body}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        {feedback === null ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink-faint">Was this perspective helpful?</span>
            <button
              onClick={() => setFeedback("helped")}
              className="eyebrow text-forest hover:opacity-75"
            >
              Yes, it helped
            </button>
            <button
              onClick={() => setFeedback("not")}
              className="eyebrow text-ink-faint hover:text-ink"
            >
              Not really
            </button>
          </div>
        ) : (
          <span className="text-sm text-ink-faint">
            {feedback === "helped" ? "Glad it helped." : "Thanks for letting us know."}
          </span>
        )}
        <button className="eyebrow text-ink-faint hover:text-danger">Report</button>
      </div>
    </div>
  );
}
