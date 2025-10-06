"use client";
import {
  Box,
  Button,
  ButtonBase,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import TextFieldMasked from "@/src/components/fields/maskedTextFields/TextFieldMasked";
import { UserObject, UserRoles } from "next-auth";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocationField from "../fields/LocalizationFields/LocationField";
import { useModal } from "@/src/hooks/useModal";
import ProfilePictureModal from "./ProfilePictureModal";

type FormDataShape = Pick<
  UserObject,
  "name" | "cpf" | "birth" | "city" | "stateShort" | "role"
>;

const mapUserToFormData = (user?: UserObject | null): FormDataShape => ({
  name: user?.name ?? "",
  cpf: user?.cpf ?? "",
  birth: user?.birth ?? "",
  city: user?.city ?? "",
  stateShort: user?.stateShort ?? "",
  role: user?.role ?? "participant",
});

const FALLBACK_PROFILE_IMAGE =
  "https://fastly.picsum.photos/id/503/200/200.jpg?hmac=genECHjox9165KfYsOiMMCmN-zGqh9u-lnhqcFinsrU";

const UserEditPage = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { data: session, status, update } = useSession();
  const user = session?.user ?? null;
  const modal = useModal();

  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profile_picture ?? null
  );

  const [formData, setFormData] = useState<FormDataShape>(() =>
    mapUserToFormData()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(mapUserToFormData(user));
    }
  }, [user]);

  useEffect(() => {
    setProfileImageUrl(user?.profile_picture ?? null);
  }, [user?.profile_picture]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const handleInputChange =
    (field: keyof FormDataShape) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      role: event.target.value as UserRoles,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !user?.id) return;

    setIsSubmitting(true);
    try {
      const res = await handleApiResponse<UserObject>(
        await sendRequestServerVanilla.put(`/api/user/${user.id}`, formData)
      );

      if (res.error) {
        throw new Error(res.error || "Falha ao atualizar usuário");
      }

      const updatedUser = res.data ?? null;
      if (updatedUser) {
        setFormData(mapUserToFormData(updatedUser));
        if (update) {
          await update();
        }
      }

      enqueueSnackbar("Usuário atualizado com sucesso!", {
        variant: "success",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro. Tente novamente.";

      enqueueSnackbar(message, {
        variant: "errorMUI",
      });
      console.error("User submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      stateShort: state,
      city: "",
    }));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      city,
    }));
  };

  const handleProfilePictureUpdated = useCallback(
    async (nextUrl: string | null) => {
      setProfileImageUrl(nextUrl);
      try {
        if (update) {
          await update();
        }
      } catch (error) {
        console.error("Erro ao atualizar a sessão após trocar a foto:", error);
      }
    },
    [update]
  );

  const handleOpenProfilePictureModal = useCallback(() => {
    if (!user) return;

    modal.open({
      key: "profile-picture",
      title: "Atualizar foto de perfil",
      size: "sm",
      customRender: () => (
        <ProfilePictureModal
          userId={user.id}
          userName={user.name}
          currentImage={profileImageUrl}
          onClose={modal.close}
          onUploadSuccess={handleProfilePictureUpdated}
        />
      ),
    });
  }, [modal, profileImageUrl, handleProfilePictureUpdated, user]);

  const emailValue = user?.email ?? "";
  const phoneValue = useMemo(() => {
    const asAny = user as unknown as { number?: string; phone?: string };
    return asAny?.number ?? asAny?.phone ?? "";
  }, [user]);
  const displayedProfileImage = profileImageUrl || FALLBACK_PROFILE_IMAGE;

  if (status === "loading") {
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

  if (status === "unauthenticated" || !user) {
    return null;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        pt: 0,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "200px",
          }}
        >
          <Image
            src="/images/background16-9.png"
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        <ButtonBase
          onClick={handleOpenProfilePictureModal}
          disabled={isSubmitting}
          sx={{
            position: "relative",
            transform: "translate(25%, -50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "4px solid white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            marginBottom: "-100px",
            overflow: "hidden",
            p: 0,
            backgroundColor: "transparent",
            cursor: "pointer",
            "&:disabled": {
              cursor: "not-allowed",
              opacity: 0.85,
            },
            "&:hover .profile-picture-overlay": {
              opacity: 1,
            },
          }}
          aria-label="Atualizar foto de perfil"
        >
          <Box sx={{ position: "absolute", inset: 0 }}>
            <Image
              src={displayedProfileImage}
              alt={
                user?.name
                  ? `Foto de ${user.name}`
                  : "Foto de perfil do usuário"
              }
              fill
              style={{ objectFit: "cover" }}
            />
          </Box>
          <Box
            className="profile-picture-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)",
              color: "common.white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              opacity: 0,
              transition: "opacity 0.2s ease",
              pointerEvents: "none",
            }}
          >
            <EditRoundedIcon fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              Alterar foto
            </Typography>
          </Box>
        </ButtonBase>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            width: 200,
            textAlign: "center",
            transform: "translate(25%, 25%)",
          }}
        >
          Clique para atualizar sua foto
        </Typography>
      </Box>

      <Box sx={{ padding: 3, paddingTop: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          Informações do seu Usuário
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nome"
              variant="outlined"
              placeholder="Digite o nome"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
              disabled={isSubmitting}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="E-mail"
              variant="outlined"
              value={emailValue}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextFieldMasked
              fullWidth
              label="CPF"
              variant="outlined"
              placeholder="000.000.000-00"
              maskType="cpf"
              value={formData.cpf}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  cpf: event.target.value,
                }));
              }}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Número"
              variant="outlined"
              value={phoneValue}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Data de Nascimento"
              type="date"
              variant="outlined"
              value={formData.birth}
              onChange={handleInputChange("birth")}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </Grid>

          <Grid size={12} sx={{ mb: 5 }}>
            <FormControl variant="outlined" fullWidth disabled={isSubmitting}>
              <InputLabel id="select-role-label">Função</InputLabel>
              <Select
                labelId="select-role-label"
                value={formData.role}
                onChange={handleRoleChange}
                label="Função"
                required
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gestor</MenuItem>
                <MenuItem value="consultant">Consultor</MenuItem>
                <MenuItem value="participant">Participante</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => setFormData(mapUserToFormData(user))}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserEditPage;
