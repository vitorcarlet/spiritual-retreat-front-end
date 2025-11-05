"use client";

import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { UniqueIdentifier } from "@dnd-kit/core";
import type { RetreatsCardTableFilters } from "@/src/components/retreats/types";
import { Items } from "./types";
import RetreatServiceTeamTable from "./RetreatServiceTeamTable";
import { useTranslations } from "next-intl";

interface ServiceSpaceContentProps {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  serviceSpacesArray: ServiceSpace[];
  total: number;
  filters: TableDefaultFilters<RetreatsCardTableFilters>;
  isReordering: boolean;
  canEditServiceSpace: boolean;
  retreatId: string;
  onSaveReorder: (items: Items) => Promise<void>;
  onSetReordering: (value: boolean) => void;
  onEdit: (spaceId: UniqueIdentifier) => void;
  onView: (spaceId: UniqueIdentifier) => void;
  onDelete?: (spaceId: UniqueIdentifier) => void;
  onFiltersChange: (
    filters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => void;
}

export default function ServiceSpaceContent({
  isLoading,
  isError,
  isFetching,
  serviceSpacesArray,
  total,
  filters,
  isReordering,
  canEditServiceSpace,
  retreatId,
  onSaveReorder,
  onSetReordering,
  onEdit,
  onView,
  onDelete,
  onFiltersChange,
}: ServiceSpaceContentProps) {
  const t = useTranslations("service-team-details");

  if (isLoading && !serviceSpacesArray.length) {
    return (
      <Typography>
        {t("loading", { defaultMessage: "Loading service spaces..." })}
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography color="error">
        {t("error", { defaultMessage: "Unable to load service spaces." })}
      </Typography>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
      {serviceSpacesArray.length > 0 && (
        <RetreatServiceTeamTable
          items={serviceSpacesArray}
          retreatId={retreatId}
          canEditServiceTeam={canEditServiceSpace}
          setServiceTeamReorderFlag={onSetReordering}
          total={total}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onView={onView}
          onEdit={onEdit}
          onDelete={canEditServiceSpace ? onDelete : undefined}
          canEdit={canEditServiceSpace}
          onSaveReorder={canEditServiceSpace ? onSaveReorder : undefined}
          setReorderFlag={canEditServiceSpace ? onSetReordering : undefined}
          reorderFlag={isReordering}
        />
      )}

      {isFetching && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: (theme) => `${theme.palette.background.paper}CC`,
            zIndex: (theme) => theme.zIndex.modal - 1,
          }}
        >
          <CircularProgress />
        </Stack>
      )}
    </Box>
  );
}
