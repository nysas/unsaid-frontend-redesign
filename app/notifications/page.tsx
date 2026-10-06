import Navbar from "@/components/Navbar";
import Divider from "@/components/Divider";
import NotificationItem from "@/components/NotificationItem";
import { EmptyState } from "@/components/EmptyState";
import { mockNotifications } from "@/lib/mock-data";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <p className="mb-8 font-display text-3xl text-ink sm:text-4xl">Notifications</p>
        <div className="flex flex-col">
          {mockNotifications.length > 0 ? (
            mockNotifications.map((n, i) => (
              <div key={n.id}>
                <NotificationItem notification={n} />
                {i < mockNotifications.length - 1 && <Divider />}
              </div>
            ))
          ) : (
            <EmptyState icon={Bell} title="Nothing new" description="You're all caught up." />
          )}
        </div>
      </div>
    </main>
  );
}
