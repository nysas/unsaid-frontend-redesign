"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { useProfile } from "@/components/UserProfileProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, requestPasswordReset } = useProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Enter your email above first.");
      return;
    }
    const res = await requestPasswordReset(email);
    if (res.ok) setNotice("If that email has an account, a reset link is on its way.");
    else setError(res.error ?? "Couldn't send a reset link.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const result = await login({ email, password });
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.push(result.user?.hasCompletedOnboarding ? "/home" : "/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-12 block text-center font-display text-2xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>
        </Link>
        <p className="mb-1 text-center font-display text-2xl text-ink">Welcome back</p>
        <p className="mb-10 text-center text-sm text-ink-muted">
          Log in to keep asking, or keep helping.
        </p>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" onClick={forgot} className="-mt-3 self-end text-xs text-ink-faint hover:text-ink">
            Forgot password?
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}
          {notice && <p className="text-sm text-forest">{notice}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Logging in…" : "Log In"}
          </Button>
        </form>
        <Divider className="my-8" />
        <p className="text-center text-sm text-ink-muted">
          New here?{" "}
          <Link href="/signup" className="text-forest">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
