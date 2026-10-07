"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import Input from "@/components/Input";
import AuthGate from "@/components/AuthGate";
import { useProfile } from "@/components/UserProfileProvider";
import { NotificationPrefs, User } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <p className="eyebrow mb-5 text-forest">{title}</p>
      {children}
      <Divider className="mt-10" />
    </section>
  );
}

const PREF_LABELS: { key: keyof NotificationPrefs; label: string; locked?: boolean }[] = [
  { key: "answer", label: "New perspectives on my questions" },
  { key: "feedback", label: "Feedback on my perspectives" },
  { key: "assessment", label: "Assessment results" },
  { key: "safety", label: "Safety notices", locked: true },
];

function SettingsContent({ user }: { user: User }) {
  const { logout, deleteAccount, updateNotificationPrefs, requestPasswordReset } = useProfile();
  const router = useRouter();
  const [prefs, setPrefs] = useState(user.notificationPrefs);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function togglePref(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setPrefError(null);
    const res = await updateNotificationPrefs(next);
    if (!res.ok) {
      setPrefs(prefs);
      setPrefError(res.error ?? "Couldn't save.");
    }
  }

  async function remove() {
    setDeleting(true);
    setDeleteError(null);
    const res = await deleteAccount();
    if (!res.ok) {
      setDeleting(false);
      setDeleteError(res.error ?? "Couldn't delete your account.");
      return;
    }
    router.push("/");
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <p className="font-display text-3xl text-ink sm:text-4xl">Settings</p>

        <Section title="Profile">
          <p className="mb-3 text-sm text-ink-muted">Username, bio, and identity mark live on your profile.</p>
          <Link href="/you" className="eyebrow text-forest">Edit on your profile →</Link>
        </Section>

        <Section title="Private account details">
          <p className="text-sm text-ink-muted">
            Signed in as <span className="text-ink">{user.email}</span>. Your email is never shown to other
            people — not on questions, perspectives, or your profile.
          </p>
          <button
            onClick={async () => {
              const res = await requestPasswordReset(user.email);
              if (res.ok) setResetSent(true);
            }}
            className="mt-4 eyebrow text-forest hover:opacity-75"
          >
            {resetSent ? "Reset link sent — check your inbox" : "Change password →"}
          </button>
        </Section>

        <Section title="Notifications">
          <div className="flex flex-col gap-4">
            {PREF_LABELS.map(({ key, label, locked }) => (
              <label key={key} className="flex items-center justify-between text-sm text-ink">
                <span>
                  {label}
                  {locked && <span className="ml-2 text-xs text-ink-faint">always on</span>}
                </span>
                <input
                  type="checkbox"
                  checked={locked ? true : prefs[key]}
                  disabled={locked}
                  onChange={() => void togglePref(key)}
                  className="h-4 w-4 accent-forest"
                />
              </label>
            ))}
          </div>
          {prefError && <p className="mt-3 text-sm text-danger">{prefError}</p>}
        </Section>

        {user.isAdmin && (
          <Section title="Moderation">
            <Link href="/admin" className="eyebrow text-forest">Open admin dashboard →</Link>
          </Section>
        )}

        <Section title="Account">
          <Button
            variant="secondary"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            Log Out
          </Button>
        </Section>

        <section className="py-10">
          <p className="eyebrow mb-3 text-danger">Delete account</p>
          <p className="mb-4 text-sm text-ink-muted">
            Permanently deletes your account, questions, perspectives, and assessments. This can&apos;t be undone.
          </p>
          <Input
            label={`Type ${user.username} to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
          {deleteError && <p className="mt-3 text-sm text-danger">{deleteError}</p>}
          <Button
            variant="secondary"
            className="mt-4 border-danger text-danger"
            disabled={confirmText !== user.username || deleting}
            onClick={remove}
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </Button>
        </section>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return <AuthGate>{(user) => <SettingsContent user={user} />}</AuthGate>;
}
