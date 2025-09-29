"use client";

import React from "react";
import { Stack, Typography } from "@mui/material";

type FormHeaderProps = {
  title?: string;
  description?: string;
  subtitle?: string;
};

const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  description,
  subtitle,
}) => {
  if (!title && !description && !subtitle) {
    return null;
  }

  return (
    <Stack spacing={0.5}>
      {title && (
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
  );
};

export default FormHeader;
