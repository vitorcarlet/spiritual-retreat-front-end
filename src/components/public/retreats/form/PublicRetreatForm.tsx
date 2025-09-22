"use client";

import React, { use, useMemo } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  RadioGroup,
  Radio,
  Typography,
  Divider,
  Switch,
  Chip,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BackendForm, BackendSection } from "./types";
import { defaultValues, fetchFormData } from "./shared";

/* -------------------- Geração dinâmica do schema Zod -------------------- */
function buildZodSchema(sections: BackendSection[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  // Extrai todos os campos de todas as seções
  const allFields = sections.flatMap((section) => section.fields);

  allFields.forEach((f) => {
    let schema: z.ZodTypeAny;

    switch (f.type) {
      case "text":
      case "textarea":
        schema = z.string();
        if (f.minLength)
          schema = (schema as z.ZodString).min(
            f.minLength,
            `Mínimo ${f.minLength} caracteres`
          );
        if (f.maxLength)
          schema = (schema as z.ZodString).max(
            f.maxLength,
            `Máximo ${f.maxLength} caracteres`
          );
        if (f.pattern)
          schema = (schema as z.ZodString).regex(
            new RegExp(f.pattern),
            "Formato inválido"
          );
        break;
      case "email":
        schema = z.string().email("Email inválido");
        break;
      case "phone":
        schema = z
          .string()
          .min(8, "Telefone curto")
          .refine(
            (v) => /^[0-9()+\-\s]+$/.test(v),
            "Telefone contém caracteres inválidos"
          );
        break;
      case "number":
        schema = z.preprocess(
          (v) =>
            v === "" || v === null || v === undefined ? undefined : Number(v),
          z.number({
            invalid_type_error: "Número inválido",
          })
        );
        if (f.min !== undefined)
          schema = (schema as z.ZodNumber).min(f.min, `Mínimo ${f.min}`);
        if (f.max !== undefined)
          schema = (schema as z.ZodNumber).max(f.max, `Máximo ${f.max}`);
        break;
      case "select":
      case "radio":
        schema = z.union([z.string(), z.number()]); // Aceita ambos; pode restringir usando refine
        break;
      case "multiselect":
      case "chips":
        schema = z.array(z.union([z.string(), z.number()])).default([]);
        if (f.min)
          schema = (schema as z.ZodString).min(
            f.min,
            `Selecione pelo menos ${f.min}`
          );
        if (f.max)
          schema = (schema as z.ZodString).max(f.max, `Máximo ${f.max} itens`);
        break;
      case "checkbox":
      case "switch":
        schema = z.boolean();
        break;
      case "date":
      case "datetime":
        schema = z
          .string()
          .refine((v) => !v || !isNaN(Date.parse(v)), "Data inválida");
        break;
      default:
        schema = z.any();
    }

    if (!f.required) {
      schema = schema.optional();
    } else {
      // Ajusta mensagens obrigatórias
      schema = schema.refine(
        (v) =>
          !(
            v === undefined ||
            v === null ||
            (typeof v === "string" && v.trim() === "") ||
            (Array.isArray(v) && v.length === 0)
          ),
        f.label ? `${f.label} é obrigatório` : "Campo obrigatório"
      );
    }

    shape[f.name] = schema;
  });

  return z.object(shape);
}

/* -------------------- Props do componente principal -------------------- */
interface PublicRetreatFormProps {
  id: string;
}

const formCache = new Map<string, Promise<BackendForm | null>>();

/* -------------------- Componente -------------------- */
const PublicRetreatForm: React.FC<PublicRetreatFormProps> = ({ id }) => {
  const getFormData = (id: string) => {
    if (!formCache.has(id)) {
      formCache.set(id, fetchFormData(id));
    }
    return formCache.get(id)!;
  };
  const formPromise = getFormData(id);
  const form = use(formPromise);
  if (!form) return <Skeleton />;

  const schema = useMemo(() => buildZodSchema(form.sections), [form.sections]);

  // Build steps from sections (max 1 section per step or combine small sections)
  const steps = useMemo(() => {
    const _steps: BackendSection[] = [];

    // Each section becomes a step, but we can combine small sections
    for (const section of form.sections) {
      const fieldCount = section.fields.length;
      const lastStep = _steps[_steps.length - 1];

      // If current section has few fields and last step also has few fields, combine them
      if (fieldCount <= 3 && lastStep && lastStep.fields.length <= 3) {
        // Combine sections by merging fields
        lastStep.fields.push(...section.fields);
        lastStep.title += ` / ${section.title}`;
      } else {
        // Add as new step
        _steps.push(section);
      }
    }

    return _steps;
  }, [form.sections]);

  const [currentStep, setCurrentStep] = React.useState(0);
  const totalSteps = steps.length;

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: useMemo(() => {
      const allFields = form.sections.flatMap((section) => section.fields);
      return allFields.reduce<Record<string, unknown>>((acc, f) => {
        acc[f.name] =
          defaultValues?.[f.name] ??
          f.defaultValue ??
          (f.type === "checkbox" || f.type === "switch"
            ? false
            : f.type === "multiselect" || f.type === "chips"
              ? []
              : "");
        return acc;
      }, {});
    }, [form.sections]),
    mode: "onBlur",
  });

  const values = watch();

  const submit: SubmitHandler<Record<string, unknown>> = async (data) => {
    console.warn("Form submitted:", data);
    //if (onSubmit) await onSubmit(data);
  };

  // Validate current step before moving forward
  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields.map((f) => f.name);
    const valid = await trigger(
      fieldsToValidate as (keyof Record<string, unknown>)[]
    );
    if (!valid) return;
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  if (!form) {
    return <div>Carregando...</div>;
  }

  console.log(steps, form, "publicForm");

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(submit)}
      sx={{ width: "100%", margin: "0 auto", maxWidth: 720 }}
    >
      {totalSteps > 1 && (
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, i) => (
              <Step key={i}>
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
      )}
      <Stack spacing={3}>
        {(form.title || form.description) && (
          <Stack spacing={0.5}>
            {form.title && (
              <Typography variant="h5" fontWeight={600}>
                {form.title}
              </Typography>
            )}
            {form.description && (
              <Typography variant="body2" color="text.secondary">
                {form.description}
              </Typography>
            )}
          </Stack>
        )}

        {/* Current section title and description */}
        {steps[currentStep] && (
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={600}>
              {steps[currentStep].title}
            </Typography>
            {steps[currentStep].description && (
              <Typography variant="body2" color="text.secondary">
                {steps[currentStep].description}
              </Typography>
            )}
            <Divider />
          </Stack>
        )}

        {steps[currentStep]?.fields.map((field) => {
          // Dependência condicional
          if (
            field.dependsOn &&
            field.dependsValue !== undefined &&
            values[field.dependsOn] !== field.dependsValue
          ) {
            return null;
          }

          const commonError = errors[field.name]?.message as string | undefined;

          switch (field.type) {
            case "text":
            case "email":
            case "phone":
            case "number":
            case "date":
            case "datetime":
            case "textarea":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <TextField
                      {...rhf}
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : field.type === "datetime"
                              ? "datetime-local"
                              : "text"
                      }
                      label={field.label}
                      required={field.required}
                      placeholder={field.placeholder}
                      disabled={field.disabled || isSubmitting}
                      error={!!commonError}
                      helperText={
                        commonError || field.helperText || field.description
                      }
                      multiline={field.type === "textarea"}
                      minRows={field.type === "textarea" ? 3 : undefined}
                      fullWidth
                      inputProps={{
                        maxLength: field.maxLength,
                        min: field.min,
                        max: field.max,
                      }}
                      onChange={(e) => {
                        if (field.type === "number") {
                          rhf.onChange(
                            e.target.value === "" ? "" : Number(e.target.value)
                          );
                        } else {
                          rhf.onChange(e);
                        }
                      }}
                    />
                  )}
                />
              );

            case "select":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      fullWidth
                      error={!!commonError}
                      disabled={field.disabled || isSubmitting}
                    >
                      {field.label && <InputLabel>{field.label}</InputLabel>}
                      <Select
                        {...rhf}
                        label={field.label}
                        displayEmpty
                        renderValue={(val: unknown) => {
                          if (val === "" || val === undefined || val === null) {
                            return field.placeholder || "Selecionar";
                          }
                          return String(val);
                        }}
                      >
                        <MenuItem value="">
                          <em>{field.placeholder || "Selecionar"}</em>
                        </MenuItem>
                        {field.options?.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.value}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {commonError || field.description}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              );

            case "multiselect":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      fullWidth
                      error={!!commonError}
                      disabled={field.disabled || isSubmitting}
                    >
                      {field.label && <InputLabel>{field.label}</InputLabel>}
                      <Select
                        {...rhf}
                        label={field.label}
                        multiple
                        renderValue={(selected: unknown) => {
                          const arr = Array.isArray(selected)
                            ? (selected as (string | number)[])
                            : [];
                          return arr.length
                            ? arr.map((v) => String(v)).join(", ")
                            : field.placeholder || "Selecionar";
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          rhf.onChange(
                            typeof value === "string" ? value.split(",") : value
                          );
                        }}
                      >
                        {field.options?.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.value}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {commonError || field.description}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              );

            case "radio":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      error={!!commonError}
                      disabled={field.disabled || isSubmitting}
                    >
                      {field.label && (
                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 0.5 }}
                          fontWeight={500}
                        >
                          {field.label}
                          {field.required && " *"}
                        </Typography>
                      )}
                      <RadioGroup
                        {...rhf}
                        row
                        onChange={(e) => rhf.onChange(e.target.value)}
                      >
                        {field.options?.map((o) => (
                          <FormControlLabel
                            key={o.value}
                            value={o.value}
                            control={<Radio />}
                            label={o.value}
                          />
                        ))}
                      </RadioGroup>
                      <FormHelperText>
                        {commonError || field.description}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              );

            case "checkbox":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...rhf}
                          disabled={field.disabled || isSubmitting}
                          checked={!!rhf.value}
                          onChange={(e) => rhf.onChange(e.target.checked)}
                        />
                      }
                      label={
                        field.label +
                        (field.required ? " *" : "") +
                        (field.description ? ` — ${field.description}` : "")
                      }
                    />
                  )}
                />
              );

            case "switch":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...rhf}
                          disabled={field.disabled || isSubmitting}
                          checked={!!rhf.value}
                          onChange={(e) => rhf.onChange(e.target.checked)}
                        />
                      }
                      label={
                        field.label +
                        (field.required ? " *" : "") +
                        (field.description ? ` — ${field.description}` : "")
                      }
                    />
                  )}
                />
              );

            case "chips":
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => {
                    const rawVal = rhf.value;
                    const selected: (string | number)[] = Array.isArray(rawVal)
                      ? (rawVal as (string | number)[])
                      : [];
                    const toggle = (val: string | number) => {
                      if (selected.includes(val)) {
                        rhf.onChange(selected.filter((v) => v !== val));
                      } else {
                        rhf.onChange([...selected, val]);
                      }
                    };
                    return (
                      <Stack spacing={1}>
                        {field.label && (
                          <Typography variant="subtitle2" fontWeight={500}>
                            {field.label}
                            {field.required && " *"}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {field.options?.map((o) => {
                            const active = selected.includes(o.value);
                            return (
                              <Chip
                                key={o.value}
                                label={o.value}
                                color={active ? "primary" : "default"}
                                variant={active ? "filled" : "outlined"}
                                onClick={() => toggle(o.value)}
                                disabled={field.disabled || isSubmitting}
                              />
                            );
                          })}
                        </Box>
                        <Typography
                          variant="caption"
                          color={commonError ? "error" : "text.secondary"}
                        >
                          {commonError || field.description}
                        </Typography>
                      </Stack>
                    );
                  }}
                />
              );

            default:
              return null;
          }
        })}

        <Box display="flex" gap={2} justifyContent="space-between" pt={2}>
          <Button
            variant="outlined"
            color="inherit"
            disabled={currentStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            Voltar
          </Button>
          {currentStep < totalSteps - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Próximo
            </Button>
          ) : (
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Enviando..."
                : form.submitLabel || "Enviar inscrição"}
            </Button>
          )}
        </Box>
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
