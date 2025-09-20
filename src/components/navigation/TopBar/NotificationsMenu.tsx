"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Drawer,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Badge,
} from "@mui/material";
import Iconify from "@/src/components/Iconify";
import SettingsIcon from "@mui/icons-material/Settings";
import { useModal } from "@/src/hooks/useModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import NotificationsConfig, {
  loadNotificationSettings,
  saveNotificationSettings,
} from "./NotificationsConfig";

type NotificationItem = {
  id: number | string;
  title: string;
  description: string;
  date: string; // já formatado pelo backend (ex.: "2 dias atrás")
  read: boolean;
  origin: string; // ex.: "payment_confirmed" | "family_filled" | etc
  retreatId?: number | string;
};

type TabKey = "all" | "unread";

const NotificationsMenu = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const modal = useModal();
  const t = useTranslations("notifications");
  const router = useRouter();

  const sseRef = useRef<EventSource | null>(null);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  const filtered = useMemo(() => {
    return tab === "unread" ? items.filter((n) => !n.read) : items;
  }, [items, tab]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await handleApiResponse<NotificationItem[]>(
        await sendRequestServerVanilla.get("/notifications")
      );
      if (!resp.success) throw new Error(resp.error || "Falha ao buscar");
      setItems(resp.data || []);
    } catch (e) {
      // fallback (evita drawer vazio se API falhar)
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!items.length) return;
    setMarkingAll(true);
    try {
      const ids = items.filter((n) => !n.read).map((n) => n.id);
      if (ids.length) {
        await handleApiResponse(
          await sendRequestServerVanilla.post("/notifications/mark-all-read", {
            ids,
          })
        );
      }
      // otimista
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }, [items]);

  const handleConfigClick = () => {
    const initial = loadNotificationSettings();
    modal.open({
      title: t("configuration"),
      size: "sm",
      customRender() {
        return (
          <NotificationsConfig
            initial={initial}
            onSave={(s) => {
              saveNotificationSettings(s);
              modal.close?.();
            }}
          />
        );
      },
    });
  };

  const getNotificationTarget = (n: NotificationItem): string => {
    const rid = n.retreatId ?? "";
    switch (n.origin) {
      case "payment_confirmed":
      case "participant_paid":
        return `/retreats/${rid}/contemplated`;
      case "family_filled":
        return `/retreats/${rid}/families`;
      case "registration_completed":
        return `/retreats/${rid}/participants`;
      default:
        return `/retreats/${rid}`;
    }
  };

  const handleViewMore = async (n: NotificationItem) => {
    // otimista: marca como lida
    setItems((prev) =>
      prev.map((it) => (it.id === n.id ? { ...it, read: true } : it))
    );
    // opcional: avisa backend
    try {
      await sendRequestServerVanilla.post(`/notifications/${n.id}/read`);
    } catch {
      // ignore
    }
    const href = getNotificationTarget(n);
    router.push(href);
    setOpen(false);
  };

  // Conecta no SSE e recebe novas notificações (3 eventos, 1/min)
  useEffect(() => {
    const url = `${API_BASE}/notifications/stream`;
    const es = new EventSource(url);
    sseRef.current = es;

    const onNotification = (e: MessageEvent) => {
      try {
        const n: NotificationItem = JSON.parse(e.data);
        // prepend otimista
        setItems((prev) => [n, ...prev]);
      } catch {
        // ignore parse error
      }
    };

    // O mock envia como "event: notification"
    es.addEventListener("notification", onNotification);

    es.onerror = () => {
      // O browser tenta reconectar automaticamente (retry definido no mock)
      // Opcional: log/telemetria
    };

    return () => {
      es.removeEventListener("notification", onNotification);
      es.close();
      sseRef.current = null;
    };
  }, [API_BASE]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge color="error" badgeContent={unreadCount || 0} overlap="circular">
          <Iconify icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              zIndex: (theme) => theme.zIndex.drawer + 900,
              width: 420,
              maxWidth: "100vw",
              height: "100vh",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2, pb: 1 }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: "flex", gap: 1 }}
          >
            {t("notifications")}
            <Typography component="span" variant="h6" color="text.secondary">
              ({items.length})
            </Typography>
          </Typography>

          <Button
            size="small"
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
            sx={{ mr: 1 }}
            startIcon={markingAll ? <CircularProgress size={14} /> : undefined}
          >
            {t("mark_all_as_read")}
          </Button>

          <IconButton onClick={handleConfigClick}>
            <SettingsIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ px: 2, pt: 1 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="notification tabs"
          >
            <Tab
              sx={{ px: 3 }}
              value="all"
              label={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {t("all")}
                  <Badge
                    color="default"
                    badgeContent={items.length || 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        right: -12,
                        top: 8,
                      },
                    }}
                  />
                </Box>
              }
            />
            <Tab
              value="unread"
              sx={{ px: 3 }}
              label={
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {t("unread")}
                  <Badge
                    color="primary"
                    badgeContent={unreadCount || 0}
                    sx={{
                      "& .MuiBadge-badge": {
                        right: -10,
                        top: 8,
                      },
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>

        <Divider />

        <Box sx={{ p: 0, flex: 1, display: "flex", flexDirection: "column" }}>
          {loading ? (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filtered.map((n) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <Button
                        size="small"
                        onClick={() => handleViewMore(n)}
                        sx={{ minWidth: 0 }}
                      >
                        {t("see_more")}
                      </Button>
                    }
                    sx={{
                      opacity: n.read ? 0.6 : 1,
                      borderBottom: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{
                        variant: "subtitle1",
                        fontWeight: 700,
                        sx: { display: "flex", gap: 1 },
                      }}
                      secondaryTypographyProps={{ component: "div" }}
                      primary={n.title}
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {n.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.5 }}
                          >
                            {n.date}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
              {!filtered.length && !loading ? (
                <Box sx={{ p: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {tab === "unread" ? t("no_unread") : t("no_notifications")}
                  </Typography>
                </Box>
              ) : null}
            </List>
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => setOpen(false)}>
            {t("close")}
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default NotificationsMenu;
