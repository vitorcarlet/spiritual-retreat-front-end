"use client";

import { useMemo, useState } from "react";
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import SendMessageToFamilyForm from "./SendMessageToFamilyForm";
import FamilyGroupsManager from "./FamilyGroupsManager";

interface FamilyCommunicationTabsProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess?: () => void;
}

type TabOption = "message" | "groups";

export default function FamilyCommunicationTabs({
  retreatId,
  families,
  onSuccess,
}: FamilyCommunicationTabsProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState<TabOption>("message");
  const handleSuccess = useMemo(
    () => onSuccess ?? (() => undefined),
    [onSuccess]
  );

  const tabs = useMemo(
    () => [
      { label: "Enviar mensagem", value: "message" as const },
      { label: "Gerenciar grupos", value: "groups" as const },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={(_event, value: TabOption) => setActiveTab(value)}
        variant={isSmallScreen ? "scrollable" : "fullWidth"}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === "message" ? (
          <SendMessageToFamilyForm
            retreatId={retreatId}
            families={families}
            onSuccess={handleSuccess}
          />
        ) : (
          <FamilyGroupsManager retreatId={retreatId} />
        )}
      </Box>
    </Box>
  );
}
