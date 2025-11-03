"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Box, Chip, Stack } from "@mui/material";
import Iconify from "@/src/components/Iconify";
import { ValidationError } from "../hooks/useRulesValidations";
import ValidationWarning from "./ValidationWarning";

interface ServiceTeamStatusProps {
  error?: ValidationError;
}

export default function ServiceTeamStatus({ error }: ServiceTeamStatusProps) {
  const t = useTranslations("service-team-details");
  const [expanded, setExpanded] = useState(false);

  if (!error) {
    return (
      <Chip
        icon={<Iconify icon="solar:check-circle-bold" />}
        label={t("validation.all-good", {
          defaultMessage: "All requirements met",
        })}
        color="success"
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      />
    );
  }

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      <ValidationWarning
        error={error}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
    </Stack>
  );
}
