import { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/mock-data";
import clsx from "clsx";

export default function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className={clsx("flex items-start gap-3 py-4", !notification.read && "relative")}>
      {!notification.read && (
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
      )}
      {notification.read && <span className="w-1.5 shrink-0" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{notification.title}</p>
        <p className="text-sm text-ink-muted">{notification.body}</p>
        <p className="eyebrow mt-1.5 text-ink-faint">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
}
