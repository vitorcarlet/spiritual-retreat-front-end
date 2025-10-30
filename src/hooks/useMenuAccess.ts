"use client";

import { signIn, useSession } from "next-auth/react";
import { UserObject, UserRoles } from "next-auth";
import {
  menuConfig,
  MenuItem,
  MenuPermission,
} from "../components/navigation/SideMenu/shared";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export function useMenuAccess() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = useMemo(() => {
    return session?.user as UserObject | null;
  }, [session]);

  const isLoading = status === "loading";

  // Melhor tratamento do erro de autenticação
  useEffect(() => {
    if (status === "unauthenticated") {
      // Aguardar um pouco antes de redirecionar para evitar loops
      const timer = setTimeout(() => {
        signIn(undefined, {
          callbackUrl: window.location.pathname,
          redirect: false, // Evita redirecionamento automático problemático
        })
          .then(() => {
            // Redirecionar manualmente após o login bem-sucedido
            router.push(window.location.pathname);
          })
          .catch((error) => {
            console.error("Erro ao fazer login:", error);
            // Fallback: redirecionar manualmente para login
            router.push("/login");
          });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const hasAccess = (access: MenuPermission): boolean => {
    if (!user) return false;

    try {
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
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
      return false;
    }
  };

  const hasAnyPermission = (
    permissions: MenuPermission["permissions"]
  ): boolean => {
    if (!permissions || !user?.permissions) return false;

    try {
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
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return false;
    }
  };

  const hasAnyRole = (roles: UserRoles[]): boolean => {
    if (!user?.role) return false;

    try {
      return roles.some((role) => user.role === role);
    } catch (error) {
      console.error("Erro ao verificar roles:", error);
      return false;
    }
  };

  const getAccessibleMenus = (): MenuItem[] => {
    try {
      return menuConfig.filter((menu) => hasAccess(menu.access));
    } catch (error) {
      console.error("Erro ao obter menus acessíveis:", error);
      return [];
    }
  };

  const canAccessMenu = (menuId: string): boolean => {
    try {
      const menu = menuConfig.find((m) => m.id === menuId);
      return menu ? hasAccess(menu.access) : false;
    } catch (error) {
      console.error("Erro ao verificar acesso ao menu:", error);
      return false;
    }
  };

  const debugUserAccess = () => {
    if (process.env.NODE_ENV === "development") {
      // console.log("🔍 User Access Debug:", {
      //   status,
      //   user: user ? { id: user.id, role: user.role } : null,
      //   accessibleMenus: getAccessibleMenus().map((m) => m.label),
      // });
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      debugUserAccess();
    }
  }, [user, status]);

  return {
    hasAccess,
    getAccessibleMenus,
    canAccessMenu,
    debugUserAccess,
    user,
    isLoading,
    status,
  };
}
