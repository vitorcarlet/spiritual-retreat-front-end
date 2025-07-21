// src/auth/login/form/SubmitButton.tsx
"use client";

import { Button } from "@mui/material";
import { Icon } from "@iconify/react";
import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      fullWidth
      variant="contained"
      sx={{ mt: 2, mb: 2, padding: 1.5 }}
      disabled={pending}
      startIcon={
        pending ? (
          <Icon icon="material-symbols:hourglass-top" />
        ) : (
          <Icon icon="material-symbols:lock-outline" />
        )
      }
    >
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}