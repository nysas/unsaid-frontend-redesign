import Link from "next/link";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { Badge } from "@/components/Badge";

const stats = [
  { label: "Total users", value: "12,480" },
  { label: "Questions", value: "8,214" },
  { label: "Answers", value: "19,662" },
  { label: "Qualified repliers", value: "1,903" },
];

const reports = [
  {
    id: "r1",
    type: "Question",
    reason: "Contains identifying information",
    snippet: "I go to Lincoln High and my ex…",
    reportedBy: "1 report",
  },
  {
    id: "r2",
    type: "Answer",
    reason: "Unhelpful / dismissive",
    snippet: "Just get over it honestly, not a big deal.",
    reportedBy: "3 reports",
  },
  {
    id: "r3",
    type: "User",
    reason: "Repeated harassment in replies",
    snippet: "@user4821",
    reportedBy: "2 reports",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-5">
        <span className="font-display text-xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>{" "}
          <span className="eyebrow text-ink-faint">Admin</span>
        </span>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <div className="mb-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <p className="font-display text-3xl text-ink">{value}</p>
              <p className="eyebrow mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Divider className="mb-10" />

        <p className="eyebrow mb-8 text-forest">Pending moderation — {reports.length}</p>

        <div className="flex flex-col">
          {reports.map((r, i) => (
            <div key={r.id}>
              <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{r.type}</Badge>
                    <span className="eyebrow">{r.reportedBy}</span>
                  </div>
                  <p className="text-sm font-medium text-ink">{r.reason}</p>
                  <p className="text-sm text-ink-muted">&ldquo;{r.snippet}&rdquo;</p>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="secondary">Review</Button>
                  <Button size="sm" variant="ghost">Dismiss</Button>
                  <Button size="sm" variant="secondary" className="border-danger text-danger">
                    Remove
                  </Button>
                </div>
              </div>
              {i < reports.length - 1 && <Divider />}
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Link href="/home" className="eyebrow text-forest">← Back to app</Link>
        </div>
      </div>
    </main>
  );
}
