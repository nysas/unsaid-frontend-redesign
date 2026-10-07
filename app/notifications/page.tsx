"use client";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import NotificationItem from "@/components/NotificationItem";
import AuthGate from "@/components/AuthGate";
import { EmptyState } from "@/components/EmptyState";
import { Loading, LoadError } from "@/components/LoadState";
import { fetchNotifications, markAllNotificationsRead } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Bell } from "lucide-react";

function NotificationsContent() {
  const list = useAsync(fetchNotifications, []);

  // Show unread dots for this visit, then mark everything read in the background.
  useEffect(() => {
    if (list.data?.some((n) => !n.read)) {
      markAllNotificationsRead()
        .then(() => window.dispatchEvent(new Event("unsaid:notifications-read")))
        .catch(console.error);
    }
  }, [list.data]);

  const items = list.data ?? [];

  return (
    <div className="flex flex-col">
      {list.loading ? (
        <Loading />
      ) : list.error ? (
        <LoadError message={list.error} onRetry={list.reload} />
      ) : items.length > 0 ? (
        items.map((n, i) => (
          <div key={n.id}>
            <NotificationItem notification={n} />
            {i < items.length - 1 && <Divider />}
          </div>
        ))
      ) : (
        <EmptyState icon={Bell} title="Nothing new" description="You're all caught up." />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate>
      {() => (
        <main>
          <Navbar />
          <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
            <p className="mb-8 font-display text-3xl text-ink sm:text-4xl">Notifications</p>
            <NotificationsContent />
          </div>
        </main>
      )}
    </AuthGate>
  );
}
