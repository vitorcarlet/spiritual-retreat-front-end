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
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

interface UserPageProps {
  children: React.ReactNode;
}

const userCache = new Map<string, Promise<UserObject | null>>();

export default function UserPage({ children }: UserPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const { menuMode, toggleMenuMode, isAllowedToEdit } = useMenuMode();

  const userId = pathname.split("/")[2];
  const getUserData = (userId: string) => {
    if (!userCache.has(userId)) {
      userCache.set(userId, fetchUserData(userId));
    }
    return userCache.get(userId)!;
  };

  const userPromise = getUserData(userId);
  const user = use(userPromise);
  const { setBreadCrumbsTitle } = useBreadCrumbs();

  useEffect(() => {
    if (user) {
      console.log("User data loaded:", user);
      setBreadCrumbsTitle({ title: user.name, pathname: `/users/${user.id}` });
    }
  }, [user, setBreadCrumbsTitle]);

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

  const getCurrentTabValue = () => {
    const currentTab = tabs.find((tab) => pathname === tab.path);
    return currentTab ? currentTab.value : 0;
  };

  const [value, setValue] = useState(getCurrentTabValue());

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
              setMenuMode={toggleMenuMode}
              isAllowedToEdit={isAllowedToEdit}
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
