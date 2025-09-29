"use client";

import React from "react";
import { Box, Button } from "@mui/material";

type FormNavigationProps = {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onNext: () => void;
  onBack: () => void;
  submitLabel?: string;
};

const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onNext,
  onBack,
  submitLabel,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <Box display="flex" gap={2} justifyContent="space-between" pt={2}>
      <Button
        variant="outlined"
        color="inherit"
        disabled={isFirstStep || isSubmitting}
        onClick={onBack}
      >
        Voltar
      </Button>
      {isLastStep ? (
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : submitLabel || "Enviar inscrição"}
        </Button>
      ) : (
        <Button variant="contained" onClick={onNext} disabled={isSubmitting}>
          Próximo
        </Button>
      )}
    </Box>
  );
};

export default FormNavigation;
