"use client";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Button,
  Typography,
  Skeleton,
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import TextFieldMasked from "../../fields/maskedTextFields/TextFieldMasked";
import { useUserContent } from "../context";
import { UserObject, UserRoles } from "next-auth";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { UserObjectWithId } from "./types";
import LocationField from "../../fields/LocalizationFields/LocationField";

const UserEditPage = () => {
  const { user } = useUserContent();
  const { menuMode } = useMenuMode();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const isReadOnly = menuMode === "view";
  const isLoading = false;
  const { setUser } = useUserContent();
  // Modo de criação quando não há usuário carregado
  const isCreating = !user;
  // Estado do formulário
  const [formData, setFormData] = useState<
    Omit<
      UserObject,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "state"
      | "email"
      | "permissions"
      | "first_name"
      | "last_name"
      | "profile_picture"
    >
  >({
    name: "",
    cpf: "",
    birth: "",
    city: "",
    stateShort: "",
    role: "participant",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        cpf: user.cpf || "",
        birth: user.birth || "",
        city: user.city || "",
        stateShort: user.stateShort || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleInputChange =
    (field: keyof UserObject) =>
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
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isCreating) {
        // CREATE
        const res = await handleApiResponse<UserObjectWithId>(
          await sendRequestServerVanilla.post("/users/create", formData)
        );

        if (res.error || !res.data)
          throw new Error(res.error || "Falha ao criar usuário");
        const data = res.data as unknown as UserObject;
        router.push(`/users/${data.id}`);
      } else {
        // UPDATE
        if (!user?.id) throw new Error("ID do usuário não encontrado");
        const res = await handleApiResponse<UserObjectWithId>(
          await sendRequestServerVanilla.put(`/api/user/${user.id}`, formData)
        );

        if (res.error)
          throw new Error(res.error || "Falha ao atualizar usuário");

        const updatedUser = (res.data as unknown as UserObject) ?? null;
        if (updatedUser) {
          setUser(updatedUser);
        }

        enqueueSnackbar("Usuário atualizado com sucesso!", {
          variant: "success",
        });

        // Replace para manter rota atual e garantir sincronização
        //router.replace(`/users/${updatedUser?.id ?? user.id}`);
      }
    } catch (e: any) {
      enqueueSnackbar(e?.message || "Ocorreu um erro. Tente novamente.", {
        variant: "errorMUI",
      });
      console.error("User submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      stateShort: state,
      city: "", // Limpar cidade quando estado mudar
    }));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({
      ...prev,
      city: city,
    }));
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
      {/* Header com imagem de fundo */}
      <Box>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "200px",
          }}
        >
          <Image
            src={"/images/background16-9.png"}
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
            priority
            onLoad={() => console.log("✅ Imagem de fundo carregou")}
            onError={(e) =>
              console.error("❌ Erro ao carregar imagem de fundo:", e)
            }
          />
        </Box>

        {/* Foto de perfil */}
        <Box
          sx={{
            position: "relative",
            transform: "translate(25%, -50%)",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "4px solid white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            marginBottom: "-100px",
          }}
        >
          <Image
            src={
              user?.profile_picture ||
              "https://fastly.picsum.photos/id/503/200/200.jpg?hmac=genECHjox9165KfYsOiMMCmN-zGqh9u-lnhqcFinsrU"
            }
            alt="Profile"
            fill
            style={{ objectFit: "cover", borderRadius: "50%" }}
            onLoad={() => console.log("✅ Imagem de perfil carregou")}
            onError={(e) =>
              console.error("❌ Erro ao carregar imagem de perfil:", e)
            }
          />
        </Box>
      </Box>

      {/* Formulário */}
      <Box sx={{ padding: 3, paddingTop: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          {isCreating ? "Criar Usuário" : `Editar Usuário: ${user?.name ?? ""}`}
        </Typography>

        <Grid container spacing={3}>
          {/* Nome */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nome"
              variant="outlined"
              placeholder="Digite o nome"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
              disabled={isReadOnly && !isCreating}
            />
          </Grid>

          {/* CPF */}
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
              disabled={isReadOnly && !isCreating}
            />
          </Grid>

          {/* Data de Nascimento */}
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
              disabled={isReadOnly && !isCreating}
            />
          </Grid>

          {/* Cidade */}
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

          {/* Role/Função */}
          <Grid size={12} sx={{ mb: 5 }}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="select-role-label">Função</InputLabel>
              <Select
                labelId="select-role-label"
                value={formData.role}
                onChange={handleRoleChange}
                label="Função"
                required
                disabled={isReadOnly && !isCreating}
              >
                <MenuItem value="">
                  <em>Selecione uma função</em>
                </MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="manager">Gestor</MenuItem>
                <MenuItem value="consultant">Consultor</MenuItem>
                <MenuItem value="participant">Participante</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botões de ação */}
          {(isCreating || !isReadOnly) && (
            <Grid size={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                {!isCreating && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => {
                      // Reset para dados originais do usuário
                      if (user) {
                        setFormData({
                          name: user.name || "",
                          cpf: user.cpf || "",
                          birth: user.birth || "",
                          city: user.city || "",
                          stateShort: user.stateShort || "",
                          role: user.role || "",
                        });
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Salvando..."
                    : isCreating
                    ? "Salvar Usuário"
                    : "Salvar Alterações"}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default UserEditPage;
