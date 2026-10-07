import Link from "next/link";
import { DomainQualification } from "@/lib/types";

const LABEL: Record<DomainQualification["status"], { text: string; className: string }> = {
  submitted: { text: "Submitted · in review", className: "text-gold" },
  qualified: { text: "Qualified", className: "text-forest" },
  not_qualified: { text: "Not qualified", className: "text-ink-faint" },
};

export default function QualificationRow({ q }: { q: DomainQualification }) {
  const label = LABEL[q.status];
  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink">{q.domain}</span>
        <span className={`eyebrow ${label.className}`}>{label.text}</span>
      </div>
      {q.reviewerNote && <p className="mt-1 text-xs text-ink-faint">Reviewer: {q.reviewerNote}</p>}
    </div>
  );
}

export function NotAssessedRow({ domain }: { domain: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink">{domain}</span>
      <div className="flex items-center gap-4">
        <span className="eyebrow text-ink-faint">Not assessed</span>
        <Link
          href={`/assessment?domains=${encodeURIComponent(domain)}`}
          className="eyebrow text-forest hover:opacity-75"
        >
          Take Assessment →
        </Link>
      </div>
    </div>
  );
}
