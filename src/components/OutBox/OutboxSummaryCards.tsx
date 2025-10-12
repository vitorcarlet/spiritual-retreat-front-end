"use client";

import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { OutboxSummary } from "./types";
import Iconify from "@/src/components/Iconify";
import { useTranslations } from "next-intl";

interface OutboxSummaryCardsProps {
  summary?: OutboxSummary;
  isLoading?: boolean;
}

const formatNumber = (value?: number) => value?.toLocaleString("pt-BR") ?? "0";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export function OutboxSummaryCards({
  summary,
  isLoading,
}: OutboxSummaryCardsProps) {
  const t = useTranslations("retreat-outbox");

  const cards = useMemo(
    () => [
      {
        key: "pending",
        label: t("pending", { defaultMessage: "Pendentes" }),
        value: formatNumber(summary?.pending),
        icon: "solar:clock-circle-bold-duotone",
        color: "warning.main",
        helperText: t("pending-helper", {
          defaultMessage: "Mensagens aguardando processamento.",
        }),
      },
      {
        key: "processed",
        label: t("processed", { defaultMessage: "Processadas" }),
        value: formatNumber(summary?.processed),
        icon: "solar:check-circle-bold-duotone",
        color: "success.main",
        helperText: t("processed-helper", {
          defaultMessage: "Mensagens finalizadas com sucesso.",
        }),
      },
      {
        key: "failed",
        label: t("failed", { defaultMessage: "Com erro" }),
        value: formatNumber(summary?.failed),
        icon: "solar:shield-cross-bold-duotone",
        color: "error.main",
        helperText: t("failed-helper", {
          defaultMessage: "Mensagens que precisam de intervenção.",
        }),
      },
      {
        key: "lastRun",
        label: t("last-run", { defaultMessage: "Última execução" }),
        value: formatDateTime(summary?.lastRunAt),
        icon: "solar:sunrise-bold-duotone",
        color: "primary.main",
        helperText:
          formatDateTime(summary?.lastSuccessAt ?? null) ||
          t("last-success", { defaultMessage: "Sem registros" }),
      },
    ],
    [summary, t]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        mb: 3,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
        },
      }}
    >
      {cards.map((card) => (
        <Box key={card.key}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              {isLoading ? (
                <Stack spacing={1}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "1.5rem", width: "60%" }}
                  />
                  <Skeleton variant="text" sx={{ width: "80%" }} />
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  <Iconify
                    icon={card.icon}
                    width={28}
                    sx={{ color: card.color }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.helperText}
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}

export default OutboxSummaryCards;
