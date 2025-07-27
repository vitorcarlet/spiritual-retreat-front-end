"use client";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Typography,
  Button,
  Divider,
  Chip,
  FormControlLabel,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useUserContent } from "./context";
import { Iconify } from "../Iconify";

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
  role: Roles;
  customPermissions: Record<string, boolean>;
}

// Configuração das seções de permissões
const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    id: "users",
    label: "Usuários",
    icon: "solar:user-bold-duotone",
    permissions: [
      {
        id: "users.view",
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
        id: "users.edit",
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
        id: "retreats.view",
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
        id: "retreats.edit",
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
    label: "Relatórios e Dashboard",
    icon: "solar:chart-bold-duotone",
    permissions: [
      {
        id: "reports.view",
        label: "Visualizar relatórios",
        description: "Pode acessar relatórios e dashboard",
        icon: "solar:document-text-bold",
      },
      {
        id: "reports.export",
        label: "Exportar relatórios",
        description: "Pode exportar dados em diversos formatos",
        icon: "solar:export-bold",
      },
    ],
  },
  {
    id: "permissions",
    label: "Permissões",
    icon: "solar:shield-check-bold-duotone",
    permissions: [
      {
        id: "permissions.view",
        label: "Visualizar permissões",
        description: "Pode ver permissões de outros usuários",
        icon: "solar:eye-bold",
      },
      {
        id: "permissions.edit",
        label: "Editar permissões",
        description: "Pode modificar permissões de outros usuários",
        icon: "solar:shield-keyhole-bold",
      },
    ],
  },
  {
    id: "enrollment",
    label: "Inscrições",
    icon: "solar:document-add-bold-duotone",
    permissions: [
      {
        id: "enrollment.view",
        label: "Visualizar inscrições",
        description: "Pode ver inscrições em retiros",
        icon: "solar:eye-bold",
      },
      {
        id: "enrollment.manage",
        label: "Gerenciar inscrições",
        description: "Pode aprovar/rejeitar inscrições",
        icon: "solar:check-circle-bold",
      },
    ],
  },
  {
    id: "contemplation",
    label: "Contemplação",
    icon: "solar:meditation-bold-duotone",
    permissions: [
      {
        id: "contemplation.view",
        label: "Visualizar conteúdo",
        description: "Pode acessar materiais de contemplação",
        icon: "solar:book-bold",
      },
      {
        id: "contemplation.manage",
        label: "Gerenciar conteúdo",
        description: "Pode criar e editar materiais",
        icon: "solar:pen-new-square-bold",
      },
    ],
  },
  {
    id: "payments",
    label: "Pagamentos",
    icon: "solar:card-bold-duotone",
    permissions: [
      {
        id: "payments.view",
        label: "Visualizar pagamentos",
        description: "Pode ver histórico de pagamentos",
        icon: "solar:eye-bold",
      },
      {
        id: "payments.manage",
        label: "Gerenciar pagamentos",
        description: "Pode processar reembolsos e ajustes",
        icon: "solar:wallet-money-bold",
      },
    ],
  },
  {
    id: "families",
    label: "Famílias",
    icon: "solar:users-group-two-rounded-bold-duotone",
    permissions: [
      {
        id: "families.view",
        label: "Visualizar famílias",
        description: "Pode ver grupos familiares",
        icon: "solar:eye-bold",
      },
      {
        id: "families.manage",
        label: "Gerenciar famílias",
        description: "Pode criar e editar grupos familiares",
        icon: "solar:users-group-rounded-bold",
      },
    ],
  },
  {
    id: "teams",
    label: "Equipes de serviço",
    icon: "solar:users-group-rounded-bold-duotone",
    permissions: [
      {
        id: "teams.view",
        label: "Visualizar equipes",
        description: "Pode ver equipes de serviço",
        icon: "solar:eye-bold",
      },
      {
        id: "teams.manage",
        label: "Gerenciar equipes",
        description: "Pode organizar equipes de trabalho",
        icon: "solar:settings-bold",
      },
    ],
  },
  {
    id: "accommodations",
    label: "Barracas",
    icon: "solar:home-smile-bold-duotone",
    permissions: [
      {
        id: "accommodations.view",
        label: "Visualizar acomodações",
        description: "Pode ver disponibilidade de barracas",
        icon: "solar:eye-bold",
      },
      {
        id: "accommodations.manage",
        label: "Gerenciar acomodações",
        description: "Pode alocar e gerenciar barracas",
        icon: "solar:home-bold",
      },
    ],
  },
  {
    id: "messages",
    label: "Mensagens",
    icon: "solar:chat-round-dots-bold-duotone",
    permissions: [
      {
        id: "messages.view",
        label: "Visualizar mensagens",
        description: "Pode ver mensagens do sistema",
        icon: "solar:eye-bold",
      },
      {
        id: "messages.send",
        label: "Enviar mensagens",
        description: "Pode enviar mensagens para usuários",
        icon: "solar:letter-bold",
      },
    ],
  },
];

// Permissões padrão por cargo
const ROLE_PERMISSIONS: Record<Roles, string[]> = {
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
    customPermissions: {},
  });

  useEffect(() => {
    if (user) {
      setPermissionsData({
        role: user.role || "participant",
        customPermissions: user.permissions || {},
      });
    }
  }, [user]);

  const handleRoleChange = (event: SelectChangeEvent) => {
    const newRole = event.target.value as Roles;
    setPermissionsData((prev) => ({
      ...prev,
      role: newRole,
      customPermissions: {}, // Reset custom permissions when role changes
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setPermissionsData((prev) => ({
      ...prev,
      customPermissions: {
        ...prev.customPermissions,
        [permissionId]: !prev.customPermissions[permissionId],
      },
    }));
  };

  const isPermissionEnabled = (permissionId: string): boolean => {
    // Se está nas permissões do cargo, está habilitado
    const rolePermissions = ROLE_PERMISSIONS[permissionsData.role] || [];
    if (rolePermissions.includes(permissionId)) {
      return true;
    }

    // Senão, verifica nas permissões customizadas
    return permissionsData.customPermissions[permissionId] || false;
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

  const getRoleDisplayName = (role: Roles): string => {
    const roleMap = {
      admin: "Administrador",
      manager: "Gestor",
      consultant: "Consultor",
      participant: "Participante",
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: Roles) => {
    const colorMap = {
      admin: "error",
      manager: "warning",
      consultant: "info",
      participant: "success",
    } as const;
    return colorMap[role] || "default";
  };

  //   if (isLoading) {
  //     return (
  //       <Box sx={{ width: "100%", height: "100%", p: 3 }}>
  //         <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
  //         <Skeleton variant="circular" width={200} height={200} sx={{ mb: 3 }} />
  //         <Grid container spacing={3}>
  //           {[...Array(8)].map((_, index) => (
  //             <Grid size={{ xs: 12, md: 6 }} key={index}>
  //               <Skeleton variant="rectangular" height={120} />
  //             </Grid>
  //           ))}
  //         </Grid>
  //       </Box>
  //     );
  //   }

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
            src="/images/background16-9.png"
            alt="Background"
            fill
            style={{ objectFit: "cover" }}
            priority
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
          />
        </Box>
      </Box>

      {/* Formulário */}
      <Box sx={{ padding: 3, paddingTop: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
          Permissões do Usuário: {user?.name}
        </Typography>

        <Grid container spacing={3}>
          {/* Cargo do usuário */}
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Iconify
                    icon="solar:shield-user-bold-duotone"
                    size={2}
                    sx={{ color: "primary.main" }}
                  />
                  <Typography variant="h6">Cargo e Permissões Base</Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  As permissões marcadas em laranja são automáticas do cargo
                  selecionado e não podem ser desabilitadas. As permissões em
                  cinza podem ser habilitadas individualmente.
                </Alert>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="select-role-label">Cargo</InputLabel>
                    <Select
                      labelId="select-role-label"
                      value={permissionsData.role}
                      onChange={handleRoleChange}
                      label="Cargo"
                    >
                      <MenuItem value="participant">Participante</MenuItem>
                      <MenuItem value="consultant">Consultor</MenuItem>
                      <MenuItem value="manager">Gestor</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                    </Select>
                  </FormControl>

                  <Chip
                    label={getRoleDisplayName(permissionsData.role)}
                    color={getRoleColor(permissionsData.role)}
                    size="medium"
                    icon={<Iconify icon="solar:crown-bold" />}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Seções de permissões */}
          {PERMISSION_SECTIONS.map((section) => (
            <Grid size={{ xs: 12, md: 6 }} key={section.id}>
              <Card sx={{ height: "100%" }}>
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
                      icon={section.icon}
                      size={1.5}
                      sx={{ color: "text.secondary" }}
                    />
                    <Typography variant="h6">{section.label}</Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {section.permissions.map((permission) => {
                      const isEnabled = isPermissionEnabled(permission.id);
                      const isFromRole = isPermissionFromRole(permission.id);

                      return (
                        <FormControlLabel
                          key={permission.id}
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
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
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
                                  variant="body2"
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
                                sx={{ color: "text.secondary", ml: 3 }}
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
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Botões de ação */}
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
                  //   if (user) {
                  //     setPermissionsData({
                  //       role: user.role || "participant",
                  //       customPermissions: user.customPermissions || {},
                  //     });
                  //   }
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
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UserPermissionsPage;
