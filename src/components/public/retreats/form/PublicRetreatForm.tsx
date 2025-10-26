"use client";

import React, { use, useMemo } from "react";
import {
  Box,
  Stack,
  Skeleton,
  Alert,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";

import {
  fetchFormData,
  defaultValues as baseDefaultValues,
  buildZodSchema,
  PublicRetreatFormProps,
  sendFormData,
} from "./shared";
import type { BackendForm, BackendSection, BackendField } from "./types";
import FormHeader from "./components/FormHeader";
import FormStepProgress from "./components/FormStepProgress";
import StepSectionHeader from "./components/StepSectionHeader";
import FormNavigation from "./components/FormNavigation";
import FieldRenderer from "./components/FieldRenderer";

const formCache = new Map<string, Promise<BackendForm>>();

const getFormPromise = (id: string, type: "participate" | "serve") => {
  if (!formCache.has(id)) {
    formCache.set(id, fetchFormData(id, type));
  }
  return formCache.get(id)!;
};

const flattenSectionFields = (sections: BackendSection[]): BackendField[] => {
  const result: BackendField[] = [];

  const visit = (field?: BackendField) => {
    if (!field || field.type === "section") return;

    result.push(field);

    if (field.type === "switchExpansible" && Array.isArray(field.fields)) {
      field.fields.forEach((child) => visit(child));
    }
  };

  sections.forEach((section) => {
    section.fields.forEach((field) => visit(field));
  });

  return result;
};

const collectFieldsForValidation = (
  fields: BackendField[],
  values: Record<string, unknown>
): string[] => {
  const result: string[] = [];

  const visit = (field?: BackendField) => {
    if (!field || field.type === "section") return;

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

const applySpecialFieldNaming = (
  sections: BackendSection[]
): BackendSection[] => {
  const renameField = (field: BackendField): BackendField => {
    if (!field || field.type === "section") {
      return field;
    }

    const specialName = field.specialType
      ? `${field.specialType}Special`
      : undefined;

    const renamedField: BackendField = {
      ...field,
      name: specialName ?? field.name,
    };

    if (
      renamedField.type === "switchExpansible" &&
      Array.isArray(renamedField.fields)
    ) {
      renamedField.fields = renamedField.fields.map((child) =>
        renameField(child)
      );
    }

    return renamedField;
  };

  return sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => renameField(field)),
  }));
};

const PublicRetreatForm: React.FC<PublicRetreatFormProps> = ({ id, type }) => {
  const form = use(getFormPromise(id, type));
  const [submittedData, setSubmittedData] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  if (!form || !Array.isArray(form.sections)) {
    return <Skeleton />;
  }

  const normalizedSections = useMemo(
    () => applySpecialFieldNaming(form.sections),
    [form.sections]
  );

  const schema = useMemo(
    () => buildZodSchema(normalizedSections),
    [normalizedSections]
  );

  const steps = useMemo(() => {
    const result: BackendSection[] = [];

    normalizedSections.forEach((section) => {
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
  }, [normalizedSections]);

  const totalSteps = steps.length || 1;
  const [currentStep, setCurrentStep] = React.useState(0);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => {
      const allFields = flattenSectionFields(normalizedSections);

      const accumulator = allFields.reduce<Record<string, unknown>>(
        (acc, field) => {
          if (
            Object.prototype.hasOwnProperty.call(baseDefaultValues, field.name)
          ) {
            acc[field.name] = baseDefaultValues[field.name];
            return acc;
          }

          if (field.defaultValue !== undefined) {
            acc[field.name] = field.defaultValue;
            return acc;
          }

          if (
            field.type === "checkbox" ||
            field.type === "switch" ||
            field.type === "switchExpansible"
          ) {
            acc[field.name] = false;
            return acc;
          }

          if (
            field.type === "multiselect" ||
            field.type === "chips" ||
            field.type === "photo"
          ) {
            if (field.type === "photo") {
              const photoIsMultiple = Boolean(
                (field as BackendField & { isMultiple?: boolean }).isMultiple ??
                  field.multiple
              );
              acc[field.name] = photoIsMultiple ? [] : null;
              return acc;
            }

            acc[field.name] = [];
            return acc;
          }

          if (field.type === "location") {
            acc[field.name] = { stateShort: "", city: "" };
            return acc;
          }

          acc[field.name] = "";
          return acc;
        },
        {}
      );

      return accumulator;
    }, [normalizedSections]),
    mode: "onBlur",
  });

  const values = watch();

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    try {
      await sendFormData(id, data, type);
      // Sucesso: armazena os dados e mostra tela de confirmação
      setSubmittedData(data);
      enqueueSnackbar("Inscrição enviada com sucesso!", {
        variant: "success",
        autoHideDuration: 4000,
      });
    } catch (error) {
      // Erro: mostra notificação
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao enviar inscrição. Tente novamente.";
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 6000,
      });
      console.error("Erro ao enviar formulário:", error);
    }
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
      error ||
      (field.helperText ? field.helperTextContent : undefined) ||
      field.description;

    if (field.type === "switchExpansible") {
      const isActive = Boolean(values[field.name]);
      const hasChildren =
        Array.isArray(field.fields) && field.fields.length > 0;

      return (
        <Stack key={field.name} spacing={1.5}>
          <FieldRenderer
            field={field}
            control={control}
            helperText={helperText}
            error={error}
            isSubmitting={isSubmitting}
            retreatId={id}
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
        key={field.name}
        field={field}
        control={control}
        helperText={helperText}
        error={error}
        isSubmitting={isSubmitting}
        retreatId={id}
      />
    );
  };

  const handleNext = async () => {
    const fieldsToValidate = collectFieldsForValidation(
      steps[currentStep]?.fields ?? [],
      values
    );
    const valid = await trigger(
      fieldsToValidate as (keyof Record<string, unknown>)[]
    );
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  // Tela de sucesso
  if (submittedData) {
    return (
      <Box sx={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
        <Alert severity="success" sx={{ mb: 3, fontSize: "1rem" }}>
          ✓ Inscrição confirmada com sucesso!
        </Alert>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Resumo da Inscrição
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {Object.entries(submittedData).map(([key, value]) => {
              // Pula campos vazios e nulos
              if (value === null || value === undefined || value === "") {
                return null;
              }

              // Formata a chave para exibição
              const displayKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .replace(/Special$/, "");

              // Formata o valor para exibição
              let displayValue: string;
              if (typeof value === "object") {
                displayValue = JSON.stringify(value, null, 2);
              } else if (typeof value === "boolean") {
                displayValue = value ? "Sim" : "Não";
              } else if (Array.isArray(value)) {
                displayValue = value.join(", ");
              } else {
                displayValue = String(value);
              }

              return (
                <Box
                  key={key}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: "background.default",
                    borderLeft: "4px solid #1976d2",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontWeight: "bold",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    {displayKey}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                    {displayValue}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          {/* <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => window.location.reload()}
            >
              Fazer Nova Inscrição
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </Stack> */}
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ width: "100%", margin: "0 auto", maxWidth: 720 }}
    >
      <FormStepProgress steps={steps} currentStep={currentStep} />

      <Stack spacing={3}>
        <FormHeader
          title={form.title}
          subtitle={form.subtitle}
          description={form.description}
        />
        <StepSectionHeader step={steps[currentStep]} />

        {steps[currentStep]?.fields.map((field) => renderField(field))}

        <FormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          isSubmitting={isSubmitting}
          onNext={handleNext}
          onBack={handleBack}
          submitLabel={form.submitLabel}
        />
      </Stack>
    </Box>
  );
};

export default PublicRetreatForm;

/* -------------------- Exemplo de uso -------------------- */
/*
const formDef: BackendForm = {
  id: "retreat-registration",
  title: "Inscrição no Retiro",
  subtitle: "Preencha seus dados",
  submitLabel: "Inscrever",
  fields: [
    { name: "sectionDados", type: "section", label: "Dados Pessoais" },
    { name: "fullName", label: "Nome completo", type: "text", required: true, maxLength: 120 },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "age", label: "Idade", type: "number", min: 0, max: 120 },
    { name: "gender", label: "Gênero", type: "radio", options: [
      { label: "Masculino", value: "M" }, { label: "Feminino", value: "F" }, { label: "Outro", value: "O" }
    ]},
    { name: "tshirt", label: "Tamanho Camisa", type: "select", required: true, options: [
      { label: "P", value: "P" }, { label: "M", value: "M" }, { label: "G", value: "G" }
    ]},
    { name: "hobbies", label: "Interesses", type: "chips", options: [
      { label: "Música", value: "musica" }, { label: "Esporte", value: "esporte" }, { label: "Leitura", value: "leitura" }
    ]},
    { name: "arrivalDate", label: "Data de Chegada", type: "date", required: true },
    { name: "needsAccommodation", label: "Precisa de alojamento?", type: "checkbox" },
    { name: "comments", label: "Observações", type: "textarea", maxLength: 500 },
    { name: "terms", label: "Aceito os termos", type: "checkbox", required: true },
  ]
};

<PublicRetreatForm
  form={formDef}
  onSubmit={async (data) => {
    console.log(data);
    // enviar ao backend
  }}
/>
*/
