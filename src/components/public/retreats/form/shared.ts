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

// const deriveEffectiveMaskType = (field: BackendField): string | undefined => {
//   const normalizedMask = field.maskType?.trim();
//   if (normalizedMask) {
//     return normalizedMask;
//   }

//   switch (field.type) {
//     case "email":
//       return "email";
//     case "phone":
//       return "phone";
//     case "number":
//       return "num";
//     case "date":
//       return "date";
//     case "datetime":
//       return "datetime";
//     default:
//       return undefined;
//   }
// };

// const parseNumericValue = (value: string, allowDecimal = false): number => {
//   if (allowDecimal) {
//     const normalized = value.replace(/\s+/g, "").replace(/,/g, ".");
//     return Number(normalized);
//   }
//   return Number(value.replace(/\s+/g, ""));
// };

// const applyNumericRangeValidation = (
//   schema: z.ZodString,
//   field: BackendField,
//   allowDecimal = false
// ) => {
//   const hasMin = typeof field.min === "number";
//   const hasMax = typeof field.max === "number";

//   if (!hasMin && !hasMax) {
//     return schema;
//   }

//   return schema.superRefine((value, ctx) => {
//     if (value === "") {
//       return;
//     }

//     const numericValue = parseNumericValue(value, allowDecimal);

//     if (Number.isNaN(numericValue)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Número inválido",
//       });
//       return;
//     }

//     if (hasMin && numericValue < (field.min as number)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: `Valor mínimo ${field.min}`,
//       });
//     }

//     if (hasMax && numericValue > (field.max as number)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: `Valor máximo ${field.max}`,
//       });
//     }
//   });
// };

// const buildCustomMaskRegex = (mask: string): RegExp | null => {
//   if (!mask) {
//     return null;
//   }

//   const escaped = mask
//     .split("")
//     .map((char) => {
//       if (char === "0") return "\\d";
//       if (/[-/\\^$*+?.()|[\]{}]/.test(char)) {
//         return `\\${char}`;
//       }
//       return char;
//     })
//     .join("");

//   try {
//     return new RegExp(`^${escaped}$`);
//   } catch (error) {
//     console.warn("Máscara personalizada inválida:", mask, error);
//     return null;
//   }
// };

// const applyMaskValidation = (schema: z.ZodString, field: BackendField) => {
//   const maskType = deriveEffectiveMaskType(field);

//   if (!maskType) {
//     return schema;
//   }

//   if (maskType === "email") {
//     return schema.email("Email inválido");
//   }

//   if (maskType === "date" || maskType === "datetime") {
//     const message =
//       maskType === "date" ? "Data inválida" : "Data e hora inválida";
//     return schema.refine(
//       (value) => value === "" || !Number.isNaN(Date.parse(value)),
//       message
//     );
//   }

//   if (maskType === "currency") {
//     const currencySchema = schema.regex(
//       /^\d+(\.\d{1,2})?$/,
//       "Valor monetário inválido"
//     );
//     return applyNumericRangeValidation(currencySchema, field, true);
//   }

//   if (maskType === "custom") {
//     if (field.customMask) {
//       const regex = buildCustomMaskRegex(field.customMask);
//       if (regex) {
//         return schema.regex(regex, "Formato inválido");
//       }
//     }
//     return schema;
//   }

//   const mappedRegex = MASK_REGEX[maskType];

//   if (mappedRegex) {
//     const feedbackMessages: Record<string, string> = {
//       cpf: "CPF inválido",
//       cnpj: "CNPJ inválido",
//       phone: "Telefone inválido",
//       cep: "CEP inválido",
//       num: "Número inválido",
//       city: "Cidade inválida",
//     };

//     const schemaWithRegex = schema.regex(
//       mappedRegex,
//       feedbackMessages[maskType] ?? "Formato inválido"
//     );

//     if (maskType === "num") {
//       return applyNumericRangeValidation(schemaWithRegex, field);
//     }

//     return schemaWithRegex;
//   }

//   return schema;
// };

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

function getEffectiveMask(field: BackendField): string | undefined {
  if (field.maskType) return field.maskType;
  if (field.type === "email") return "email";
  if (field.type === "phone") return "phone";
  if (field.type === "date") return "date";
  return undefined;
}

function toNumber(val: unknown): number | undefined {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val.replace(/[^\d.-]/g, ""));
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function buildCustomMaskRegex(pattern: string): RegExp | null {
  try {
    const regexStr = pattern.replace(/0/g, "\\d").replace(/a/g, "[a-zA-Z]");
    return new RegExp(`^${regexStr}$`);
  } catch {
    return null;
  }
}

export function buildZodSchema(
  sections: BackendSection[]
): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.type === "section") return;

      // Handle location type
      if (field.maskType === "location") {
        const locationSchema = z.object({
          stateShort: z.string(),
          city: z.string(),
        });

        if (field.required) {
          shape[field.name] = locationSchema.refine(
            (data) => {
              const hasState = data.stateShort && data.stateShort.trim() !== "";
              const hasCity = data.city && data.city.trim() !== "";
              return hasState && hasCity;
            },
            {
              message: "Estado e cidade são obrigatórios",
            }
          );
        } else {
          shape[field.name] = locationSchema.optional();
        }
        return;
      }

      // Handle photo type
      if (field.type === "photo") {
        const isMultiple = Boolean(
          (field as BackendField & { isMultiple?: boolean }).isMultiple ??
            field.multiple
        );

        if (isMultiple) {
          const arraySchema = z.array(
            z.instanceof(File, { message: "Arquivo inválido" })
          );
          shape[field.name] = field.required
            ? arraySchema.min(1, "Selecione pelo menos uma imagem")
            : arraySchema.optional();
        } else {
          const fileSchema = z.instanceof(File, {
            message: "Arquivo inválido",
          });
          shape[field.name] = field.required
            ? fileSchema
            : z.union([fileSchema, z.null()]).optional();
        }
        return;
      }

      // Handle multiselect/chips
      if (field.type === "multiselect" || field.type === "chips") {
        const arraySchema = z.array(z.union([z.string(), z.number()]));

        shape[field.name] = field.required
          ? arraySchema.min(1, "Selecione pelo menos uma opção")
          : arraySchema.optional();
        return;
      }

      // Handle checkbox/switch
      if (field.type === "checkbox" || field.type === "switch") {
        const boolSchema = z.boolean();

        shape[field.name] = field.required
          ? boolSchema.refine((val) => val === true, {
              message: "Este campo é obrigatório",
            })
          : boolSchema.optional();
        return;
      }

      // Handle string-like inputs (text, email, phone, date, number, etc.)
      const maskType = getEffectiveMask(field);
      const isNumericField = field.type === "number" || maskType === "numeric";

      // Para campos numéricos, aceitar tanto string quanto number
      let baseSchema: z.ZodTypeAny;

      if (isNumericField) {
        // Campos numéricos: aceitar string ou number, converter para string internamente
        baseSchema = z.preprocess(
          (val) => {
            if (val === null || val === undefined || val === "") {
              return field.required ? undefined : "";
            }
            return String(val); // Converter para string sempre
          },
          field.required
            ? z.string().min(1, "Campo obrigatório")
            : z.string().optional()
        );
      } else {
        // Campos de texto normais
        if (!field.required) {
          baseSchema = z
            .union([z.string().min(1), z.literal("")])
            .transform((val) => (val === "" ? undefined : val))
            .optional();
        } else {
          baseSchema = z.string().min(1, "Campo obrigatório");
        }
      }

      // Apply length constraints
      if (field.minLength !== undefined || field.maxLength !== undefined) {
        const originalSchema = baseSchema;
        baseSchema = originalSchema.refine(
          (val) => {
            if (!val) return !field.required; // Se vazio, ok apenas se não obrigatório
            const strVal = String(val);
            if (
              field.minLength !== undefined &&
              strVal.length < field.minLength
            )
              return false;
            if (
              field.maxLength !== undefined &&
              strVal.length > field.maxLength
            )
              return false;
            return true;
          },
          {
            message: `Deve ter entre ${field.minLength ?? 0} e ${
              field.maxLength ?? "∞"
            } caracteres`,
          }
        );
      }

      // Apply mask validation (apenas para campos não-numéricos)
      if (maskType && !isNumericField) {
        const originalSchema = baseSchema;
        baseSchema = originalSchema.refine(
          (val) => {
            if (!val) return !field.required; // Se vazio, ok apenas se não obrigatório

            if (maskType === "custom" && field.customMask) {
              const customRegex = buildCustomMaskRegex(field.customMask);
              return customRegex ? customRegex.test(String(val)) : true;
            }

            const regex = MASK_REGEX[maskType];
            return regex ? regex.test(String(val)) : true;
          },
          {
            message:
              maskType === "custom" && field.customMask
                ? `Formato inválido: ${field.customMask}`
                : MASK_REGEX[maskType]
                ? `Formato inválido para ${maskType}`
                : "Formato inválido",
          }
        );
      }

      // Para campos numéricos, validar apenas os ranges (já está em formato string)
      if (isNumericField) {
        // Apply numeric constraints
        if (field.min !== undefined || field.max !== undefined) {
          baseSchema = baseSchema.refine(
            (val) => {
              if (val === undefined || val === "") return !field.required;
              const num = toNumber(String(val));
              if (num === undefined) return false;
              if (field.min !== undefined && num < field.min) return false;
              if (field.max !== undefined && num > field.max) return false;
              return true;
            },
            {
              message: `Valor deve estar entre ${field.min ?? "-∞"} e ${
                field.max ?? "∞"
              }`,
            }
          );
        }
      }

      shape[field.name] = baseSchema;
    });
  });

  return z.object(shape);
}
export interface PublicRetreatFormProps {
  id: string;
}
