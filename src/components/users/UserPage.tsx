"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Tabs, Tab, useTheme, Grid } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import Iconify from "../Iconify";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import SelectEditMode from "../navigation/SelectEditMode";
import { UserContentProvider } from "./context";
import { UserObject } from "next-auth";
import { fetchUserData } from "./shared";

interface UserPageProps {
  children: React.ReactNode;
}

// Cache simples para dados do usuário
const userCache = new Map<string, Promise<UserObject | null>>();

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
      console.log("User data loaded:", user);
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
    <Box sx={{ width: "100%", height: "100%", maxHeight: "100%" }}>
      {/* Container das abas */}
      {/* Tabs Header */}
      <Grid container spacing={0} height={72}>
        <Grid
          size={{ xs: 12, md: 8, lg: 6 }}
          sx={{ p: 2, pr: 0, pb: 0, pt: 0, height: "100%" }}
        >
          <Box>
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
                height: "100%",
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
                    //minHeight: 72,
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
              //borderBottom: 1,
              // borderColor: "divider",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <SelectEditMode
              sx={{ height: "90%", minWidth: 120 }}
              menuMode={menuMode}
              setMenuMode={setMenuMode}
              isAllowedToEdit={true}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Content Area - Renderiza os children baseado na rota */}
      <Box flexGrow={1} sx={{ p: 2, pt: 0, height: "calc(100% - 72px)" }}>
        <UserContentProvider user={user}>{children}</UserContentProvider>
      </Box>
    </Box>
  );
}
