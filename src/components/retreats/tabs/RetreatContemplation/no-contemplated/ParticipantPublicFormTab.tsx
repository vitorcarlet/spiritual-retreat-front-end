"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
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
  fetchFormData,
  sendFormData,
} from "@/src/components/public/retreats/form/shared";
import type {
  BackendField,
  BackendSection,
} from "@/src/components/public/retreats/form/types";
import { enqueueSnackbar } from "notistack";
import apiClient from "@/src/lib/axiosClientInstance";

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
  participantId?: string;
  initialData?: Participant;
};

const ParticipantPublicFormTab: React.FC<ParticipantPublicFormTabProps> = ({
  retreatId,
  participantId,
  initialData,
}) => {
  const isEditMode = Boolean(participantId && initialData);
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

  // Mapeia dados do participante para valores do formulário
  const mapParticipantToFormValues = useCallback(
    (p: Participant): Record<string, unknown> => {
      return {
        name: p.name ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        cpf: p.cpf ?? "",
        city: p.city ?? "",
        gender: p.gender ?? "",
        birthDate: p.birthDate ?? "",
        // Personal
        maritalStatus: p.personal?.maritalStatus ?? "",
        pregnancy: p.personal?.pregnancy ?? "None",
        shirtSize: p.personal?.shirtSize ?? "",
        weightKg: String(p.personal?.weightKg ?? ""),
        heightCm: String(p.personal?.heightCm ?? ""),
        profession: p.personal?.profession ?? "",
        streetAndNumber: p.personal?.streetAndNumber ?? "",
        neighborhood: p.personal?.neighborhood ?? "",
        state: p.personal?.state ?? "",
        // Contacts
        whatsapp: p.contacts?.whatsapp ?? "",
        facebookUsername: p.contacts?.facebookUsername ?? "",
        instagramHandle: p.contacts?.instagramHandle ?? "",
        neighborPhone: p.contacts?.neighborPhone ?? "",
        relativePhone: p.contacts?.relativePhone ?? "",
        // Family Info
        fatherStatus: p.familyInfo?.fatherStatus ?? "",
        fatherName: p.familyInfo?.fatherName ?? "",
        fatherPhone: p.familyInfo?.fatherPhone ?? "",
        motherStatus: p.familyInfo?.motherStatus ?? "",
        motherName: p.familyInfo?.motherName ?? "",
        motherPhone: p.familyInfo?.motherPhone ?? "",
        hadFamilyLossLast6Months:
          p.familyInfo?.hadFamilyLossLast6Months ?? false,
        familyLossDetails: p.familyInfo?.familyLossDetails ?? "",
        hasRelativeOrFriendSubmitted:
          p.familyInfo?.hasRelativeOrFriendSubmitted ?? false,
        submitterRelationship: p.familyInfo?.submitterRelationship ?? "",
        submitterNames: p.familyInfo?.submitterNames ?? "",
        // Religion History
        religion: p.religionHistory?.religion ?? "",
        previousUncalledApplications:
          p.religionHistory?.previousUncalledApplications ?? "",
        rahaminVidaCompleted: p.religionHistory?.rahaminVidaCompleted ?? "",
        // Health
        alcoholUse: p.health?.alcoholUse ?? "None",
        smoker: p.health?.smoker ?? false,
        usesDrugs: p.health?.usesDrugs ?? false,
        drugUseFrequency: p.health?.drugUseFrequency ?? "",
        hasAllergies: p.health?.hasAllergies ?? false,
        allergiesDetails: p.health?.allergiesDetails ?? "",
        hasMedicalRestriction: p.health?.hasMedicalRestriction ?? false,
        medicalRestrictionDetails: p.health?.medicalRestrictionDetails ?? "",
        takesMedication: p.health?.takesMedication ?? false,
        medicationsDetails: p.health?.medicationsDetails ?? "",
        physicalLimitationDetails: p.health?.physicalLimitationDetails ?? "",
        recentSurgeryOrProcedureDetails:
          p.health?.recentSurgeryOrProcedureDetails ?? "",
        // Consents
        termsAccepted: p.consents?.termsAccepted ?? false,
        marketingOptIn: p.consents?.marketingOptIn ?? false,
      };
    },
    []
  );

  const defaultValues = useMemo(() => {
    if (isEditMode && initialData) {
      return mapParticipantToFormValues(initialData);
    }
    return {};
  }, [isEditMode, initialData, mapParticipantToFormValues]);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (isEditMode && initialData) {
      reset(mapParticipantToFormValues(initialData));
    }
  }, [isEditMode, initialData, reset, mapParticipantToFormValues]);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (isEditMode && participantId) {
        // Modo edição: atualiza o participante existente
        return apiClient.put(`/Registrations/${participantId}`, payload);
      }
      // Modo criação
      return sendFormData(retreatId, payload, "participate");
    },
    onSuccess: () => {
      enqueueSnackbar(
        isEditMode
          ? "Participante atualizado com sucesso!"
          : "Participante criado com sucesso!",
        { variant: "success" }
      );
      queryClient.invalidateQueries({
        queryKey: ["NonContemplated", retreatId],
      });
      if (isEditMode) {
        queryClient.invalidateQueries({
          queryKey: ["participant", participantId],
        });
      }
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

  const values = watch();
  const submitting = isSubmitting || mutation.isPending;

  const handleNext = async () => {
    if (submitting) {
      return;
    }

    const fieldsToValidate = collectFieldsForValidation(
      steps[currentStep]?.fields ?? [],
      values
    );
    const isValid = await trigger(fieldsToValidate as string[]);
    if (isValid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    if (submitting) {
      return;
    }
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const onSubmit: SubmitHandler<Record<string, unknown>> = async (data) => {
    if (!formData) {
      return;
    }

    await mutation.mutateAsync(data);
  };

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

  const submitButtonLabel = isEditMode
    ? submitting
      ? "Salvando..."
      : "Salvar Alterações"
    : submitting
      ? "Criando..."
      : "Criar Participante";

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}
    >
      <Stack spacing={3}>
        {!isEditMode && (
          <FormHeader
            title={formData.title}
            subtitle={formData.subtitle}
            description={formData.description}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={submitting || (!isEditMode && !isDirty)}
          sx={{ alignSelf: "flex-end" }}
        >
          {submitButtonLabel}
        </Button>

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
          submitLabel={submitButtonLabel}
          disableSubmit={!isEditMode && !isDirty}
        />
      </Stack>
    </Box>
  );
};

export default ParticipantPublicFormTab;
