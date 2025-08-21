"use client";

import React from "react";

import { Box, Typography } from "@mui/material";
import { FormEditor } from "@/src/components/form-editor";

export default function ParticipantsFormEditor({ id }: { id: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      p={2}
      sx={{ height: "100%", boxSizing: "border-box" }}
    >
      <Typography variant="h5" fontWeight={600}>
        Editor de Formulário - Equipe de Serviço
      </Typography>
      <FormEditor id={id} />
    </Box>
  );
}
