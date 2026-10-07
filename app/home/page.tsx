"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import QuestionBlock from "@/components/QuestionBlock";
import { AskerGate } from "@/components/ProfileGate";
import AuthGate from "@/components/AuthGate";
import { useProfile } from "@/components/UserProfileProvider";
import { EmptyState } from "@/components/EmptyState";
import { Loading, LoadError } from "@/components/LoadState";
import { fetchFeed } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { User } from "@/lib/types";

function HomeContent({ user }: { user: User }) {
  const { activateAsker } = useProfile();
  const router = useRouter();
  const feed = useAsync(fetchFeed, []);
  const [featured, ...rest] = feed.data ?? [];

  if (!user.asker.active) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <AskerGate onActivate={() => void activateAsker()} />
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <section className="mb-10">
          <p className="font-display text-3xl text-ink sm:text-4xl">
            What&apos;s on your mind?
          </p>
          <div className="mt-6">
            <Link href="/ask">
              <Button size="lg">Ask Anonymously</Button>
            </Link>
          </div>
        </section>

        {!user.replier.active && (
          <section className="mb-16">
            <button
              onClick={() => router.push("/become-replier")}
              className="text-left text-sm text-ink-faint transition-colors hover:text-ink"
            >
              Have a perspective to share?{" "}
              <span className="text-forest">Become a Replier →</span>
            </button>
          </section>
        )}

        <Divider className="mb-16" />

        <section>
          <p className="eyebrow mb-10 text-forest">Things people haven&apos;t said out loud.</p>

          {feed.loading && <Loading />}
          {feed.error && <LoadError message={feed.error} onRetry={feed.reload} />}
          {!feed.loading && !feed.error && !featured && (
            <EmptyState
              title="It's quiet in here"
              description="No one has asked anything yet. Be the first — it's anonymous."
            />
          )}
          {featured && (
          <div className="mb-14">
            <QuestionBlock question={featured} size="lg" />
          </div>
          )}

          <div className="flex flex-col">
            {rest.map((q, i) => (
              <div key={q.id}>
                <div className="py-9">
                  <QuestionBlock question={q} size={i % 3 === 0 ? "md" : "sm"} />
                </div>
                {i < rest.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  return <AuthGate>{(user) => <HomeContent user={user} />}</AuthGate>;
}
