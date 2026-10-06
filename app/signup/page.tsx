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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !email.trim() || password.length < 8) {
      setError("Fill in an email, username, and an 8+ character password.");
      return;
    }
    setSubmitting(true);
    const result = signup({ email, username });
    if (!result.ok) {
      setSubmitting(false);
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.push("/onboarding");
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
