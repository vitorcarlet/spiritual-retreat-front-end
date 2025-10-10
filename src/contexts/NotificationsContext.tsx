"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  handleApiResponse,
  sendRequestClientVanilla,
} from "@/src/lib/sendRequestClientVanilla";
import { useSession } from "next-auth/react";

export type NotificationItem = {
  id: number | string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  origin: string;
  retreatId?: number | string;
};

interface NotificationsContextType {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: NotificationItem) => void;
  markAsRead: (id: number | string) => void;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: sessionData } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = items.filter((n) => !n.read).length;

  const accessToken = useMemo(() => {
    if (!sessionData) return undefined;
    const tokenFromTokens = (
      sessionData as { tokens?: { access_token?: string } }
    ).tokens?.access_token;
    if (tokenFromTokens) return tokenFromTokens;
    return (sessionData as { accessToken?: string })?.accessToken;
  }, [sessionData]);

  const addNotification = useCallback((notification: NotificationItem) => {
    setItems((prev) => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: number | string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const resp = await handleApiResponse<NotificationItem[]>(
        await sendRequestClientVanilla.get("/notifications", {
          getAccessToken: async () => accessToken,
        })
      );
      if (!resp.success) throw new Error(resp.error || "Falha ao buscar");
      setItems(resp.data || []);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const markAllAsRead = useCallback(async () => {
    if (!accessToken) return;
    try {
      const ids = items.filter((n) => !n.read).map((n) => n.id);
      if (ids.length) {
        await handleApiResponse(
          await sendRequestClientVanilla.post(
            "/notifications/mark-all-read",
            {
              ids,
            },
            {
              getAccessToken: async () => accessToken,
            }
          )
        );
      }
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [accessToken, items]);

  // Busca notificações na inicialização
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value: NotificationsContextType = {
    items,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    setItems,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
