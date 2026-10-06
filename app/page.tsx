import Link from "next/link";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const steps = [
  {
    n: "01",
    title: "Ask",
    body: "Say what's on your mind. Nobody will know it's you.",
  },
  {
    n: "02",
    title: "Connect",
    body: "Your question reaches people who genuinely understand it.",
  },
  {
    n: "03",
    title: "Hear",
    body: "Get perspectives that help you think differently — not just advice.",
  },
];

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <span className="font-display text-xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>
        </span>
        <div className="flex items-center gap-5">
          <ThemeSwitcher />
          <Link href="/login" className="eyebrow text-ink-muted hover:text-ink">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pt-16 pb-24 sm:px-8 sm:pt-24 sm:pb-32">
        <p className="eyebrow mb-8 text-forest">An anonymous perspective</p>
        <h1 className="font-display text-[2.6rem] leading-[1.12] text-ink sm:text-6xl sm:leading-[1.08]">
          Some things are easier
          <br />
          to say when nobody
          <br />
          knows who you are.
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-muted">
          Ask anonymously. Hear different perspectives. Find people who
          understand.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="/signup">
            <Button size="lg">Ask Something</Button>
          </Link>
          <Link href="/become-replier">
            <Button variant="secondary" size="lg">
              Become a Replier
            </Button>
          </Link>
        </div>
      </section>

      <Divider className="mx-5 sm:mx-8" />

      {/* Small statement */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <p className="font-display text-2xl italic leading-relaxed text-ink-muted sm:text-3xl">
          No judgment. No audience. Just another perspective.
        </p>
      </section>

      <Divider className="mx-5 sm:mx-8" />

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <p className="eyebrow mb-14 text-forest">How it works</p>
        <div className="flex flex-col">
          {steps.map((s, i) => (
            <div key={s.n}>
              <div className="grid grid-cols-[3.5rem,1fr] gap-6 py-8 sm:grid-cols-[5rem,1fr] sm:gap-10">
                <span className="font-display text-2xl text-ink-faint sm:text-3xl">
                  {s.n}
                </span>
                <div>
                  <p className="font-display text-2xl text-ink sm:text-3xl">
                    {s.title.toUpperCase()}
                  </p>
                  <p className="mt-2 max-w-md text-ink-muted">{s.body}</p>
                </div>
              </div>
              {i < steps.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      </section>

      <Divider className="mx-5 sm:mx-8" />

      {/* Closing CTA */}
      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <p className="font-display text-3xl text-ink sm:text-4xl">
          What&apos;s on your mind?
        </p>
        <div className="mt-8">
          <Link href="/signup">
            <Button size="lg">Ask Something</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-ink-faint sm:flex-row">
          <span className="font-display text-ink">
            UNSAID<span className="wordmark-dot">.</span>
          </span>
          <span>© 2026 Unsaid</span>
        </div>
      </footer>
    </main>
  );
}
