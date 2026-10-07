"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import AnswerBlock from "@/components/AnswerBlock";
import AnswerComposer from "@/components/AnswerComposer";
import ReportModal from "@/components/ReportModal";
import AuthGate from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { Loading, LoadError } from "@/components/LoadState";
import { useProfile } from "@/components/UserProfileProvider";
import { deleteQuestion, fetchAnswers, fetchQuestion } from "@/lib/api";
import { friendlyError } from "@/lib/supabase";
import { useAsync } from "@/lib/useAsync";
import { timeAgo } from "@/lib/format";

function QuestionDetail({ id }: { id: string }) {
  const router = useRouter();
  const { refresh } = useProfile();
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const q = useAsync(() => fetchQuestion(id), [id]);
  const a = useAsync(() => fetchAnswers(id), [id]);

  if (q.loading) return <Loading />;
  if (q.error) return <LoadError message={q.error} onRetry={q.reload} />;
  const question = q.data;
  if (!question) {
    return (
      <EmptyState
        title="This question isn't available"
        description="It may have been removed, or the link is wrong."
      />
    );
  }

  const answers = a.data ?? [];
  const alreadyAnswered = answers.some((x) => x.isMine);

  async function remove() {
    try {
      await deleteQuestion(id);
      await refresh();
      router.push("/you");
    } catch (err) {
      setDeleteError(friendlyError(err));
    }
  }

  function reloadAll() {
    a.reload();
    q.reload();
    void refresh();
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="eyebrow">
          {question.isMine ? "You" : question.isAnonymous ? "Anonymous" : `@${question.authorUsername}`}
          {question.isMine && question.isAnonymous && " · posted anonymously"}
        </span>
        <span className="text-ink-faint">·</span>
        <span className="eyebrow text-forest">{question.domain}</span>
        <span className="text-ink-faint">·</span>
        <span className="eyebrow">{timeAgo(question.createdAt)}</span>
      </div>
      {question.status !== "visible" && (
        <p className="mb-4 text-sm text-danger">
          This question is hidden while a moderator reviews it. Only you can see it.
        </p>
      )}
      <p className="whitespace-pre-line font-display text-3xl leading-[1.3] text-ink sm:text-4xl">
        &ldquo;{question.body}&rdquo;
      </p>
      {question.responsePreferences.length > 0 && (
        <p className="mt-5 text-sm text-ink-faint">Looking for: {question.responsePreferences.join(" · ")}</p>
      )}

      <div className="mt-6 flex gap-6">
        {question.isMine ? (
          confirmDelete ? (
            <span className="flex items-center gap-4 text-sm">
              <span className="text-ink-muted">Delete this and all its perspectives?</span>
              <button onClick={remove} className="eyebrow text-danger">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="eyebrow text-ink-faint">Cancel</button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="eyebrow text-ink-faint hover:text-danger">
              Delete question
            </button>
          )
        ) : (
          <button onClick={() => setReportOpen(true)} className="eyebrow text-ink-faint hover:text-danger">
            Report question
          </button>
        )}
      </div>
      {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}

      <div className="my-14">
        <Divider />
      </div>

      <p className="eyebrow mb-8 text-forest">Perspectives &middot; {answers.length}</p>

      <div className="mb-10">
        <AnswerComposer
          questionId={question.id}
          domain={question.domain}
          isOwnQuestion={question.isMine}
          alreadyAnswered={alreadyAnswered}
          onPosted={reloadAll}
        />
      </div>

      <div className="flex flex-col">
        {a.loading ? (
          <Loading />
        ) : a.error ? (
          <LoadError message={a.error} onRetry={a.reload} />
        ) : answers.length > 0 ? (
          answers.map((ans, i) => (
            <div key={ans.id}>
              <AnswerBlock answer={ans} viewerIsAsker={question.isMine} onChanged={a.reload} />
              {i < answers.length - 1 && <Divider />}
            </div>
          ))
        ) : (
          <EmptyState
            title="No perspectives yet"
            description={
              question.isMine
                ? "It's been shared with people who've been assessed in this area. We'll let you know."
                : "This question is still waiting for the right person to see it."
            }
          />
        )}
      </div>

      <div className="mt-14">
        <Link href={question.isMine ? "/you" : "/home"} className="eyebrow text-ink-faint hover:text-ink">
          ← Back
        </Link>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="question" targetId={question.id} />
    </>
  );
}

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <AuthGate>
      {() => (
        <main>
          <Navbar />
          <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
            <QuestionDetail id={params.id} />
          </div>
        </main>
      )}
    </AuthGate>
  );
}
