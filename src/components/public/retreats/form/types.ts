export type BackendFieldType =
  | "text"
  | "email"
  | "number"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "textarea"
  | "date"
  | "datetime"
  | "phone"
  | "section"
  | "chips";

export interface BackendOption {
  label: string;
  value: string | number;
}

export interface BackendField {
  id?: string;
  name: string;
  label?: string;
  type: BackendFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: BackendOption[]; // select, radio, multiselect, chips
  defaultValue?: unknown;
  disabled?: boolean;
  multiple?: boolean; // multiselect
  dependsOn?: string; // nome de outro campo
  dependsValue?: unknown; // valor que habilita
}

export interface BackendForm {
  id: string;
  title?: string;
  subtitle?: string;
  fields: BackendField[];
  submitLabel?: string;
}
