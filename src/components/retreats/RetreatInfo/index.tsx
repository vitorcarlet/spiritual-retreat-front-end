"use client";

import React, { useState, useEffect, use } from "react";
import { Box, Tabs, Tab, useTheme, Grid } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import Iconify from "@/src/components/Iconify";
import { useBreadCrumbs } from "@/src/contexts/BreadCrumbsContext";
import SelectEditMode from "@/src/components/navigation/SelectEditMode";
import { fetchRetreatData } from "./shared";
import { useMenuMode } from "@/src/contexts/users-context/MenuModeContext";

interface RetreatPageProps {
  children: React.ReactNode;
}

const retreatCache = new Map<string, Promise<Retreat | null>>();

export default function RetreatPage({ children }: RetreatPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const { menuMode, toggleMenuMode, isAllowedToEdit } = useMenuMode();

  const retreatId = pathname.split("/")[2];
  const getRetreatData = (retreatId: string) => {
    if (!retreatCache.has(retreatId)) {
      retreatCache.set(retreatId, fetchRetreatData(retreatId));
    }
    return retreatCache.get(retreatId)!;
  };

  const retreatPromise = getRetreatData(retreatId);
  const retreat = use(retreatPromise);
  const { setBreadCrumbsTitle } = useBreadCrumbs();

  useEffect(() => {
    if (retreat) {
      console.log("retreat data loaded:", retreat);
      setBreadCrumbsTitle({
        title: retreat.title,
        pathname: `/users/${retreat.id}`,
      });
    }
  }, [retreat, setBreadCrumbsTitle]);

  const tabs = [
    {
      label: "Geral",
      icon: "lucide:retreat",
      path: `/users/${retreatId}`,
      value: 0,
    },
    {
      label: "Contemplação",
      icon: "lucide:shield-check",
      path: `/users/${retreatId}/contemplation`,
      value: 1,
      disabled: !retreat,
    },
    {
      label: "Formulário",
      icon: "lucide:lock",
      path: `/users/${retreatId}/form`,
      value: 2,
    },
    {
      label: "Famílias",
      icon: "lucide:lock",
      path: `/users/${retreatId}/families`,
      value: 3,
    },
    {
      label: "Equipes de Serviço",
      icon: "lucide:lock",
      path: `/users/${retreatId}/service-teams`,
      value: 4,
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
      id: `retreat-tab-${index}`,
      "aria-controls": `retreat-tabpanel-${index}`,
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
              aria-label="Abas de gerenciamento de retiro"
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
        {children}
      </Box>
    </Box>
  );
}
