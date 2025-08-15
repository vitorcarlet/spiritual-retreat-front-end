"use client";

import React from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormEditorSchema } from "./useFormEditorSchema";
import { FieldDefinition } from "./types";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TitleIcon from "@mui/icons-material/Title";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

export function FormEditor({ id }: { id: string }) {
  const {
    state,
    addField,
    updateField,
    removeField,
    selectField,
    updateSchemaMeta,
    reorderFields,
  } = useFormEditorSchema();
  const save = React.useCallback(() => {
    // TODO integrate backend: POST /api/forms/{id}
    // For now just log
    console.log("Saving schema", state.schema, id);
  }, [state.schema, id]);

  const { schema, selectedFieldId } = state;

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
      const newIndex = schema.fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        // optimistic reorder using local arrayMove then reducer REORDER if desired
        // We'll dispatch REORDER_FIELDS for consistency
        // NOTE: we already have reorderFields(from,to)
        reorderFields(oldIndex, newIndex);
      }
    }
  }

  async function handleSave() {
    // TODO integrate backend: POST /api/forms/{id}
    // For now just log
    console.log("Saving schema", schema);
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "fixed",
          right: 32,
          top: 160,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Tooltip title="Texto" placement="right">
          <Fab size="small" color="primary" onClick={() => addField("text")}>
            <TitleIcon fontSize="small" />
          </Fab>
        </Tooltip>
        <Tooltip title="Radio" placement="right">
          <Fab size="small" color="primary" onClick={() => addField("radio")}>
            <RadioButtonCheckedIcon fontSize="small" />
          </Fab>
        </Tooltip>
        <Tooltip title="Lista" placement="right">
          <Fab size="small" color="primary" onClick={() => addField("list")}>
            <ListAltIcon fontSize="small" />
          </Fab>
        </Tooltip>
      </Box>
      {/* main content */}
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        <Paper
          variant="outlined"
          sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            variant="outlined"
            label="Título do Formulário"
            value={schema.title}
            onChange={(e) => updateSchemaMeta({ title: e.target.value })}
            size="small"
            fullWidth
          />
          <TextField
            variant="outlined"
            label="Descrição"
            value={schema.description}
            onChange={(e) => updateSchemaMeta({ description: e.target.value })}
            size="small"
            fullWidth
            multiline
            minRows={2}
          />
        </Paper>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={schema.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <Stack spacing={2}>
              {schema.fields.map((f, idx) => (
                <FieldEditorCard
                  key={f.id}
                  field={f}
                  index={idx}
                  onChange={(patch) => updateField(f.id, patch)}
                  onDelete={() => removeField(f.id)}
                  onSelect={() => selectField(f.id)}
                  selected={selectedFieldId === f.id}
                />
              ))}
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => addField("text")}
                sx={{ alignSelf: "flex-start" }}
              >
                Novo Campo
              </Button>
            </Stack>
          </SortableContext>
        </DndContext>

        <Box display="flex" justifyContent="flex-end" pb={4}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Salvar Formulário
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

interface FieldEditorCardProps {
  field: FieldDefinition;
  index: number;
  onChange: (patch: Partial<FieldDefinition>) => void;
  onDelete: () => void;
  onSelect: () => void;
  selected: boolean;
}

function FieldEditorCard({
  field,
  index,
  onChange,
  onDelete,
  onSelect,
  selected,
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
        <TextField
          label="Name"
          value={field.name}
          size="small"
          onChange={(e) => onChange({ name: e.target.value })}
          fullWidth
        />
        <TextField
          label="Placeholder"
          value={field.placeholder || ""}
          size="small"
          onChange={(e) => onChange({ placeholder: e.target.value })}
          fullWidth
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!!field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
            />
          }
          label="Obrigatório"
        />
        <TextField
          label="Helper Text"
          value={field.helperText || ""}
          size="small"
          onChange={(e) => onChange({ helperText: e.target.value })}
          fullWidth
        />
      </Stack>
    </Paper>
  );
}
