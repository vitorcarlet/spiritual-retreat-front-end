"use client";

import { forwardRef } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import { SnackbarContent, useSnackbar } from "notistack";
import type { CustomContentProps } from "notistack";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";

export interface FloatingNotificationData {
  title: string;
  description: string;
  origin: string;
  date: string;
}

const FloatingNotification = forwardRef<HTMLDivElement, CustomContentProps>(
  function FloatingNotification({ id, message }: CustomContentProps, ref) {
    const { closeSnackbar } = useSnackbar();

    // Try to parse message as JSON, fallback to plain message
    let notificationData: FloatingNotificationData | null = null;
    let displayMessage = message;

    try {
      if (typeof message === "string" && message.startsWith("{")) {
        notificationData = JSON.parse(message) as FloatingNotificationData;
        displayMessage = notificationData.title;
      }
    } catch {
      // If parsing fails, use message as is
      displayMessage = message;
    }

    const getOriginLabel = (origin: string) => {
      switch (origin) {
        case "payment_confirmed":
          return "Pagamento Confirmado";
        case "family_filled":
          return "Família Completa";
        case "registration_completed":
          return "Inscrição Realizada";
        default:
          return "Notificação";
      }
    };

    const getOriginColor = (
      origin: string
    ): "success" | "info" | "primary" | "default" => {
      switch (origin) {
        case "payment_confirmed":
          return "success";
        case "family_filled":
          return "info";
        case "registration_completed":
          return "primary";
        default:
          return "default";
      }
    };

    return (
      <SnackbarContent ref={ref} role="alert">
        <Box
          sx={{
            backgroundColor: (theme) => theme.vars?.palette.background.paper,
            borderRadius: 2,
            p: 2,
            minWidth: 300,
            maxWidth: 400,
            boxShadow: (theme) => theme.shadows[8],
            border: (theme) => `1px solid ${theme.vars?.palette.divider}`,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: (theme) => `${theme.vars?.palette.primary.main}20`,
                color: "primary.main",
              }}
            >
              <NotificationsIcon />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {displayMessage}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => closeSnackbar(id)}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {notificationData?.origin && (
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={getOriginLabel(notificationData.origin)}
                    size="small"
                    color={getOriginColor(notificationData.origin)}
                    variant="outlined"
                    sx={{ fontSize: "0.75rem", height: 20 }}
                  />
                </Box>
              )}

              {notificationData?.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {notificationData.description}
                </Typography>
              )}

              {notificationData?.date && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.disabled",
                    fontSize: "0.7rem",
                  }}
                >
                  {notificationData.date}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </SnackbarContent>
    );
  }
);

export default FloatingNotification;
