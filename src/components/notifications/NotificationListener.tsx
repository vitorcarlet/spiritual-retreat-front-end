"use client";

import { useEffect, useRef } from "react";
import { useSnackbar } from "notistack";
import {
  loadNotificationSettings,
  NOTIFICATION_SOUNDS,
} from "../navigation/TopBar/NotificationsConfig";
import {
  useNotifications,
  NotificationItem,
} from "@/src/contexts/NotificationsContext";
import type { FloatingNotificationData } from "../notistack/FloatingNotification";

export default function NotificationListener() {
  const { enqueueSnackbar } = useSnackbar();
  const { addNotification } = useNotifications();
  const sseRef = useRef<EventSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

  const playNotificationSound = (soundId: string) => {
    const sound = NOTIFICATION_SOUNDS.find((s) => s.id === soundId);

    // Don't play anything if "no sound" is selected or no sound found
    if (!sound || sound.id === "none" || !sound.src) return;

    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = sound.src;
    audioRef.current.play().catch(() => {
      // Ignore audio play errors (e.g., user hasn't interacted with page yet)
    });
  };

  const showFloatingNotification = (notification: NotificationItem) => {
    const settings = loadNotificationSettings();

    // Only show floating notification if enabled in settings
    if (!settings.floating) return;

    const notificationData: FloatingNotificationData = {
      title: notification.title,
      description: notification.description,
      origin: notification.origin,
      date: notification.date,
    };

    enqueueSnackbar(JSON.stringify(notificationData), {
      variant: "default",
      persist: false,
      autoHideDuration: 3000,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });

    // Play sound if enabled
    if (settings.sound && settings.sound !== "none") {
      playNotificationSound(settings.sound);
    }
  };

  useEffect(() => {
    const url = `${API_BASE}/notifications/stream`;
    const es = new EventSource(url);
    sseRef.current = es;

    const onNotification = (e: MessageEvent) => {
      try {
        const notification: NotificationItem = JSON.parse(e.data);

        // Add to context state (updates badge)
        addNotification(notification);

        // Show floating notification
        showFloatingNotification(notification);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    // Listen for notification events from SSE
    es.addEventListener("notification", onNotification);

    es.onerror = () => {
      //console.error("SSE connection error:", error);
      // The browser will automatically try to reconnect
    };

    return () => {
      es.removeEventListener("notification", onNotification);
      es.close();
      sseRef.current = null;
    };
  }, [API_BASE, enqueueSnackbar]);

  // This component doesn't render anything
  return null;
}
