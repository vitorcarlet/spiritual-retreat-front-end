"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import axios from "axios";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";

interface SendMessageToFamilyFormProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess: () => void;
}

const messageSchema = z.object({
  subject: z.string().min(1, "Assunto é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  selectedFamilies: z.array(z.string()),
  sendToAll: z.boolean(),
});

type MessageData = z.infer<typeof messageSchema>;

export default function SendMessageToFamilyForm({
  retreatId,
  families,
  onSuccess,
}: SendMessageToFamilyFormProps) {
  const t = useTranslations();
  const { data: sessionData } = useSession();
  const accessToken = useMemo(() => {
    if (!sessionData) return undefined;
    const tokenFromTokens = (
      sessionData as { tokens?: { access_token?: string } }
    ).tokens?.access_token;
    if (tokenFromTokens) return tokenFromTokens;
    return (sessionData as { accessToken?: string })?.accessToken;
  }, [sessionData]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<MessageData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      subject: "",
      message: "",
      selectedFamilies: [],
      sendToAll: false,
    },
  });

  const sendToAll = watch("sendToAll");
  const selectedFamilies = watch("selectedFamilies");

  const handleFamilySelection = (familyId: string) => {
    const currentSelected = selectedFamilies || [];
    const isAlreadySelected = currentSelected.includes(familyId);

    setValue("selectedFamilies", isAlreadySelected ? [] : [familyId]);
  };

  const onSubmit = async (data: MessageData) => {
    try {
      if (!accessToken) {
        return;
      }

      const selectedFamilyId = data.selectedFamilies[0];

      const endpoint = data.sendToAll
        ? `/admin/retreats/${retreatId}/groups`
        : `/admin/retreats/${retreatId}/groups/${selectedFamilyId}/notify`;

      const payload = {
        subject: data.subject,
        message: data.message,
        familyIds: data.sendToAll
          ? families.map((f) => f.id)
          : selectedFamilyId
            ? [selectedFamilyId]
            : [],
      };

      const response = await apiClient.post(endpoint, payload);

      if (response.status >= 200 && response.status < 300) {
        reset();
        onSuccess();
        enqueueSnackbar("Mensagem enviada com sucesso!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } else {
        console.error("Erro ao enviar mensagem:", response);
        enqueueSnackbar("Não foi possível enviar a mensagem.", {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { error?: string })?.error ??
          error.message ??
          "Não foi possível enviar a mensagem.";
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
      } else {
        enqueueSnackbar("Não foi possível enviar a mensagem.", {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 1 }}>
      <Stack spacing={3}>
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t("subject")}
              required
              placeholder={t("message-subject-placeholder")}
              error={!!errors.subject}
              helperText={errors.subject?.message}
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t("message")}
              multiline
              rows={4}
              required
              placeholder={t("message-content-placeholder")}
              error={!!errors.message}
              helperText={errors.message?.message}
            />
          )}
        />

        <Controller
          name="sendToAll"
          control={control}
          render={({ field }) => (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox checked={field.value} onChange={field.onChange} />
                }
                label={t("send-to-all-families")}
              />
            </Box>
          )}
        />

        {!sendToAll && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("select-families")}:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {families.map((family) => (
                <Chip
                  key={family.id}
                  label={family.name}
                  variant={
                    selectedFamilies?.[0] === String(family.id)
                      ? "filled"
                      : "outlined"
                  }
                  color={
                    selectedFamilies?.[0] === String(family.id)
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleFamilySelection(String(family.id))}
                  clickable
                />
              ))}
            </Stack>
            {selectedFamilies?.length === 0 && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {t("select-at-least-one-family")}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onSuccess}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting ||
              !accessToken ||
              (!sendToAll && selectedFamilies?.length === 0)
            }
            startIcon={
              isSubmitting ? <CircularProgress size={16} /> : undefined
            }
          >
            {isSubmitting ? t("sending") : t("send-message")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
