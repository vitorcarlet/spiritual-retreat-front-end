"use client";

import React, { useCallback, useMemo, useState } from "react";
import SingleImageUpload from "@/src/components/fields/ImageUpload/SingleImageUpload";
import apiClient from "@/src/lib/axiosClientInstance";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

type ParticipantPhotoFieldProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  errorMessage?: string;
  helperText?: string;
  participantId?: string | number | null;
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Não foi possível processar o arquivo selecionado."));
    };
    reader.onerror = () => {
      reject(new Error("Falha ao ler a imagem. Tente novamente."));
    };
    reader.readAsDataURL(file);
  });
};

const ParticipantPhotoField: React.FC<ParticipantPhotoFieldProps> = ({
  value,
  onChange,
  disabled,
  errorMessage,
  helperText,
  participantId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const existingImage = useMemo(() => {
    if (typeof value === "string" && value) {
      return { url: value };
    }
    return undefined;
  }, [value]);

  const effectiveHelperText = useMemo(() => {
    if (errorMessage || localError) {
      return undefined;
    }
    return helperText;
  }, [errorMessage, helperText, localError]);

  const effectiveErrorText = useMemo(() => {
    return errorMessage ?? localError ?? undefined;
  }, [errorMessage, localError]);

  const handleFileChange = useCallback(
    async (nextFile: File | null) => {
      if (!nextFile) {
        setLocalError(null);
        onChange(null);
        return;
      }

      // Se não tem participantId, apenas converte para dataURL (modo criação)
      if (!participantId) {
        setIsProcessing(true);
        try {
          const dataUrl = await readFileAsDataUrl(nextFile);
          setLocalError(null);
          onChange(dataUrl);
        } catch (error) {
          console.error(error);
          setLocalError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a imagem selecionada."
          );
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // Se tem participantId, faz upload via API
      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append("file", nextFile);

        const response = await apiClient.post(
          `/Registrations/${participantId}/photo`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const photoUrl =
          response.data?.photoUrl ??
          response.data?.url ??
          URL.createObjectURL(nextFile);

        setLocalError(null);
        onChange(photoUrl);

        enqueueSnackbar("Foto atualizada com sucesso!", {
          variant: "success",
          autoHideDuration: 3000,
        });
      } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
        const message = axios.isAxiosError(error)
          ? ((error.response?.data as { error?: string })?.error ??
            error.message)
          : "Não foi possível fazer upload da imagem.";
        setLocalError(message);
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [onChange, participantId]
  );

  const handleRemoveExisting = useCallback(() => {
    setLocalError(null);
    onChange(null);
  }, [onChange]);

  return (
    <SingleImageUpload
      label="Foto do participante"
      variant="avatar"
      size={120}
      value={null}
      existing={existingImage}
      onChange={handleFileChange}
      onRemoveExisting={
        existingImage ? () => handleRemoveExisting() : undefined
      }
      disabled={disabled || isProcessing}
      helperText={effectiveHelperText ?? undefined}
      errorText={effectiveErrorText}
      accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
    />
  );
};

export default ParticipantPhotoField;
