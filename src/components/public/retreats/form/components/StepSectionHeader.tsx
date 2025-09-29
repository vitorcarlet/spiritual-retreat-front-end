"use client";

import React from "react";
import { Divider, Stack, Typography } from "@mui/material";

import type { BackendSection } from "../types";

type StepSectionHeaderProps = {
  step?: BackendSection;
};

const StepSectionHeader: React.FC<StepSectionHeaderProps> = ({ step }) => {
  if (!step) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="h6" fontWeight={600}>
        {step.title}
      </Typography>
      {step.description && (
        <Typography variant="body2" color="text.secondary">
          {step.description}
        </Typography>
      )}
      <Divider />
    </Stack>
  );
};

export default StepSectionHeader;
