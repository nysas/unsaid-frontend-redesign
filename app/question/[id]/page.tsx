import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import AnswerBlock from "@/components/AnswerBlock";
import AnswerComposer from "@/components/AnswerComposer";
import { EmptyState } from "@/components/EmptyState";
import { mockAnswers, mockQuestions, timeAgo } from "@/lib/mock-data";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = mockQuestions.find((q) => q.id === id);
  if (!question) notFound();

  const answers = mockAnswers[id] ?? [];

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="eyebrow">
            {question.isAnonymous ? "Anonymous" : `@${question.authorUsername}`}
          </span>
          <span className="text-ink-faint">·</span>
          <span className="eyebrow text-forest">{question.domain}</span>
          <span className="text-ink-faint">·</span>
          <span className="eyebrow">{timeAgo(question.createdAt)}</span>
        </div>
        <p className="font-display text-3xl leading-[1.3] text-ink sm:text-4xl">
          &ldquo;{question.body}&rdquo;
        </p>
        {question.responsePreferences.length > 0 && (
          <p className="mt-5 text-sm text-ink-faint">
            Looking for: {question.responsePreferences.join(" · ")}
          </p>
        )}

        <div className="my-14">
          <Divider />
        </div>

        <p className="eyebrow mb-8 text-forest">
          Perspectives &middot; {question.answerCount}
        </p>

        <div className="mb-10">
          <AnswerComposer questionId={question.id} domain={question.domain} />
        </div>

        <div className="flex flex-col">
          {answers.length > 0 ? (
            answers.map((a, i) => (
              <div key={a.id}>
                <AnswerBlock answer={a} />
                {i < answers.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState
              title="No perspectives yet"
              description="This question is still waiting for the right person to see it."
            />
          )}
        </div>
      </div>
    </main>
  );
}
