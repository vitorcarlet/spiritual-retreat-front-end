import { z } from "zod";

// Basic field types supported by the editor
export const BASE_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "select",
  "date",
  "checkbox",
  "radio",
  "color",
  "email",
  "phone",
  "list",
  "chips",
  "switch",
  "photo",
  "location",
  "switchExpansible",
] as const;

export type BaseFieldType = typeof BASE_FIELD_TYPES[number];

export const SPECIAL_TEXT_FIELD_TYPES = [
  "name",
  "email",
  "phone",
  "profilePhoto",
] as const;

export const SPECIAL_SELECT_FIELD_TYPES = ["gender"] as const;

export type SpecialTextFieldType = typeof SPECIAL_TEXT_FIELD_TYPES[number];
export type SpecialSelectFieldType = typeof SPECIAL_SELECT_FIELD_TYPES[number];

export type SpecialFieldType = SpecialTextFieldType | SpecialSelectFieldType;

export const ALL_SPECIAL_FIELD_TYPES = [
  ...SPECIAL_TEXT_FIELD_TYPES,
  ...SPECIAL_SELECT_FIELD_TYPES,
] as const;

export interface OptionItem {
  id: string;
  value: string;
}

export interface SectionDefinition {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
  fields: FieldDefinition[];
}

export interface BaseFieldDefinition {
  id: string; // stable unique id
  name: string; // form field name
  label: string;
  type: BaseFieldType;
  mask?: boolean;
  required?: boolean;
  helperText?: boolean | null;
  helperTextContent?: string | null;
  //Fotos multiplas
  isMultiple?: boolean | null;
  placeholder?: string | null;
  maskType?: string | null;
  customMask?: string | null;
  options?: OptionItem[]; // for select / radio
  defaultValue?: unknown;
  // layout
  grid?: number; // 12-grid width
  multiple?: boolean | null;
  min?: number | null;
  max?: number | null;
  specialType?: SpecialFieldType | null;
}

export interface FieldDefinition extends BaseFieldDefinition {
  fields?: FieldDefinition[];
}

export interface FormSchemaDefinition {
  id: string;
  title: string;
  description?: string;
  sections: SectionDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormEditorState {
  schema: FormSchemaDefinition;
  selectedFieldId?: string;
  selectedSectionId?: string;
  dirty: boolean;
}

export type FormEditorAction =
  | { type: "SET_SCHEMA"; schema: FormSchemaDefinition }
  | { type: "ADD_SECTION"; section: SectionDefinition }
  | {
      type: "UPDATE_SECTION";
      sectionId: string;
      patch: Partial<SectionDefinition>;
    }
  | { type: "REMOVE_SECTION"; sectionId: string }
  | { type: "REORDER_SECTIONS"; from: number; to: number }
  | { type: "SELECT_SECTION"; sectionId?: string }
  | { type: "ADD_FIELD"; sectionId: string; field: FieldDefinition }
  | {
      type: "UPDATE_FIELD";
      sectionId: string;
      fieldId: string;
      patch: Partial<FieldDefinition>;
    }
  | { type: "REMOVE_FIELD"; sectionId: string; fieldId: string }
  | { type: "REORDER_FIELDS"; sectionId: string; from: number; to: number }
  | {
      type: "MOVE_FIELD";
      fromSectionId: string;
      toSectionId: string;
      fieldId: string;
    }
  | { type: "SELECT_FIELD"; fieldId?: string }
  | {
      type: "UPDATE_SCHEMA_META";
      patch: Partial<Pick<FormSchemaDefinition, "title" | "description">>;
    }
  | {
      type: "ADD_OPTION";
      sectionId: string;
      fieldId: string;
      option: OptionItem;
    }
  | {
      type: "UPDATE_OPTION";
      sectionId: string;
      fieldId: string;
      optionId: string;
      patch: Partial<OptionItem>;
    }
  | {
      type: "REMOVE_OPTION";
      sectionId: string;
      fieldId: string;
      optionId: string;
    }
  | {
      type: "REORDER_OPTIONS";
      sectionId: string;
      fieldId: string;
      from: number;
      to: number;
    }
  | { type: "MARK_CLEAN" };

const fieldSchema: z.ZodType<FieldDefinition> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(BASE_FIELD_TYPES),
    required: z.boolean().optional(),
    helperText: z.boolean().optional(),
    helperTextContent: z.string().optional(),
    placeholder: z.string().optional(),
    isMultiple: z.boolean().nullable().optional(),
    multiple: z.boolean().nullable().optional(),
    maskType: z.string().nullable().optional(),
    customMask: z.string().nullable().optional(),
    specialType: z.enum(ALL_SPECIAL_FIELD_TYPES).nullable().optional(),
    options: z
      .array(
        z.object({
          id: z.string(),
          value: z.string(),
          label: z.string().optional(),
        })
      )
      .optional(),
    defaultValue: z.any().optional(),
    grid: z.number().min(1).max(12).optional(),
    min: z.number().nullable().optional(),
    max: z.number().nullable().optional(),
    fields: z.array(fieldSchema).optional(),
  })
);

export const formSchemaZod = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        collapsed: z.boolean().optional(),
        fields: z.array(fieldSchema).default([]),
      })
    )
    .default([]),
});

export type FormSchemaZod = z.infer<typeof formSchemaZod>;
