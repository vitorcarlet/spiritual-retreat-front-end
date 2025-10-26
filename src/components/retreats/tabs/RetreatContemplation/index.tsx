"use client";
import { Tab, Tabs, Box, Skeleton } from "@mui/material";
import { useState, useMemo, Suspense } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Lazy (carrega só quando a aba for aberta)
const Contemplated = dynamic(() => import("./contemplated"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});
const NonContemplatedTable = dynamic(() => import("./no-contemplated"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});
const ServiceUnassigned = dynamic(() => import("./service/unassigned"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});
const ServiceConfirmed = dynamic(() => import("./service/confirmed"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});

interface TabConfig {
  value: number;
  labelKey: string;
  render: (id: string) => React.ReactNode;
  preload?: () => void;
}

const TABS: TabConfig[] = [
  {
    value: 0,
    labelKey: "contemplations.contemplated.tab-label",
    render: (id: string) => <Contemplated id={id} />,
    preload: () => import("./contemplated"),
  },
  {
    value: 1,
    labelKey: "contemplations.no-contemplated.tab-label",
    render: (id: string) => <NonContemplatedTable id={id} />,
    preload: () => import("./no-contemplated"),
  },
  {
    value: 2,
    labelKey: "contemplations.service.unassigned.tab-label",
    render: (id: string) => <ServiceUnassigned id={id} />,
    preload: () => import("./service/unassigned"),
  },
  {
    value: 3,
    labelKey: "contemplations.service.confirmed.tab-label",
    render: (id: string) => <ServiceConfirmed id={id} />,
    preload: () => import("./service/confirmed"),
  },
];

function a11yProps(index: number) {
  return {
    id: `retreat-tab-${index}`,
    "aria-controls": `retreat-tabpanel-${index}`,
  };
}

export default function RetreatContemplation({ id }: { id: string }) {
  const t = useTranslations();
  const [tabValue, setTabValue] = useState(0);

  // Pré-carrega próxima aba após montagem / troca (opcional)
  useMemo(() => {
    const next = TABS.find((tab) => tab.value !== tabValue)?.preload;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next && next();
  }, [tabValue]);

  const current = useMemo(
    () => TABS.find((tab) => tab.value === tabValue),
    [tabValue]
  );

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
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
            label={t(tab.labelKey)}
            {...a11yProps(tab.value)}
            sx={{ textTransform: "none", fontSize: "0.95rem", fontWeight: 500 }}
          />
        ))}
      </Tabs>

      <Box
        role="tabpanel"
        id={`retreat-tabpanel-${tabValue}`}
        aria-labelledby={`retreat-tab-${tabValue}`}
        sx={{ flex: 1, minHeight: 120 }}
      >
        <Suspense fallback={<Skeleton variant="rectangular" height={160} />}>
          {current?.render(id)}
        </Suspense>
      </Box>
    </Box>
  );
}
