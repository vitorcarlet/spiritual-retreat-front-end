import React, { useState } from "react";
import { Box, Typography, useTheme, Theme } from "@mui/material";
import { FieldError } from "react-hook-form";

interface OtpWrapperProps {
  children: React.ReactNode;
  label?: string;
  error?: FieldError;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// @TODO: DEIXAR MAIS PARECIDO COM O MUI
const OtpWrapper: React.FC<OtpWrapperProps> = ({
  children,
  label = "Código de Verificação",
  error,
  helperText,
  disabled = false,
  required = false,
  focused: controlledFocused,
  onFocus,
  onBlur,
}) => {
  const theme = useTheme();
  //const { mode } = useColorScheme();
  console.log(error, "Error in OtpWrapper");
  const [internalFocused, setInternalFocused] = useState(false);

  // Use controlled focused if provided, otherwise use internal state
  const isFocused =
    controlledFocused !== undefined ? controlledFocused : internalFocused;

  const handleFocus = () => {
    if (!disabled) {
      setInternalFocused(true);
      onFocus?.();
    }
  };

  const handleBlur = () => {
    setInternalFocused(false);
    onBlur?.();
  };

  // Determinar cor da borda
  const getBorderColor = (theme: Theme) => {
    if (error) return theme.vars?.palette.error.main;
    if (isFocused) return theme.vars?.palette.primary.main;
    if (disabled) return theme.vars?.palette.action.disabled;
    return theme.vars?.palette.grey[400];
  };

  // Determinar cor do label
  const getLabelColor = () => {
    if (error) return theme.vars?.palette.error.main;
    if (isFocused) return theme.vars?.palette.primary.main;
    if (disabled) return theme.vars?.palette.text.disabled;
    return theme.palette.text.secondary;
  };

  return (
    <Box sx={{ width: "100%", mb: helperText ? 0 : 2 }}>
      {/* Container principal */}
      <Box
        onFocus={handleFocus}
        onBlur={handleBlur}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 56,
          padding: "0 14px",
          border: `${isFocused ? 2 : 1}px solid`,
          borderColor: (theme) => getBorderColor(theme),
          borderRadius: 1,
          backgroundColor: disabled
            ? theme.vars?.palette.action.disabledBackground
            : theme.vars?.palette.background.paper,
          cursor: disabled ? "not-allowed" : "text",
          transition: theme.transitions.create(
            ["border-color", "background-color", "box-shadow"],
            {
              duration: theme.transitions.duration.short,
            }
          ),

          // Box shadow quando focado
          ...(isFocused &&
            !error && {
              boxShadow: `0 0 0 1px color-mix(in srgb, var(--mui-palette-error-main) 25%, transparent)`,
            }),

          // Box shadow de erro
          ...(error && {
            boxShadow: `0 0 0 1px color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)`,
          }),

          "&:hover": {
            borderColor: disabled
              ? theme.vars?.palette.text.primary
              : error
              ? theme.vars?.palette.error.main
              : theme.vars?.palette.text.primary,
          },
        }}
      >
        {/* Label flutuante */}
        <Typography
          component="label"
          sx={{
            position: "absolute",
            top: -8,
            left: 12,
            backgroundColor: theme.vars?.palette.background.paper,
            padding: "0 4px",
            fontSize: 12,
            fontWeight: 400,
            color: getLabelColor(),
            transition: theme.transitions.create(["color"], {
              duration: theme.transitions.duration.short,
            }),
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {label}
          {required && (
            <span style={{ color: theme.palette.error.main }}> *</span>
          )}
        </Typography>

        {/* Conteúdo (inputs OTP) */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            "& input": {
              border: "none !important",
              outline: "none !important",
              backgroundColor: "transparent !important",
              boxShadow: "none !important",
            },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Helper text */}
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            mx: 1.75,
            color: error
              ? theme.palette.error.main
              : theme.palette.text.secondary,
            fontSize: 12,
            lineHeight: 1.33,
          }}
        >
          {error?.message || helperText}
        </Typography>
      )}
    </Box>
  );
};

export default OtpWrapper;
