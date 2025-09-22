"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Stack,
  Fab,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import TitleIcon from "@mui/icons-material/Title";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { SectionDefinition, FieldDefinition } from "./types";
import FieldEditorCard from "./FieldEditorCard";
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

interface SectionCardProps {
  section: SectionDefinition;
  onUpdateSection: (patch: Partial<SectionDefinition>) => void;
  onRemoveSection: () => void;
  onAddField: (type: FieldDefinition["type"]) => void;
  onUpdateField: (fieldId: string, patch: Partial<FieldDefinition>) => void;
  onRemoveField: (fieldId: string) => void;
  onReorderFields: (from: number, to: number) => void;
  onAddOption: (fieldId: string, option: { id: string; value: string }) => void;
  onUpdateOption: (
    fieldId: string,
    optionId: string,
    patch: Partial<{ value: string }>
  ) => void;
  onRemoveOption: (fieldId: string, optionId: string) => void;
  onReorderOptions: (fieldId: string, from: number, to: number) => void;
  selectedFieldId?: string;
  onSelectField: (fieldId?: string) => void;
}

export default function SectionCard({
  section,
  onUpdateSection,
  onRemoveSection,
  onAddField,
  onUpdateField,
  onRemoveField,
  onReorderFields,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  onReorderOptions,
  selectedFieldId,
  onSelectField,
}: SectionCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editDescription, setEditDescription] = useState(
    section.description || ""
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleSaveEdit = () => {
    onUpdateSection({
      title: editTitle,
      description: editDescription,
    });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(section.title);
    setEditDescription(section.description || "");
    setEditMode(false);
  };

  const handleToggleCollapse = () => {
    onUpdateSection({ collapsed: !section.collapsed });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id);
      const newIndex = section.fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderFields(oldIndex, newIndex);
      }
    }
  }

  return (
    <Accordion
      expanded={!section.collapsed}
      onChange={handleToggleCollapse}
      sx={{
        "&.MuiAccordion-root": {
          boxShadow: 2,
          "&::before": { display: "none" },
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "background.paper",
          minHeight: 64,
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            justifyContent: "space-between",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          {editMode ? (
            <Box sx={{ display: "flex", gap: 1, flexGrow: 1, mr: 2 }}>
              <TextField
                size="small"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Título da seção"
                variant="outlined"
                sx={{ flexGrow: 1 }}
                onClick={(e) => e.stopPropagation()}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
                color="primary"
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  {section.title}
                </Typography>
                {section.description && (
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditMode(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSection();
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ position: "relative", minHeight: 270 }}>
        {editMode && (
          <TextField
            fullWidth
            size="small"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Descrição da seção (opcional)"
            variant="outlined"
            sx={{ mb: 2 }}
            multiline
            minRows={2}
          />
        )}

        {/* Floating action buttons for field types */}
        <Box
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Tooltip title="Campo de Texto" placement="left">
            <Fab
              size="small"
              color="primary"
              onClick={() => onAddField("text")}
            >
              <TitleIcon fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Opção Única" placement="left">
            <Fab
              size="small"
              color="primary"
              onClick={() => onAddField("radio")}
            >
              <RadioButtonCheckedIcon fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Lista de Verificação" placement="left">
            <Fab
              size="small"
              color="primary"
              onClick={() => onAddField("checkbox")}
            >
              <ListAltIcon fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Interruptor" placement="left">
            <Fab
              size="small"
              color="primary"
              onClick={() => onAddField("switch")}
            >
              <ToggleOnIcon fontSize="small" />
            </Fab>
          </Tooltip>
          <Tooltip title="Photo" placement="left">
            <Fab
              size="small"
              color="primary"
              onClick={() => onAddField("switch")}
            >
              <PhotoCameraIcon fontSize="small" />
            </Fab>
          </Tooltip>
        </Box>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext
            items={section.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <Stack spacing={2} sx={{ mr: 8 }}>
              {section.fields.map((field, idx) => (
                <FieldEditorCard
                  key={field.id}
                  field={field}
                  index={idx}
                  onChange={(patch) => onUpdateField(field.id, patch)}
                  onDelete={() => onRemoveField(field.id)}
                  onSelect={() => onSelectField(field.id)}
                  selected={selectedFieldId === field.id}
                  addOption={(opt) => onAddOption(field.id, opt)}
                  updateOption={(optionId, patch) =>
                    onUpdateOption(field.id, optionId, patch)
                  }
                  removeOption={(optionId) =>
                    onRemoveOption(field.id, optionId)
                  }
                  reorderOptions={(from, to) =>
                    onReorderOptions(field.id, from, to)
                  }
                />
              ))}

              {section.fields.length === 0 && (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "text.secondary",
                    fontStyle: "italic",
                  }}
                >
                  Nenhum campo nesta seção. Use os botões ao lado para adicionar
                  campos.
                </Box>
              )}

              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => onAddField("text")}
                sx={{ alignSelf: "flex-start", mt: 2 }}
              >
                Adicionar Campo
              </Button>
            </Stack>
          </SortableContext>
        </DndContext>
      </AccordionDetails>
    </Accordion>
  );
}
