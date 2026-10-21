import { request } from "./http.ts";

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  /** In-app path to open, e.g. "/websites/<id>?tab=hosting". */
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationFeed = { items: AppNotification[]; unreadCount: number };

export const notificationsApi = {
  list: (limit = 20) => request<NotificationFeed>(`/notifications?limit=${limit}`),
  markRead: (id: string) => request<void>(`/notifications/${encodeURIComponent(id)}/read`, { method: "POST" }),
  markAllRead: () => request<void>("/notifications/read-all", { method: "POST" }),
};
