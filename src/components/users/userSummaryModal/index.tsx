"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Tabs, Tab, Grid } from "@mui/material";
import Iconify from "../../Iconify";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import { UserObject } from "next-auth";
import { fetchUserData } from "../shared";
import { UserContentProvider } from "../context";
import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";
import dynamic from "next/dynamic";
import LoadingScreenCircular from "../../loading-screen/client/LoadingScreenCircular";

const UserEditPage = dynamic(
  () => import("@/src/components/users/UserEditPage/UserEditPage"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

const UserPermissionsPage = dynamic(
  () => import("@/src/components/users/permissions/index"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

const UserCredentialsPage = dynamic(
  () => import("@/src/components/users/credentials/index"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

interface UserPageProps {
  userId: string;
}

const userCache = new Map<string, Promise<UserObject | null>>();

export default function UserSummaryModal({ userId }: UserPageProps) {
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
      setBreadCrumbsTitle({ title: user.name, pathname: `/users/${user.id}` });
    }
  }, [user, setBreadCrumbsTitle]);

  const tabs = [
    { label: "userPage.info", icon: "lucide:user", value: 0 },
    { label: "userPage.permissions", icon: "lucide:shield-check", value: 1 },
    { label: "userPage.security", icon: "lucide:lock", value: 2 },
  ];

  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function a11yProps(index: number) {
    return {
      id: `user-tab-${index}`,
      "aria-controls": `user-tabpanel-${index}`,
    };
  }

  return (
    <UserContentProvider user={user}>
      <MenuModeProvider mode={"view"}>
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
                      backgroundColor: (theme) =>
                        theme.vars?.palette.primary.main,
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
              ></Box>
            </Grid>
          </Grid>

          {/* Content Area - Renderiza os children baseado na rota */}
          <Box sx={{ p: 2 }}>
            {value === 0 && <UserEditPage />}
            {value === 1 && <UserPermissionsPage />}
            {value === 2 && <UserCredentialsPage />}
          </Box>
        </Box>
      </MenuModeProvider>
    </UserContentProvider>
  );
}
