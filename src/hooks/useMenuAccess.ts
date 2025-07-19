"use client";

import { useSession } from "next-auth/react";
import { UserObject, UserRoles } from "next-auth";
import {
  menuConfig,
  MenuItem,
  MenuPermission,
} from "../components/navigation/SideMenu/shared";

export function useMenuAccess() {
  const session = useSession();
  const user = session?.data?.user as UserObject | null;
  console.log("🔍 User Session:", user);
  const hasAccess = (access: MenuPermission): boolean => {
    if (!user) return false;

    if (access.permissions && hasAnyPermission(access.permissions)) {
      return true;
    }

    if (access.roles && hasAnyRole(access.roles)) {
      return true;
    }

    if (access.customCheck && access.customCheck(user)) {
      return true;
    }

    return false;
  };

  const hasAnyPermission = (
    permissions: MenuPermission["permissions"]
  ): boolean => {
    if (!permissions || !user?.permissions) return false;

    return Object.entries(permissions).some(([resource, actions]) => {
      return actions.some((action) => {
        const resourceKey = resource as keyof typeof user.permissions;
        const resourcePermissions = user.permissions[resourceKey];
        if (!resourcePermissions) return false;
        return (
          (resourcePermissions as Record<string, boolean>)[action] === true
        );
      });
    });
  };

  const hasAnyRole = (roles: (keyof UserRoles)[]): boolean => {
    if (!user?.roles) return false;
    return roles.some((role) => user.roles[role]);
  };

  const getAccessibleMenus = (): MenuItem[] => {
    return menuConfig.filter((menu) => hasAccess(menu.access));
  };

  const canAccessMenu = (menuId: string): boolean => {
    const menu = menuConfig.find((m) => m.id === menuId);
    return menu ? hasAccess(menu.access) : false;
  };

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
    isLoading: !user,
  };
}
