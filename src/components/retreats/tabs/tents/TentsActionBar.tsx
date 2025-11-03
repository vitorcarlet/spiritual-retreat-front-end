"use client";

import { useTranslations } from "next-intl";
import { Button, Stack } from "@mui/material";
import type { RetreatsCardTableFilters } from "@/src/components/retreats/types";

interface TentsActionBarProps {
  hasCreatePermission: boolean;
  isReordering: boolean;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  activeFiltersCount: number;
  //filtersConfig: any;
  onCreateTent: () => void;
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
  onCreateTent,
  onAddParticipant,
  onConfigure,
  onLock,
}: TentsActionBarProps) {
  const t = useTranslations("tent-details");

  return (
    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
      {hasCreatePermission && (
        <>
          <Button
            variant="contained"
            onClick={onCreateTent}
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
