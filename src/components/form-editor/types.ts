import { z } from "zod";

// Basic field types supported by the editor
export type BaseFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "date"
  | "checkbox"
  | "radio"
  | "color"
  | "email"
  | "phone"
  | "list";

export interface OptionItem {
  id: string;
  label: string;
  value: string;
}

export interface BaseFieldDefinition {
  id: string; // stable unique id
  name: string; // form field name
  label: string;
  type: BaseFieldType;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  options?: OptionItem[]; // for select / radio
  defaultValue?: unknown;
  // layout
  grid?: number; // 12-grid width
}

export type FieldDefinition = BaseFieldDefinition;

export interface FormSchemaDefinition {
  id: string;
  title: string;
  description?: string;
  fields: FieldDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormEditorState {
  schema: FormSchemaDefinition;
  selectedFieldId?: string;
  dirty: boolean;
}

export type FormEditorAction =
  | { type: "SET_SCHEMA"; schema: FormSchemaDefinition }
  | { type: "ADD_FIELD"; field: FieldDefinition }
  | { type: "UPDATE_FIELD"; fieldId: string; patch: Partial<FieldDefinition> }
  | { type: "REMOVE_FIELD"; fieldId: string }
  | { type: "REORDER_FIELDS"; from: number; to: number }
  | { type: "SELECT_FIELD"; fieldId?: string }
  | {
      type: "UPDATE_SCHEMA_META";
      patch: Partial<Pick<FormSchemaDefinition, "title" | "description">>;
    }
  | { type: "MARK_CLEAN" };

export const formSchemaZod = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        label: z.string().min(1),
        type: z.string(),
        required: z.boolean().optional(),
        helperText: z.string().optional(),
        placeholder: z.string().optional(),
        options: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              value: z.string(),
            })
          )
          .optional(),
        defaultValue: z.any().optional(),
        grid: z.number().min(1).max(12).optional(),
      })
    )
    .default([]),
});

export type FormSchemaZod = z.infer<typeof formSchemaZod>;
