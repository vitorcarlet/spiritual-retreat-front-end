import { ActionType, ResourceType, UserObject, UserRoles } from "next-auth";

export type MenuPermission = {
  // Permissions necessárias (OR logic - qualquer uma serve)
  permissions?: Partial<Record<ResourceType, ActionType[]>>;
  // Roles necessárias (OR logic - qualquer uma serve)
  roles?: (keyof UserRoles)[];
  // Lógica customizada (opcional)
  customCheck?: (user: UserObject) => boolean;
};

export type MenuItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  access: MenuPermission;
  children?: MenuItem[];
};

export const menuConfig: MenuItem[] = [
  {
    id: "user-management",
    label: "Gestão de Usuários",
    icon: "material-symbols:people",
    path: "/dashboard/users",
    access: {
      // ✅ Prioridade para permissions específicas
      permissions: {
        users: ["read"],
      },
      // ✅ Fallback para roles (caso não tenha permission específica)
      roles: ["admin", "manager"],
    },
  },
  {
    id: "retreat-management",
    label: "Gestão de Retiros",
    icon: "material-symbols:temple-buddhist",
    path: "/dashboard/retreats",
    access: {
      permissions: {
        retreats: ["read"],
      },
      roles: ["admin", "manager"],
    },
  },
  {
    id: "profile-management",
    label: "Gestão de Perfil",
    icon: "material-symbols:person",
    path: "/dashboard/profile",
    access: {
      // ✅ Todos têm acesso ao próprio perfil
      permissions: {
        profile: ["read"],
      },
      // Sem roles necessárias - qualquer usuário logado
    },
  },
  {
    id: "settings",
    label: "Configurações",
    icon: "material-symbols:settings",
    path: "/dashboard/settings",
    access: {
      permissions: {
        settings: ["read", "update"],
      },
      roles: ["admin"], // Só admin por padrão
    },
  },
];
