"use client";

import React, { use, useMemo } from "react";
import {
  Box,
  Stack,
  Button,
  FormControlLabel,
  Checkbox,
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
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import SmartSelect from "./SmartSelect";
import SmartDateField from "./SmartDateField";
import TextFieldMasked, {
  MaskType,
} from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import { fetchFormData, defaultValues as baseDefaultValues } from "./shared";
import type { BackendForm, BackendSection, BackendOption } from "./types";

const getOptionLabel = (option?: BackendOption) => {
  if (!option) return "";
  const withLabel = option as BackendOption & {
    label?: string | number | undefined | null;
  };
  if (withLabel.label !== undefined && withLabel.label !== null) {
    return String(withLabel.label);
  }
  return String(option.value ?? "");
};

const buildZodSchema = (sections: BackendSection[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "section") return;

      let schema: z.ZodTypeAny;

      switch (field.type) {
        case "text":
        case "textarea":
        case "email":
        case "phone": {
          let stringSchema = z.string();
          if (typeof field.minLength === "number") {
            stringSchema = stringSchema.min(
              field.minLength,
              `Mínimo de ${field.minLength} caracteres`
            );
          }
          if (typeof field.maxLength === "number") {
            stringSchema = stringSchema.max(
              field.maxLength,
              `Máximo de ${field.maxLength} caracteres`
            );
          }
          if (field.pattern) {
            stringSchema = stringSchema.regex(
              new RegExp(field.pattern),
              "Formato inválido"
            );
          }
          if (field.type === "email") {
            stringSchema = stringSchema.email("Email inválido");
          }
          schema = stringSchema;
          break;
        }

        case "date":
        case "datetime": {
          schema = z
            .string()
            .refine(
              (value) => !value || !Number.isNaN(Date.parse(value)),
              "Data inválida"
            );
          break;
        }

        case "number": {
          let numberSchema = z.number({
            invalid_type_error: "Número inválido",
          });
          if (typeof field.min === "number") {
            numberSchema = numberSchema.min(
              field.min,
              `Valor mínimo ${field.min}`
            );
          }
          if (typeof field.max === "number") {
            numberSchema = numberSchema.max(
              field.max,
              `Valor máximo ${field.max}`
            );
          }

          schema = z.preprocess((value) => {
            if (value === "" || value === null || value === undefined) {
              return undefined;
            }
            if (typeof value === "string") {
              const parsed = Number(value);
              return Number.isNaN(parsed) ? value : parsed;
            }
            return value;
          }, numberSchema);
          break;
        }

        case "select":
        case "radio": {
          schema = z.preprocess(
            (value) =>
              value === "" || value === null || value === undefined
                ? undefined
                : value,
            z.union([z.string(), z.number()])
          );
          break;
        }

        case "multiselect":
        case "chips":
        case "photo": {
          let arraySchema = z.array(z.union([z.string(), z.number()]));
          if (typeof field.min === "number") {
            arraySchema = arraySchema.min(
              field.min,
              `Selecione pelo menos ${field.min}`
            );
          }
          if (typeof field.max === "number") {
            arraySchema = arraySchema.max(
              field.max,
              `Máximo ${field.max} itens`
            );
          }
          schema = arraySchema;
          break;
        }

        case "checkbox":
        case "switch": {
          schema = z.boolean();
          break;
        }

        default: {
          schema = z.any();
        }
      }

      if (!field.required) {
        schema = schema.optional();
      } else {
        const requiredMessage = field.label
          ? `${field.label} é obrigatório`
          : "Campo obrigatório";
        schema = schema.refine(
          (value) =>
            !(
              value === undefined ||
              value === null ||
              (typeof value === "string" && value.trim() === "") ||
              (Array.isArray(value) && value.length === 0)
            ),
          requiredMessage
        );
      }

      shape[field.name] = schema;
    });
  });

  return z.object(shape);
};

interface PublicRetreatFormProps {
  id: string;
}

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
      {totalSteps > 1 && (
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

          switch (field.type) {
            case "text":
            case "textarea":
            case "email":
            case "phone":
            case "number":
            case "datetime": {
              const deriveMask = (): {
                maskType?: MaskType;
                customMask?: string;
              } => {
                const raw = field.maskType ?? undefined;
                if (raw && raw !== "") {
                  if (raw === "custom") {
                    return field.customMask
                      ? { maskType: "custom", customMask: field.customMask }
                      : {};
                  }
                  return { maskType: raw as MaskType };
                }

                if (field.type === "phone") {
                  return { maskType: "phone" };
                }
                if (field.type === "number") {
                  return { maskType: "num" };
                }
                return {};
              };

              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => {
                    const { maskType, customMask } = deriveMask();
                    const hasMask = Boolean(maskType || customMask);

                    return (
                      <TextFieldMasked
                        {...rhf}
                        maskType={maskType}
                        customMask={customMask}
                        type={
                          hasMask
                            ? "text"
                            : field.type === "number"
                              ? "number"
                              : field.type === "datetime"
                                ? "datetime-local"
                                : "text"
                        }
                        label={field.label}
                        required={field.required}
                        placeholder={field.placeholder}
                        disabled={field.disabled || isSubmitting}
                        error={Boolean(error)}
                        helperText={helperText}
                        multiline={field.type === "textarea"}
                        minRows={field.type === "textarea" ? 3 : undefined}
                        fullWidth
                        inputProps={{
                          maxLength: field.maxLength,
                          min: field.min,
                          max: field.max,
                        }}
                        onChange={(event) => {
                          const target = event.target as HTMLInputElement;
                          const nextValue = target.value;

                          if (maskType === "currency") {
                            if (field.type === "number") {
                              rhf.onChange(
                                nextValue === "" ? "" : Number(nextValue)
                              );
                            } else {
                              rhf.onChange(nextValue);
                            }
                            return;
                          }

                          if (field.type === "number") {
                            rhf.onChange(
                              nextValue === "" ? "" : Number(nextValue)
                            );
                            return;
                          }

                          rhf.onChange(nextValue);
                        }}
                      />
                    );
                  }}
                />
              );
            }

            case "date": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <SmartDateField
                      label={field.label}
                      value={rhf.value as string | null | undefined}
                      onChange={(next) => rhf.onChange(next ?? "")}
                      placeholder={field.placeholder}
                      helperText={helperText}
                      error={Boolean(error)}
                      disabled={field.disabled || isSubmitting}
                      required={field.required}
                      onBlur={rhf.onBlur}
                    />
                  )}
                />
              );
            }

            case "select": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <SmartSelect
                      label={field.label}
                      placeholder={field.placeholder || "Selecionar"}
                      disabled={field.disabled || isSubmitting}
                      options={field.options}
                      value={
                        rhf.value === undefined ||
                        rhf.value === null ||
                        rhf.value === ""
                          ? null
                          : (rhf.value as string | number)
                      }
                      onChange={(value) => {
                        if (Array.isArray(value)) {
                          rhf.onChange(value.length ? value[0] : "");
                          return;
                        }
                        rhf.onChange(value ?? "");
                      }}
                      error={Boolean(error)}
                      helperText={helperText}
                      required={field.required}
                      onBlur={rhf.onBlur}
                    />
                  )}
                />
              );
            }

            case "multiselect": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <SmartSelect
                      multiple
                      label={field.label}
                      placeholder={field.placeholder || "Selecionar"}
                      disabled={field.disabled || isSubmitting}
                      options={field.options}
                      value={
                        Array.isArray(rhf.value)
                          ? (rhf.value as (string | number)[])
                          : []
                      }
                      onChange={(value) => {
                        if (Array.isArray(value)) {
                          rhf.onChange(value);
                          return;
                        }
                        if (value === null || value === undefined) {
                          rhf.onChange([]);
                          return;
                        }
                        rhf.onChange([value]);
                      }}
                      error={Boolean(error)}
                      helperText={helperText}
                      required={field.required}
                      onBlur={rhf.onBlur}
                    />
                  )}
                />
              );
            }

            case "radio": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      component="fieldset"
                      error={Boolean(error)}
                      disabled={field.disabled || isSubmitting}
                    >
                      {field.label && (
                        <Typography
                          variant="subtitle2"
                          fontWeight={500}
                          sx={{ mb: 0.5 }}
                        >
                          {field.label}
                          {field.required ? " *" : ""}
                        </Typography>
                      )}
                      <RadioGroup
                        {...rhf}
                        row
                        onChange={(event) => rhf.onChange(event.target.value)}
                      >
                        {field.options?.map((option) => (
                          <FormControlLabel
                            key={option.id ?? option.value}
                            value={option.value}
                            control={<Radio />}
                            label={getOptionLabel(option)}
                          />
                        ))}
                      </RadioGroup>
                      <FormHelperText>{helperText}</FormHelperText>
                    </FormControl>
                  )}
                />
              );
            }

            case "checkbox": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      component="fieldset"
                      error={Boolean(error)}
                      disabled={field.disabled || isSubmitting}
                      variant="standard"
                      sx={{ m: 0 }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...rhf}
                            checked={Boolean(rhf.value)}
                            onChange={(event) =>
                              rhf.onChange(event.target.checked)
                            }
                          />
                        }
                        label={[field.label, field.required ? "*" : null]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      {helperText && (
                        <FormHelperText>{helperText}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              );
            }

            case "switch": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => (
                    <FormControl
                      component="fieldset"
                      error={Boolean(error)}
                      disabled={field.disabled || isSubmitting}
                      variant="standard"
                      sx={{ m: 0 }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            {...rhf}
                            checked={Boolean(rhf.value)}
                            onChange={(event) =>
                              rhf.onChange(event.target.checked)
                            }
                          />
                        }
                        label={[field.label, field.required ? "*" : null]
                          .filter(Boolean)
                          .join(" ")}
                      />
                      {helperText && (
                        <FormHelperText>{helperText}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              );
            }

            case "chips":
            case "photo": {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: rhf }) => {
                    const selected = Array.isArray(rhf.value)
                      ? (rhf.value as (string | number)[])
                      : [];

                    const toggle = (value: string | number) => {
                      if (selected.includes(value)) {
                        rhf.onChange(selected.filter((item) => item !== value));
                      } else {
                        rhf.onChange([...selected, value]);
                      }
                    };

                    return (
                      <Stack spacing={1}>
                        {field.label && (
                          <Typography variant="subtitle2" fontWeight={500}>
                            {field.label}
                            {field.required ? " *" : ""}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          {field.options?.map((option) => {
                            const active = selected.includes(option.value);
                            return (
                              <Chip
                                key={option.id ?? option.value}
                                label={getOptionLabel(option)}
                                color={active ? "primary" : "default"}
                                variant={active ? "filled" : "outlined"}
                                onClick={() => toggle(option.value)}
                                disabled={field.disabled || isSubmitting}
                              />
                            );
                          })}
                        </Box>
                        <Typography
                          variant="caption"
                          color={error ? "error" : "text.secondary"}
                        >
                          {helperText}
                        </Typography>
                      </Stack>
                    );
                  }}
                />
              );
            }

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
