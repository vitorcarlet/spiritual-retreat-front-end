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
import TextFieldMasked from "../fields/maskedTextFields/TextFieldMasked";
import { useUserContent } from "./context";
import { StateField } from "../fields/LocalizationFields";
import { UserObject, UserRoles } from "next-auth";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

const UserEditPage = () => {
  const { user } = useUserContent();
  const { menuMode } = useMenuMode();
  const isReadOnly = menuMode === "view";
  const isLoading = false;
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
    >
  >({
    name: "",
    cpf: "",
    birth: "",
    city: "",
    stateShort: "",
    role: "participant",
  });

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Dados do formulário:", formData);
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
              user?.profileImage ||
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
          Editar Usuário: {user?.name}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </Grid>

          {/* Cidade */}
          <Grid size={{ xs: 12, md: 6 }}>
            <StateField
              selectedState={formData.stateShort}
              selectedCity={formData.city}
              onStateChange={handleStateChange}
              onCityChange={handleCityChange}
              required
              size="medium"
              disabled={isReadOnly}
            />
          </Grid>

          {/* Role/Função */}
          <Grid size={12}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="select-role-label">Função</InputLabel>
              <Select
                labelId="select-role-label"
                value={formData.role}
                onChange={handleRoleChange}
                label="Função"
                required
                disabled={isReadOnly}
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
          {!isReadOnly && (
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
                  onClick={() => {
                    // Reset para dados originais do usuário
                    if (user) {
                      setFormData({
                        name: user.name || "",
                        cpf: user.cpf || "",
                        birth: user.birth || "",
                        city: user.city || "",
                        stateShort: user.state || "",
                        role: user.role || "",
                      });
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Salvar Alterações
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
