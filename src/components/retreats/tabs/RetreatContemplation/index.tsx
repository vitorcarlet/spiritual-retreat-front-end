"use client";
import { Tab, Tabs, Box, Skeleton } from "@mui/material";
import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy (carrega só quando a aba for aberta)
const Contemplated = dynamic(() => import("./contemplated"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});
const NonContemplatedTable = dynamic(() => import("./no-contemplated"), {
  loading: () => <Skeleton variant="rectangular" height={160} />,
});

interface TabConfig {
  value: number;
  label: string;
  render: (id: string) => React.ReactNode;
  preload?: () => void;
}

const TABS: TabConfig[] = [
  {
    value: 0,
    label: "contemplated",
    render: (id: string) => <Contemplated id={id} />,
    preload: () => import("./contemplated"),
  },
  {
    value: 1,
    label: "no-contemplated",
    render: (id: string) => <NonContemplatedTable id={id} />,
    preload: () => import("./no-contemplated"),
  },
];

function a11yProps(index: number) {
  return {
    id: `retreat-tab-${index}`,
    "aria-controls": `retreat-tabpanel-${index}`,
  };
}

export default function RetreatContemplation({ id }: { id: string }) {
  const [tabValue, setTabValue] = useState(0);

  // Pré-carrega próxima aba após montagem / troca (opcional)
  useMemo(() => {
    const next = TABS.find((t) => t.value !== tabValue)?.preload;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    next && next();
  }, [tabValue]);

  const current = useMemo(
    () => TABS.find((t) => t.value === tabValue),
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
            label={tab.label}
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
