"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import AuthGate from "@/components/AuthGate";
import { useProfile } from "@/components/UserProfileProvider";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <p className="eyebrow mb-5 text-forest">{title}</p>
      {children}
      <Divider className="mt-10" />
    </section>
  );
}

function SettingsContent() {
  const { logout, resetPrototype } = useProfile();
  const router = useRouter();

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <p className="font-display text-3xl text-ink sm:text-4xl">Settings</p>

        <Section title="Profile">
          <p className="mb-3 text-sm text-ink-muted">
            Username, bio, and identity mark live on your profile.
          </p>
          <Link href="/you" className="eyebrow text-forest">Edit on your profile →</Link>
        </Section>

        <Section title="Real identity">
          <p className="text-sm text-ink-muted">
            We keep your legal name and contact info on file for safety
            purposes only. It is never shown to other users.
          </p>
        </Section>

        <Section title="Notifications">
          <div className="flex flex-col gap-4">
            {["New perspectives", "Feedback received", "Assessment results", "Safety notices"].map(
              (label) => (
                <label key={label} className="flex items-center justify-between text-sm text-ink">
                  <span>{label}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-forest" />
                </label>
              )
            )}
          </div>
        </Section>

        <section className="py-10">
          <p className="eyebrow mb-5 text-forest">Account</p>
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log Out
          </Button>
        </section>

        <section className="pt-6 pb-10">
          <p className="eyebrow mb-3 text-ink-faint">Development</p>
          <button
            onClick={() => {
              resetPrototype();
              router.push("/signup");
            }}
            className="text-xs text-ink-faint underline decoration-dotted hover:text-danger"
          >
            Reset prototype data — start UNSAID from scratch
          </button>
        </section>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return <AuthGate>{() => <SettingsContent />}</AuthGate>;
}
