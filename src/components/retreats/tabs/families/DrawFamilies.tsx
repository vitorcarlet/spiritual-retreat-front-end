"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Fragment, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import Iconify from "@/src/components/Iconify";

interface ParticipantWithoutFamily {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group?: string;
}

interface DrawFamiliesResponse {
  participants: ParticipantWithoutFamily[];
}

interface DrawFamiliesProps {
  retreatId: string;
  onSuccess?: () => void;
}

const fetchParticipantsWithoutFamily = async (
  retreatId: string
): Promise<ParticipantWithoutFamily[]> => {
  const response = await handleApiResponse<DrawFamiliesResponse>(
    await sendRequestServerVanilla.get(`/retreats/${retreatId}/lottery/preview`)
  );
  console.log({ response }, response.data, response.data?.participants);
  if (!response.success) {
    throw new Error(response.error ?? "Failed to load participants");
  }

  return response.data?.participants ?? [];
};

const drawFamiliesRequest = async (retreatId: string) => {
  const response = await handleApiResponse(
    await sendRequestServerVanilla.post(`/retreats/${retreatId}/families/draw`)
  );

  if (!response.success) {
    throw new Error(response.error ?? "Failed to draw families");
  }

  return response.data;
};

export default function DrawFamilies({
  retreatId,
  onSuccess,
}: DrawFamiliesProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const {
    data: participants,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["retreat-families-unassigned", retreatId],
    queryFn: () => fetchParticipantsWithoutFamily(retreatId),
    staleTime: 30_000,
  });

  const drawMutation = useMutation({
    mutationFn: () => drawFamiliesRequest(retreatId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["retreat-families-unassigned", retreatId],
      });
      queryClient.invalidateQueries({ queryKey: ["retreat-families"] });
      onSuccess?.();
    },
  });

  const totalParticipants = participants?.length ?? 0;
  console.log({ totalParticipants }, participants);
  const isDrawDisabled = totalParticipants === 0 || drawMutation.isPending;

  const title = useMemo(() => {
    if (isLoading) return t("loading-participants");
    return t("participants-without-family");
  }, [isLoading, t]);

  return (
    <Box sx={{ width: "100%", minHeight: 280 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("participants-without-family-description")}
          </Typography>
        </Box>

        {isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        )}

        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                {t("retry")}
              </Button>
            }
          >
            {error instanceof Error
              ? error.message
              : t("failed-to-load-participants")}
          </Alert>
        )}

        {!isLoading && !isError && (
          <Box
            sx={{
              maxHeight: 320,
              overflowY: "auto",
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {totalParticipants === 0 ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
                <Iconify
                  icon="solar:user-cross-bold"
                  width={48}
                  height={48}
                  color="text.disabled"
                />
                <Typography variant="body2" color="text.secondary">
                  {t("no-unassigned-participants")}
                </Typography>
              </Stack>
            ) : (
              <List disablePadding>
                {participants?.map((participant, index) => (
                  <Fragment key={participant.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>
                          {participant.name
                            ?.split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.name}
                        secondary={
                          <Stack spacing={0.5}>
                            {participant.email && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {participant.email}
                              </Typography>
                            )}
                            {participant.phone && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {participant.phone}
                              </Typography>
                            )}
                            {participant.group && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {t("group-label", { group: participant.group })}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < totalParticipants - 1 && (
                      <Divider component="li" />
                    )}
                  </Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            {t("unassigned-participants-count", { count: totalParticipants })}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => drawMutation.mutate()}
            disabled={isDrawDisabled}
            startIcon={
              drawMutation.isPending ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <Iconify icon="solar:shuffle-outline" />
              )
            }
          >
            {drawMutation.isPending ? t("drawing") : t("start-family-draw")}
          </Button>
        </Stack>

        {drawMutation.isError && (
          <Alert severity="error">
            {drawMutation.error instanceof Error
              ? drawMutation.error.message
              : t("failed-to-draw-families")}
          </Alert>
        )}

        {drawMutation.isSuccess && (
          <Alert severity="success">{t("families-draw-success")}</Alert>
        )}
      </Stack>
    </Box>
  );
}
