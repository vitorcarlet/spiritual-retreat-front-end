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
} from "@mui/material";
import React, { memo } from "react";
import { FieldDefinition } from "./types";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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

interface FieldEditorCardProps {
  field: FieldDefinition;
  index: number;
  onChange: (patch: Partial<FieldDefinition>) => void;
  onDelete: () => void;
  onSelect: () => void;
  selected: boolean;
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
  onSelect,
  selected,
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
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const optionSensors = useSensors(useSensor(PointerSensor));

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
      variant={selected ? "elevation" : "outlined"}
      elevation={selected ? 4 : 0}
      sx={{ p: 2, position: "relative" }}
      style={style}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton size="small" {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          {index + 1}. {field.label || field.name}
        </Typography>
        <Button size="small" color="error" onClick={onDelete}>
          Remover
        </Button>
      </Stack>
      <Stack spacing={1} onClick={onSelect}>
        <TextField
          label="Label"
          value={field.label}
          size="small"
          onChange={(e) => onChange({ label: e.target.value })}
          fullWidth
        />
        {field.placeholder && (
          <TextField
            label="Placeholder"
            value={field.placeholder || ""}
            size="small"
            onChange={(e) => onChange({ placeholder: e.target.value })}
            fullWidth
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
        {field.helperText && (
          <TextField
            label="Helper Text"
            value={field.helperText || ""}
            size="small"
            onChange={(e) => onChange({ helperText: e.target.value })}
            fullWidth
          />
        )}

        {["radio", "select"].includes(field.type) && (
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
