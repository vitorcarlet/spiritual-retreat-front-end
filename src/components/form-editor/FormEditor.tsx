"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  CircularProgress,
  Typography,
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
import { BackendForm } from "../public/retreats/form/types";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { FormSchemaDefinition } from "./types";

const cloneForm = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

interface FormEditorProps {
  id: string;
  type: string;
}

const fetchFormData = async (
  retreatId: string,
  type: "participant" | "service-team"
): Promise<BackendForm> => {
  try {
    const result = await handleApiResponse<BackendForm>(
      await sendRequestServerVanilla.get(
        `/api/public/retreats/${retreatId}/form/${type}`,
        {
          baseUrl: "http://localhost:3001", // URL do MSW
        }
      )
    );

    if (result.success && result.data) {
      return result.data as BackendForm;
    }
    return {} as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    return {} as BackendForm;
  }
};

const sendFormData = async (
  schema: FormSchemaDefinition,
  retreatId: string,
  type: string
): Promise<BackendForm> => {
  try {
    const result = await handleApiResponse<BackendForm>(
      await sendRequestServerVanilla.post(
        `/api/public/retreats/${retreatId}/form/${type}`,
        {
          baseUrl: "http://localhost:3001",
          payload: schema, // URL do MSW
        }
      )
    );

    if (result.success && result.data) {
      return result.data as BackendForm;
    }
    return {} as BackendForm;
  } catch (error) {
    console.error("Erro ao buscar dados do formulario:", error);
    return {} as BackendForm;
  }
};

type LoadedFormEditorProps = {
  initialSchema: BackendForm;
  id: string;
  type: string;
};

function FormEditorContent({
  initialSchema,
  id,
  type: formType,
}: LoadedFormEditorProps) {
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
  } = useFormEditorSchema(initialSchema);

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
    sendFormData(schema, id, formType);
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

export function FormEditor({ id, type }: FormEditorProps) {
  const [initialSchema, setInitialSchema] = useState<BackendForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const formType = useMemo<"participant" | "service-team">(() => {
    return type === "service-team" ? "service-team" : "participant";
  }, [type]);

  useEffect(() => {
    const loadSchema = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchFormData(id, formType);
        setInitialSchema(cloneForm(data));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Falha ao carregar formulário.";
        setError(message);
        setInitialSchema(null);
      } finally {
        setLoading(false);
      }
    };

    loadSchema();
  }, [id, formType, reloadKey]);

  if (loading) {
    return (
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ py: 6 }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Carregando estrutura do formulário...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ py: 6 }}
      >
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setReloadKey((key) => key + 1);
          }}
        >
          Tentar novamente
        </Button>
      </Stack>
    );
  }

  if (!initialSchema) {
    return (
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ py: 6 }}
      >
        <Typography variant="body2" color="text.secondary">
          Nenhuma estrutura encontrada para este formulário.
        </Typography>
      </Stack>
    );
  }

  return (
    <FormEditorContent initialSchema={initialSchema} id={id} type={type} />
  );
}
