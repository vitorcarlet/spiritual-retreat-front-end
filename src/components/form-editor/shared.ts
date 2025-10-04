import { FieldDefinition } from "./types";
import { nanoid } from "nanoid";
export function createFieldByType(
  type: FieldDefinition["type"]
): FieldDefinition {
  const baseField = {
    id: nanoid(),
    name: `${type}_${Date.now()}`,
    type,
    required: false,
    grid: 12,
    helperText: false,
    mask: false,
    helperTextContent: "",
    multiple: false,
  };

  switch (type) {
    case "text":
      return {
        ...baseField,
        label: "Campo de Texto",
        placeholder: "Digite aqui...",
        defaultValue: "",
        mask: true,
      };

    case "radio":
    case "select":
      return {
        ...baseField,
        label: "Opção Única",
        placeholder: "",
        options: [
          { id: nanoid(), value: "opcao1" },
          { id: nanoid(), value: "opcao2" },
        ],
        defaultValue: [],
      };

    case "checkbox":
      return {
        ...baseField,
        label: "Lista de Seleção Múltipla",
        placeholder: "",
        options: [
          { id: nanoid(), value: "item1" },
          { id: nanoid(), value: "item2" },
        ],
        defaultValue: [],
      };

    case "list":
      return {
        ...baseField,
        label: "Lista de Seleção Múltipla",
        placeholder: "",
        options: [
          { id: nanoid(), value: "item1" },
          { id: nanoid(), value: "item2" },
        ],
        defaultValue: [],
      };

    case "chips":
      return {
        ...baseField,
        label: "Seleção em chips",
        placeholder: "",
        options: [
          { id: nanoid(), value: "item1" },
          { id: nanoid(), value: "item2" },
        ],
        defaultValue: [],
        multiple: true,
      };

    case "switch":
      return {
        ...baseField,
        label: "Interruptor",
        placeholder: null,
        defaultValue: false,
      };

    case "switchExpansible":
      return {
        ...baseField,
        label: "Interruptor Expansível",
        placeholder: null,
        defaultValue: false,
        fields: [],
      };

    case "photo":
      return {
        ...baseField,
        label: "Adicione uma foto",
        isMultiple: false,
      };

    default:
      return {
        ...baseField,
        label: "Novo Campo",
        placeholder: "",
        //options: type === "select" ? [] : undefined,
        defaultValue: undefined,
      };
  }
}
