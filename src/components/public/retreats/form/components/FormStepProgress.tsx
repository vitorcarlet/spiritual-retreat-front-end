"use client";

import React from "react";
import { Box, Stepper, Step, StepLabel, LinearProgress } from "@mui/material";

import type { BackendSection } from "../types";

type FormStepProgressProps = {
  steps: BackendSection[];
  currentStep: number;
};

const FormStepProgress: React.FC<FormStepProgressProps> = ({
  steps,
  currentStep,
}) => {
  const totalSteps = steps.length;

  if (totalSteps <= 1) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.id ?? index}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <LinearProgress
        variant="determinate"
        value={((currentStep + 1) / totalSteps) * 100}
        sx={{ mt: 1 }}
      />
    </Box>
  );
};

export default FormStepProgress;
