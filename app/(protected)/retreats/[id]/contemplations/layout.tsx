"use client";

import { Tab, Tabs, Box } from "@mui/material";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface TabConfig {
  value: string;
  labelKey: string;
  path: string;
}

const TABS: TabConfig[] = [
  {
    value: "contemplated",
    labelKey: "contemplations.contemplated.tab-label",
    path: "contemplated",
  },
  {
    value: "no-contemplated",
    labelKey: "contemplations.no-contemplated.tab-label",
    path: "no-contemplated",
  },
  {
    value: "service-unassigned",
    labelKey: "contemplations.service.unassigned.tab-label",
    path: "service-unassigned",
  },
  {
    value: "service-confirmed",
    labelKey: "contemplations.service.confirmed.tab-label",
    path: "service-confirmed",
  },
];

function a11yProps(value: string) {
  return {
    id: `retreat-tab-${value}`,
    "aria-controls": `retreat-tabpanel-${value}`,
  };
}

export default function ContemplationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams<{ id: string }>();

  const currentTab = useMemo(() => {
    const segments = pathname.split("/");
    const lastSegment = segments[segments.length - 1];

    // Se estiver em /contemplations sem subrota, retorna "contemplated"
    if (lastSegment === "contemplations") {
      return "contemplated";
    }

    return (
      TABS.find((tab) => tab.path === lastSegment)?.value ?? "contemplated"
    );
  }, [pathname]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    const tab = TABS.find((t) => t.value === newValue);
    if (tab) {
      router.push(`/retreats/${id}/contemplations/${tab.path}`);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        height: "100%",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="Abas de gerenciamento de retiro"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: (theme) => theme.vars?.palette.primary.main,
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={t(tab.labelKey)}
            {...a11yProps(tab.value)}
            sx={{ textTransform: "none", fontSize: "0.95rem", fontWeight: 500 }}
          />
        ))}
      </Tabs>

      <Box
        role="tabpanel"
        id={`retreat-tabpanel-${currentTab}`}
        aria-labelledby={`retreat-tab-${currentTab}`}
        sx={{ flex: 1, minHeight: 120 }}
      >
        {children}
      </Box>
    </Box>
  );
}
