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
import { useUserContent } from "./context";
import { Iconify } from "../Iconify";
import { UserPermissions, UserRoles } from "next-auth";

// Definir tipos para as permissões
interface Permission {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface PermissionSection {
  id: string;
  label: string;
  icon: string;
  permissions: Permission[];
}

interface UserPermissionsData {
  role: UserRoles;
  permissions: UserPermissions;
}

// Configuração das seções de permissões
const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    id: "users",
    label: "Usuários",
    icon: "solar:user-bold-duotone",
    permissions: [
      {
        id: "users.read",
        label: "Visualizar usuários",
        description: "Pode ver a lista de usuários",
        icon: "solar:eye-bold",
      },
      {
        id: "users.create",
        label: "Criar usuários",
        description: "Pode criar novos usuários",
        icon: "solar:user-plus-bold",
      },
      {
        id: "users.update",
        label: "Editar usuários",
        description: "Pode editar dados de usuários",
        icon: "solar:pen-bold",
      },
      {
        id: "users.delete",
        label: "Deletar usuários",
        description: "Pode excluir usuários",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
  {
    id: "retreats",
    label: "Retiros",
    icon: "material-symbols:temple-buddhist",
    permissions: [
      {
        id: "retreats.read",
        label: "Visualizar retiros",
        description: "Pode ver a lista de retiros",
        icon: "solar:eye-bold",
      },
      {
        id: "retreats.create",
        label: "Criar retiros",
        description: "Pode criar novos retiros",
        icon: "solar:add-circle-bold",
      },
      {
        id: "retreats.update",
        label: "Editar retiros",
        description: "Pode editar retiros existentes",
        icon: "solar:pen-bold",
      },
      {
        id: "retreats.delete",
        label: "Deletar retiros",
        description: "Pode excluir retiros",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: "solar:chart-bold-duotone",
    permissions: [
      {
        id: "reports.read",
        label: "Visualizar relatórios",
        description: "Pode acessar relatórios",
        icon: "solar:document-text-bold",
      },
      {
        id: "reports.create",
        label: "Criar relatórios",
        description: "Pode criar novos relatórios",
        icon: "solar:add-circle-bold",
      },
      {
        id: "reports.update",
        label: "Editar relatórios",
        description: "Pode editar relatórios existentes",
        icon: "solar:pen-bold",
      },
      {
        id: "reports.delete",
        label: "Deletar relatórios",
        description: "Pode excluir relatórios",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
  {
    id: "settings",
    label: "Configurações",
    icon: "solar:settings-bold-duotone",
    permissions: [
      {
        id: "settings.read",
        label: "Visualizar configurações",
        description: "Pode ver configurações do sistema",
        icon: "solar:eye-bold",
      },
      {
        id: "settings.create",
        label: "Criar configurações",
        description: "Pode criar novas configurações",
        icon: "solar:add-circle-bold",
      },
      {
        id: "settings.update",
        label: "Editar configurações",
        description: "Pode modificar configurações do sistema",
        icon: "solar:pen-bold",
      },
      {
        id: "settings.delete",
        label: "Deletar configurações",
        description: "Pode excluir configurações",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
  {
    id: "bookings",
    label: "Reservas",
    icon: "solar:calendar-bold-duotone",
    permissions: [
      {
        id: "bookings.read",
        label: "Visualizar reservas",
        description: "Pode ver reservas de retiros",
        icon: "solar:eye-bold",
      },
      {
        id: "bookings.create",
        label: "Criar reservas",
        description: "Pode fazer novas reservas",
        icon: "solar:calendar-add-bold",
      },
      {
        id: "bookings.update",
        label: "Editar reservas",
        description: "Pode modificar reservas existentes",
        icon: "solar:pen-bold",
      },
      {
        id: "bookings.delete",
        label: "Cancelar reservas",
        description: "Pode cancelar reservas",
        icon: "solar:calendar-cross-bold",
      },
    ],
  },
  {
    id: "profile",
    label: "Perfil",
    icon: "solar:user-circle-bold-duotone",
    permissions: [
      {
        id: "profile.read",
        label: "Visualizar perfil",
        description: "Pode ver dados do próprio perfil",
        icon: "solar:eye-bold",
      },
      {
        id: "profile.create",
        label: "Criar perfil",
        description: "Pode criar perfil",
        icon: "solar:user-plus-bold",
      },
      {
        id: "profile.update",
        label: "Editar perfil",
        description: "Pode editar dados do próprio perfil",
        icon: "solar:pen-bold",
      },
      {
        id: "profile.delete",
        label: "Deletar perfil",
        description: "Pode excluir o próprio perfil",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "solar:widget-bold-duotone",
    permissions: [
      {
        id: "dashboard.read",
        label: "Visualizar dashboard",
        description: "Pode acessar o dashboard",
        icon: "solar:eye-bold",
      },
      {
        id: "dashboard.create",
        label: "Criar widgets",
        description: "Pode criar novos widgets no dashboard",
        icon: "solar:add-circle-bold",
      },
      {
        id: "dashboard.update",
        label: "Editar dashboard",
        description: "Pode personalizar o dashboard",
        icon: "solar:pen-bold",
      },
      {
        id: "dashboard.delete",
        label: "Remover widgets",
        description: "Pode remover widgets do dashboard",
        icon: "solar:trash-bin-minimalistic-bold",
      },
    ],
  },
];

// Permissões padrão por cargo
const ROLE_PERMISSIONS: Record<UserRoles, string[]> = {
  admin: PERMISSION_SECTIONS.flatMap((section) =>
    section.permissions.map((p) => p.id)
  ),
  manager: [
    "users.view",
    "users.edit",
    "retreats.view",
    "retreats.create",
    "retreats.edit",
    "reports.view",
    "reports.export",
    "enrollment.view",
    "enrollment.manage",
    "contemplation.view",
    "contemplation.manage",
    "payments.view",
    "families.view",
    "families.manage",
    "teams.view",
    "teams.manage",
    "accommodations.view",
    "accommodations.manage",
    "messages.view",
    "messages.send",
  ],
  consultant: [
    "users.view",
    "retreats.view",
    "retreats.create",
    "retreats.edit",
    "reports.view",
    "enrollment.view",
    "enrollment.manage",
    "contemplation.view",
    "contemplation.manage",
    "families.view",
    "families.manage",
    "teams.view",
    "teams.manage",
    "accommodations.view",
    "messages.view",
  ],
  participant: [
    "retreats.view",
    "enrollment.view",
    "contemplation.view",
    "messages.view",
  ],
};

const UserPermissionsPage = () => {
  const { user } = useUserContent();
  const [permissionsData, setPermissionsData] = useState<UserPermissionsData>({
    role: "participant",
    permissions: {} as UserPermissions,
  });

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
  }, [user]);

  const handlePermissionToggle = (permissionId: string) => {
    setPermissionsData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: !(prev.permissions as any)[permissionId],
      },
    }));
  };

  // ✅ NOVO: Handler para seleção de seção
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId === selectedSectionId ? null : sectionId);
  };

  const isPermissionEnabled = (permissionId: string): boolean => {
    // Se está nas permissões do cargo, está habilitado
    const rolePermissions = ROLE_PERMISSIONS[permissionsData.role] || [];
    if (rolePermissions.includes(permissionId)) {
      return true;
    }
    const [section, action] = permissionId.split(".");

    console.log(
      permissionId,
      "--",
      permissionsData.permissions,
      permissionsData.permissions[section][action] || false
    );
    // Senão, verifica nas permissões customizadas
    return permissionsData.permissions[section][action] || false;
  };

  const isPermissionFromRole = (permissionId: string): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[permissionsData.role] || [];
    return rolePermissions.includes(permissionId);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Dados das permissões:", permissionsData);
    // Aqui você enviaria os dados para o servidor
  };

  // const getRoleDisplayName = (role: Roles): string => {
  //   const roleMap = {
  //     admin: "Administrador",
  //     manager: "Gestor",
  //     consultant: "Consultor",
  //     participant: "Participante",
  //   };
  //   return roleMap[role] || role;
  // };

  // const getRoleColor = (role: Roles) => {
  //   const colorMap = {
  //     admin: "error",
  //     manager: "warning",
  //     consultant: "info",
  //     participant: "success",
  //   } as const;
  //   return colorMap[role] || "default";
  // };

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
      <Paper elevation={1} sx={{ padding: 3, paddingTop: 3, borderRadius: 1 }}>
        {/* Header */}
        <Grid
          size={12}
          display={"flex"}
          alignItems={"center"}
          height={72}
          gap={2}
          borderBottom={1}
          borderColor={"divider"}
        >
          <Iconify
            icon="solar:danger-triangle-bold-duotone"
            color="warning.main"
          />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: "warning.main",
              textTransform: "capitalize",
            }}
          >
            Cargo: {user?.role}
          </Typography>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
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
          <Grid size={{ xs: 12, lg: 9 }}>
            {selectedSection ? (
              <Box>
                {/* Header da seção selecionada */}
                <Card>
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
                    </Alert>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                      {selectedSection.permissions.map((permission) => {
                        const isEnabled = isPermissionEnabled(permission.id);
                        const isFromRole = isPermissionFromRole(permission.id);

                        return (
                          <Grid size={{ xs: 12, md: 6 }} key={permission.id}>
                            <Card
                              variant="outlined"
                              sx={{
                                p: 2,
                                border: isEnabled ? 2 : 1,
                                backgroundColor: "background.default",
                                borderColor: isEnabled
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
                                    disabled={isFromRole}
                                    color={isFromRole ? "warning" : "primary"}
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
          >
            Salvar Permissões
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserPermissionsPage;
