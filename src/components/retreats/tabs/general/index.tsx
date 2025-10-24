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
import { Controller, useForm } from "react-hook-form";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import { useModal } from "@/src/hooks/useModal";
import { useSnackbar } from "notistack";
import TextFieldMasked from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import DeleteConfirmation from "@/src/components/confirmations/DeleteConfirmation";
import { Retreat } from "@/src/types/retreats";
import {
  fetchRetreatData,
  createRetreat,
  updateRetreat,
  deleteRetreat,
} from "@/src/components/retreats/shared";

const retreatGeneralSchema = z
  .object({
    name: z.string().trim().min(1, "O título é obrigatório"),
    edition: z.string().trim().min(1, "Informe a edição"),
    theme: z.string().trim().min(1, "Informe o tema"),
    startDate: z.string().min(1, "Informe a data de início"),
    endDate: z.string().min(1, "Informe a data de fim"),
    registrationStart: z.string().min(1, "Informe o início das inscrições"),
    registrationEnd: z.string().min(1, "Informe o fim das inscrições"),
    feeFazer: z.number().min(0, "Informe um valor válido"),
    feeServir: z.number().min(0, "Informe um valor válido"),
    capacity: z.number().min(0, "A capacidade deve ser positiva"),
    maleSlots: z.number().min(0, "Vagas masculinas devem ser positivas"),
    femaleSlots: z.number().min(0, "Vagas femininas devem ser positivas"),
    westRegionPct: z
      .number()
      .min(0)
      .max(100, "Percentual deve estar entre 0 e 100"),
    otherRegionPct: z
      .number()
      .min(0)
      .max(100, "Percentual deve estar entre 0 e 100"),
    stateShort: z.string().optional(),
    city: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    instructor: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.registrationStart &&
      data.registrationEnd &&
      data.registrationEnd < data.registrationStart
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registrationEnd"],
        message: "A data final deve ser posterior à inicial",
      });
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "A data final deve ser posterior à inicial",
      });
    }
  });

type RetreatGeneralFormValues = z.output<typeof retreatGeneralSchema>;

const defaultFormValues: RetreatGeneralFormValues = {
  name: "",
  edition: "1",
  theme: "",
  startDate: "",
  endDate: "",
  registrationStart: "",
  registrationEnd: "",
  feeFazer: 0,
  feeServir: 0,
  capacity: 0,
  maleSlots: 60,
  femaleSlots: 60,
  westRegionPct: 85,
  otherRegionPct: 15,
  stateShort: "",
  city: "",
  location: "",
  description: "",
  instructor: "",
};

const normalizeDateInput = (value?: string | null): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const extractNumericValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.,-]/g, "").replace(/,/g, ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value && typeof value === "object") {
    const amount = (value as { amount?: number }).amount;
    if (typeof amount === "number" && Number.isFinite(amount)) {
      return amount;
    }

    const nestedValue = (value as { value?: number }).value;
    if (typeof nestedValue === "number" && Number.isFinite(nestedValue)) {
      return nestedValue;
    }
  }

  return 0;
};

const mapRetreatToFormValues = (
  retreat: Retreat
): RetreatGeneralFormValues => ({
  ...defaultFormValues,
  name: retreat.name ?? defaultFormValues.name,
  edition:
    retreat.edition != null
      ? String(retreat.edition)
      : defaultFormValues.edition,
  theme: retreat.theme ?? defaultFormValues.theme,
  startDate: normalizeDateInput(retreat.startDate),
  endDate: normalizeDateInput(retreat.endDate),
  registrationStart: normalizeDateInput(retreat.registrationStart),
  registrationEnd: normalizeDateInput(retreat.registrationEnd),
  feeFazer: extractNumericValue(retreat.feeFazer),
  feeServir: extractNumericValue(retreat.feeServir),
  maleSlots:
    typeof retreat.maleSlots === "number"
      ? retreat.maleSlots
      : defaultFormValues.maleSlots,
  femaleSlots:
    typeof retreat.femaleSlots === "number"
      ? retreat.femaleSlots
      : defaultFormValues.femaleSlots,
  westRegionPct: extractNumericValue(retreat.westRegionPct),
  otherRegionPct: extractNumericValue(retreat.otherRegionPct),
  stateShort: retreat.stateShort ?? defaultFormValues.stateShort,
  city: retreat.city ?? defaultFormValues.city,
  description: retreat.description ?? defaultFormValues.description,
  capacity:
    typeof retreat.capacity === "number"
      ? retreat.capacity
      : defaultFormValues.capacity,
  location: retreat.location ?? defaultFormValues.location,
  instructor: retreat.instructor ?? defaultFormValues.instructor,
});

const RetreatEditPage = ({ isCreating }: { isCreating?: boolean }) => {
  const { menuMode } = useMenuMode();
  const { setBreadCrumbsTitle } = useBreadCrumbs();
  const router = useRouter();
  const params = useParams();
  const modal = useModal();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const rawId = params?.id;
  const retreatId =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : undefined;

  const { data: retreatData, isLoading } = useQuery({
    queryKey: ["retreats", retreatId ?? "new"],
    queryFn: () => fetchRetreatData(retreatId!),
    enabled: Boolean(retreatId) && !isCreating,
    staleTime: 5 * 60 * 1000,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RetreatGeneralFormValues>({
    resolver: zodResolver(retreatGeneralSchema),
    defaultValues: defaultFormValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldUnregister: false,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<(string | number)[]>([]);

  const isReadOnly = menuMode === "view";

  useEffect(() => {
    if (retreatData) {
      reset(mapRetreatToFormValues(retreatData));
      setImagesToDelete([]);
      setNewImages([]);
    } else if (isCreating) {
      reset(defaultFormValues);
      setImagesToDelete([]);
      setNewImages([]);
    }
  }, [retreatData, isCreating]);

  useEffect(() => {
    if (retreatData) {
      setBreadCrumbsTitle({
        title: retreatData.name,
        pathname: `/retreats/${retreatData.id}`,
      });
    } else if (isCreating) {
      setBreadCrumbsTitle({
        title: "Criar Retiro",
        pathname: "/retreats/create",
      });
    }
  }, [retreatData, isCreating, setBreadCrumbsTitle]);

  const watchedName = watch("name");

  // const existingImages = (() => {
  //   const gallery = (
  //     retreatData as Retreat & {
  //       gallery?: Array<{ id: string | number; url: string; title?: string }>;
  //     }
  //   )?.gallery;

  //   if (Array.isArray(gallery) && gallery.length > 0) {
  //     return gallery
  //       .filter((item) => !imagesToDelete.includes(item.id))
  //       .map((item) => ({
  //         id: item.id,
  //         url: item.url,
  //         title: item.title,
  //       }));
  //   }

  //   if (retreatData && Array.isArray(retreatData.images)) {
  //     return retreatData.images
  //       .map((url: string, index: number) => ({ id: index, url }))
  //       .filter(
  //         (item: { id: number; url: string }) =>
  //           !imagesToDelete.includes(item.id)
  //       );
  //   }

  //   return [];
  // })();

  const handleDelete = () => {
    if (!retreatData?.id) return;

    modal.open({
      title: "Confirmar exclusão",
      size: "sm",
      customRender: () => (
        <DeleteConfirmation
          title="Excluir Retiro"
          resourceName={retreatData.name}
          description="Esta ação não pode ser desfeita e removerá permanentemente o retiro."
          requireCheckboxLabel="Eu entendo as consequências."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={async () => {
            try {
              await deleteRetreat(String(retreatData.id));

              enqueueSnackbar("Retiro excluído com sucesso!", {
                variant: "success",
              });

              modal.close();
              router.push("/retreats");
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Erro ao excluir retiro. Tente novamente.";
              enqueueSnackbar(message, {
                variant: "error",
              });
              throw error;
            }
          }}
          onCancel={() => modal.close()}
        />
      ),
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      imagesToDelete,
    };

    // Salva os valores anteriores em caso de erro
    const previousFormValues = { ...values };
    const previousImagesToDelete = [...imagesToDelete];
    const previousNewImages = [...newImages];

    try {
      if (isCreating) {
        const data = await createRetreat(
          payload,
          newImages.length > 0 ? newImages : undefined
        );
        enqueueSnackbar("Retiro criado com sucesso!", {
          variant: "success",
        });
        setImagesToDelete([]);
        setNewImages([]);
        router.push(`/retreats/${data.retreatId}`);
        return;
      }

      const idToUpdate =
        retreatId ?? (retreatData ? String(retreatData.id) : undefined);
      if (!idToUpdate) {
        throw new Error("ID do retiro não encontrado");
      }

      await updateRetreat(
        idToUpdate,
        payload,
        newImages.length > 0 ? newImages : undefined
      );

      // Invalida a query para refetch dos dados atualizados
      await queryClient.invalidateQueries({
        queryKey: ["retreats", idToUpdate],
      });

      setImagesToDelete([]);
      setNewImages([]);
      enqueueSnackbar("Retiro atualizado com sucesso!", {
        variant: "success",
      });
    } catch (error: unknown) {
      // Em caso de erro, reseta para os valores anteriores
      reset(previousFormValues);
      setImagesToDelete(previousImagesToDelete);
      setNewImages(previousNewImages);

      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro. Tente novamente.";
      enqueueSnackbar(message, {
        variant: "error",
      });
    }
  });

  if (!isCreating && isLoading) {
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
    <Box component="form" onSubmit={onSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isCreating
          ? "Criar Retiro"
          : `Editar Retiro: ${watchedName || retreatData?.name || ""}`}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Título"
            required
            disabled={isReadOnly}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register("name")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Edição"
            required
            disabled={isReadOnly}
            error={Boolean(errors.edition)}
            helperText={errors.edition?.message}
            {...register("edition")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Tema"
            required
            disabled={isReadOnly}
            error={Boolean(errors.theme)}
            helperText={errors.theme?.message}
            {...register("theme")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Localização"
            disabled={isReadOnly}
            error={Boolean(errors.location)}
            helperText={errors.location?.message}
            {...register("location")}
          />
        </Grid>

        {/* <Grid size={{ xs: 12 }}>
          <LocationField
            selectedState={watchedState ?? ""}
            selectedCity={watchedCity ?? ""}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            size="medium"
            disabled={isReadOnly && !isCreating}
            error={Boolean(errors.stateShort?.message || errors.city?.message)}
            helperText={errors.stateShort?.message ?? errors.city?.message}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Descrição"
            multiline
            minRows={3}
            disabled={isReadOnly}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            {...register("description")}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12 }}>
          <MultiImageUpload
            label="Imagens do retiro"
            existing={existingImages}
            onRemoveExisting={(id) =>
              setImagesToDelete((prev) =>
                prev.includes(id) ? prev : [...prev, id]
              )
            }
            value={newImages}
            onChange={setNewImages}
            maxFiles={12}
            maxSizeMB={8}
            disabled={isReadOnly}
          />
        </Grid> */}

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Início das Inscrições"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
            error={Boolean(errors.registrationStart)}
            helperText={errors.registrationStart?.message}
            {...register("registrationStart")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Fim das Inscrições"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
            error={Boolean(errors.registrationEnd)}
            helperText={errors.registrationEnd?.message}
            {...register("registrationEnd")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Início"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate?.message}
            {...register("startDate")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Data de Fim"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate?.message}
            {...register("endDate")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Vagas"
            type="number"
            disabled={isReadOnly}
            error={Boolean(errors.capacity)}
            helperText={errors.capacity?.message}
            inputProps={{ min: 0 }}
            {...register("capacity", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" || value == null ? 0 : Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Vagas Masculinas"
            type="number"
            disabled={isReadOnly}
            error={Boolean(errors.maleSlots)}
            helperText={errors.maleSlots?.message}
            inputProps={{ min: 0 }}
            {...register("maleSlots", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" || value == null ? 0 : Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Vagas Femininas"
            type="number"
            disabled={isReadOnly}
            error={Boolean(errors.femaleSlots)}
            helperText={errors.femaleSlots?.message}
            inputProps={{ min: 0 }}
            {...register("femaleSlots", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" || value == null ? 0 : Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="% Região Oeste"
            type="number"
            disabled={isReadOnly}
            error={Boolean(errors.westRegionPct)}
            helperText={errors.westRegionPct?.message}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            {...register("westRegionPct", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" || value == null ? 85 : Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="% Outras Regiões"
            type="number"
            disabled={isReadOnly}
            error={Boolean(errors.otherRegionPct)}
            helperText={errors.otherRegionPct?.message}
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            {...register("otherRegionPct", {
              valueAsNumber: true,
              setValueAs: (value) =>
                value === "" || value == null ? 15 : Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            control={control}
            name="feeFazer"
            render={({ field }) => (
              <TextFieldMasked
                maskType="currency"
                fullWidth
                label="Taxa de Participação"
                disabled={isReadOnly}
                error={Boolean(errors.feeFazer)}
                helperText={errors.feeFazer?.message}
                value={field.value ?? 0}
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const numericValue = Number(event.target.value || 0);
                  field.onChange(Number.isNaN(numericValue) ? 0 : numericValue);
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            control={control}
            name="feeServir"
            render={({ field }) => (
              <TextFieldMasked
                maskType="currency"
                fullWidth
                label="Taxa de Servidão"
                disabled={isReadOnly}
                error={Boolean(errors.feeServir)}
                helperText={errors.feeServir?.message}
                value={field.value ?? 0}
                name={field.name}
                inputRef={field.ref}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const numericValue = Number(event.target.value || 0);
                  field.onChange(Number.isNaN(numericValue) ? 0 : numericValue);
                }}
              />
            )}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Instrutor"
            disabled={isReadOnly}
            error={Boolean(errors.instructor)}
            helperText={errors.instructor?.message}
            {...register("instructor")}
          />
        </Grid> */}

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
                  disabled={isSubmitting || isReadOnly}
                >
                  Excluir Retiro
                </Button>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => {
                    if (retreatData) {
                      reset(mapRetreatToFormValues(retreatData));
                    } else {
                      reset(defaultFormValues);
                    }
                    setImagesToDelete([]);
                    setNewImages([]);
                  }}
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
