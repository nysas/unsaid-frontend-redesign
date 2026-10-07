"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import Textarea from "@/components/Textarea";
import AuthGate from "@/components/AuthGate";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Loading, LoadError } from "@/components/LoadState";
import {
  AdminAssessment,
  adminAssessments,
  adminReports,
  adminResolveReport,
  adminReviewAssessment,
  adminStats,
} from "@/lib/api";
import { assessmentQuestions } from "@/lib/assessment-questions";
import { friendlyError } from "@/lib/supabase";
import { useAsync } from "@/lib/useAsync";
import { timeAgo } from "@/lib/format";
import { User } from "@/lib/types";

type Tab = "reports" | "assessments";

function ReportsQueue({ onChange }: { onChange: () => void }) {
  const list = useAsync(adminReports, []);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(targetType: string, targetId: string, action: "dismiss" | "remove") {
    setBusy(targetId);
    setError(null);
    try {
      await adminResolveReport(targetType, targetId, action);
      list.reload();
      onChange();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  if (list.loading) return <Loading />;
  if (list.error) return <LoadError message={list.error} onRetry={list.reload} />;
  const reports = list.data ?? [];
  if (reports.length === 0) return <EmptyState title="Queue is clear" description="No pending reports." />;

  return (
    <div className="flex flex-col">
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      {reports.map((r, i) => (
        <div key={r.targetId}>
          <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge>{r.targetType}</Badge>
                <span className="eyebrow">
                  {r.reportCount} report{r.reportCount === 1 ? "" : "s"} · {timeAgo(r.firstReportedAt)}
                </span>
                {r.targetStatus === "hidden" && <Badge tone="danger">Auto-hidden</Badge>}
              </div>
              <p className="text-sm font-medium text-ink">{r.reasons.join(" · ")}</p>
              <p className="mt-1 text-sm text-ink-muted">&ldquo;{r.snippet}&rdquo;</p>
              {r.targetType === "question" && (
                <Link href={`/question/${r.targetId}`} className="mt-2 inline-block eyebrow text-forest">
                  Open →
                </Link>
              )}
            </div>
            <div className="flex shrink-0 gap-3">
              <Button
                size="sm"
                variant="ghost"
                disabled={busy === r.targetId}
                onClick={() => act(r.targetType, r.targetId, "dismiss")}
              >
                {r.targetStatus === "hidden" ? "Restore" : "Dismiss"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="border-danger text-danger"
                disabled={busy === r.targetId}
                onClick={() => act(r.targetType, r.targetId, "remove")}
              >
                Remove
              </Button>
            </div>
          </div>
          {i < reports.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  );
}

function AssessmentCard({ a, onDone }: { a: AdminAssessment; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bank = assessmentQuestions[a.domain] ?? [];

  async function review(status: "qualified" | "not_qualified") {
    setBusy(true);
    setError(null);
    try {
      await adminReviewAssessment(a.id, status, note);
      onDone();
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <div className="py-6">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span>
          <span className="text-ink">@{a.username}</span>
          <span className="ml-3 eyebrow text-forest">{a.domain}</span>
        </span>
        <span className="eyebrow text-ink-faint">
          {timeAgo(a.submittedAt)} · {open ? "Close" : "Review"}
        </span>
      </button>

      {open && (
        <div className="mt-6 flex flex-col gap-6">
          {a.responses.map((r, i) => {
            const q = bank.find((b) => b.id === r.questionId);
            return (
              <div key={r.questionId + i}>
                <p className="text-sm text-ink-faint">{q?.question ?? r.questionId}</p>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">{r.answer}</p>
              </div>
            );
          })}
          <Textarea
            label="Note to the replier (optional)"
            rows={2}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3">
            <Button size="sm" disabled={busy} onClick={() => review("qualified")}>
              Qualify
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="border-danger text-danger"
              disabled={busy}
              onClick={() => review("not_qualified")}
            >
              Not qualified
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentQueue({ onChange }: { onChange: () => void }) {
  const list = useAsync(() => adminAssessments("submitted"), []);
  if (list.loading) return <Loading />;
  if (list.error) return <LoadError message={list.error} onRetry={list.reload} />;
  const items = list.data ?? [];
  if (items.length === 0) return <EmptyState title="All reviewed" description="No assessments waiting." />;
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((a) => (
        <AssessmentCard
          key={a.id}
          a={a}
          onDone={() => {
            list.reload();
            onChange();
          }}
        />
      ))}
    </div>
  );
}

function AdminContent({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>("reports");
  const stats = useAsync(() => (user.isAdmin ? adminStats() : Promise.resolve(null)), [user.isAdmin]);

  if (!user.isAdmin) {
    return (
      <EmptyState title="Moderators only" description="Your account doesn't have access to this page." />
    );
  }

  const s = stats.data;
  const cards = s
    ? [
        { label: "Users", value: s.users },
        { label: "Questions", value: s.questions },
        { label: "Perspectives", value: s.answers },
        { label: "Qualified repliers", value: s.qualifiedRepliers },
      ]
    : [];

  return (
    <>
      {stats.error && <LoadError message={stats.error} onRetry={stats.reload} />}
      <div className="mb-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
        {cards.map(({ label, value }) => (
          <div key={label}>
            <p className="font-display text-3xl text-ink">{value.toLocaleString()}</p>
            <p className="eyebrow mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Divider className="mb-8" />

      <div className="mb-6 flex gap-8">
        {(
          [
            ["reports", `Reports${s ? ` · ${s.pendingReports}` : ""}`],
            ["assessments", `Assessments${s ? ` · ${s.pendingAssessments}` : ""}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx("eyebrow", tab === id ? "text-forest" : "text-ink-muted hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "reports" ? <ReportsQueue onChange={stats.reload} /> : <AssessmentQueue onChange={stats.reload} />}
    </>
  );
}

export default function AdminPage() {
  return (
    <AuthGate>
      {(user) => (
        <main className="min-h-screen">
          <header className="border-b border-border px-6 py-5">
            <span className="font-display text-xl text-ink">
              UNSAID<span className="wordmark-dot">.</span> <span className="eyebrow text-ink-faint">Admin</span>
            </span>
          </header>
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
            <AdminContent user={user} />
            <div className="mt-14">
              <Link href="/home" className="eyebrow text-forest">← Back to app</Link>
            </div>
          </div>
        </main>
      )}
    </AuthGate>
  );
}
