export type BackendFieldType =
  | "text"
  | "email"
  | "number"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "switch"
  | "switchExpansible"
  | "textarea"
  | "date"
  | "datetime"
  | "phone"
  | "section"
  | "chips"
  | "photo"
  | "location";

export interface BackendOption {
  id: string;
  value: string | number;
  label?: string | number;
}

export interface BackendField {
  id: string;
  name: string;
  label?: string;
  type: BackendFieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: boolean;
  helperTextContent?: string;
  description?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  maskType?: string | null;
  customMask?: string | null;
  pattern?: string;
  options?: BackendOption[]; // select, radio, multiselect, chips
  defaultValue?: unknown;
  disabled?: boolean;
  multiple?: boolean; // multiselect
  isMultiple?: boolean; // photo / custom
  dependsOn?: string; // nome de outro campo
  dependsValue?: unknown; // valor que habilita
  grid?: number; // grid layout
  fields?: BackendField[]; // utilizado em campos compostos
}

export interface BackendSection {
  id: string;
  title: string;
  description?: string;
  collapsed?: boolean;
  fields: BackendField[];
}

export interface BackendForm {
  id: string;
  title?: string;
  description?: string;
  subtitle?: string;
  sections: BackendSection[];
  submitLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}
