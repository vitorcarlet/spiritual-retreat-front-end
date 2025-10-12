import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { BackendForm, BackendOption, BackendSection } from "./types";
import z from "zod";

import type { BackendField } from "./types";
import apiClient from "@/src/lib/axiosClientInstance";
import { sections, sectionsServe } from "@/src/mocks/handlerData/formData";
import { Retreat } from "@/src/types/retreats";

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
  retreatId: string,
  type: string
): Promise<BackendForm> => {
  try {
    const result = await apiClient.get<Retreat>(`/retreats/${retreatId}`);

    const retreat = result.data;

    return {
      id: `retreat-${retreatId}-participant-form`,
      title: retreat.title,
      description:
        type === RetreatFormType.PARTICIPATE
          ? "Preencha seus dados para participar do retiro"
          : RetreatFormType.SERVER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: type === RetreatFormType.PARTICIPATE ? sections : sectionsServe,
    } as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    throw error;
  }
};

export const sendFormData = async (
  retreatId: string,
  body: Record<string, unknown>
): Promise<BackendForm> => {
  try {
    const result = await handleApiResponse<BackendForm>(
      await sendRequestServerVanilla.post(
        `/Registrations`,
        {
          payload: {
            retreatId: retreatId,
            ...body,
          },
        },
        { requireAuth: false }
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

const buildFieldSchema = (
  field: BackendField,
  required: boolean
): z.ZodTypeAny => {
  if (field.maskType === "location") {
    const locationSchema = z.object({
      stateShort: z.string(),
      city: z.string(),
    });

    if (required) {
      return locationSchema.refine(
        (data) => {
          const hasState = data.stateShort && data.stateShort.trim() !== "";
          const hasCity = data.city && data.city.trim() !== "";
          return hasState && hasCity;
        },
        {
          message: "Estado e cidade são obrigatórios",
        }
      );
    }

    return locationSchema.optional();
  }

  if (field.type === "photo") {
    const isMultiple = Boolean(
      (field as BackendField & { isMultiple?: boolean }).isMultiple ??
        field.multiple
    );

    if (isMultiple) {
      const arraySchema = z.array(
        z.instanceof(File, { message: "Arquivo inválido" })
      );
      return required
        ? arraySchema.min(1, "Selecione pelo menos uma imagem")
        : arraySchema.optional();
    }

    const fileSchema = z.instanceof(File, {
      message: "Arquivo inválido",
    });

    return required ? fileSchema : z.union([fileSchema, z.null()]).optional();
  }

  if (field.type === "multiselect" || field.type === "chips") {
    const arraySchema = z.array(z.union([z.string(), z.number()]));

    return required
      ? arraySchema.min(1, "Selecione pelo menos uma opção")
      : arraySchema.optional();
  }

  if (
    field.type === "checkbox" ||
    field.type === "switch" ||
    field.type === "switchExpansible"
  ) {
    const boolSchema = z.boolean();

    return required
      ? boolSchema.refine((val) => val === true, {
          message: "Este campo é obrigatório",
        })
      : boolSchema.optional();
  }

  const maskType = getEffectiveMask(field);
  const isNumericField = field.type === "number" || maskType === "numeric";

  let baseSchema: z.ZodTypeAny;

  if (isNumericField) {
    baseSchema = z.preprocess(
      (val) => {
        if (val === null || val === undefined || val === "") {
          return required ? undefined : "";
        }
        return String(val);
      },
      required ? z.string().min(1, "Campo obrigatório") : z.string().optional()
    );
  } else {
    if (!required) {
      baseSchema = z
        .union([z.string().min(1), z.literal("")])
        .transform((val) => (val === "" ? undefined : val))
        .optional();
    } else {
      baseSchema = z.string().min(1, "Campo obrigatório");
    }
  }

  if (field.minLength !== undefined || field.maxLength !== undefined) {
    const min = field.minLength;
    const max = field.maxLength;
    baseSchema = baseSchema.refine(
      (val) => {
        if (!val) return !required;
        const strVal = String(val);
        if (min !== undefined && strVal.length < min) return false;
        if (max !== undefined && strVal.length > max) return false;
        return true;
      },
      {
        message: `Deve ter entre ${min ?? 0} e ${max ?? "∞"} caracteres`,
      }
    );
  }

  if (maskType && !isNumericField) {
    baseSchema = baseSchema.refine(
      (val) => {
        if (!val) return !required;

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

  if (isNumericField && (field.min !== undefined || field.max !== undefined)) {
    const min = field.min;
    const max = field.max;
    baseSchema = baseSchema.refine(
      (val) => {
        if (val === undefined || val === "") return !required;
        const num = toNumber(String(val));
        if (num === undefined) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
      },
      {
        message: `Valor deve estar entre ${min ?? "-∞"} e ${max ?? "∞"}`,
      }
    );
  }

  return baseSchema;
};

export function buildZodSchema(sections: BackendSection[]): z.ZodTypeAny {
  const shape: z.ZodRawShape = {};
  const conditionalRequirements: Array<{
    parentName: string;
    fieldName: string;
    schema: z.ZodTypeAny;
  }> = [];

  const processField = (
    field?: BackendField,
    controllingSwitchName?: string
  ) => {
    if (!field || field.type === "section") {
      return;
    }

    const hasControllingSwitch = Boolean(controllingSwitchName);
    const effectiveRequired = Boolean(field.required && !hasControllingSwitch);

    shape[field.name] = buildFieldSchema(field, effectiveRequired);

    if (hasControllingSwitch && field.required) {
      conditionalRequirements.push({
        parentName: controllingSwitchName!,
        fieldName: field.name,
        schema: buildFieldSchema(field, true),
      });
    }

    if (field.type === "switchExpansible" && Array.isArray(field.fields)) {
      field.fields.forEach((child) => processField(child, field.name));
    }
  };

  sections.forEach((section) => {
    section.fields.forEach((field) => processField(field));
  });

  const baseSchema = z.object(shape);

  if (!conditionalRequirements.length) {
    return baseSchema;
  }

  return baseSchema.superRefine((data, ctx) => {
    conditionalRequirements.forEach(({ parentName, fieldName, schema }) => {
      if (data[parentName] !== true) {
        return;
      }

      const parsed = schema.safeParse(data[fieldName]);

      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: [fieldName, ...issue.path],
          });
        });
      }
    });
  });
}
export interface PublicRetreatFormProps {
  id: string;
  type: string;
}

const RetreatFormType = {
  PARTICIPATE: "participate",
  SERVER: "serve",
};
