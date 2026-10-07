"use client";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import AnonymousMark from "@/components/AnonymousMark";
import Reputation from "@/components/Reputation";
import AuthGate from "@/components/AuthGate";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Loading, LoadError } from "@/components/LoadState";
import { fetchPublicProfile } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { timeAgo } from "@/lib/format";

function ProfileView({ username }: { username: string }) {
  const p = useAsync(() => fetchPublicProfile(username), [username]);
  if (p.loading) return <Loading />;
  if (p.error) return <LoadError message={p.error} onRetry={p.reload} />;
  const profile = p.data;
  if (!profile) return <EmptyState title="No one by that name" description="This profile doesn't exist." />;

  return (
    <>
      <div className="flex items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong">
          <AnonymousMark seed={profile.avatarSeed} size="lg" />
        </div>
        <div>
          <h1 className="font-display text-3xl text-ink">@{profile.username}</h1>
          {profile.bio && <p className="mt-1 font-display italic text-ink-muted">&ldquo;{profile.bio}&rdquo;</p>}
        </div>
      </div>

      <div className="my-10">
        <Divider />
      </div>

      <p className="eyebrow mb-4 text-forest">Can help with</p>
      {profile.assessedDomains.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.assessedDomains.map((d) =>
            profile.qualifiedDomains.includes(d) ? (
              <Badge key={d} tone="forest">{d} · Qualified</Badge>
            ) : (
              <Badge key={d}>{d}</Badge>
            )
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Not a replier yet.</p>
      )}

      <div className="mt-8">
        <Reputation reputation={profile.reputation ?? undefined} answered={profile.answersCount} />
      </div>

      <div className="my-10">
        <Divider />
      </div>

      <p className="eyebrow mb-6 text-forest">Perspectives they chose to share</p>
      {profile.perspectives.length > 0 ? (
        <div className="flex flex-col divide-y divide-border">
          {profile.perspectives.map((a) => (
            <div key={a.id} className="py-6">
              <p className="eyebrow mb-2 text-ink-faint">{a.domain} · {timeAgo(a.createdAt)}</p>
              <p className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">{a.body}</p>
              <span className="eyebrow text-ink-faint">{a.helpfulCount} found this helpful</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Nothing shared publicly yet.</p>
      )}
    </>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  return (
    <AuthGate>
      {() => (
        <main>
          <Navbar />
          <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
            <ProfileView username={decodeURIComponent(params.username)} />
          </div>
        </main>
      )}
    </AuthGate>
  );
}
