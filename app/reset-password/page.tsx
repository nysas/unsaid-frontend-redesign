"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useProfile } from "@/components/UserProfileProvider";

/** Landing page for the password-reset email link (Supabase signs the user in via the URL). */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { mounted, isLoggedIn, updatePassword } = useProfile();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setSaving(true);
    const res = await updatePassword(password);
    setSaving(false);
    if (!res.ok) setError(res.error ?? "Couldn't update your password.");
    else router.push("/home");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-12 block text-center font-display text-2xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>
        </Link>
        {!mounted ? null : !isLoggedIn ? (
          <p className="text-center text-ink-muted">
            This reset link has expired or was already used.{" "}
            <Link href="/login" className="text-forest">Request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-6">
            <p className="text-center font-display text-2xl text-ink">Choose a new password</p>
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
