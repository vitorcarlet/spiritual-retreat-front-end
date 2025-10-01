"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import ZoomOutMapRoundedIcon from "@mui/icons-material/ZoomOutMapRounded";
import { useDropzone, Accept } from "react-dropzone";

export interface ExistingImage {
  id?: string | number;
  url: string;
  title?: string;
}

export interface MultiImageUploadProps {
  label?: string;
  value?: File[]; // controlado opcional
  onChange?: (files: File[]) => void;
  existing?: ExistingImage[]; // imagens já salvas (URLs)
  onRemoveExisting?: (id: string | number, image: ExistingImage) => void;
  accept?: Accept;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  cols?: number; // colunas do grid
  rowHeight?: number;
}

type PreviewItem = {
  file: File;
  url: string;
  key: string; // para evitar duplicados
};

export default function MultiImageUpload({
  label = "Adicionar imagens",
  value,
  onChange,
  existing = [],
  onRemoveExisting,
  accept = { "image/*": [] },
  maxFiles = 12,
  maxSizeMB = 5,
  disabled,
  errorText,
  helperText,
  cols = 4,
  rowHeight = 140,
}: MultiImageUploadProps) {
  const [files, setFiles] = useState<File[]>(value ?? []);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const objectUrlsRef = useRef<string[]>([]);

  // Sync externo
  useEffect(() => {
    if (value) setFiles(value);
  }, [value]);

  // Gera previews e evita vazamento de memória
  useEffect(() => {
    // limpa anteriores
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];

    const next = files.map((f) => {
      const url = URL.createObjectURL(f);
      objectUrlsRef.current.push(url);
      return {
        file: f,
        url,
        key: `${f.name}-${f.size}-${f.lastModified}`,
      };
    });
    setPreviews(next);

    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, [files]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      // valida tamanho e evita duplicados
      const valid = incoming.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
      const byKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;
      const existingKeys = new Set(files.map(byKey));
      const deduped = valid.filter((f) => !existingKeys.has(byKey(f)));

      let next = [...files, ...deduped];
      if (next.length > maxFiles) next = next.slice(0, maxFiles);

      setFiles(next);
      onChange?.(next);
    },
    [files, maxFiles, maxSizeMB, onChange]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted?.length) return;
      addFiles(accepted);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    multiple: true,
    maxFiles,
    noClick: true, // usamos botão para abrir
    disabled,
  });

  const handleRemoveNew = (key: string) => {
    const next = files.filter(
      (f) => `${f.name}-${f.size}-${f.lastModified}` !== key
    );
    setFiles(next);
    onChange?.(next);
  };

  const handleClearAll = () => {
    setFiles([]);
    onChange?.([]);
  };

  const hasAny = previews.length > 0 || existing.length > 0;

  return (
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.5 }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadRoundedIcon />}
            onClick={open}
            disabled={disabled}
          >
            Selecionar
          </Button>
          <Tooltip title="Limpar tudo">
            <span>
              <IconButton
                size="small"
                onClick={handleClearAll}
                disabled={disabled || !files.length}
              >
                <ClearAllRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {helperText && !errorText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
          {helperText}
        </Typography>
      )}

      <Box
        {...getRootProps()}
        sx={{
          p: 2,
          border: "1px dashed",
          borderColor: errorText
            ? "error.main"
            : isDragActive
              ? "primary.main"
              : "divider",
          bgcolor: (theme) =>
            isDragActive
              ? theme.vars?.palette.action.hover
              : theme.vars?.palette.background.default,
          borderRadius: 2,
          outline: "none",
          transition: "all .15s ease",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <input {...getInputProps()} />
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Arraste e solte imagens aqui ou clique em &quot;Selecionar&quot;.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PNG/JPG até {maxSizeMB}MB • Máx {maxFiles} imagens
          </Typography>
          {!hasAny && (
            <Stack direction="row" spacing={1}>
              <Chip size="small" label="image/png" />
              <Chip size="small" label="image/jpeg" />
              <Chip size="small" label="image/webp" />
            </Stack>
          )}
        </Stack>
      </Box>

      {errorText && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          {errorText}
        </Typography>
      )}

      {hasAny && (
        <ImageList cols={cols} rowHeight={rowHeight} gap={8} sx={{ m: 0 }}>
          {/* Imagens existentes do servidor */}
          {existing.map((img) => (
            <ImageListItem key={`existing-${img.id ?? img.url}`}>
              <img
                src={img.url}
                alt={img.title ?? "Imagem"}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <ImageListItemBar
                title={img.title ?? ""}
                actionIcon={
                  <Stack direction="row" alignItems="center">
                    <Tooltip title="Abrir">
                      <IconButton
                        size="small"
                        component="a"
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color: "white" }}
                      >
                        <ZoomOutMapRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onRemoveExisting && img.id != null && (
                      <Tooltip title="Remover (servidor)">
                        <IconButton
                          size="small"
                          onClick={() => onRemoveExisting(img.id!, img)}
                          sx={{ color: "white" }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                }
                position="top"
                sx={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 100%)",
                }}
              />
            </ImageListItem>
          ))}

          {/* Novas imagens selecionadas (client-side) */}
          {previews.map((p) => (
            <ImageListItem key={p.key}>
              <img
                src={p.url}
                alt={p.file.name}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <ImageListItemBar
                title={p.file.name}
                subtitle={`${(p.file.size / (1024 * 1024)).toFixed(2)} MB`}
                actionIcon={
                  <Tooltip title="Remover">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveNew(p.key)}
                      sx={{ color: "white" }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
                position="top"
                sx={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 100%)",
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Stack>
  );
}
