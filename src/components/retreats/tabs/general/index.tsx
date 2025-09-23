"use client";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Skeleton,
} from "@mui/material";
//import Image from "next/image";
import { useState, useEffect } from "react";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import { fetchRetreatData } from "../../shared";
import LocationField from "@/src/components/fields/LocalizationFields/LocationField";
import TextFieldMasked from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import { Retreat } from "@/src/types/retreats";
import MultiImageUpload from "@/src/components/fields/ImageUpload/MultiImageUpload";

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
  images: [""],
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
    images: r.images ?? "",
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
  console.log("isReadOnly", isReadOnly);
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
      console.log("Retiro data loaded:", retreatData);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Exemplo: se tiver upload, envie como multipart/form-data
      const hasUploads = newImages.length > 0 || imagesToDelete.length > 0;
      if (isCreating) {
        const payload = { ...formData, imagesToDelete };
        const body = hasUploads ? new FormData() : formData;
        if (hasUploads) {
          body.append(
            "payload",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
          newImages.forEach((f) => body.append("images", f));
        }
        const res = await handleApiResponse<Retreat>(
          await sendRequestServerVanilla.post("/api/retreat/create", body)
        );
        if (res.error || !res.data)
          throw new Error(res.error || "Falha ao criar retiro");
        const result = res.data as Retreat;
        router.push(`/retreats/${result.id}`);
      } else {
        if (!retreat?.id) throw new Error("ID do retiro não encontrado");
        const payload = { ...formData, imagesToDelete };
        const body = hasUploads ? new FormData() : payload;
        if (hasUploads) {
          body.append(
            "payload",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
          );
          newImages.forEach((f) => body.append("images", f));
        }
        const res = await handleApiResponse<Retreat>(
          await sendRequestServerVanilla.put(`/api/retreat/${retreat.id}`, body)
        );
        if (res.error)
          throw new Error(res.error || "Falha ao atualizar retiro");
        setRetreat((res.data as Retreat) ?? null);
        enqueueSnackbar("Retiro atualizado com sucesso!", {
          variant: "success",
        });
      }
    } catch (e: unknown) {
      enqueueSnackbar(
        (e as Error)?.message || "Ocorreu um erro. Tente novamente.",
        {
          variant: "errorMUI",
        }
      );
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
              // Ajuste conforme sua API: tente usar uma galeria (retreatData?.gallery)
              // ou faça fallback para uma única imagem de capa (formData.image)
              (retreatData as any)?.gallery?.map((g: any) => ({
                id: g.id,
                url: g.url,
                title: g.title,
              })) || (formData.images ? [{ url: formData.images }] : [])
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
