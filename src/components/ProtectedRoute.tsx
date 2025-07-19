"use client";
import { useMenuAccess } from "@/src/hooks/useMenuAccess";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { menuConfig } from "./navigation/SideMenu/shared";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { canAccessMenu } = useMenuAccess();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // ✅ Verificar se tem acesso à rota atual
    const hasAccess = menuConfig.some((menu) => {
      if (pathname.startsWith(menu.path)) {
        return canAccessMenu(menu.id);
      }
      return false;
    });

    if (!hasAccess) {
      router.push("/unauthorized");
    }
  }, [pathname, canAccessMenu, router]);

  return <>{children}</>;
}
