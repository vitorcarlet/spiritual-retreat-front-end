"use client";

import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { menuConfig } from "../SideMenu/shared";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canAccessMenu, isLoading, status, user } = useMenuAccess();
  const pathname = usePathname();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("🔄 ProtectedRoute Effect:", {
      status,
      isLoading,
      hasUser: !!user,
      pathname,
      menuConfig: menuConfig.map((m) => ({ id: m.id, path: m.path })),
    });

    // ✅ Aguardar a sessão carregar
    if (isLoading || status === "loading") {
      setHasAccess(null);
      return;
    }

    // ✅ Se não está autenticado, redirecionar para login
    // if (status === "unauthenticated") {
    //   router.push("/login");
    //   return;
    // }

    // ✅ Se está autenticado, verificar acesso
    if (status === "authenticated" && user) {
      const checkAccess = () => {
        try {
          // ✅ CORREÇÃO: Verificação mais robusta
          let hasRouteAccess = false;

          // 1. Verificar rotas públicas primeiro
          const publicRoutes = ["/dashboard", "/profile"];
          if (publicRoutes.some((route) => pathname.startsWith(route))) {
            hasRouteAccess = true;
          }

          // 2. Verificar menus específicos
          else {
            const matchingMenu = menuConfig.find((menu) =>
              pathname.startsWith(menu.path)
            );

            if (matchingMenu) {
              hasRouteAccess = canAccessMenu(matchingMenu.id);
            } else {
              // 3. Fallback: verificar baseado no pathname
              if (pathname.startsWith("/users")) {
                hasRouteAccess = canAccessMenu("users");
              } else if (pathname.startsWith("/settings")) {
                hasRouteAccess = canAccessMenu("settings");
              } else {
                // 4. Por padrão, permitir se não há regra específica
                hasRouteAccess = true;
              }
            }
          }

          console.log("🔐 Final Access Check:", {
            pathname,
            hasRouteAccess,
            userRoles: user?.roles,
            userPermissions: Object.keys(user?.permissions || {}),
          });

          setHasAccess(hasRouteAccess);

          if (!hasRouteAccess) {
            console.log("❌ Redirecting to unauthorized");
            router.push("/unauthorized");
          }
        } catch (error) {
          console.error("❌ Error in access check:", error);
          // Em caso de erro, permitir acesso (ou redirecionar conforme sua regra)
          setHasAccess(true);
        }
      };

      const timer = setTimeout(checkAccess, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, canAccessMenu, router, isLoading, status, user]);

  // ✅ Mostrar loading enquanto carrega sessão
  if (isLoading || status === "loading") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Aguardar verificação de acesso
  if (hasAccess === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Se não tem acesso, não renderizar (vai redirecionar)
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
