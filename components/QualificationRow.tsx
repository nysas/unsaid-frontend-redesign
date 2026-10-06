import Link from "next/link";
import { DomainQualification } from "@/lib/types";

export default function QualificationRow({ q }: { q: DomainQualification }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-ink">{q.domain}</span>
      <span className="eyebrow text-gold">
        {q.assessmentCompleted ? "Assessment completed" : "Not assessed"}
      </span>
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
