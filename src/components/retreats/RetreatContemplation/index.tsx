import { Tab, Tabs } from "@mui/material";
import { useState } from "react";

const RetreatContemplation = () => {
  const [tabValue, setTabValue] = useState(0);
  function a11yProps(index: number) {
    return {
      id: `retreat-tab-${index}`,
      "aria-controls": `retreat-tabpanel-${index}`,
    };
  }
  return (
    <>
      <Tabs
        value={tabValue}
        onChange={(event, newValue) => setTabValue(newValue)}
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
            label={tab.label}
            {...a11yProps(tab.value)}
            sx={{
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          />
        ))}
      </Tabs>
      <div>
        <h1>Retreat Contemplation</h1>
      </div>
    </>
  );
};

const tabs = [
  { value: 0, label: "contemplated" },
  { value: 1, label: "no-contemplated" },
];

export default RetreatContemplation;
