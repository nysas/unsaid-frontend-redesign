"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import Divider from "@/components/Divider";
import DomainSelector from "@/components/DomainSelector";
import PrivacyNote from "@/components/PrivacyNote";
import { useProfile } from "@/components/UserProfileProvider";
import AuthGate from "@/components/AuthGate";
import {
  Domain,
  MatchingPreference,
  MATCHING_PREFERENCES,
  ResponsePreference,
  RESPONSE_PREFERENCES,
  User,
} from "@/lib/types";

const PII_PATTERN =
  /(@[a-z0-9._]+\.(com|edu|net)|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|instagram\.com|snapchat)/i;

// Gentle check for crisis language. Never blocks posting — it just makes sure
// the person sees real, immediate help alongside peer perspectives.
const CRISIS_PATTERN =
  /\b(kill myself|end my life|suicid\w*|want to die|don'?t want to (live|be here)|self[- ]?harm|cut myself|hurt myself|no reason to live)\b/i;

type Step = "write" | "preview" | "posted";

function CrisisNote() {
  return (
    <div className="border border-gold bg-gold-tint px-5 py-4 text-sm leading-relaxed text-ink">
      <p className="font-medium">You don&apos;t have to carry this alone.</p>
      <p className="mt-1 text-ink-muted">
        Peers here can listen, but if you&apos;re thinking about hurting yourself, please also talk to someone
        trained right now. In India, <strong>Tele-MANAS</strong> is free and open 24/7 at{" "}
        <a href="tel:14416" className="text-forest underline">14416</a>. If you&apos;re in immediate danger, call{" "}
        <a href="tel:112" className="text-forest underline">112</a>. Outside India,{" "}
        <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="text-forest underline">
          findahelpline.com
        </a>{" "}
        lists services near you.
      </p>
    </div>
  );
}

function AskContent({ user }: { user: User }) {
  const { askQuestion } = useProfile();
  const [step, setStep] = useState<Step>("write");
  const [domain, setDomain] = useState<Domain | null>(null);
  const [body, setBody] = useState("");
  const [prefs, setPrefs] = useState<ResponsePreference[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const [matching, setMatching] = useState<MatchingPreference>("No preference");
  const [checking, setChecking] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postedId, setPostedId] = useState<string | null>(null);

  const hasPII = useMemo(() => PII_PATTERN.test(body), [body]);
  const showCrisis = useMemo(() => CRISIS_PATTERN.test(body), [body]);
  const canContinue = domain && body.trim().length > 10 && !hasPII;
  const hasStartedWriting = body.trim().length > 0;

  function togglePref(p: ResponsePreference) {
    setPrefs((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  function goToPreview() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setStep("preview");
    }, 900);
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        {step === "write" && (
          <div className="flex flex-col gap-12">
            <div>
              <p className="font-display text-3xl leading-[1.2] text-ink sm:text-4xl">
                What&apos;s been sitting with you?
              </p>
              <p className="mt-3 text-ink-muted">
                You don&apos;t have to have the right words. Just start somewhere.
              </p>

              <div className="mt-8">
                <Textarea
                  placeholder="Start writing…"
                  rows={9}
                  maxLength={1500}
                  showCount
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                {hasPII && (
                  <p className="mt-3 text-sm text-danger">
                    This might make you identifiable. Take a look before you continue.
                  </p>
                )}
                {showCrisis && (
                  <div className="mt-4">
                    <CrisisNote />
                  </div>
                )}
              </div>
            </div>

            {hasStartedWriting && (
              <>
                <Divider />

                <div>
                  <p className="eyebrow mb-4">What is this about?</p>
                  <DomainSelector
                    selected={domain ? [domain] : []}
                    onToggle={(d) => setDomain(d)}
                  />
                </div>

                <Divider />

                <div>
                  <p className="eyebrow mb-1">What kind of perspective would help?</p>
                  <p className="mb-4 text-sm text-ink-faint">
                    Choose whatever feels useful. You don&apos;t have to know exactly what you need.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSE_PREFERENCES.map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePref(p)}
                        className={clsx(
                          "border px-4 py-2 text-sm transition-colors",
                          prefs.includes(p)
                            ? "border-forest bg-forest-tint text-forest"
                            : "border-border text-ink-muted hover:border-border-strong"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Divider />

                <div>
                  <p className="eyebrow mb-4">How do you want to say this?</p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setAnonymous(true)}
                      className={clsx(
                        "border px-5 py-4 text-left transition-colors",
                        anonymous ? "border-forest bg-forest-tint" : "border-border"
                      )}
                    >
                      <p className="text-ink">Anonymous</p>
                      <p className="text-sm text-ink-faint">
                        Your username won&apos;t be shown with this question.
                      </p>
                    </button>
                    <button
                      onClick={() => setAnonymous(false)}
                      className={clsx(
                        "border px-5 py-4 text-left transition-colors",
                        !anonymous ? "border-forest bg-forest-tint" : "border-border"
                      )}
                    >
                      <p className="text-ink">@{user.username}</p>
                      <p className="text-sm text-ink-faint">
                        Your username will appear with this question.
                      </p>
                    </button>
                  </div>
                  <div className="mt-3">
                    <PrivacyNote anonymous={anonymous} />
                  </div>
                </div>

                <Divider />

                <div>
                  <p className="eyebrow mb-1">Who would you like to hear from?</p>
                  <p className="mb-4 text-sm text-ink-faint">
                    We&apos;ll use this to match your question with the right people — you won&apos;t browse or pick anyone yourself.
                  </p>
                  <div className="flex flex-col gap-2">
                    {MATCHING_PREFERENCES.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMatching(m)}
                        className={clsx(
                          "border px-4 py-3 text-left text-sm transition-colors",
                          matching === m
                            ? "border-forest bg-forest-tint text-forest"
                            : "border-border text-ink-muted hover:border-border-strong"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  disabled={!canContinue || checking}
                  onClick={goToPreview}
                  className="self-start"
                >
                  {checking ? "Just checking…" : "Continue"}
                </Button>
              </>
            )}
          </div>
        )}

        {step === "preview" && domain && (
          <div className="flex flex-col gap-10">
            <p className="eyebrow text-forest">Your question</p>

            <div>
              <p className="font-display text-3xl leading-[1.3] text-ink sm:text-4xl">
                &ldquo;{body}&rdquo;
              </p>
              <p className="mt-4 eyebrow text-forest">{domain}</p>
              <p className="mt-1 eyebrow">
                {anonymous ? "Anonymous" : `@${user.username}`}
              </p>
              {prefs.length > 0 && (
                <p className="mt-4 text-sm text-ink-faint">
                  Looking for: {prefs.join(" · ")}
                </p>
              )}
              <p className="mt-1 text-sm text-ink-faint">Matching: {matching}</p>
            </div>

            <Divider />

            {showCrisis && <CrisisNote />}
            {postError && <p className="text-sm text-danger">{postError}</p>}

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep("write")} disabled={posting}>
                Keep editing
              </Button>
              <Button
                disabled={posting}
                onClick={async () => {
                  setPosting(true);
                  setPostError(null);
                  const res = await askQuestion({
                    domain,
                    body,
                    isAnonymous: anonymous,
                    responsePreferences: prefs,
                    matchingPreference: matching,
                  });
                  setPosting(false);
                  if (!res.ok) {
                    setPostError(res.error ?? "Couldn't post your question.");
                    return;
                  }
                  setPostedId(res.id ?? null);
                  setStep("posted");
                }}
              >
                {posting ? "Posting…" : anonymous ? "Post Anonymously →" : "Post →"}
              </Button>
            </div>
          </div>
        )}

        {step === "posted" && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="font-display text-3xl text-ink">It&apos;s out there now.</p>
            <p className="text-ink-muted">
              People who understand {domain} will start seeing it. We&apos;ll notify you when a perspective arrives.
            </p>
            <div className="mt-6 flex gap-6">
              {postedId && (
                <Link href={`/question/${postedId}`} className="eyebrow text-forest hover:opacity-75">
                  View your question →
                </Link>
              )}
              <Link href="/home" className="eyebrow text-ink-faint hover:text-ink">
                Back home
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AskPage() {
  return <AuthGate>{(user) => <AskContent user={user} />}</AuthGate>;
}
