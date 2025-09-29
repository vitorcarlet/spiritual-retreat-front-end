"use client";

import React, { use, useMemo } from "react";
import { Box, Stack, Skeleton } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  fetchFormData,
  defaultValues as baseDefaultValues,
  buildZodSchema,
  PublicRetreatFormProps,
} from "./shared";
import type { BackendForm, BackendSection } from "./types";
import FormHeader from "./components/FormHeader";
import FormStepProgress from "./components/FormStepProgress";
import StepSectionHeader from "./components/StepSectionHeader";
import FormNavigation from "./components/FormNavigation";
import FieldRenderer from "./components/FieldRenderer";

const formCache = new Map<string, Promise<BackendForm>>();

const getFormPromise = (id: string) => {
  if (!formCache.has(id)) {
    formCache.set(id, fetchFormData(id));
  }
  return formCache.get(id)!;
};

const PublicRetreatForm: React.FC<PublicRetreatFormProps> = ({ id }) => {
  const form = use(getFormPromise(id));

  if (!form || !Array.isArray(form.sections)) {
    return <Skeleton />;
  }

  const schema = useMemo(() => buildZodSchema(form.sections), [form.sections]);

  const steps = useMemo(() => {
    const result: BackendSection[] = [];

    form.sections.forEach((section) => {
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
  }, [form.sections]);

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
      const accumulator = form.sections
        .flatMap((section) => section.fields)
        .reduce<Record<string, unknown>>((acc, field) => {
          if (field.type === "section") {
            return acc;
          }

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

          if (field.type === "checkbox" || field.type === "switch") {
            acc[field.name] = false;
            return acc;
          }

          if (
            field.type === "multiselect" ||
            field.type === "chips" ||
            field.type === "photo"
          ) {
            acc[field.name] = [];
            return acc;
          }

          if (field.type === "location") {
            acc[field.name] = { stateShort: "", city: "" };
            return acc;
          }

          acc[field.name] = "";
          return acc;
        }, {});

      return accumulator;
    }, [form.sections]),
    mode: "onBlur",
  });

  const values = watch();

  const onSubmit: SubmitHandler<Record<string, unknown>> = async (data) => {
    console.warn("Form submitted:", data);
  };

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep]?.fields ?? [];
    const valid = await trigger(
      fieldsToValidate.map((field) => field.name) as (keyof Record<
        string,
        unknown
      >)[]
    );
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
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

        {steps[currentStep]?.fields.map((field) => {
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

          return (
            <FieldRenderer
              key={field.name}
              field={field}
              control={control}
              helperText={helperText}
              error={error}
              isSubmitting={isSubmitting}
            />
          );
        })}

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
