import Link from "next/link";
import { Question } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function QuestionBlock({
  question,
  size = "md",
}: {
  question: Question;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Link href={`/question/${question.id}`} className="group block">
      <div className="mb-3 flex items-center gap-2">
        <span className="eyebrow text-forest">{question.domain}</span>
        <span className="text-ink-faint">·</span>
        <span className="eyebrow">
          {question.isAnonymous ? "Anonymous" : `@${question.authorUsername}`}
        </span>
      </div>
      <p
        className={
          size === "lg"
            ? "font-display text-3xl leading-[1.2] text-ink transition-colors group-hover:text-forest sm:text-4xl"
            : size === "sm"
            ? "font-display text-xl leading-snug text-ink transition-colors group-hover:text-forest"
            : "font-display text-2xl leading-snug text-ink transition-colors group-hover:text-forest"
        }
      >
        &ldquo;{question.body.length > 140 ? question.body.slice(0, 140).trim() + "…" : question.body}&rdquo;
      </p>
      <p className="mt-3 text-sm text-ink-faint">
        {question.answerCount} {question.answerCount === 1 ? "perspective" : "perspectives"} · {timeAgo(question.createdAt)}
      </p>
    </Link>
  );
}
