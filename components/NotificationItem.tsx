import Link from "next/link";
import clsx from "clsx";
import { Notification } from "@/lib/types";
import { timeAgo } from "@/lib/format";

export default function NotificationItem({ notification }: { notification: Notification }) {
  const content = (
    <div className={clsx("flex items-start gap-3 py-4", notification.link && "group")}>
      {!notification.read ? (
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
      ) : (
        <span className="w-1.5 shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-ink transition-colors group-hover:text-forest">{notification.title}</p>
        <p className="text-sm text-ink-muted">{notification.body}</p>
        <p className="eyebrow mt-1.5 text-ink-faint">{timeAgo(notification.createdAt)}</p>
      </div>
    </div>
  );
  return notification.link ? <Link href={notification.link}>{content}</Link> : content;
}
