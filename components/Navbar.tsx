"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { unreadNotificationCount } from "@/lib/api";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import AnonymousMark from "@/components/AnonymousMark";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useProfile } from "@/components/UserProfileProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useProfile();
  const [unread, setUnread] = useState(0);
  const isHelp = pathname.startsWith("/replier");
  const isYou = pathname.startsWith("/you");

  // Poll the unread count; refresh on navigation and when the inbox is opened.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = () =>
      unreadNotificationCount()
        .then((n) => alive && setUnread(n))
        .catch(() => {});
    load();
    const timer = setInterval(load, 60_000);
    window.addEventListener("unsaid:notifications-read", load);
    window.addEventListener("focus", load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("unsaid:notifications-read", load);
      window.removeEventListener("focus", load);
    };
  }, [user, pathname]);

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
            href="/notifications"
            aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
            className="relative text-ink-muted transition-colors hover:text-ink"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[10px] leading-none text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
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
