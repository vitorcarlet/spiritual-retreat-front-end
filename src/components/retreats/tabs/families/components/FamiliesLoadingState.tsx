"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";

interface FamiliesLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
}

export default function FamiliesLoadingState({
  isLoading,
  isError,
}: FamiliesLoadingStateProps) {
  if (isLoading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: "100%" }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (isError) {
    return <Typography color="error">Erro ao carregar famílias.</Typography>;
  }

  return null;
}
