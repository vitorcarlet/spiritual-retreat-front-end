// src/hooks/useMenuAccess.ts
import { useSession } from "next-auth/react";
import { UserRoles } from "next-auth";
import {
  menuConfig,
  MenuItem,
  MenuPermission,
} from "../components/navigation/SideMenu/shared";

export function useMenuAccess() {
  const { data: session } = useSession();
  const user = session?.user;

  // ✅ Função principal que verifica acesso
  const hasAccess = (access: MenuPermission): boolean => {
    if (!user) return false;

    // 1. ✅ PRIORIDADE: Verificar permissions específicas
    if (access.permissions && hasAnyPermission(access.permissions)) {
      return true;
    }

    // 2. ✅ FALLBACK: Verificar roles
    if (access.roles && hasAnyRole(access.roles)) {
      return true;
    }

    // 3. ✅ CUSTOM: Lógica customizada
    if (access.customCheck && access.customCheck(user)) {
      return true;
    }

    return false;
  };

  // ✅ Verificar se tem qualquer permission necessária
  const hasAnyPermission = (
    permissions: MenuPermission["permissions"]
  ): boolean => {
    if (!permissions || !user?.permissions) return false;
    //const objTest = Object.keys(permissions);
    return (
      permissions[resource]?.some(
        (action) => user.permissions[resource]?.[action] === true
      ) ?? false
    );
  };

  // ✅ Verificar se tem qualquer role necessária
  const hasAnyRole = (roles: (keyof UserRoles)[]): boolean => {
    if (!user?.roles) return false;
    return roles.some((role) => user.roles[role]);
  };

  // ✅ Filtrar menus acessíveis
  const getAccessibleMenus = (): MenuItem[] => {
    return menuConfig.filter((menu) => hasAccess(menu.access));
  };

  // ✅ Verificar acesso específico para um menu
  const canAccessMenu = (menuId: string): boolean => {
    const menu = menuConfig.find((m) => m.id === menuId);
    return menu ? hasAccess(menu.access) : false;
  };

  // ✅ Debug - mostrar permissions do usuário
  const debugUserAccess = () => {
    console.log("🔍 User Access Debug:", {
      roles: user?.roles,
      permissions: user?.permissions,
      accessibleMenus: getAccessibleMenus().map((m) => m.label),
    });
  };

  return {
    hasAccess,
    getAccessibleMenus,
    canAccessMenu,
    debugUserAccess,
    user,
  };
}
