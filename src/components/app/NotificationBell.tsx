import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationsApi, type AppNotification } from "../../api/notifications.ts";

const POLL_MS = 60_000;

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Sidebar bell for the signed-in user's notifications; polls while the tab is visible. */
export default function NotificationBell({ dark }: { dark: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    notificationsApi
      .list()
      .then((feed) => {
        setItems(feed.items);
        setUnread(feed.unreadCount);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) load();
    setOpen(!open);
  }

  function openItem(item: AppNotification) {
    if (!item.read) {
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
      setUnread((count) => Math.max(0, count - 1));
      void notificationsApi.markRead(item.id).catch(() => undefined);
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  }

  function markAllRead() {
    setItems((current) => current.map((entry) => ({ ...entry, read: true })));
    setUnread(0);
    void notificationsApi.markAllRead().catch(() => undefined);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className={`relative grid size-8 place-items-center rounded-lg transition-colors ${
          dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-canvas hover:text-ink"
        }`}
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute bottom-full left-0 z-50 mb-2 w-80 overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">You're all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-line overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex w-full gap-2.5 px-4 py-3 text-left transition-colors hover:bg-canvas ${item.read ? "" : "bg-brand-soft/30"}`}
                  >
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-brand"}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-body">{item.body}</span>
                      <span className="mt-1 block text-[11px] text-ink-muted">{timeAgo(item.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
