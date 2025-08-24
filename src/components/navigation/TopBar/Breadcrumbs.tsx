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
import Iconify from "@/src/components/Iconify";
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

const BreadcrumbIcon = ({
  icon,
  isLast,
  size = 1.4,
}: {
  icon?: string;
  isLast: boolean;
  size?: number;
}) => {
  // ✅ Ícone padrão para evitar mudanças bruscas
  const defaultIcon = "lucide:folder";
  const iconToUse = icon || defaultIcon;

  return (
    <Iconify
      icon={iconToUse}
      size={size}
      sx={{
        color: isLast ? "primary.main" : "text.secondary",
        // ✅ Evitar layout shift durante carregamento
        display: "block",
      }}
    />
  );
};

const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const { title, pathname: breadCrumbPathName } = useBreadCrumbs();

  const routeConfig = useMemo(() => getRouteConfig(), []);

  // Gerar breadcrumbs baseado no pathname atual
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
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
  }, [pathname, routeConfig]);

  console.log(breadcrumbs, "Breadcrumbs items:", pathname);
  // Se só tem um item (Home), não mostrar breadcrumbs

  const mainIcon = useMemo(() => {
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    return lastBreadcrumb?.icon || "lucide:folder";
  }, [breadcrumbs]);

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
          {title ?? breadcrumbs[breadcrumbs.length - 1].label}
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
            if (Number(item.label))
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
                  <Box
                    sx={{
                      width: 14, // ✅ Largura fixa
                      height: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // ✅ Previnir layout shift
                      flexShrink: 0,
                    }}
                  >
                    <BreadcrumbIcon
                      icon={item.icon}
                      isLast={isLast}
                      size={1.4}
                    />
                  </Box>

                  {/* Label */}
                  {isLast ? (
                    <Chip
                      label={title ?? item.label}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                        height: 24,
                        transition: "all 0.15s ease-in-out",
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
                      {title ?? item.label}
                    </Link>
                  )}
                </Box>
              );
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
                <Box
                  sx={{
                    width: 14, // ✅ Largura fixa
                    height: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    // ✅ Previnir layout shift
                    flexShrink: 0,
                  }}
                >
                  <BreadcrumbIcon icon={item.icon} isLast={isLast} size={1.4} />
                </Box>

                {/* Label */}
                {isLast ? (
                  <Chip
                    label={typeof item.label === "string" ? item.label : title}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      bgcolor: "background.paper",
                      color: "background.main",
                      fontWeight: 600,
                      fontSize: 12,
                      height: 24,
                      "& .MuiChip-label": {
                        color: "primary.main",
                      },
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
