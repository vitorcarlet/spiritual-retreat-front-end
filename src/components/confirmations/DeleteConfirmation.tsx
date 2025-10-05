/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { useModal } from "@/src/hooks/useModal";

export type DeleteConfirmationProps = {
  title?: string;
  description?: string;
  resourceName?: string; // e.g. user name
  confirmLabel?: string; // default: "Delete"
  cancelLabel?: string; // default: "Cancel"
  confirmColor?: "error" | "primary" | "warning";
  requireText?: string; // if set, user must type this to enable confirm
  requireCheckboxLabel?: string; // if set, user must check it to enable confirm
  onConfirm: () => Promise<void> | void; // perform deletion
  onCancel?: () => void; // optional extra callback
};

export default function DeleteConfirmation({
  title = "Delete",
  description = "This action cannot be undone.",
  resourceName,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmColor = "error",
  requireText,
  requireCheckboxLabel,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled =
    loading ||
    (requireText ? typed.trim() !== requireText.trim() : false) ||
    (requireCheckboxLabel ? !checked : false);

  const handleCancel = () => {
    onCancel?.();
    modal.close();
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      modal.close();
    } catch (e: any) {
      setError(e?.message || "Failed to delete. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, width: { xs: "100%", sm: 480 }, maxWidth: "100%" }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          {title} {resourceName ? `“${resourceName}”` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>

        {requireText && (
          <Stack spacing={1}>
            <Typography variant="body2">
              To confirm, type: <strong>{requireText}</strong>
            </Typography>
            <TextField
              size="small"
              fullWidth
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
            />
          </Stack>
        )}

        {requireCheckboxLabel && (
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            }
            label={requireCheckboxLabel}
          />
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            onClick={handleCancel}
            disabled={loading}
            color="inherit"
            variant="outlined"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            color={confirmColor}
            variant="contained"
            disabled={disabled}
          >
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
