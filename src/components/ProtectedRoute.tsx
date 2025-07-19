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
  const { canAccessMenu, isLoading } = useMenuAccess();
  const pathname = usePathname();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const checkAccess = () => {
      const access = menuConfig.some((menu) => {
        if (pathname.startsWith(menu.path)) {
          return canAccessMenu(menu.id);
        }
        return false;
      });

      setHasAccess(access);

      if (!access) {
        router.push("/unauthorized");
      }
    };

    checkAccess();
  }, [pathname, canAccessMenu, router, isLoading]);

  if (isLoading || hasAccess === null) {
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

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
