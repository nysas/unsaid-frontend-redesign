"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { useProfile } from "@/components/UserProfileProvider";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useProfile();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !email.trim() || password.length < 8) {
      setError("Fill in an email, username, and an 8+ character password.");
      return;
    }
    if (!/^[A-Za-z0-9_.]{3,24}$/.test(username)) {
      setError("Usernames are 3–24 characters: letters, numbers, _ or .");
      return;
    }
    setSubmitting(true);
    const result = await signup({ email, username, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    if (result.needsConfirmation) {
      setSentTo(email.trim());
      return;
    }
    router.push("/onboarding");
  }

  if (sentTo) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm text-center">
          <p className="mb-3 font-display text-3xl text-ink">Check your inbox.</p>
          <p className="text-ink-muted">
            We sent a confirmation link to <span className="text-ink">{sentTo}</span>. Open it on this
            device to finish setting up.
          </p>
          <Divider className="my-8" />
          <Link href="/login" className="eyebrow text-forest">Back to log in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-12 block text-center font-display text-2xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>
        </Link>
        <p className="mb-1 text-center font-display text-2xl text-ink">Create your account</p>
        <p className="mb-10 text-center text-sm text-ink-muted">
          Just the basics — nothing that identifies you will ever be public.
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
            label="Choose a username"
            placeholder="quietobserver"
            hint="This is what people will see. Your real name never is."
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? "Creating…" : "Create Account"}
          </Button>
        </form>
        <Divider className="my-8" />
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-forest">Log in</Link>
        </p>
      </div>
    </main>
  );
}
