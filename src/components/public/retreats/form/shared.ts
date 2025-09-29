import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { BackendForm, BackendOption, BackendSection } from "./types";
import z from "zod";

import type { BackendField } from "./types";

const MASK_REGEX: Record<string, RegExp> = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  phone: /^\+\d{2} \(\d{2}\) \d{5}-\d{4}$/, // aceita formato +55 (11) 99999-9999
  cep: /^\d{5}-\d{3}$/,
  num: /^-?\d+$/, // aceita números negativos e positivos
  city: /^[a-zA-ZÀ-ÿ\s]+$/,
};

const deriveEffectiveMaskType = (field: BackendField): string | undefined => {
  const normalizedMask = field.maskType?.trim();
  if (normalizedMask) {
    return normalizedMask;
  }

  switch (field.type) {
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "number":
      return "num";
    case "date":
      return "date";
    case "datetime":
      return "datetime";
    default:
      return undefined;
  }
};

const parseNumericValue = (value: string, allowDecimal = false): number => {
  if (allowDecimal) {
    const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
    return Number(normalized);
  }
  return Number(value.replace(/\s+/g, ""));
};

const applyNumericRangeValidation = (
  schema: z.ZodString,
  field: BackendField,
  allowDecimal = false
) => {
  const hasMin = typeof field.min === "number";
  const hasMax = typeof field.max === "number";

  if (!hasMin && !hasMax) {
    return schema;
  }

  return schema.superRefine((value, ctx) => {
    if (value === "") {
      return;
    }

    const numericValue = parseNumericValue(value, allowDecimal);

    if (Number.isNaN(numericValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Número inválido",
      });
      return;
    }

    if (hasMin && numericValue < (field.min as number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Valor mínimo ${field.min}`,
      });
    }

    if (hasMax && numericValue > (field.max as number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Valor máximo ${field.max}`,
      });
    }
  });
};

const buildCustomMaskRegex = (mask: string): RegExp | null => {
  if (!mask) {
    return null;
  }

  const escaped = mask
    .split("")
    .map((char) => {
      if (char === "0") return "\\d";
      if (/[-/\\^$*+?.()|[\]{}]/.test(char)) {
        return `\\${char}`;
      }
      return char;
    })
    .join("");

  try {
    return new RegExp(`^${escaped}$`);
  } catch (error) {
    console.warn("Máscara personalizada inválida:", mask, error);
    return null;
  }
};

const applyMaskValidation = (schema: z.ZodString, field: BackendField) => {
  const maskType = deriveEffectiveMaskType(field);

  if (!maskType) {
    return schema;
  }

  if (maskType === "email") {
    return schema.email("Email inválido");
  }

  if (maskType === "date" || maskType === "datetime") {
    const message =
      maskType === "date" ? "Data inválida" : "Data e hora inválida";
    return schema.refine(
      (value) => value === "" || !Number.isNaN(Date.parse(value)),
      message
    );
  }

  if (maskType === "currency") {
    const currencySchema = schema.regex(
      /^\d+(\.\d{1,2})?$/,
      "Valor monetário inválido"
    );
    return applyNumericRangeValidation(currencySchema, field, true);
  }

  if (maskType === "custom") {
    if (field.customMask) {
      const regex = buildCustomMaskRegex(field.customMask);
      if (regex) {
        return schema.regex(regex, "Formato inválido");
      }
    }
    return schema;
  }

  const mappedRegex = MASK_REGEX[maskType];

  if (mappedRegex) {
    const feedbackMessages: Record<string, string> = {
      cpf: "CPF inválido",
      cnpj: "CNPJ inválido",
      phone: "Telefone inválido",
      cep: "CEP inválido",
      num: "Número inválido",
      city: "Cidade inválida",
    };

    const schemaWithRegex = schema.regex(
      mappedRegex,
      feedbackMessages[maskType] ?? "Formato inválido"
    );

    if (maskType === "num") {
      return applyNumericRangeValidation(schemaWithRegex, field);
    }

    return schemaWithRegex;
  }

  return schema;
};

export const fetchFormData = async (
  retreatId: string
): Promise<BackendForm> => {
  try {
    const result = await handleApiResponse<BackendForm>(
      await sendRequestServerVanilla.get(
        `/api/public/retreats/${retreatId}/form/participant`,
        {
          baseUrl: "http://localhost:3001", // URL do MSW
        }
      )
    );

    if (result.success && result.data) {
      return result.data as BackendForm;
    }
    return {} as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    return {} as BackendForm;
  }
};

export const defaultValues: Record<string, unknown> = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
};

export const getOptionLabel = (option?: BackendOption) => {
  if (!option) return "";
  const withLabel = option as BackendOption & {
    label?: string | number | undefined | null;
  };
  if (withLabel.label !== undefined && withLabel.label !== null) {
    return String(withLabel.label);
  }
  return String(option.value ?? "");
};

export const buildZodSchema = (sections: BackendSection[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "section") return;

      let schema: z.ZodTypeAny;
      let skipGenericRequiredCheck = false;

      switch (field.type) {
        case "text":
        case "textarea":
        case "email":
        case "phone":
        case "date":
        case "datetime":
        case "number": {
          let baseStringSchema = z.string();

          if (typeof field.minLength === "number") {
            baseStringSchema = baseStringSchema.min(
              field.minLength,
              `Mínimo de ${field.minLength} caracteres`
            );
          }

          if (typeof field.maxLength === "number") {
            baseStringSchema = baseStringSchema.max(
              field.maxLength,
              `Máximo de ${field.maxLength} caracteres`
            );
          }

          if (field.pattern) {
            baseStringSchema = baseStringSchema.regex(
              new RegExp(field.pattern),
              "Formato inválido"
            );
          }

          let stringSchema: z.ZodTypeAny = applyMaskValidation(
            baseStringSchema,
            field
          );

          if (field.required) {
            stringSchema = stringSchema.refine(
              (value) => {
                if (typeof value !== "string") return false;
                return value.trim() !== "";
              },
              {
                message: field.label
                  ? `${field.label} é obrigatório`
                  : "Campo obrigatório",
              }
            );
          }

          const normalizedSchema = field.required
            ? stringSchema
            : z.union([stringSchema, z.literal("")]).optional();

          let processedSchema: z.ZodTypeAny = z.preprocess((value) => {
            if (value === null || value === undefined) {
              return value;
            }
            if (typeof value === "number") {
              return String(value);
            }
            return value;
          }, normalizedSchema);

          const effectiveMask = deriveEffectiveMaskType(field);
          if (
            effectiveMask === "num" ||
            effectiveMask === "currency" ||
            field.type === "number"
          ) {
            processedSchema = processedSchema.transform((value) => {
              if (value === "" || value === undefined) {
                return value;
              }

              if (typeof value === "number") {
                return value;
              }

              if (typeof value === "string") {
                const numeric = parseNumericValue(
                  value,
                  effectiveMask === "currency"
                );
                return Number.isNaN(numeric) ? value : numeric;
              }

              return value;
            });
          }

          schema = processedSchema;
          break;
        }

        case "location": {
          const baseLocationSchema = z
            .object({
              stateShort: z.string().optional().nullable(),
              city: z.string().optional().nullable(),
            })
            .transform((value) => ({
              stateShort: (value.stateShort ?? "").trim(),
              city: (value.city ?? "").trim(),
            }));

          let locationSchema: z.ZodTypeAny = z.preprocess((input) => {
            if (input === undefined) {
              return undefined;
            }

            if (input === null) {
              return { stateShort: "", city: "" };
            }

            if (typeof input !== "object") {
              return input;
            }

            const raw = input as Record<string, unknown>;
            return {
              stateShort:
                typeof raw.stateShort === "string" ? raw.stateShort : "",
              city: typeof raw.city === "string" ? raw.city : "",
            };
          }, baseLocationSchema);

          if (field.required) {
            const requiredMessage = field.label
              ? `${field.label} é obrigatório`
              : "Campo obrigatório";

            locationSchema = locationSchema.superRefine((value, ctx) => {
              const stateFilled = value.stateShort.trim() !== "";
              const cityFilled = value.city.trim() !== "";

              if (!stateFilled) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Selecione um estado",
                  path: ["stateShort"],
                });
              }

              if (!cityFilled) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Selecione uma cidade",
                  path: ["city"],
                });
              }

              if (!stateFilled || !cityFilled) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: requiredMessage,
                });
              }
            });
          } else {
            locationSchema = locationSchema.optional();
          }

          schema = locationSchema;
          skipGenericRequiredCheck = true;
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

      if (!skipGenericRequiredCheck) {
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
      }

      shape[field.name] = schema;
    });
  });

  return z.object(shape);
};

export interface PublicRetreatFormProps {
  id: string;
}
