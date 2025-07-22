"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { Iconify } from "@/src/components/Iconify";
import NextLink from "next/link";
import { menuConfig } from "../SideMenu/shared";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: string;
  isCurrentPage?: boolean;
}

// Configuração das rotas baseada no menuConfig e ROUTES
const getRouteConfig = (): Record<
  string,
  { label: string; icon: string; parent?: string }
> => {
  const config: Record<
    string,
    { label: string; icon: string; parent?: string }
  > = {};

  // Adicionar configurações do menu
  menuConfig.forEach((menu) => {
    config[menu.path] = {
      label: menu.label,
      icon: menu.icon,
    };
  });

  // Adicionar rotas específicas com variações de path
  const additionalRoutes = {
    "/": { label: "Home", icon: "lucide:home" },
    "/users": { label: "Usuários", icon: "solar:user-bold-duotone" },
    "/retreats": { label: "Retiros", icon: "material-symbols:temple-buddhist" },
    "/profile": { label: "Perfil", icon: "material-symbols:person" },
    "/settings": { label: "Configurações", icon: "material-symbols:settings" },
    "/my-retreats": {
      label: "Meus Retiros",
      icon: "material-symbols:temple-buddhist",
    },
    "/payment": { label: "Pagamento", icon: "lucide:credit-card" },
    "/reports": { label: "Relatórios", icon: "lucide:bar-chart" },
    "/help": { label: "Ajuda", icon: "lucide:help-circle" },
    "/config": { label: "Configurações", icon: "material-symbols:settings" },
  };

  Object.entries(additionalRoutes).forEach(([path, config_item]) => {
    config[path] = config_item;
  });

  return config;
};

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();

  // Obter configuração de rotas
  const routeConfig = getRouteConfig();
  const { title, pathname: breadCrumbPathName } = useBreadCrumbs();

  const allowBreadCrumbsTitle = useMemo(() => {
    if (!breadCrumbPathName || !title) return null;
    if (pathname.startsWith(breadCrumbPathName)) return title;
    return null;
  }, [pathname, breadCrumbPathName, title]);

  console.log(
    allowBreadCrumbsTitle,
    "Breadcrumbs title:",
    title,
    "Pathname:",
    pathname,
    "Pattern:",
    breadCrumbPathName
  );
  // Gerar breadcrumbs baseado no pathname atual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Sempre adicionar Home como primeiro item (se não estiver na raiz)
    if (pathname !== "/") {
      breadcrumbs.push({
        label: "Home",
        path: "/",
        icon: "lucide:home",
      });
    }

    // Construir breadcrumbs baseado nos segmentos do path
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const routeInfo = routeConfig[currentPath];

      if (routeInfo) {
        breadcrumbs.push({
          label: routeInfo.label,
          path: currentPath,
          icon: routeInfo.icon,
          isCurrentPage: isLast,
        });
      } else {
        // Fallback para rotas não configuradas
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path: currentPath,
          icon: "ph:cross-thin",
          isCurrentPage: isLast,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  console.log(breadcrumbs, "Breadcrumbs items:", pathname);
  // Se só tem um item (Home), não mostrar breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box display={"flex"} alignItems="center" gap={1}>
      <Iconify
        icon={breadcrumbs[breadcrumbs.length - 1].icon || "lucide:folder"}
        size={6}
        sx={{ color: "text.primary" }}
      />
      <Box>
        <Typography variant="h4">
          {allowBreadCrumbsTitle
            ? allowBreadCrumbsTitle
            : breadcrumbs[breadcrumbs.length - 1].label}
        </Typography>
        <MuiBreadcrumbs
          separator={
            <Iconify
              icon="lucide:chevron-right"
              size={1.2}
              sx={{ color: "text.disabled" }}
            />
          }
          maxItems={4}
          sx={{
            "& .MuiBreadcrumbs-ol": {
              alignItems: "center",
            },
          }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (!isNaN(Number(item.label))) return null;
            return (
              <Box
                key={item.path}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {/* Ícone */}
                {item.icon && (
                  <Iconify
                    icon={item.icon}
                    size={1.4}
                    sx={{
                      color: isLast ? "primary.main" : "text.secondary",
                    }}
                  />
                )}

                {/* Label */}
                {isLast ? (
                  <Chip
                    label={allowBreadCrumbsTitle ?? item.label}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      height: 24,
                    }}
                  />
                ) : (
                  <Link
                    component={NextLink}
                    href={item.path}
                    underline="hover"
                    color="inherit"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      fontSize: 14,
                      fontWeight: 500,
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </Box>
            );
          })}
        </MuiBreadcrumbs>
      </Box>
    </Box>
  );
};

export default Breadcrumbs;
