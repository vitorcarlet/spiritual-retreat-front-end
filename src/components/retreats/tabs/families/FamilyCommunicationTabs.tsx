"use client";

import { useMemo, useState } from "react";
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import SendMessageToFamilyForm from "./SendMessageToFamilyForm";
import FamilyGroupsManager from "./FamilyGroupsManager";
import CreateGroupsForm from "./CreateGroupsForm";

interface FamilyCommunicationTabsProps {
  retreatId: string;
  families: RetreatFamily[];
  onSuccess?: () => void;
}

type TabOption = "groups" | "message" | "create-groups";

export default function FamilyCommunicationTabs({
  retreatId,
  families,
  onSuccess,
}: FamilyCommunicationTabsProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState<TabOption>("create-groups");
  const handleSuccess = useMemo(
    () => onSuccess ?? (() => undefined),
    [onSuccess]
  );

  const tabs = useMemo(
    () => [
      { label: "Criar Grupos", value: "create-groups" as const },
      { label: "Gerenciar Grupos", value: "groups" as const },
      // { label: "Enviar Mensagem", value: "message" as const },
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
        {activeTab === "create-groups" ? (
          <CreateGroupsForm retreatId={retreatId} onSuccess={handleSuccess} />
        ) : activeTab === "groups" ? (
          <FamilyGroupsManager retreatId={retreatId} />
        ) : (
          <SendMessageToFamilyForm
            retreatId={retreatId}
            families={families}
            onSuccess={handleSuccess}
          />
        )}
      </Box>
    </Box>
  );
}
