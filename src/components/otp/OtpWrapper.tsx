import React, { useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  useColorScheme,
} from "@mui/material";

interface OtpWrapperProps {
  children: React.ReactNode;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const OtpWrapper: React.FC<OtpWrapperProps> = ({
  children,
  label = "Código de Verificação",
  error = false,
  helperText,
  disabled = false,
  required = false,
  focused: controlledFocused,
  onFocus,
  onBlur,
}) => {
  const theme = useTheme();
  const { mode } = useColorScheme();
  console.log(mode, theme.palette.mode, theme.vars?.palette);
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
  const getBorderColor = () => {
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
          borderColor: getBorderColor(),
          borderRadius: 1,
          backgroundColor: disabled
            ? theme.vars?.palette.action.disabledBackground
            : theme.vars?.palette.background.default,
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
              boxShadow: `0 0 0 1px ${alpha(
                theme.vars?.palette.primary.main,
                0.25
              )}`,
            }),

          // Box shadow de erro
          ...(error && {
            boxShadow: `0 0 0 1px ${alpha(
              theme.vars?.palette.error.main,
              0.25
            )}`,
          }),

          "&:hover": {
            borderColor: disabled
              ? theme.palette.action.disabled
              : error
              ? theme.palette.error.main
              : theme.palette.text.primary,
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
            backgroundColor: theme.palette.background.default,
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
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default OtpWrapper;
