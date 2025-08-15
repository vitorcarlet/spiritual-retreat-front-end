import { useCallback, useReducer } from "react";
import {
  FormEditorAction,
  FormEditorState,
  FieldDefinition,
  FormSchemaDefinition,
} from "./types";
import { nanoid } from "nanoid";

function createEmptySchema(): FormSchemaDefinition {
  return {
    id: nanoid(),
    title: "Novo Formulário",
    description: "",
    fields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function reducer(
  state: FormEditorState,
  action: FormEditorAction
): FormEditorState {
  switch (action.type) {
    case "SET_SCHEMA":
      return { ...state, schema: action.schema, dirty: false };
    case "ADD_FIELD":
      return {
        ...state,
        schema: {
          ...state.schema,
          fields: [...state.schema.fields, action.field],
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        schema: {
          ...state.schema,
          fields: state.schema.fields.map((f) =>
            f.id === action.fieldId ? { ...f, ...action.patch } : f
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
          fields: state.schema.fields.filter((f) => f.id !== action.fieldId),
          updatedAt: new Date().toISOString(),
        },
        dirty: true,
      };
    case "REORDER_FIELDS": {
      const fields = [...state.schema.fields];
      const [removed] = fields.splice(action.from, 1);
      fields.splice(action.to, 0, removed);
      return {
        ...state,
        schema: {
          ...state.schema,
          fields,
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
    default:
      return state;
  }
}

export function useFormEditorSchema(initial?: FormSchemaDefinition) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    schema: initial ?? createEmptySchema(),
    selectedFieldId: undefined,
    dirty: false,
  }));

  const addField = useCallback((type: FieldDefinition["type"]) => {
    const field: FieldDefinition = {
      id: nanoid(),
      name: `${type}_${Date.now()}`,
      label: "Novo Campo",
      type,
      required: false,
      helperText: "",
      placeholder: "",
      options: type === "select" || type === "radio" ? [] : undefined,
      defaultValue: undefined,
      grid: 12,
    };
    dispatch({ type: "ADD_FIELD", field });
  }, []);

  const updateField = useCallback(
    (fieldId: string, patch: Partial<FieldDefinition>) => {
      dispatch({ type: "UPDATE_FIELD", fieldId, patch });
    },
    []
  );

  const removeField = useCallback((fieldId: string) => {
    dispatch({ type: "REMOVE_FIELD", fieldId });
  }, []);

  const reorderFields = useCallback((from: number, to: number) => {
    dispatch({ type: "REORDER_FIELDS", from, to });
  }, []);

  const selectField = useCallback((fieldId?: string) => {
    dispatch({ type: "SELECT_FIELD", fieldId });
  }, []);

  const updateSchemaMeta = useCallback(
    (patch: Partial<{ title: string; description?: string }>) => {
      dispatch({ type: "UPDATE_SCHEMA_META", patch });
    },
    []
  );

  return {
    state,
    dispatch,
    addField,
    updateField,
    removeField,
    reorderFields,
    selectField,
    updateSchemaMeta,
  };
}
