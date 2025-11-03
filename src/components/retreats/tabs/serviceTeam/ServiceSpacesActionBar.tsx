"use client";

import { useTranslations } from "next-intl";
import { Button, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";
import type {
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters,
} from "@/src/components/retreats/types";

interface ServiceTeamActionBarProps {
  hasCreatePermission: boolean;
  isReordering: boolean;
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
  filters,
  activeFiltersCount,
  //filtersConfig,
  onCreateTeam,
  onAddParticipant,
  onConfigure,
  onLock,
  onApplyFilters,
  onResetFilters,
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
            disabled={isReordering}
          >
            {t("create-new-team")}
          </Button>
          <Button
            variant="contained"
            onClick={onAddParticipant}
            disabled={isReordering}
          >
            {t("add-member-to-team")}
          </Button>
          <Button
            variant="contained"
            onClick={onConfigure}
            disabled={isReordering}
          >
            {t("service-space-configurations")}
          </Button>
          <Button variant="contained" onClick={onLock} disabled={isReordering}>
            {t("lock.button", {
              defaultMessage: "Lock service teams",
            })}
          </Button>
        </>
      )}
    </Stack>
  );
}
