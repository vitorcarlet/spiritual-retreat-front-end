"use client";

import { useTranslations } from "next-intl";
import { Button, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";
import type {
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters,
} from "@/src/components/retreats/types";

interface TentsActionBarProps {
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

export default function TentsActionBar({
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
}: TentsActionBarProps) {
  const t = useTranslations("tent-details");

  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
      {hasCreatePermission && (
        <>
          <Button
            variant="contained"
            onClick={onCreateTeam}
            disabled={isReordering}
          >
            {t("create-new-tent")}
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
            {t("lock-tents")}
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
