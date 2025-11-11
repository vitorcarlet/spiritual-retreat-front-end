"use client";

import React, { useState, useCallback } from "react";
import { Box, Stack, Paper, Typography, Button, Alert } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import axios from "axios";

import SingleImageUpload from "@/src/components/fields/ImageUpload/SingleImageUpload";
import apiClient from "@/src/lib/axiosClientInstance";

interface PhotoUploadStepProps {
  registrationId: string;
  onComplete: () => void;
}

const PhotoUploadStep: React.FC<PhotoUploadStepProps> = ({
  registrationId,
  onComplete,
}) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [documentPhoto, setDocumentPhoto] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProfile, setUploadedProfile] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(false);

  const handleProfilePhotoChange = useCallback((file: File | null) => {
    setProfilePhoto(file);
  }, []);

  const handleDocumentPhotoChange = useCallback((file: File | null) => {
    setDocumentPhoto(file);
  }, []);

  const uploadProfilePhoto = async () => {
    if (!profilePhoto) {
      enqueueSnackbar("Selecione uma foto de perfil", { variant: "warning" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", profilePhoto);

      await apiClient.post(`/Registrations/${registrationId}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadedProfile(true);
      enqueueSnackbar("Foto de perfil enviada com sucesso!", {
        variant: "success",
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao enviar foto de perfil";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const uploadDocumentPhoto = async () => {
    if (!documentPhoto) {
      enqueueSnackbar("Selecione uma foto do documento", {
        variant: "warning",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", documentPhoto);

      await apiClient.post(
        `/Registrations/${registrationId}/document`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadedDocument(true);
      enqueueSnackbar("Foto do documento enviada com sucesso!", {
        variant: "success",
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Erro ao enviar foto do documento";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const canFinish = uploadedProfile && uploadedDocument;

  return (
    <Box sx={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Para finalizar sua inscrição, envie sua foto de perfil e documento de
        identidade.
      </Alert>

      <Stack spacing={4}>
        {/* Foto de Perfil */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            1. Foto de Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Envie uma foto sua recente (formato JPG ou PNG)
          </Typography>

          <SingleImageUpload
            label="Selecione sua foto"
            variant="avatar"
            size={120}
            value={profilePhoto}
            onChange={handleProfilePhotoChange}
            disabled={isUploading || uploadedProfile}
            accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
          />

          <Button
            variant="contained"
            onClick={uploadProfilePhoto}
            disabled={!profilePhoto || isUploading || uploadedProfile}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploadedProfile ? "✓ Foto enviada" : "Enviar Foto de Perfil"}
          </Button>
        </Paper>

        {/* Foto do Documento */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            2. Documento de Identidade
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Envie uma foto do seu documento de identidade (RG, CNH, Passaporte,
            etc.)
          </Typography>

          <SingleImageUpload
            label="Selecione a foto do documento"
            variant="standard"
            value={documentPhoto}
            onChange={handleDocumentPhotoChange}
            disabled={isUploading || uploadedDocument}
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
            }}
          />

          <Button
            variant="contained"
            onClick={uploadDocumentPhoto}
            disabled={!documentPhoto || isUploading || uploadedDocument}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploadedDocument ? "✓ Documento enviado" : "Enviar Documento"}
          </Button>
        </Paper>

        {/* Botão Finalizar */}
        <Button
          variant="contained"
          size="large"
          onClick={onComplete}
          disabled={!canFinish}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            bgcolor: canFinish ? "success.main" : undefined,
            "&:hover": {
              bgcolor: canFinish ? "success.dark" : undefined,
            },
          }}
        >
          {canFinish
            ? "✓ Finalizar Inscrição"
            : "Envie as fotos para continuar"}
        </Button>
      </Stack>
    </Box>
  );
};

export default PhotoUploadStep;
