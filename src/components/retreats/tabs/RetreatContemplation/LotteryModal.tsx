"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper,
} from "@mui/material";
import { useTranslations } from "next-intl";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { useRef } from "react";
import { useDarkMode } from "@/src/theme/DarkModeContext";

interface LotteryModalProps {
  retreatId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface LotteryPreviewResponse {
  male: string[];
  female: string[];
  maleCap: number;
  femaleCap: number;
}

interface ParticipantRow {
  id: string;
  name: string;
  gender: "male" | "female";
}

export default function LotteryModal({
  retreatId,
  onSuccess,
  onCancel,
}: LotteryModalProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [isCommitting, setIsCommitting] = useState(false);
  const { darkMode } = useDarkMode();
  const [lotteryData, setLotteryData] = useState<LotteryPreviewResponse | null>(
    null
  );
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs for virtual scrolling
  const parentRef = useRef<HTMLDivElement>(null);

  // Load lottery preview
  useEffect(() => {
    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.post<LotteryPreviewResponse>(
          `/retreats/${retreatId}/lottery/preview`
        );

        setLotteryData(response.data);

        // Combine male and female participants into a single list
        const maleParticipants: ParticipantRow[] = response.data.male.map(
          (id, index) => ({
            id,
            name: `Participante Masculino ${index + 1}`,
            gender: "male" as const,
          })
        );

        const femaleParticipants: ParticipantRow[] = response.data.female.map(
          (id, index) => ({
            id,
            name: `Participante Feminino ${index + 1}`,
            gender: "female" as const,
          })
        );

        setParticipants([...maleParticipants, ...femaleParticipants]);
      } catch (error) {
        console.error("Error loading lottery preview:", error);
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Erro ao carregar preview da loteria";
        setError(message);
        enqueueSnackbar(message, { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [retreatId]);

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  const handleCommit = async () => {
    if (!lotteryData) return;

    setIsCommitting(true);

    try {
      const response = await apiClient.post<LotteryPreviewResponse>(
        `/retreats/${retreatId}/lottery/commit`
      );

      enqueueSnackbar(
        t("lottery-committed-success", {
          total: response.data.male.length + response.data.female.length,
        }),
        { variant: "success" }
      );

      onSuccess();
    } catch (error) {
      console.error("Error committing lottery:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Erro ao confirmar loteria";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsCommitting(false);
    }
  };

  const stats = useMemo(() => {
    if (!lotteryData) return null;

    return {
      totalMale: lotteryData.male.length,
      totalFemale: lotteryData.female.length,
      total: lotteryData.male.length + lotteryData.female.length,
      maleCap: lotteryData.maleCap,
      femaleCap: lotteryData.femaleCap,
      malePercentage:
        lotteryData.maleCap > 0
          ? ((lotteryData.male.length / lotteryData.maleCap) * 100).toFixed(1)
          : "0",
      femalePercentage:
        lotteryData.femaleCap > 0
          ? ((lotteryData.female.length / lotteryData.femaleCap) * 100).toFixed(
              1
            )
          : "0",
    };
  }, [lotteryData]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          minHeight: 300,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {t("loading-lottery-preview")}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel}>
            {t("close")}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        {/* Header with stats */}
        <Box>
          <Typography variant="h6" gutterBottom>
            {t("lottery-preview-title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("lottery-preview-description")}
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Stack direction="row" spacing={2}>
            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("male-participants")}
                  </Typography>
                  <Chip
                    label={`${stats.totalMale}/${stats.maleCap}`}
                    size="small"
                    color="primary"
                  />
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalMale}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.malePercentage}% {t("of-capacity")}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="caption" color="text.secondary">
                    {t("female-participants")}
                  </Typography>
                  <Chip
                    label={`${stats.totalFemale}/${stats.femaleCap}`}
                    size="small"
                    color="secondary"
                  />
                </Stack>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalFemale}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.femalePercentage}% {t("of-capacity")}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t("total-selected")}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stats.maleCap + stats.femaleCap} {t("total-capacity")}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        )}

        <Divider />

        {/* Virtualized Table */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {t("selected-participants-list")}
          </Typography>

          {participants.length === 0 ? (
            <Alert severity="info">{t("no-participants-selected")}</Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                height: 400,
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              {/* Table Header */}
              <Box
                sx={{
                  display: "flex",
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "background.default",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    flex: "0 0 80px",
                    p: 1.5,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  #
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {t("participant-id")}
                </Box>
                <Box
                  sx={{
                    flex: "0 0 150px",
                    p: 1.5,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {t("gender")}
                </Box>
              </Box>

              {/* Virtualized Rows */}
              <Box
                ref={parentRef}
                sx={{
                  height: "calc(100% - 48px)",
                  overflow: "auto",
                }}
              >
                <Box
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer
                    .getVirtualItems()
                    .map((virtualRow: VirtualItem) => {
                      const participant = participants[virtualRow.index];
                      return (
                        <Box
                          key={virtualRow.key}
                          data-index={virtualRow.index}
                          ref={rowVirtualizer.measureElement}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                            display: "flex",
                            borderBottom: 1,
                            borderColor: "divider",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              flex: "0 0 80px",
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2">
                              {virtualRow.index + 1}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                              }}
                            >
                              {participant.id}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: "0 0 150px",
                              p: 1.5,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={
                                participant.gender === "male"
                                  ? t("male")
                                  : t("female")
                              }
                              size="small"
                              color={
                                participant.gender === "male"
                                  ? "primary"
                                  : "secondary"
                              }
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isCommitting}
            size="large"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCommit}
            disabled={isCommitting || participants.length === 0}
            startIcon={
              isCommitting ? <CircularProgress size={20} /> : undefined
            }
            size="large"
            sx={{
              color: darkMode ? "#000" : "#fff",
              "&:hover": {
                color: darkMode ? "#fff" : "#000",
              },
            }}
          >
            {isCommitting ? t("committing") : t("confirm-lottery")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
