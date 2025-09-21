"use client";

import React from "react";
import { Box, Button, Paper, Stack, TextField } from "@mui/material";
import { useFormEditorSchema } from "./useFormEditorSchema";
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

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TitleIcon from "@mui/icons-material/Title";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import FieldEditorCard from "./FieldEditorCard";

export function FormEditor({ id }: { id: string }) {
  const {
    state,
    addField,
    updateField,
    removeField,
    selectField,
    updateSchemaMeta,
    reorderFields,
    addOption,
    updateOption,
    removeOption,
    reorderOptions,
  } = useFormEditorSchema();

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
        <Tooltip title="Switch" placement="right">
          <Fab size="small" color="primary" onClick={() => addField("switch")}>
            <ToggleOnIcon fontSize="small" />
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
                  addOption={(opt: { id: string; value: string }) =>
                    addOption(f.id, opt)
                  }
                  updateOption={(
                    optionId: string,
                    patch: { label?: string; value?: string }
                  ) => updateOption(f.id, optionId, patch)}
                  removeOption={(optionId: string) =>
                    removeOption(f.id, optionId)
                  }
                  reorderOptions={(from: number, to: number) =>
                    reorderOptions(f.id, from, to)
                  }
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
