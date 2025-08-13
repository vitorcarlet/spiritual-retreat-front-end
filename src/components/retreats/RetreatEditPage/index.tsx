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
import { fetchRetreatData } from "../shared";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import LocationField from "../../fields/LocalizationFields/LocationField";
import TextFieldMasked from "../../fields/maskedTextFields/TextFieldMasked";

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
  const [retreat, setRetreat] = useState<Retreat | null>(retreatData || null);
  const isReadOnly = menuMode === "view";
  const [formData, setFormData] = useState<Omit<Retreat, "id" | "state">>({
    title: "",
    description: "",
    city: "",
    stateShort: "",
    edition: 1,
    startDate: "",
    endDate: "",
    capacity: 0,
    enrolled: 0,
    location: "",
    isActive: false,
    image: "",
    status: "upcoming",
    instructor: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (retreatData) {
      setFormData({
        title: retreatData.title,
        description: retreatData.description,
        city: retreatData.city,
        stateShort: retreatData.stateShort,
        edition: retreatData.edition,
        startDate: retreatData.startDate,
        endDate: retreatData.endDate,
        capacity: retreatData.capacity,
        enrolled: retreatData.enrolled,
        location: retreatData.location,
        isActive: retreatData.isActive,
        image: retreatData.image,
        status: retreatData.status,
        instructor: retreatData.instructor ?? "",
      });
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
      estado: state,
      cidade: "", // Limpar cidade quando estado mudar
    }));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      cidade: city,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isCreating) {
        const res = await handleApiResponse<Retreat>(
          await sendRequestServerVanilla.post("/api/retreat/create", formData)
        );
        if (res.error || !res.data)
          throw new Error(res.error || "Falha ao criar retiro");
        const result = res.data as Retreat;
        router.push(`/retreats/${result.id}`);
      } else {
        if (!retreat?.id) throw new Error("ID do retiro não encontrado");
        const res = await handleApiResponse<Retreat>(
          await sendRequestServerVanilla.put(
            `/api/retreat/${retreat.id}`,
            formData
          )
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
            maskType={"currency"}
            fullWidth
            label="Descrição"
            multiline
            minRows={3}
            value={formData.description}
            onChange={handleInputChange("description")}
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
                onClick={() => setFormData(retreatData)}
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
