import { useSortable } from "@dnd-kit/sortable";
import {
  Paper,
  Stack,
  IconButton,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import React, { memo } from "react";
import {
  BaseFieldType,
  FieldDefinition,
  BASE_FIELD_TYPES,
  SpecialTextType,
} from "./types";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import AddIcon from "@mui/icons-material/Add";
import { nanoid } from "nanoid";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SmartSelect from "../public/retreats/form/SmartSelect";
import type { BackendOption } from "../public/retreats/form/types";
import { createFieldByType } from "./shared";

const MASK_OPTIONS: BackendOption[] = [
  { id: "mask-none", value: "", label: "Nenhuma" },
  { id: "mask-cpf", value: "cpf", label: "CPF" },
  { id: "mask-cnpj", value: "cnpj", label: "CNPJ" },
  { id: "mask-phone", value: "phone", label: "Telefone" },
  { id: "mask-cep", value: "cep", label: "CEP" },
  { id: "mask-num", value: "num", label: "Numérico" },
  { id: "mask-location", value: "location", label: "Localidade" },
  { id: "mask-currency", value: "currency", label: "Moeda" },
  { id: "mask-date", value: "date", label: "Data" },
  { id: "mask-email", value: "email", label: "E-mail" },
  { id: "mask-custom", value: "custom", label: "Personalizada" },
];

const FIELD_TYPE_LABELS: Record<BaseFieldType, string> = {
  text: "Campo de texto",
  textSpecial: "Campo de texto especial",
  textarea: "Texto longo",
  number: "Número",
  select: "Seleção",
  date: "Data",
  checkbox: "Caixa de seleção",
  radio: "Opção única",
  color: "Cor",
  email: "Email",
  phone: "Telefone",
  list: "Lista",
  chips: "Lista (chips)",
  switch: "Interruptor",
  photo: "Foto",
  location: "Localização",
  switchExpansible: "Interruptor expansível",
  specialField: "Campos Especiais",
};

const CHILD_FIELD_TYPES = BASE_FIELD_TYPES.filter(
  (type) => type !== "switchExpansible"
);

const SPECIAL_TEXT_OPTIONS: BackendOption[] = [
  { id: "special-name", value: "name", label: "Nome" },
  { id: "special-email", value: "email", label: "Email" },
  { id: "special-phone", value: "phone", label: "Telefone" },
  {
    id: "special-profile-photo",
    value: "profilePhoto",
    label: "Foto de perfil",
  },
];

const SPECIAL_TEXT_LABELS: Record<SpecialTextType, string> = {
  name: "Nome",
  email: "Email",
  phone: "Telefone",
  profilePhoto: "Foto de perfil",
};

interface FieldEditorCardProps {
  field: FieldDefinition;
  index: number;
  onChange: (patch: Partial<FieldDefinition>) => void;
  onDelete: () => void;
  selectedFieldId?: string;
  onSelectField?: (fieldId: string) => void;
  addOption?: (option: { id: string; value: string }) => void;
  updateOption?: (optionId: string, patch: { value?: string }) => void;
  removeOption?: (optionId: string) => void;
  reorderOptions?: (from: number, to: number) => void;
}

function FieldEditorCard({
  field,
  index,
  onChange,
  onDelete,
  selectedFieldId,
  onSelectField,
  addOption,
  updateOption,
  removeOption,
  reorderOptions,
}: FieldEditorCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  const isSelected = selectedFieldId === field.id;

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const optionSensors = useSensors(useSensor(PointerSensor));
  const childSensors = useSensors(useSensor(PointerSensor));

  const childFields = field.fields ?? [];
  const [childMenuAnchor, setChildMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const childMenuOpen = Boolean(childMenuAnchor);

  const handleChildMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setChildMenuAnchor(event.currentTarget);
  };

  const handleChildMenuClose = () => {
    setChildMenuAnchor(null);
  };

  const handleChildChange = (
    childId: string,
    patch: Partial<FieldDefinition>
  ) => {
    const updated = childFields.map((child) =>
      child.id === childId ? { ...child, ...patch } : child
    );
    onChange({ fields: updated });
  };

  const handleChildDelete = (childId: string) => {
    const updated = childFields.filter((child) => child.id !== childId);
    onChange({ fields: updated });
  };

  const handleAddChildField = (type: BaseFieldType) => {
    handleChildMenuClose();
    if (type === "switchExpansible") {
      return;
    }
    const newField = createFieldByType(type);
    const updated = [...childFields, newField];
    onChange({ fields: updated });
    onSelectField?.(newField.id);
  };

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = childFields.findIndex((child) => child.id === active.id);
    const toIndex = childFields.findIndex((child) => child.id === over.id);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const reordered = [...childFields];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onChange({ fields: reordered });
  };

  function handleOptionDragEnd(e: DragEndEvent) {
    if (!reorderOptions || !field.options) return;
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const from = field.options.findIndex((o) => o.id === active.id);
      const to = field.options.findIndex((o) => o.id === over.id);
      if (from !== -1 && to !== -1) reorderOptions(from, to);
    }
  }

  return (
    <Paper
      ref={setNodeRef}
      variant={isSelected ? "elevation" : "outlined"}
      elevation={isSelected ? 4 : 0}
      sx={{ p: 2, position: "relative" }}
      style={style}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton size="small" {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography variant="subtitle2" sx={{ flex: 1, minWidth: 0 }}>
            {index + 1}. {field.label || field.name} -{" "}
            {FIELD_TYPE_LABELS[field.type] ?? field.type}
          </Typography>
          {field.type === "textSpecial" && field.specialType && (
            <Chip
              size="small"
              color="info"
              label={`Especial: ${SPECIAL_TEXT_LABELS[field.specialType]}`}
            />
          )}
        </Stack>
        <Button size="small" color="error" onClick={onDelete}>
          Remover
        </Button>
      </Stack>
      <Stack spacing={1} onClick={() => onSelectField?.(field.id)}>
        <TextField
          label="Label"
          value={field.label}
          size="small"
          onChange={(e) => onChange({ label: e.target.value })}
          fullWidth
        />
        {(field.type === "text" ||
          field.type === "textSpecial" ||
          field.type === "textarea" ||
          field.type === "email" ||
          field.type === "phone" ||
          field.type === "number") && (
          <TextField
            label="Texto exibido quando o campo está vazio"
            value={field.placeholder ?? ""}
            size="small"
            onChange={(e) =>
              onChange({
                placeholder:
                  e.target.value.trim().length === 0 ? null : e.target.value,
              })
            }
            fullWidth
          />
        )}

        {(!!field.mask ||
          field.type === "text" ||
          field.type === "textarea") && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Box sx={{ flex: 1 }}>
              <SmartSelect
                label="Tipo de máscara"
                placeholder="Selecionar"
                options={MASK_OPTIONS}
                value={(field.maskType ?? "") as string}
                onChange={(selected) => {
                  const rawValue = Array.isArray(selected)
                    ? selected.length > 0
                      ? String(selected[0])
                      : ""
                    : selected === null || selected === undefined
                      ? ""
                      : String(selected);
                  const normalized = rawValue.trim();

                  onChange({
                    maskType: normalized ? normalized : null,
                    ...(normalized === "custom" ? {} : { customMask: null }),
                  });
                }}
                noOptionsText="Nenhuma máscara disponível"
              />
            </Box>
            {field.maskType === "custom" && (
              <TextField
                size="small"
                label="Máscara personalizada"
                value={field.customMask || ""}
                onChange={(e) => onChange({ customMask: e.target.value })}
                helperText="Use o formato do IMask, ex: 000-000"
              />
            )}
          </Stack>
        )}

        {field.type === "textSpecial" && (
          <SmartSelect
            label="Tipo especial"
            placeholder="Selecionar"
            options={SPECIAL_TEXT_OPTIONS}
            value={(field.specialType ?? "") as string}
            onChange={(selected) => {
              const rawValue = Array.isArray(selected)
                ? selected.length > 0
                  ? String(selected[0])
                  : ""
                : selected === undefined || selected === null
                  ? ""
                  : String(selected);

              if (!rawValue) {
                onChange({ specialType: null });
                return;
              }

              const isValid = SPECIAL_TEXT_OPTIONS.some(
                (option) => option.value === rawValue
              );

              onChange({
                specialType: isValid ? (rawValue as SpecialTextType) : null,
              });
            }}
            noOptionsText="Nenhum tipo disponível"
            helperText="Selecione o tipo que será vinculado ao perfil do participante"
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={!!field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
            />
          }
          label="Obrigatório"
        />
        {field.type == "photo" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.isMultiple}
                onChange={(e) => onChange({ isMultiple: e.target.checked })}
              />
            }
            label="Fotos Múltiplas"
          />
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={!!field.helperText}
              onChange={(e) =>
                onChange({
                  helperText: e.target.checked,
                  ...(e.target.checked ? {} : { helperTextContent: "" }),
                })
              }
            />
          }
          label="Exibir texto de ajuda"
        />
        {field.helperText && (
          <TextField
            label="Helper Text"
            multiline
            minRows={2}
            value={field.helperTextContent || ""}
            size="small"
            onChange={(e) => onChange({ helperTextContent: e.target.value })}
            fullWidth
          />
        )}

        {["radio", "list", "checkbox", "chips", "select"].includes(
          field.type
        ) && (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              Opções
            </Typography>
            {reorderOptions ? (
              <DndContext
                sensors={optionSensors}
                onDragEnd={handleOptionDragEnd}
              >
                <SortableContext
                  items={(field.options || []).map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1}>
                    {(field.options || []).map((opt, index) => (
                      <OptionRow
                        key={opt.id}
                        opt={{ ...opt, index: index + 1 }}
                        updateOption={updateOption}
                        removeOption={removeOption}
                        fallbackOnChange={(updated) =>
                          onChange({ options: updated })
                        }
                        currentOptions={field.options || []}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            ) : (
              (field.options || []).map((opt) => (
                <Stack
                  key={opt.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <TextField
                    size="small"
                    label="Valor"
                    value={opt.value}
                    onChange={(e) =>
                      updateOption
                        ? updateOption(opt.id, { value: e.target.value })
                        : onChange({
                            options: (field.options || []).map((o) =>
                              o.id === opt.id
                                ? { ...o, value: e.target.value }
                                : o
                            ),
                          })
                    }
                    sx={{ flex: 1 }}
                  />
                  <Button
                    color="error"
                    size="small"
                    onClick={() =>
                      removeOption
                        ? removeOption(opt.id)
                        : onChange({
                            options: (field.options || []).filter(
                              (o) => o.id !== opt.id
                            ),
                          })
                    }
                  >
                    X
                  </Button>
                </Stack>
              ))
            )}
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                addOption
                  ? addOption({ id: nanoid(), value: "option" })
                  : onChange({
                      options: [
                        ...(field.options || []),
                        { id: nanoid(), value: "option" },
                      ],
                    })
              }
            >
              Adicionar Opção
            </Button>
          </Stack>
        )}

        {field.type === "switchExpansible" && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              backgroundColor: "background.default",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Campos internos
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleChildMenuOpen}
              >
                Adicionar campo
              </Button>
            </Stack>

            <Menu
              anchorEl={childMenuAnchor}
              open={childMenuOpen}
              onClose={handleChildMenuClose}
            >
              {CHILD_FIELD_TYPES.map((type) => (
                <MenuItem key={type} onClick={() => handleAddChildField(type)}>
                  {FIELD_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Menu>

            {childFields.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Nenhum campo interno adicionado ainda.
              </Typography>
            ) : (
              <DndContext sensors={childSensors} onDragEnd={handleChildDragEnd}>
                <SortableContext
                  items={childFields.map((child) => child.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={1.5}>
                    {childFields.map((child, childIndex) => (
                      <FieldEditorCard
                        key={child.id}
                        field={child}
                        index={childIndex}
                        onChange={(patch) => handleChildChange(child.id, patch)}
                        onDelete={() => handleChildDelete(child.id)}
                        selectedFieldId={selectedFieldId}
                        onSelectField={onSelectField}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
export default memo(FieldEditorCard);

interface OptionRowProps {
  opt: { id: string; value: string; index?: number };
  updateOption?: (id: string, patch: { value?: string }) => void;
  removeOption?: (id: string) => void;
  fallbackOnChange: (opts: { id: string; value: string }[]) => void;
  currentOptions: { id: string; value: string }[];
}

function OptionRow({
  opt,
  updateOption,
  removeOption,
  fallbackOnChange,
  currentOptions,
}: OptionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opt.id });
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    background: isDragging ? "rgba(0,0,0,0.04)" : undefined,
    borderRadius: 4,
    padding: 4,
  };
  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      spacing={1}
      alignItems="center"
      style={style}
    >
      <IconButton size="small" {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="inherit" />
      </IconButton>
      <TextField
        size="small"
        label={`Opção ${opt.index}`}
        value={opt.value}
        onChange={(e) =>
          updateOption
            ? updateOption(opt.id, { value: e.target.value })
            : fallbackOnChange(
                currentOptions.map((o) =>
                  o.id === opt.id ? { ...o, value: e.target.value } : o
                )
              )
        }
        sx={{ flex: 1 }}
      />
      <Button
        color="error"
        size="small"
        onClick={() =>
          removeOption
            ? removeOption(opt.id)
            : fallbackOnChange(currentOptions.filter((o) => o.id !== opt.id))
        }
      >
        X
      </Button>
    </Stack>
  );
}
