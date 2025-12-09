import { BackendForm, BackendOption, BackendSection } from "./types";
import z from "zod";

import type { BackendField } from "./types";
import apiClient from "@/src/lib/axiosClientInstance";
import {
  // sections2,
  sections3,
  sectionsServe,
} from "@/src/mocks/handlerData/formData";
import { Retreat } from "@/src/types/retreats";
import { validateCPF } from "@/src/utils/validateCPF";

const MASK_REGEX: Record<string, RegExp> = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  // phone: /^\+\d{2} \(\d{2}\) \d{5}-\d{4}$/, // aceita formato +55 (11) 99999-9999
  phone: /^\d{10,11}$/, // aceita de 10 a 11 números
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
  type: "participate" | "serve"
): Promise<BackendForm> => {
  try {
    const result = await apiClient.get<Retreat>(`/retreats/${retreatId}`);

    const retreat = result.data;

    return {
      id: `retreat-${retreatId}-participant-form`,
      title: retreat.name,
      description:
        type === RetreatFormType.PARTICIPATE
          ? "Preencha seus dados para participar do retiro"
          : RetreatFormType.SERVER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections:
        type === RetreatFormType.PARTICIPATE ? sections3 : sectionsServe,
    } as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    throw error;
  }
};

export const sendFormData = async (
  retreatId: string,
  body: Record<string, unknown>,
  type: string
): Promise<{ registrationId?: string }> => {
  try {
    // Transforma o payload para o formato esperado pela API
    const transformedBody =
      type === RetreatFormType.PARTICIPATE
        ? buildParticipationPayload(body, retreatId)
        : buildServePayload(body, retreatId);

    const url =
      type === RetreatFormType.PARTICIPATE
        ? "/Registrations"
        : `/retreats/${retreatId}/service/registrations`;

    const response = await apiClient.post<{ registrationId?: string }>(
      url,
      transformedBody
    );

    if (response.data) {
      return response.data;
    }
    return {};
  } catch (error) {
    console.error("Erro ao enviar dados do formulario:", error);

    // Tenta extrair mensagem de erro clara
    if (error instanceof Error) {
      // Se é um AxiosError, tenta extrair a mensagem da resposta
      const axiosError = error as unknown as Record<string, unknown>;
      const response = axiosError?.response as
        | Record<string, unknown>
        | undefined;
      if (response?.data && typeof response.data === "object") {
        const data = response.data as Record<string, unknown>;
        if (data.message && typeof data.message === "string") {
          throw new Error(data.message);
        }
        if (data.error && typeof data.error === "string") {
          throw new Error(data.error);
        }
      }
      throw error;
    }

    throw new Error("Erro desconhecido ao enviar inscrição");
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

// Valores de teste para preencher o formulário automaticamente (DEV ONLY)
export const testDefaultValues: Record<string, unknown> = {
  // Dados pessoais
  nameSpecial: { value: "Roger Guedes" },
  cpfSpecial: { value: "534.534.534-53" },
  birthDateSpecial: "1997-08-08",
  genderSpecial: "Male",
  maritalStatusSpecial: "Single",
  professionSpecial: "Desenvolvedor",
  pregnancySpecial: "None",
  weightKgSpecial: "70",
  heightCmSpecial: "175",
  shirtSizeSpecial: "M",
  religionSpecial: "Catholic",

  // Endereço
  streetAndNumberSpecial: "Rua das Flores, 123",
  neighborhoodSpecial: "Centro",
  citySpecial: "Lages",
  stateSpecial: "SC",
  locationSpecial: { stateShort: "SC", city: "Lages" },

  // Contato
  emailSpecial: { value: "roger.guedes@teste.com" },
  phoneSpecial: "48999999999",
  whatsappSpecial: "48999999999",
  neighborPhoneSpecial: "48888888888",
  relativePhoneSpecial: "48777777777",
  facebookUsernameSpecial: "roger.guedes",
  instagramHandleSpecial: "@roger.guedes",

  // Família
  fatherStatusSwitchSpecial: true,
  fatherStatusSpecial: "Alive",
  fatherNameSpecial: "José Guedes",
  motherStatusSwitchSpecial: true,
  motherStatusSpecial: "Alive",
  motherNameSpecial: "Maria Guedes",
  hadFamilyLossLast6MonthsSpecial: false,
  hasRelativeOrFriendSubmittedSpecial: false,

  // Histórico
  previousUncalledApplicationsSpecial: "None",
  rahaminVidaCompletedSpecial: "None",

  // Saúde
  alcoholUseSpecial: "None",
  usesDrugsSpecial: false,
  hasAllergiesSpecial: false,
  hasMedicalRestrictionSpecial: false,
  takesMedicationSpecial: false,

  // Termos
  termsAcceptedSpecial: true,
  marketingOptInSpecial: true,
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

  if (field.type === "select") {
    const selectValueSchema = z.union([z.string(), z.number()]);

    if (required) {
      return selectValueSchema.refine((value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return true;
      }, "Selecione uma opção");
    }

    return z
      .union([selectValueSchema, z.literal(""), z.null(), z.undefined()])
      .transform((value) => {
        if (value === "" || value === null || value === undefined) {
          return undefined;
        }
        return value;
      });
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

  if (
    // field.specialType === "cpf" ||
    maskType === "cpf" ||
    field.maskType === "cpf"
  ) {
    baseSchema = baseSchema.refine(validateCPF, {
      message: "CPF inválido",
    });
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
  type: "participate" | "serve";
}

const RetreatFormType = {
  PARTICIPATE: "participate",
  SERVER: "serve",
};

/**
 * Transforma os dados do formulário para o formato esperado pela API
 * Converte campos simples em objetos com { value: ... }
 */
const buildParticipationPayload = (
  formData: Record<string, unknown>,
  retreatId: string
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    retreatId,
  };

  Object.entries(formData).forEach(([key, value]) => {
    // Campos que precisam ser convertidos para { value: ... }
    const fieldsWithValue = ["name", "cpf", "email"];

    if (
      fieldsWithValue.includes(key) &&
      value !== null &&
      value !== undefined
    ) {
      payload[key] = { value };
    } else {
      // Outros campos mantêm o valor original
      payload[key] = value;
    }
  });

  // Gera a data de hoje no formato YYYY-MM-DD
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const termsVersion = `${year}-${month}-${day}`;

  return { termsVersion, ...payload };
};

/**
 * Transforma os dados do formulário de serviço para o formato esperado pela API
 * Converte campos simples em objetos com { value: ... }
 * Mapeia campos "Special" (nameSpecial, emailSpecial, phoneSpecial) para seus nomes reais
 */
const buildServePayload = (
  formData: Record<string, unknown>,
  retreatId: string
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    retreatId,
  };

  // Mapa de campos especiais para seus nomes reais
  const specialFieldMap: Record<string, string> = {
    nameSpecial: "name",
    emailSpecial: "email",
    phoneSpecial: "phone",
  };

  // Campos que precisam ser convertidos para { value: ... }
  const fieldsWithValue = ["name", "cpf", "email"];

  Object.entries(formData).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    // Mapear campo especial para seu nome real
    const mappedKey = specialFieldMap[key] || key;

    // Se é um campo que precisa de { value: ... }
    if (fieldsWithValue.includes(mappedKey)) {
      payload[mappedKey] = { value };
    } else {
      // Outros campos mantêm o valor original
      payload[mappedKey] = value;
    }
  });

  return payload;
};
