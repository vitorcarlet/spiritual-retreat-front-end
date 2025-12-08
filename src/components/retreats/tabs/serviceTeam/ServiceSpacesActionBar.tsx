"use client";

import { useTranslations } from "next-intl";
import { Button, Stack } from "@mui/material";
import type { RetreatsCardTableFilters } from "@/src/components/retreats/types";

interface ServiceTeamActionBarProps {
  hasCreatePermission: boolean;
  isReordering: boolean;
  isEditMode: boolean;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  activeFiltersCount: number;
  //filtersConfig: any;
  onCreateTeam: () => void;
  onAddParticipant: () => void;
  onConfigure: () => void;
  onLock: () => void;
  onApplyFilters: (
    filters: Partial<TableDefaultFilters<RetreatsCardTableFilters>>
  ) => void;
  onResetFilters: () => void;
}

export default function ServiceTeamActionBar({
  hasCreatePermission,
  isReordering,
  isEditMode,
  onCreateTeam,
  onAddParticipant,
  onConfigure,
  onLock,
}: ServiceTeamActionBarProps) {
  const t = useTranslations("service-team-details");

  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
      {/* <FilterButton<
        TableDefaultFilters<RetreatsCardTableFilters>,
        RetreatsCardTableDateFilters
      >
       // filters={filtersConfig}
        defaultValues={filters}
        onApplyFilters={onApplyFilters}
        onReset={onResetFilters}
        activeFiltersCount={activeFiltersCount}
      /> */}

      {hasCreatePermission && (
        <>
          <Button
            variant="contained"
            onClick={onCreateTeam}
            disabled={isReordering || !isEditMode}
          >
            {t("create-new-team")}
          </Button>
          <Button
            variant="contained"
            onClick={onAddParticipant}
            disabled={isReordering || !isEditMode}
          >
            {t("add-member-to-team")}
          </Button>
          <Button
            variant="contained"
            onClick={onConfigure}
            disabled={isReordering || !isEditMode}
          >
            {t("service-space-configurations")}
          </Button>
          <Button
            variant="contained"
            onClick={onLock}
            disabled={isReordering || !isEditMode}
          >
            {t("lock.button", {
              defaultMessage: "Lock service teams",
            })}
          </Button>
        </>
      )}
    </Stack>
  );
}
