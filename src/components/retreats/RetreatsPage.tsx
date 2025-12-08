"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Tabs, Tab, Grid } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Iconify from "../Iconify";
import SelectEditMode from "../navigation/SelectEditMode";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

interface RetreatPageProps {
  children: React.ReactNode;
  // Indica que estamos criando um novo retiro (ainda não salvo)
  isCreating?: true;
}

//const retreatCache = new Map<string, Promise<any | null>>();

export default function RetreatPage({
  children,
  isCreating,
}: RetreatPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const { menuMode, toggleMenuMode, isAllowedToEdit } = useMenuMode();

  const retreatId = pathname.split("/")[2];

  const allTabs = useMemo(
    () => [
      {
        label: "Geral",
        icon: "lucide:home",
        path: `/retreats/${retreatId}`,
        value: 0,
      },
      {
        label: "Contemplações",
        icon: "lucide:star",
        path: `/retreats/${retreatId}/contemplations`,
        value: 1,
      },
      {
        label: "Formulários",
        icon: "lucide:file-text",
        path: `/retreats/${retreatId}/forms`,
        value: 2,
        requireAdmin: true,
      },
      {
        label: "Famílias",
        icon: "icon-park-solid:family",
        path: `/retreats/${retreatId}/families`,
        value: 3,
      },
      {
        label: "Equipe de serviço",
        icon: "fluent:people-team-toolbox-20-filled",
        path: `/retreats/${retreatId}/service-team`,
        value: 4,
      },
      {
        label: "Barracas",
        icon: "lucide:tent",
        path: `/retreats/${retreatId}/tents`,
        value: 5,
      },
    ],
    [retreatId]
  );

  // Filtrar tabs baseado no role do usuário
  const tabs = useMemo(() => {
    const userRole = session?.user?.role;
    return allTabs.filter((tab) => !tab.requireAdmin || userRole === "admin");
  }, [allTabs, session?.user?.role]);

  // Encontrar a tab atual baseado no pathname
  const getCurrentTabValue = useCallback(() => {
    if (isCreating) return 0;

    // Ordenar por comprimento de path em ordem decrescente (mais específico primeiro)
    const sortedTabs = [...tabs].sort((a, b) => b.path.length - a.path.length);

    const currentTab = sortedTabs.find(
      (tab) => pathname === tab.path || pathname.startsWith(`${tab.path}/`)
    );

    return currentTab ? currentTab.value : 0;
  }, [isCreating, pathname, tabs]);

  // Calcular o valor atual da tab baseado no pathname
  const currentTabValue = useMemo(
    () => getCurrentTabValue(),
    [getCurrentTabValue]
  );

  const [value, setValue] = useState(currentTabValue);

  useEffect(() => {
    setValue(currentTabValue);
  }, [currentTabValue]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // Bloqueia navegação para outras abas enquanto estiver criando
    if (isCreating && newValue !== 0) {
      return;
    }
    setValue(newValue);
    const selectedTab = tabs.find((tab) => tab.value === newValue);
    if (selectedTab) {
      router.push(selectedTab.path);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `retreat-tab-${index}`,
      "aria-controls": `retreat-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: "100%", height: "100%", maxHeight: "100%" }}>
      {/* Container das abas */}
      {/* Tabs Header */}
      <Grid container spacing={0} minHeight={72}>
        <Grid
          size={{ xs: 12, md: 8, lg: 6 }}
          sx={{ p: 2, pr: 0, pb: 0, pt: 0, height: "100%" }}
        >
          <Box>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Abas de gerenciamento de retiro"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: (theme) => theme.vars?.palette.primary.main,
                },
                height: "100%",
              }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  icon={<Iconify icon={tab.icon} />}
                  iconPosition="start"
                  label={tab.label}
                  {...a11yProps(tab.value)}
                  // Desabilita abas para dados não criados
                  disabled={isCreating && tab.value !== 0}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 4, lg: 6 }}
          sx={{
            p: 2,
            pl: 0,
            pb: 0,
            pt: 0,
            height: "100%",
          }}
        >
          <Box
            width={"100%"}
            height={73}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <SelectEditMode
              sx={{ height: "90%", minWidth: 120 }}
              menuMode={menuMode}
              setMenuMode={toggleMenuMode}
              isAllowedToEdit={isAllowedToEdit}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Content Area - Renderiza os children baseado na rota */}
      <Box
        flexGrow={1}
        sx={{ p: 2, pt: 0, minHeight: "95vh", height: "calc(100% - 72px)" }}
      >
        {children}
      </Box>
    </Box>
  );
}
