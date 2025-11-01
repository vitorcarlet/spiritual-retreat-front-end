"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useTranslations } from "next-intl";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface ResetFamiliesModalProps {
  retreatId: string;
  families: RetreatFamily[];
  familiesLocked: boolean | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ResetFamiliesResponse {
  version: number;
  familiesDeleted: number;
  membersDeleted: number;
}

export default function ResetFamiliesModal({
  retreatId,
  families,
  familiesLocked,
  onSuccess,
  onCancel,
}: ResetFamiliesModalProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceLockedFamilies, setForceLockedFamilies] = useState(false);
  const [confirmUnderstand, setConfirmUnderstand] = useState(false);
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  // Check if there are locked families
  const lockedFamilies = families.filter((family) => family.locked);
  const hasLockedFamilies = familiesLocked || lockedFamilies.length > 0;

  const handleReset = async () => {
    // Validate confirmations
    if (!confirmUnderstand || !confirmPermanent) {
      enqueueSnackbar(t("please-confirm-all-checkboxes"), {
        variant: "warning",
      });
      return;
    }

    if (hasLockedFamilies && !forceLockedFamilies) {
      enqueueSnackbar(t("confirm-force-locked-families"), {
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<ResetFamiliesResponse>(
        `/retreats/${retreatId}/families/reset`,
        {
          forceLockedFamilies,
        }
      );

      const { familiesDeleted, membersDeleted } = response.data;

      enqueueSnackbar(
        t("families-reset-success", {
          familiesDeleted,
          membersDeleted,
        }),
        { variant: "success" }
      );

      onSuccess();
    } catch (error) {
      console.error("Error resetting families:", error);
      if (axios.isAxiosError(error)) {
        enqueueSnackbar(
          error.response?.data?.message || t("error-resetting-families"),
          { variant: "error" }
        );
      } else {
        enqueueSnackbar(t("error-resetting-families"), { variant: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        {/* Warning Alert */}
        <Alert
          severity="error"
          icon={<WarningAmberIcon fontSize="large" />}
          sx={{ fontSize: "1rem" }}
        >
          <Typography variant="h6" gutterBottom>
            {t("reset-families-warning-title")}
          </Typography>
          <Typography variant="body2">
            {t("reset-families-warning-description")}
          </Typography>
        </Alert>

        {/* Statistics */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {t("current-statistics")}:
          </Typography>
          <Stack spacing={1} sx={{ pl: 2 }}>
            <Typography variant="body2">
              • {t("total-families")}: <strong>{families.length}</strong>
            </Typography>
            <Typography variant="body2">
              • {t("total-members")}:{" "}
              <strong>
                {families.reduce(
                  (sum, family) => sum + (family.members?.length || 0),
                  0
                )}
              </strong>
            </Typography>
            {hasLockedFamilies && (
              <Typography variant="body2" color="warning.main">
                • {t("locked-families")}:{" "}
                <strong>{lockedFamilies.length}</strong>
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Confirmation Checkboxes */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {t("confirm-reset-action")}:
          </Typography>
          <Stack spacing={2} sx={{ pl: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmUnderstand}
                  onChange={(e) => setConfirmUnderstand(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={
                <Typography variant="body2">
                  {t("confirm-understand-reset")}
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmPermanent}
                  onChange={(e) => setConfirmPermanent(e.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={
                <Typography variant="body2">
                  {t("confirm-action-permanent")}
                </Typography>
              }
            />

            {hasLockedFamilies && (
              <Box sx={{ pl: 2, pt: 1 }}>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {t("locked-families-detected", {
                      count: lockedFamilies.length,
                    })}
                  </Typography>
                </Alert>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={forceLockedFamilies}
                      onChange={(e) => setForceLockedFamilies(e.target.checked)}
                      disabled={isSubmitting}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body2" color="warning.main">
                      <strong>{t("confirm-force-reset-locked")}</strong>
                    </Typography>
                  }
                />
              </Box>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            size="large"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReset}
            disabled={
              isSubmitting ||
              !confirmUnderstand ||
              !confirmPermanent ||
              (hasLockedFamilies && !forceLockedFamilies)
            }
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : undefined
            }
            size="large"
          >
            {isSubmitting ? t("resetting") : t("reset-families")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
