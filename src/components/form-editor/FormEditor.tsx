"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
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
import SectionCard from "./SectionCard";
import { sections } from "@/src/mocks/handlerData/formData";

const MOCK_FORM_SCHEMA = {
  id: "mock-form-editor",
  title: "Formulário de Exemplo",
  description: "Estrutura carregada do mock local",
  sections,
};

export function FormEditor() {
  const {
    state,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    addField,
    updateField,
    removeField,
    reorderFields,
    selectField,
    updateSchemaMeta,
    addOption,
    updateOption,
    removeOption,
    reorderOptions,
  } = useFormEditorSchema(MOCK_FORM_SCHEMA);

  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const { schema, selectedFieldId } = state;

  const sensors = useSensors(useSensor(PointerSensor));

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = schema.sections.findIndex((s) => s.id === active.id);
      const newIndex = schema.sections.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  }

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      addSection(newSectionTitle.trim());
      setNewSectionTitle("");
      setShowAddSectionDialog(false);
    }
  };

  async function handleSave() {
    // TODO integrate backend: POST /api/forms/{id}
    // For now just warn
    console.warn("Saving schema", schema);
  }

  return (
    <Box sx={{ position: "relative" }}>
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

        <DndContext sensors={sensors} onDragEnd={handleSectionDragEnd}>
          <SortableContext
            items={schema.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <Stack spacing={2}>
              {schema.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onUpdateSection={(patch) => updateSection(section.id, patch)}
                  onRemoveSection={() => removeSection(section.id)}
                  onAddField={(type) => addField(section.id, type)}
                  onUpdateField={(fieldId, patch) =>
                    updateField(section.id, fieldId, patch)
                  }
                  onRemoveField={(fieldId) => removeField(section.id, fieldId)}
                  onReorderFields={(from, to) =>
                    reorderFields(section.id, from, to)
                  }
                  onAddOption={(fieldId, opt) =>
                    addOption(section.id, fieldId, opt)
                  }
                  onUpdateOption={(fieldId, optionId, patch) =>
                    updateOption(section.id, fieldId, optionId, patch)
                  }
                  onRemoveOption={(fieldId, optionId) =>
                    removeOption(section.id, fieldId, optionId)
                  }
                  onReorderOptions={(fieldId, from, to) =>
                    reorderOptions(section.id, fieldId, from, to)
                  }
                  selectedFieldId={selectedFieldId}
                  onSelectField={selectField}
                />
              ))}

              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => setShowAddSectionDialog(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                Adicionar Seção
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

      {/* Add Section Dialog */}
      <Dialog
        open={showAddSectionDialog}
        onClose={() => setShowAddSectionDialog(false)}
      >
        <DialogTitle>Adicionar Nova Seção</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título da Seção"
            fullWidth
            variant="outlined"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddSection();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddSectionDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddSection} variant="contained">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
