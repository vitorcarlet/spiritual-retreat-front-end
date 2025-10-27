"use client";

import { Box, Card, Skeleton, Stack, Typography } from "@mui/material";
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
      },
      {
        key: "processed",
        label: t("processed", { defaultMessage: "Processadas" }),
        value: formatNumber(summary?.processed),
        icon: "solar:check-circle-bold-duotone",
        color: "success.main",
      },
      {
        key: "failed",
        label: t("failed", { defaultMessage: "Com erro" }),
        value: formatNumber(summary?.failed),
        icon: "solar:shield-cross-bold-duotone",
        color: "error.main",
      },
      {
        key: "lastRun",
        label: t("last-run", { defaultMessage: "Última execução" }),
        value: formatDateTime(summary?.lastRunAt),
        icon: "solar:sunrise-bold-duotone",
        color: "primary.main",
      },
    ],
    [summary, t]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        mb: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
        },
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          variant="outlined"
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: "100%",
          }}
        >
          {isLoading ? (
            <>
              <Skeleton variant="circular" width={24} height={24} />
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Skeleton variant="text" sx={{ width: "70%" }} />
                <Skeleton variant="text" sx={{ width: "50%" }} />
              </Stack>
            </>
          ) : (
            <>
              <Iconify
                icon={card.icon}
                width={24}
                sx={{ color: card.color, flexShrink: 0 }}
              />
              <Stack spacing={0} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {card.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {card.value}
                </Typography>
              </Stack>
            </>
          )}
        </Card>
      ))}
    </Box>
  );
}

export default OutboxSummaryCards;
