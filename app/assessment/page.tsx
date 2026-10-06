"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import ProgressIndicator from "@/components/ProgressIndicator";
import AssessmentQuestion from "@/components/AssessmentQuestion";
import { assessmentQuestions, questionCountLabel } from "@/lib/assessment-questions";
import { useProfile } from "@/components/UserProfileProvider";
import AuthGate from "@/components/AuthGate";
import { Domain } from "@/lib/types";

type Phase = "intro" | "questions";

function AssessmentInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { submitReplierAssessments } = useProfile();
  const domainQueue = (params.get("domains") ?? "Relationships & Friendships").split(
    "|"
  ) as Domain[];

  const [queueIndex, setQueueIndex] = useState(0);
  const domain = domainQueue[queueIndex];
  const questions = assessmentQuestions[domain] ?? [];

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

  function setAnswer(v: string) {
    setAnswers((cur) => {
      const next = [...cur];
      next[index] = v;
      return next;
    });
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // this domain's assessment is done
    if (queueIndex < domainQueue.length - 1) {
      const nextDomain = domainQueue[queueIndex + 1];
      setQueueIndex((q) => q + 1);
      setIndex(0);
      setAnswers(Array(assessmentQuestions[nextDomain]?.length ?? 0).fill(""));
      setPhase("intro");
    } else {
      submitReplierAssessments(domainQueue);
      router.push("/assessment/result");
    }
  }

  const isLast = index === questions.length - 1 && queueIndex === domainQueue.length - 1;
  const isLastOfDomain = index === questions.length - 1;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <p className="mb-8 eyebrow text-ink-faint">
          Domain {queueIndex + 1} of {domainQueue.length}
        </p>

        {phase === "intro" && (
          <div className="flex flex-col gap-8">
            <p className="eyebrow text-forest">{domain}</p>
            <p className="font-display text-3xl leading-tight text-ink sm:text-4xl">
              A few situations, in your own words.
            </p>
            <p className="text-ink-muted">{questionCountLabel(domain)}</p>
            <p className="text-sm text-ink-faint">
              Answer honestly and thoughtfully — this should feel like helping a
              friend, not taking a test.
            </p>
            <Divider />
            <Button size="lg" onClick={() => setPhase("questions")} className="self-start">
              Begin
            </Button>
          </div>
        )}

        {phase === "questions" && (
          <div className="flex flex-col gap-10">
            <div>
              <p className="eyebrow mb-3 text-forest">{domain}</p>
              <ProgressIndicator value={index + 1} max={questions.length} />
            </div>
            <AssessmentQuestion
              question={questions[index]}
              value={answers[index]}
              onChange={setAnswer}
            />
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                Back
              </Button>
              <Button onClick={next} disabled={answers[index].trim().length < 3}>
                {isLast
                  ? "Submit Assessment →"
                  : isLastOfDomain
                  ? "Continue →"
                  : "Continue →"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <AuthGate>
      {() => (
        <Suspense fallback={null}>
          <AssessmentInner />
        </Suspense>
      )}
    </AuthGate>
  );
}
