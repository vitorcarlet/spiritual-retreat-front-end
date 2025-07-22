"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Tabs, Tab, Paper, useTheme, Grid } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { Iconify } from "../Iconify";
import { api, handleApiResponse } from "@/src/lib/sendRequestServerVanilla";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import SelectEditMode from "../navigation/SelectEditMode";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserPageProps {
  children: React.ReactNode;
}

// Cache simples para dados do usuário
const userCache = new Map<string, Promise<User | null>>();

// Função para buscar dados do usuário
const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const response = await api.get(`/api/user/${userId}`, {
      baseUrl: "http://localhost:3001", // URL do MSW
    });

    const result = await handleApiResponse<User>(response);

    if (result.success && result.data) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return null;
  }
};

export default function UserPage({ children }: UserPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  // Extrair o ID do usuário da URL

  const userId = pathname.split("/")[2];
  // Buscar dados do usuário com cache
  const getUserData = (userId: string) => {
    if (!userCache.has(userId)) {
      userCache.set(userId, fetchUserData(userId));
    }
    return userCache.get(userId)!;
  };

  // Usar React 19 use hook para buscar dados
  const userPromise = getUserData(userId);
  const user = use(userPromise);
  //const [isLoading, setIsLoading] = useState(true);
  const { setBreadCrumbsTitle } = useBreadCrumbs();

  // useEffect(() => {
  //   userPromise
  //     .then(() => setIsLoading(false))
  //     .catch(() => setIsLoading(false));
  // }, [userPromise]);

  useEffect(() => {
    // Atualizar o título do breadcrumb quando o usuário for carregado
    if (user) {
      setBreadCrumbsTitle({ title: user.name, pathname: `/users/${user.id}` });
    }
  }, [user, setBreadCrumbsTitle]);

  // Definir as abas e suas rotas correspondentes
  const tabs = [
    {
      label: "Informações",
      icon: "lucide:user",
      path: `/users/${userId}`,
      value: 0,
    },
    {
      label: "Permissões",
      icon: "lucide:shield-check",
      path: `/users/${userId}/permissions`,
      value: 1,
    },
    {
      label: "Segurança",
      icon: "lucide:lock",
      path: `/users/${userId}/credentials`,
      value: 2,
    },
  ];

  // Determinar qual aba está ativa baseado na rota atual
  const getCurrentTabValue = () => {
    const currentTab = tabs.find((tab) => pathname === tab.path);
    return currentTab ? currentTab.value : 0;
  };

  const [value, setValue] = useState(getCurrentTabValue());

  // Atualizar a aba quando a rota mudar
  useEffect(() => {
    setValue(getCurrentTabValue());
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const selectedTab = tabs.find((tab) => tab.value === newValue);
    if (selectedTab) {
      router.push(selectedTab.path);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `user-tab-${index}`,
      "aria-controls": `user-tabpanel-${index}`,
    };
  }

  const [menuMode, setMenuMode] = useState<"view" | "edit" | null>(null);

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Container das abas */}
      <Paper elevation={1} sx={{ width: "100%", height: "100%" }}>
        {/* Tabs Header */}
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, md: 8, lg: 6 }} sx={{ p: 2, pr: 0, pb: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="Abas de gerenciamento de usuário"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              >
                {tabs.map((tab) => (
                  <Tab
                    key={tab.value}
                    icon={<Iconify icon={tab.icon} />}
                    iconPosition="start"
                    label={tab.label}
                    {...a11yProps(tab.value)}
                    sx={{
                      minHeight: 64,
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
            }}
          >
            <Box
              width={"100%"}
              height={"65px"}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <SelectEditMode
                menuMode={menuMode}
                setMenuMode={setMenuMode}
                isAllowedToEdit={true}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Content Area - Renderiza os children baseado na rota */}
        <Box height={"100%"}>{children}</Box>
      </Paper>
    </Box>
  );
}
