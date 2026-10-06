"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import AnonymousMark from "@/components/AnonymousMark";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useProfile } from "@/components/UserProfileProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useProfile();
  const isHelp = pathname.startsWith("/replier");
  const isYou = pathname.startsWith("/you");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/home" className="font-display text-xl text-ink">
          UNSAID<span className="wordmark-dot">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/home"
            className={clsx(
              "eyebrow transition-colors",
              !isHelp && !isYou ? "text-forest" : "text-ink-muted hover:text-ink"
            )}
          >
            Ask
          </Link>
          <Link
            href="/replier/questions"
            className={clsx(
              "eyebrow transition-colors",
              isHelp ? "text-forest" : "text-ink-muted hover:text-ink"
            )}
          >
            Help
          </Link>
          <Link
            href="/you"
            className={clsx(
              "eyebrow transition-colors",
              isYou ? "text-forest" : "text-ink-muted hover:text-ink"
            )}
          >
            You
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link
            href="/you"
            aria-label="You"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-strong"
          >
            <AnonymousMark seed={user?.avatarSeed ?? "?"} size="md" />
          </Link>
        </div>
      </div>
      <div className="flex divide-x divide-border border-t border-border md:hidden">
        <Link
          href="/home"
          className={clsx(
            "flex-1 py-3 text-center eyebrow",
            !isHelp && !isYou ? "text-forest" : "text-ink-muted"
          )}
        >
          Ask
        </Link>
        <Link
          href="/replier/questions"
          className={clsx(
            "flex-1 py-3 text-center eyebrow",
            isHelp ? "text-forest" : "text-ink-muted"
          )}
        >
          Help
        </Link>
        <Link
          href="/you"
          className={clsx("flex-1 py-3 text-center eyebrow", isYou ? "text-forest" : "text-ink-muted")}
        >
          You
        </Link>
      </div>
    </header>
  );
}
