"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FieldRenderer from "@/src/components/public/retreats/form/components/FieldRenderer";
import FormHeader from "@/src/components/public/retreats/form/components/FormHeader";
import FormNavigation from "@/src/components/public/retreats/form/components/FormNavigation";
import FormStepProgress from "@/src/components/public/retreats/form/components/FormStepProgress";
import StepSectionHeader from "@/src/components/public/retreats/form/components/StepSectionHeader";
import {
  buildZodSchema,
  defaultValues as baseDefaultValues,
  fetchFormData,
  sendFormData,
} from "@/src/components/public/retreats/form/shared";
import type {
  BackendField,
  BackendSection,
} from "@/src/components/public/retreats/form/types";
import { enqueueSnackbar } from "notistack";

const flattenSectionFields = (sections: BackendSection[]): BackendField[] => {
  const fields: BackendField[] = [];

  const visit = (field?: BackendField) => {
    if (!field || field.type === "section") {
      return;
    }

    fields.push(field);

    if (field.type === "switchExpansible" && Array.isArray(field.fields)) {
      field.fields.forEach((child) => visit(child));
    }
  };

  sections.forEach((section) => {
    section.fields.forEach((field) => visit(field));
  });

  return fields;
};

const buildInitialValues = (
  sections: BackendSection[],
  answers: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...answers };
  const fields = flattenSectionFields(sections);

  fields.forEach((field) => {
    const key = field.name;
    const hasAnswer =
      Object.prototype.hasOwnProperty.call(result, key) &&
      result[key] !== undefined;

    if (hasAnswer) {
      if (field.type === "photo") {
        const isMultiple = Boolean(
          (field as BackendField & { isMultiple?: boolean }).isMultiple ??
            field.multiple
        );
        const value = result[key];
        if (isMultiple) {
          result[key] = Array.isArray(value) ? value : [];
        } else {
          result[key] = value instanceof File ? value : null;
        }
      }

      if (field.maskType === "location") {
        const value = result[key];
        if (!value || typeof value !== "object") {
          result[key] = { stateShort: "", city: "" };
        }
      }

      return;
    }

    if (Object.prototype.hasOwnProperty.call(baseDefaultValues, key)) {
      result[key] = baseDefaultValues[key];
      return;
    }

    if (field.defaultValue !== undefined) {
      result[key] = field.defaultValue;
      return;
    }

    if (field.maskType === "location") {
      result[key] = { stateShort: "", city: "" };
      return;
    }

    switch (field.type) {
      case "checkbox":
      case "switch":
      case "switchExpansible":
        result[key] = false;
        return;
      case "multiselect":
      case "chips":
        result[key] = [];
        return;
      case "photo": {
        const isMultiple = Boolean(
          (field as BackendField & { isMultiple?: boolean }).isMultiple ??
            field.multiple
        );
        result[key] = isMultiple ? [] : null;
        return;
      }
      default:
        result[key] = "";
    }
  });

  return result;
};

const collectFieldsForValidation = (
  fields: BackendField[],
  values: Record<string, unknown>
): string[] => {
  const result: string[] = [];

  const visit = (field?: BackendField) => {
    if (!field || field.type === "section") {
      return;
    }

    if (
      field.dependsOn &&
      field.dependsValue !== undefined &&
      values[field.dependsOn] !== field.dependsValue
    ) {
      return;
    }

    result.push(field.name);

    if (
      field.type === "switchExpansible" &&
      Boolean(values[field.name]) &&
      Array.isArray(field.fields)
    ) {
      field.fields.forEach((child) => visit(child));
    }
  };

  fields.forEach((field) => visit(field));

  return result;
};

type ParticipantPublicFormTabProps = {
  retreatId: string;
};

const ParticipantPublicFormTabCreate: React.FC<
  ParticipantPublicFormTabProps
> = ({ retreatId }) => {
  const queryClient = useQueryClient();

  const {
    data: formData,
    isLoading: loadingForm,
    error: formError,
  } = useQuery({
    queryKey: ["participant-form-structure", retreatId],
    queryFn: () => fetchFormData(retreatId, "participate"),
    enabled: Boolean(retreatId),
    staleTime: 5 * 60 * 1000,
  });

  const schema = useMemo(
    () => buildZodSchema(formData?.sections ?? []),
    [formData?.sections]
  );

  const steps = useMemo(() => {
    if (!formData?.sections) {
      return [] as BackendSection[];
    }

    const result: BackendSection[] = [];

    formData.sections.forEach((section) => {
      if (!section) return;

      const current = result[result.length - 1];
      if (current && current.fields.length <= 3 && section.fields.length <= 3) {
        current.fields = [...current.fields, ...section.fields];
        current.title = `${current.title} / ${section.title}`;
        if (section.description) {
          current.description = [current.description, section.description]
            .filter(Boolean)
            .join(" \u2022 ");
        }
        return;
      }

      result.push({ ...section, fields: [...section.fields] });
    });

    return result;
  }, [formData?.sections]);

  const totalSteps = steps.length || 1;
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidatingStep, setIsValidatingStep] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onBlur",
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      sendFormData(retreatId, payload, "participate"),
    onSuccess: () => {
      enqueueSnackbar("Participante criado com sucesso!", {
        variant: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["NonContemplated", retreatId],
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar o participante.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  useEffect(() => {
    setCurrentStep(0);
  }, [retreatId, formData?.sections?.length]);

  useEffect(() => {
    if (!formData) {
      return;
    }

    const initialValues = buildInitialValues(formData.sections ?? [], {});
    reset(initialValues, { keepDirty: false, keepValues: false });
  }, [formData, reset]);

  const values = watch();
  const submitting = isSubmitting || mutation.isPending;

  const handleNext = async () => {
    if (submitting || isValidatingStep) {
      return;
    }

    setIsValidatingStep(true);

    try {
      const fieldsToValidate = collectFieldsForValidation(
        steps[currentStep]?.fields ?? [],
        values
      );
      const isValid = await trigger(fieldsToValidate as string[]);
      if (isValid) {
        setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
      }
    } finally {
      setIsValidatingStep(false);
    }
  };

  const handleBack = () => {
    if (submitting) {
      return;
    }
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onSubmit: SubmitHandler<Record<string, unknown>> = async (
    data,
    event
  ) => {
    if (currentStep < totalSteps - 1) {
      event?.preventDefault();
      await handleNext();
      return;
    }

    if (!formData) {
      return;
    }

    await mutation.mutateAsync(data);
  };

  const submitForm = () => handleSubmit(onSubmit)();

  const renderField = (field: BackendField): React.ReactNode => {
    if (!field || field.type === "section") {
      return null;
    }

    if (
      field.dependsOn &&
      field.dependsValue !== undefined &&
      values[field.dependsOn] !== field.dependsValue
    ) {
      return null;
    }

    const error = errors[field.name]?.message as string | undefined;
    const helperText =
      error || field.helperTextContent || field.description || undefined;

    if (field.type === "switchExpansible") {
      const isActive = Boolean(values[field.name]);
      const hasChildren =
        Array.isArray(field.fields) && field.fields.length > 0;

      return (
        <Stack key={field.id ?? field.name} spacing={1.5}>
          <FieldRenderer
            field={field}
            control={control}
            helperText={helperText}
            error={error}
            isSubmitting={submitting}
            retreatId={retreatId}
          />
          {isActive && hasChildren && (
            <Stack
              spacing={1.5}
              sx={{
                pl: { xs: 2, sm: 3 },
                borderLeft: (theme) => `2px solid ${theme.palette.divider}`,
              }}
            >
              {field.fields?.map((child) => renderField(child))}
            </Stack>
          )}
        </Stack>
      );
    }

    return (
      <FieldRenderer
        key={field.id ?? field.name}
        field={field}
        control={control}
        helperText={helperText}
        error={error}
        isSubmitting={submitting}
        retreatId={retreatId}
      />
    );
  };

  if (loadingForm) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ py: 6 }}
        spacing={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Carregando formulário...
        </Typography>
      </Stack>
    );
  }

  if (formError) {
    const errorMessage =
      formError instanceof Error
        ? formError.message
        : "Não foi possível carregar o formulário.";

    return <Alert severity="error">{errorMessage}</Alert>;
  }

  if (!formData) {
    return (
      <Alert severity="info">Não foi possível carregar o formulário.</Alert>
    );
  }

  const activeStep = steps[currentStep];

  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submitForm();
      }}
      sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}
    >
      <Stack spacing={3}>
        <FormHeader
          title={formData.title}
          subtitle={formData.subtitle}
          description={formData.description}
        />

        <FormStepProgress steps={steps} currentStep={currentStep} />

        {activeStep ? (
          <>
            <StepSectionHeader step={activeStep} />
            <Stack spacing={2}>
              {activeStep.fields.map((field) => renderField(field))}
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum campo disponível neste formulário.
          </Typography>
        )}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSubmitting={submitting}
          onNext={handleNext}
          onBack={handleBack}
          submitLabel="Criar Participante"
          disableSubmit={!isDirty}
          onSubmit={submitForm}
        />
      </Stack>
    </Box>
  );
};

export default ParticipantPublicFormTabCreate;
