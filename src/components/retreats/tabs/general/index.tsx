"use client";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Skeleton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import { fetchRetreatData } from "../../shared";
import LocationField from "@/src/components/fields/LocalizationFields/LocationField";
import TextFieldMasked from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import { Retreat } from "@/src/types/retreats";
import MultiImageUpload from "@/src/components/fields/ImageUpload/MultiImageUpload";
import apiClient from "@/src/lib/axiosClientInstance";
import axios from "axios";
import { useModal } from "@/src/hooks/useModal";
import DeleteConfirmation from "@/src/components/confirmations/DeleteConfirmation";

const emptyFormData: Omit<Retreat, "id" | "state"> = {
  title: "",
  description: "",
  city: "",
  stateShort: "",
  edition: 1,
  startDate: "",
  endDate: "",
  theme: "",
  capacity: 0,
  enrolled: 0,
  location: "",
  participationTax: "",
  isActive: false,
  images: [],
  status: "upcoming",
  instructor: "",
};

function mapRetreatToFormData(r: Retreat): Omit<Retreat, "id" | "state"> {
  return {
    title: r.title ?? "",
    description: r.description ?? "",
    city: r.city ?? "",
    stateShort: r.stateShort ?? "",
    edition: r.edition ?? 1,
    startDate: r.startDate ?? "",
    endDate: r.endDate ?? "",
    theme: r.theme ?? "",
    capacity: r.capacity ?? 0,
    enrolled: r.enrolled ?? 0,
    location: r.location ?? "",
    participationTax: r.participationTax ?? "",
    isActive: r.isActive ?? false,
    images: r.images ?? [],
    status: r.status ?? "upcoming",
    instructor: r.instructor ?? "",
  };
}

const RetreatEditPage = ({ isCreating }: { isCreating?: boolean }) => {
  const { menuMode } = useMenuMode();
  const { setBreadCrumbsTitle } = useBreadCrumbs();
  const router = useRouter();
  const params = useParams();
  const retreatId = params.id as string;
  const modal = useModal();

  const { data: retreatData, isLoading } = useQuery({
    queryKey: ["retreats", retreatId],
    queryFn: () => fetchRetreatData(retreatId),
    staleTime: 5 * 60 * 1000,
  });

  const { enqueueSnackbar } = useSnackbar();
  const [retreat, setRetreat] = useState<Retreat | null | undefined>(
    retreatData || null
  );
  const isReadOnly = menuMode === "view";
  const [formData, setFormData] =
    useState<Omit<Retreat, "id" | "state">>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Novas imagens (a enviar) e imagens existentes marcadas para remoção
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<(string | number)[]>([]);

  useEffect(() => {
    if (retreatData) {
      setFormData(mapRetreatToFormData(retreatData));
    }
  }, [retreatData]);

  useEffect(() => {
    if (retreatData) {
      setBreadCrumbsTitle({
        title: retreatData.title,
        pathname: `/retreats/${retreatData.id}`,
      });
    }
  }, [retreatData, setBreadCrumbsTitle]);

  const handleInputChange =
    (field: keyof Retreat) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === "capacity" || field === "enrolled"
            ? Number(event.target.value)
            : event.target.value,
      }));
    };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      stateShort: state,
      city: "", // limpa cidade ao trocar estado
    }));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      city,
    }));
  };

  const handleDelete = () => {
    if (!retreat?.id) return;

    modal.open({
      title: "Confirmar exclusão",
      size: "sm",
      customRender: () => (
        <DeleteConfirmation
          title="Excluir Retiro"
          resourceName={retreat.title}
          description="Esta ação não pode ser desfeita e removerá permanentemente o retiro."
          requireCheckboxLabel="Eu entendo as consequências."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={async () => {
            try {
              await apiClient.delete(`/api/Retreats/${retreat.id}`);

              enqueueSnackbar("Retiro excluído com sucesso!", {
                variant: "success",
              });

              modal.close();
              router.push("/retreats");
            } catch (error: unknown) {
              const message = axios.isAxiosError(error)
                ? ((error.response?.data as { error?: string })?.error ??
                  error.message)
                : "Erro ao excluir retiro. Tente novamente.";
              enqueueSnackbar(message, {
                variant: "error",
              });
              throw error; // Re-throw para o DeleteConfirmation mostrar o erro
            }
          }}
          onCancel={() => modal.close()}
        />
      ),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const hasUploads = newImages.length > 0 || imagesToDelete.length > 0;

      if (isCreating) {
        const payload = { ...formData, imagesToDelete };

        if (hasUploads) {
          const body = new FormData();
          body.append(
            "payload",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
          newImages.forEach((f) => body.append("images", f));

          const res = await apiClient.post<Retreat>("/api/Retreats", body, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          enqueueSnackbar("Retiro criado com sucesso!", {
            variant: "success",
          });
          router.push(`/retreats/${res.data.id}`);
        } else {
          const res = await apiClient.post<Retreat>("/api/Retreats", payload);

          enqueueSnackbar("Retiro criado com sucesso!", {
            variant: "success",
          });
          router.push(`/retreats/${res.data.id}`);
        }
      } else {
        if (!retreat?.id) throw new Error("ID do retiro não encontrado");

        const payload = { ...formData, imagesToDelete };

        if (hasUploads) {
          const body = new FormData();
          body.append(
            "payload",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
          newImages.forEach((f) => body.append("images", f));

          const res = await apiClient.put<Retreat>(
            `/api/Retreats/${retreat.id}`,
            body,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          setRetreat(res.data);
          enqueueSnackbar("Retiro atualizado com sucesso!", {
            variant: "success",
          });
        } else {
          const res = await apiClient.put<Retreat>(
            `/api/Retreats/${retreat.id}`,
            payload
          );

          setRetreat(res.data);
          enqueueSnackbar("Retiro atualizado com sucesso!", {
            variant: "success",
          });
        }
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as { error?: string })?.error ?? error.message)
        : "Ocorreu um erro. Tente novamente.";
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", height: "100%", p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="circular" width={200} height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isCreating ? "Criar Retiro" : `Editar Retiro: ${retreat?.title ?? ""}`}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Título"
            value={formData.title}
            onChange={handleInputChange("title")}
            required
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Edição"
            value={formData.edition}
            onChange={handleInputChange("edition")}
            required
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Tema"
            value={formData.theme}
            onChange={handleInputChange("theme")}
            required
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Localização"
            value={formData.location}
            onChange={handleInputChange("location")}
            required
            disabled={isReadOnly}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <LocationField
            selectedState={formData.stateShort}
            selectedCity={formData.city}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            required
            size="medium"
            disabled={isReadOnly && !isCreating}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Descrição"
            multiline
            minRows={3}
            value={formData.description}
            onChange={handleInputChange("description")}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MultiImageUpload
            label="Imagens do retiro"
            existing={
              Array.isArray(
                (
                  retreatData as Retreat & {
                    gallery?: Array<{
                      id: string | number;
                      url: string;
                      title?: string;
                    }>;
                  }
                )?.gallery
              )
                ? (
                    retreatData as Retreat & {
                      gallery: Array<{
                        id: string | number;
                        url: string;
                        title?: string;
                      }>;
                    }
                  ).gallery.map((g) => ({
                    id: g.id,
                    url: g.url,
                    title: g.title,
                  }))
                : Array.isArray(formData.images)
                  ? formData.images.map((url, idx) => ({ id: idx, url }))
                  : []
            }
            onRemoveExisting={(id) =>
              setImagesToDelete((prev) => [...prev, id])
            }
            value={newImages}
            onChange={setNewImages}
            maxFiles={12}
            maxSizeMB={8}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Início"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange("startDate")}
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Fim"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange("endDate")}
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Vagas"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange("capacity")}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextFieldMasked
            maskType="currency"
            fullWidth
            label="Taxa de Participação"
            value={formData.participationTax}
            onChange={handleInputChange("participationTax")}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Instrutor"
            value={formData.instructor}
            onChange={handleInputChange("instructor")}
            disabled={isReadOnly}
          />
        </Grid>

        <Grid
          size={{ xs: 12 }}
          sx={{
            position: "sticky",
            bottom: 0,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            {!isCreating && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Excluir Retiro
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFormData(
                      retreatData
                        ? mapRetreatToFormData(retreatData)
                        : emptyFormData
                    )
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </>
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isCreating
                  ? "Salvar Retiro"
                  : "Salvar Alterações"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RetreatEditPage;
