"use client";

import { forwardRef } from "react";
import { Alert } from "@mui/material";
import { SnackbarContent, useSnackbar } from "notistack";
import type { CustomContentProps } from "notistack";

const ErrorNotification = forwardRef<HTMLDivElement, CustomContentProps>(
  function ErrorNotification({ id, message }: CustomContentProps, ref) {
    const { closeSnackbar } = useSnackbar();

    return (
      <SnackbarContent ref={ref} role="alert">
        <Alert
          variant="outlined"
          severity="error"
          onClose={() => closeSnackbar(id)}
          sx={{
            alignItems: "center",
            bgcolor: (theme) => theme.vars?.palette.background.paper,
            color: (theme) => theme.vars?.palette.text.primary,
            borderColor: (theme) => theme.vars?.palette.error.main,
            "& .MuiAlert-icon": {
              color: (theme) => theme.vars?.palette.error.main,
            },
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          {message}
        </Alert>
      </SnackbarContent>
    );
  }
);

export default ErrorNotification;
