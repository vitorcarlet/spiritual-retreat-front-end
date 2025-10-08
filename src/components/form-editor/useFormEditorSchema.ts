import { useCallback, useReducer } from "react";
import {
  FormEditorAction,
  FormEditorState,
  FieldDefinition,
  FormSchemaDefinition,
  OptionItem,
  SectionDefinition,
  BaseFieldType,
  BASE_FIELD_TYPES,
  SpecialTextType,
  SPECIAL_TEXT_TYPES,
} from "./types";
import { nanoid } from "nanoid";
import { createFieldByType } from "./shared";

function makeUniqueValue(
  options: OptionItem[],
  baseValue: string,
  excludeId?: string
) {
  const sanitized = (baseValue || "option").trim() || "option";
  let candidate = sanitized;
  let i = 1;
  while (options.some((o) => o.id !== excludeId && o.value === candidate)) {
    candidate = `${sanitized}_${i++}`;
  }
  return candidate;
}

function createEmptySchema(): FormSchemaDefinition {
  return {
    id: nanoid(),
    title: "Novo Formulário",
    description: "",
    sections: [
      {
        id: nanoid(),
        title: "Seção Principal",
        description: "Informações básicas",
        collapsed: true,
        fields: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createSectionByTitle(title: string): SectionDefinition {
  return {
    id: nanoid(),
    title,
    description: "",
    collapsed: false,
    fields: [],
  };
}

const FIELD_TYPE_SET = new Set<BaseFieldType>(BASE_FIELD_TYPES);
const SPECIAL_TEXT_TYPE_SET = new Set<SpecialTextType>(SPECIAL_TEXT_TYPES);

type InitialSchemaInput =
  | FormSchemaDefinition
  | { id?: string; title?: string; description?: string; sections?: unknown[]; createdAt?: string; updatedAt?: string }
  | unknown[]
  | undefined;

function normalizeOption(option: unknown, fallbackIndex: number): OptionItem {
  if (option && typeof option === "object") {
    const candidate = option as Partial<OptionItem> & { value?: unknown };
    return {
      id: candidate.id ?? nanoid(),
      value: String(candidate.value ?? `opcao_${fallbackIndex + 1}`),
    };
  }

  return {
    id: nanoid(),
    value: String(option ?? `opcao_${fallbackIndex + 1}`),
  };
}

function normalizeField(field: unknown): FieldDefinition {
  if (!field || typeof field !== "object") {
    return createFieldByType("text");
  }

  const raw = field as Record<string, unknown>;
  const rawFields = Array.isArray(raw.fields) ? raw.fields : undefined;
  const rawOptions = Array.isArray(raw.options) ? raw.options : undefined;
  const rawType = typeof raw.type === "string" ? raw.type : "text";
  const normalizedType: BaseFieldType = FIELD_TYPE_SET.has(
    rawType as BaseFieldType
  )
    ? (rawType as BaseFieldType)
    : "text";

  const helperTextValue =
    typeof raw.helperText === "string"
      ? raw.helperText
      : typeof raw.helperTextContent === "string"
        ? raw.helperTextContent
        : "";

  const helperFlag =
    typeof raw.helperText === "string"
      ? true
      : raw.helperText === true || helperTextValue.trim().length > 0;

  const specialType =
    typeof raw.specialType === "string" &&
    SPECIAL_TEXT_TYPE_SET.has(raw.specialType as SpecialTextType)
      ? (raw.specialType as SpecialTextType)
      : null;

  const normalized: FieldDefinition = {
    id: typeof raw.id === "string" ? raw.id : nanoid(),
    name:
      typeof raw.name === "string"
        ? raw.name
        : `${normalizedType}_${nanoid(6)}`,
    label: typeof raw.label === "string" ? raw.label : "Novo Campo",
    type: normalizedType,
    required: typeof raw.required === "boolean" ? raw.required : false,
    helperText: helperFlag,
    helperTextContent: helperFlag ? helperTextValue : "",
    placeholder:
      typeof raw.placeholder === "string" || raw.placeholder === null
        ? (raw.placeholder as string | null)
        : "",
    mask: typeof raw.mask === "boolean" ? raw.mask : false,
    maskType:
      typeof raw.maskType === "string" || raw.maskType === null
        ? (raw.maskType as string | null)
        : null,
    customMask:
      typeof raw.customMask === "string" || raw.customMask === null
        ? (raw.customMask as string | null)
        : null,
    defaultValue: raw.defaultValue,
    grid:
      typeof raw.grid === "number" && !Number.isNaN(raw.grid)
        ? raw.grid
        : 12,
    options: rawOptions
      ? rawOptions.map((opt, index) => normalizeOption(opt, index))
      : undefined,
    fields: rawFields
      ? rawFields.map((child) => normalizeField(child))
      : undefined,
    isMultiple:
      typeof raw.isMultiple === "boolean" || raw.isMultiple === null
        ? (raw.isMultiple as boolean | null)
        : undefined,
    multiple:
      typeof raw.multiple === "boolean" || raw.multiple === null
        ? (raw.multiple as boolean | null)
        : undefined,
    min:
      typeof raw.min === "number" || raw.min === null
        ? (raw.min as number | null)
        : undefined,
    max:
      typeof raw.max === "number" || raw.max === null
        ? (raw.max as number | null)
        : undefined,
    specialType,
  };

  return normalized;
}

function normalizeSection(
  section: unknown,
  index: number
): SectionDefinition {
  if (!section || typeof section !== "object") {
    return {
      id: nanoid(),
      title: `Seção ${index + 1}`,
      description: "",
      collapsed: false,
      fields: [],
    };
  }

  const raw = section as Record<string, unknown>;
  const rawFields = Array.isArray(raw.fields) ? raw.fields : [];

  return {
    id: typeof raw.id === "string" ? raw.id : nanoid(),
    title: typeof raw.title === "string" ? raw.title : `Seção ${index + 1}`,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
  collapsed: typeof raw.collapsed === "boolean" ? raw.collapsed : true,
    fields: rawFields.map((field) => normalizeField(field)),
  };
}

function normalizeInitialSchema(initial: InitialSchemaInput) {
  const fallback = createEmptySchema();

  if (!initial) {
    return fallback;
  }

  if (Array.isArray(initial)) {
    return {
      ...fallback,
      sections: initial.map((section, index) =>
        normalizeSection(section, index)
      ),
      updatedAt: new Date().toISOString(),
    };
  }

  if (typeof initial === "object" && initial !== null) {
    const candidate = initial as {
      id?: string;
      title?: string;
      description?: string;
      sections?: unknown[];
      createdAt?: string;
      updatedAt?: string;
    };

    const normalizedSections = Array.isArray(candidate.sections)
      ? candidate.sections.map((section, index) =>
          normalizeSection(section, index)
        )
      : fallback.sections;

    return {
      id: candidate.id ?? fallback.id,
      title: candidate.title ?? fallback.title,
      description: candidate.description ?? fallback.description,
      sections: normalizedSections,
      createdAt: candidate.createdAt ?? fallback.createdAt,
      updatedAt: candidate.updatedAt ?? new Date().toISOString(),
    } satisfies FormSchemaDefinition;
  }

  return fallback;
}



function reducer(
  state: FormEditorState,
  action: FormEditorAction
): FormEditorState {
  switch (action.type) {
    case "SET_SCHEMA":
      return { ...state, schema: action.schema, dirty: false };

    case "ADD_SECTION":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: [...state.schema.sections, action.section],
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "UPDATE_SECTION":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId ? { ...s, ...action.patch } : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "REMOVE_SECTION":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.filter(
            (s) => s.id !== action.sectionId
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "REORDER_SECTIONS": {
      const sections = [...state.schema.sections];
      const [removed] = sections.splice(action.from, 1);
      sections.splice(action.to, 0, removed);
      return {
        ...state,
        schema: {
          ...state.schema,
          sections,
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "SELECT_SECTION":
      return { ...state, selectedSectionId: action.sectionId };

    case "ADD_FIELD":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? { ...s, fields: [...s.fields, action.field] }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "UPDATE_FIELD":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.map((f) =>
                    f.id === action.fieldId ? { ...f, ...action.patch } : f
                  ),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "REMOVE_FIELD":
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.filter((f) => f.id !== action.fieldId),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "REORDER_FIELDS": {
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) => {
            if (s.id !== action.sectionId) return s;
            const fields = [...s.fields];
            const [removed] = fields.splice(action.from, 1);
            fields.splice(action.to, 0, removed);
            return { ...s, fields };
          }),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "MOVE_FIELD": {
      const { fromSectionId, toSectionId, fieldId } = action;
      let fieldToMove: FieldDefinition | null = null;

      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) => {
            if (s.id === fromSectionId) {
              const field = s.fields.find((f) => f.id === fieldId);
              if (field) fieldToMove = field;
              return { ...s, fields: s.fields.filter((f) => f.id !== fieldId) };
            }
            if (s.id === toSectionId && fieldToMove) {
              return { ...s, fields: [...s.fields, fieldToMove] };
            }
            return s;
          }),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "SELECT_FIELD":
      return { ...state, selectedFieldId: action.fieldId };

    case "MARK_CLEAN":
      return { ...state, dirty: false };

    case "UPDATE_SCHEMA_META":
      return {
        ...state,
        schema: {
          ...state.schema,
          ...action.patch,
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };

    case "ADD_OPTION": {
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.map((f) => {
                    if (f.id !== action.fieldId) return f;
                    const existing: OptionItem[] = f.options || [];
                    const uniqueValue = makeUniqueValue(
                      existing,
                      action.option.value
                    );
                    return {
                      ...f,
                      options: [
                        ...existing,
                        { ...action.option, value: uniqueValue },
                      ],
                    };
                  }),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "UPDATE_OPTION": {
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.map((f) => {
                    if (f.id !== action.fieldId) return f;
                    const existing: OptionItem[] = f.options || [];
                    return {
                      ...f,
                      options: existing.map((o) => {
                        if (o.id !== action.optionId) return o;
                        const patch: Partial<OptionItem> = { ...action.patch };
                        if (patch.value) {
                          patch.value = makeUniqueValue(
                            existing,
                            patch.value,
                            o.id
                          );
                        }
                        return { ...o, ...patch };
                      }),
                    };
                  }),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "REMOVE_OPTION": {
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.map((f) =>
                    f.id === action.fieldId
                      ? {
                          ...f,
                          options: (f.options || []).filter(
                            (o) => o.id !== action.optionId
                          ),
                        }
                      : f
                  ),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    case "REORDER_OPTIONS": {
      return {
        ...state,
        schema: {
          ...state.schema,
          sections: state.schema.sections.map((s) =>
            s.id === action.sectionId
              ? {
                  ...s,
                  fields: s.fields.map((f) => {
                    if (f.id !== action.fieldId) return f;
                    const opts = [...(f.options || [])];
                    const [removed] = opts.splice(action.from, 1);
                    opts.splice(action.to, 0, removed);
                    return { ...f, options: opts };
                  }),
                }
              : s
          ),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    }

    default:
      return state;
  }
}

export function useFormEditorSchema(initial?: InitialSchemaInput) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    schema: normalizeInitialSchema(initial),
    selectedFieldId: undefined,
    selectedSectionId: undefined,
    dirty: false,
  }));

  // Section functions
  const addSection = useCallback((title: string) => {
    const section = createSectionByTitle(title);
    dispatch({ type: "ADD_SECTION", section });
  }, []);

  const updateSection = useCallback(
    (sectionId: string, patch: Partial<SectionDefinition>) => {
      dispatch({ type: "UPDATE_SECTION", sectionId, patch });
    },
    []
  );

  const removeSection = useCallback((sectionId: string) => {
    dispatch({ type: "REMOVE_SECTION", sectionId });
  }, []);

  const reorderSections = useCallback((from: number, to: number) => {
    dispatch({ type: "REORDER_SECTIONS", from, to });
  }, []);

  const selectSection = useCallback((sectionId?: string) => {
    dispatch({ type: "SELECT_SECTION", sectionId });
  }, []);

  // Field functions
  const addField = useCallback(
    (sectionId: string, type: FieldDefinition["type"]) => {
      const field = createFieldByType(type);
      dispatch({ type: "ADD_FIELD", sectionId, field });
    },
    []
  );

  const updateField = useCallback(
    (sectionId: string, fieldId: string, patch: Partial<FieldDefinition>) => {
      dispatch({ type: "UPDATE_FIELD", sectionId, fieldId, patch });
    },
    []
  );

  const removeField = useCallback((sectionId: string, fieldId: string) => {
    dispatch({ type: "REMOVE_FIELD", sectionId, fieldId });
  }, []);

  const reorderFields = useCallback(
    (sectionId: string, from: number, to: number) => {
      dispatch({ type: "REORDER_FIELDS", sectionId, from, to });
    },
    []
  );

  const moveField = useCallback(
    (fromSectionId: string, toSectionId: string, fieldId: string) => {
      dispatch({ type: "MOVE_FIELD", fromSectionId, toSectionId, fieldId });
    },
    []
  );

  const selectField = useCallback((fieldId?: string) => {
    dispatch({ type: "SELECT_FIELD", fieldId });
  }, []);

  // Schema meta functions
  const updateSchemaMeta = useCallback(
    (patch: Partial<{ title: string; description?: string }>) => {
      dispatch({ type: "UPDATE_SCHEMA_META", patch });
    },
    []
  );

  // Option functions
  const addOption = useCallback(
    (
      sectionId: string,
      fieldId: string,
      option: { id: string; value: string }
    ) => {
      dispatch({ type: "ADD_OPTION", sectionId, fieldId, option });
    },
    []
  );

  const updateOption = useCallback(
    (
      sectionId: string,
      fieldId: string,
      optionId: string,
      patch: Partial<{ value: string }>
    ) => {
      dispatch({ type: "UPDATE_OPTION", sectionId, fieldId, optionId, patch });
    },
    []
  );

  const removeOption = useCallback(
    (sectionId: string, fieldId: string, optionId: string) => {
      dispatch({ type: "REMOVE_OPTION", sectionId, fieldId, optionId });
    },
    []
  );

  const reorderOptions = useCallback(
    (sectionId: string, fieldId: string, from: number, to: number) => {
      dispatch({ type: "REORDER_OPTIONS", sectionId, fieldId, from, to });
    },
    []
  );

  return {
    state,
    dispatch,
    // Section methods
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    selectSection,
    // Field methods
    addField,
    updateField,
    removeField,
    reorderFields,
    moveField,
    selectField,
    // Schema methods
    updateSchemaMeta,
    // Option methods
    addOption,
    updateOption,
    removeOption,
    reorderOptions,
  };
}
