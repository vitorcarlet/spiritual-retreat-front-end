"use client";

import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { menuConfig } from "./navigation/SideMenu/shared";
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
    });

    // ✅ Aguardar a sessão carregar
    if (isLoading) {
      setHasAccess(null);
      return;
    }

    // ✅ Se não está autenticado, redirecionar para login
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // ✅ Se está autenticado, verificar acesso
    if (status === "authenticated" && user) {
      const checkAccess = () => {
        const access = menuConfig.some((menu) => {
          if (pathname.startsWith(menu.path)) {
            return canAccessMenu(menu.id);
          }
          return false;
        });

        console.log("🔐 Access Check:", { pathname, access });
        setHasAccess(access);

        if (!access) {
          console.log("❌ Access denied for path:", pathname);
          router.push("/unauthorized");
        }
      };

      checkAccess();
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
