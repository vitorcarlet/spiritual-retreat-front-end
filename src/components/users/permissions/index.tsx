"use client";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  Typography,
  Button,
  Divider,
  Chip,
  FormControlLabel,
  Alert,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import Iconify from "../../Iconify";
import { UserObject, UserPermissions } from "next-auth";
import {
  PERMISSION_SECTIONS,
  ROLE_PERMISSIONS,
} from "@/src/utils/getPermission";
import Header from "./Header";
import { useUserContent } from "../context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

const UserPermissionsPage = () => {
  const { user, setUser } = useUserContent();
  const { menuMode } = useMenuMode();
  const isReadOnly = menuMode === "view";
  const [permissionsData, setPermissionsData] = useState<UserPermissionsData>({
    role: "participant",
    permissions: {} as UserPermissions,
  });

  const queryClient = useQueryClient();

  // ✅ NOVO: Estado para seção selecionada
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (user) {
      setPermissionsData({
        role: user.role || "participant",
        permissions: user.permissions || {},
      });
    }
    console.log("User permissions data loaded:", user);
  }, [user]);

  const handlePermissionToggle = (permissionId: string) => {
    const [section, action] = permissionId.split(".");
    setPermissionsData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section],
          [action]: !prev.permissions[section]?.[action],
        },
      },
    }));
  };

  // ✅ NOVO: Handler para seleção de seção
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId === selectedSectionId ? null : sectionId);
  };

  const isPermissionEnabled = (permissionId: string): boolean => {
    const rolePermissions =
      ROLE_PERMISSIONS[permissionsData.role as keyof typeof ROLE_PERMISSIONS];
    if (rolePermissions.includes(permissionId)) {
      return true;
    }
    const [section, action] = permissionId.split(".");

    // console.log(
    //   permissionId,
    //   "--",
    //   permissionsData.permissions,
    //   permissionsData.permissions[section]?.[action] || false
    // );
    // Senão, verifica nas permissões customizadas
    return permissionsData.permissions?.[section]?.[action] || false;
  };

  const isPermissionFromRole = (permissionId: string): boolean => {
    const [section, action] = permissionId.split(".");
    return user?.permissions?.[section]?.[action];
  };

  const mutationUpdatePermissions = useMutation({
    mutationFn: async (data: UserPermissionsData) => {
      // Chame sua API para salvar permissões
      await fetch("/api/permissions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setUser((prev: UserObject) => ({
        ...prev,
        permissions: permissionsData.permissions,
      }));
      // Feedback de sucesso, fechar modal, etc.
    },
    onSettled: () => {
      // Invalida a query para garantir que os dados estejam atualizados
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutationUpdatePermissions.mutate(permissionsData);

    // Aqui você enviaria os dados para o servidor
  };

  // ✅ NOVO: Encontrar seção selecionada
  const selectedSection = PERMISSION_SECTIONS.find(
    (section) => section.id === selectedSectionId
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      id="user-permissions-form"
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "hidden",
        pt: 0,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          padding: 3,
          paddingTop: 0,
          borderRadius: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Header */}
        <Header role={user?.role as string} />

        <Grid
          container
          spacing={1}
          sx={{ mt: 1, width: "100%", height: "calc(100% - 72px)" }}
        >
          {/* ✅ MODIFICADO: Lista de seções (clicáveis) */}
          <Grid
            size={{ xs: 12, lg: 3 }}
            sx={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Seções de Permissões
            </Typography>
            {PERMISSION_SECTIONS.map((section) => (
              <Card
                key={section.id}
                sx={{
                  mb: 2,
                  mr: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  border: selectedSectionId === section.id ? 2 : 1,
                  borderColor:
                    selectedSectionId === section.id
                      ? "primary.main"
                      : "divider",
                  "&:hover": {
                    boxShadow: 2,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => handleSectionSelect(section.id)}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Iconify
                      icon={section.icon}
                      size={1.5}
                      sx={{
                        color:
                          selectedSectionId === section.id
                            ? "primary.main"
                            : "text.secondary",
                      }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight:
                          selectedSectionId === section.id ? 600 : 400,
                        color:
                          selectedSectionId === section.id
                            ? "primary.main"
                            : "text.primary",
                      }}
                    >
                      {section.label}
                    </Typography>
                    {selectedSectionId === section.id && (
                      <Iconify
                        icon="solar:alt-arrow-right-bold"
                        size={1.2}
                        sx={{ color: "primary.main", ml: "auto" }}
                      />
                    )}
                  </Box>

                  {/* ✅ NOVO: Indicador de quantas permissões estão ativas */}
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {section.permissions.length} permissões
                    </Typography>
                    <Chip
                      label={`${
                        section.permissions.filter((p) =>
                          isPermissionEnabled(p.id)
                        ).length
                      } ativas`}
                      size="small"
                      color={
                        selectedSectionId === section.id ? "primary" : "default"
                      }
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* ✅ NOVO: Área de detalhes das permissões */}
          <Grid
            size={{ xs: 12, lg: 9 }}
            sx={{
              width: "100%",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {selectedSection ? (
              <>
                <Box>
                  {/* Header da seção selecionada */}
                  <Card
                    sx={{
                      boxShadow: 0,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Iconify
                          icon={selectedSection.icon}
                          size={2}
                          sx={{ color: "primary.main" }}
                        />
                        <Typography variant="h5" color="primary.main">
                          Permissões de {selectedSection.label}
                        </Typography>
                      </Box>

                      <Alert severity="info" sx={{ mb: 2 }}>
                        {isReadOnly ? (
                          "Permissões não podem ser editadas no modo de visualização."
                        ) : (
                          <>
                            As permissões marcadas com{" "}
                            <Chip
                              label="Cargo"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mx: 0.5 }}
                            />
                            são automáticas do cargo atual e não podem ser
                            desabilitadas.
                          </>
                        )}
                      </Alert>
                      <Divider sx={{ mb: 3 }} />

                      <Grid container spacing={2}>
                        {selectedSection.permissions.map((permission) => {
                          const isEnabled = isPermissionEnabled(permission.id);
                          const isFromRole = isPermissionFromRole(
                            permission.id
                          );

                          return (
                            <Grid size={{ xs: 12, md: 6 }} key={permission.id}>
                              <Card
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  border: isEnabled ? 2 : 1,
                                  backgroundColor: "background.default",
                                  borderColor: isReadOnly
                                    ? "grey.600"
                                    : isEnabled
                                    ? "primary.main"
                                    : "divider",
                                  // bgcolor: isEnabled
                                  //   ? "primary.50"
                                  //   : "background.paper",
                                  transition: "all 0.2s ease-in-out",
                                  boxShadow: "none",
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={isEnabled}
                                      onChange={() =>
                                        handlePermissionToggle(permission.id)
                                      }
                                      disabled={isFromRole || isReadOnly}
                                      color={
                                        isReadOnly
                                          ? "primary"
                                          : isFromRole
                                          ? "default"
                                          : "primary"
                                      }
                                    />
                                  }
                                  label={
                                    <Box sx={{ ml: 1 }}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          mb: 0.5,
                                        }}
                                      >
                                        <Iconify
                                          icon={permission.icon}
                                          size={1.2}
                                          sx={{
                                            color: isEnabled
                                              ? "primary.main"
                                              : "text.disabled",
                                          }}
                                        />
                                        <Typography
                                          variant="subtitle2"
                                          sx={{
                                            fontWeight: isEnabled ? 600 : 400,
                                            color: isEnabled
                                              ? "text.primary"
                                              : "text.secondary",
                                          }}
                                        >
                                          {permission.label}
                                        </Typography>
                                        {isFromRole && (
                                          <Chip
                                            label="Cargo"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "text.secondary" }}
                                      >
                                        {permission.description}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{
                                    alignItems: "flex-start",
                                    "& .MuiFormControlLabel-label": { pt: 0.5 },
                                  }}
                                />
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "flex-end",
                    mt: 4,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => {
                      if (user) {
                        setPermissionsData({
                          role: user.role || "participant",
                          permissions: user.permissions || {},
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
                    startIcon={<Iconify icon="solar:shield-check-bold" />}
                    disabled={mutationUpdatePermissions.isPending}
                  >
                    {mutationUpdatePermissions.isPending
                      ? "Salvando..."
                      : "Salvar Permissões"}
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 400,
                  textAlign: "center",
                }}
              >
                <Iconify
                  icon="solar:widget-add-bold-duotone"
                  size={4}
                  sx={{ color: "text.disabled", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Selecione uma seção
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Clique em uma das seções à esquerda para ver e editar as
                  permissões específicas.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Botões de ação */}
      </Paper>
    </Box>
  );
};

export default UserPermissionsPage;
