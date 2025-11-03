"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import Iconify from "@/src/components/Iconify";
import { ValidationError } from "../hooks/useRulesValidations";

interface ValidationWarningProps {
  error: ValidationError;
  expanded?: boolean;
  onToggle?: () => void;
}

export default function ValidationWarning({
  error,
  expanded = false,
  onToggle,
}: ValidationWarningProps) {
  const t = useTranslations("service-team-details");
  console.log({ error });
  const severity = useMemo(() => {
    const errorCount = error.errors.length;
    if (errorCount >= 2) return "error";
    return "warning";
  }, [error.errors.length]);

  // Gerar resumo conciso dos problemas
  const summary = useMemo(() => {
    const issues: string[] = [];

    if (error.missingCoordinator) {
      issues.push(
        t("validation.missing-coordinator", {
          defaultMessage: "Sem coordenador",
        })
      );
    }

    if (error.missingViceCoordinator) {
      issues.push(
        t("validation.missing-vice-coordinator", { defaultMessage: "Sem vice" })
      );
    }

    return issues.join(" • ");
  }, [error, t]);

  return (
    <Box sx={{ width: "100%" }}>
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="expand"
            size="small"
            onClick={onToggle}
            sx={{ cursor: onToggle ? "pointer" : "default" }}
          >
            <Iconify
              icon={
                expanded ? "solar:chevron-up-bold" : "solar:chevron-down-bold"
              }
            />
          </IconButton>
        }
        sx={{ mb: 0 }}
      >
        <Stack spacing={expanded ? 1 : 0}>
          {/* Resumo conciso */}
          <Typography variant="subtitle2" fontWeight={600}>
            {summary}
          </Typography>

          {/* Detalhes expandidos */}
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List
              dense
              sx={{
                mt: 1,
                mb: 0,
                "& .MuiListItem-root": {
                  py: 0.5,
                },
              }}
            >
              {error.errors.map((err, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Iconify
                      icon="solar:danger-triangle-bold"
                      sx={{
                        color:
                          severity === "error" ? "error.main" : "warning.main",
                        fontSize: 16,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2">{err}</Typography>}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Stack>
      </Alert>
    </Box>
  );
}
