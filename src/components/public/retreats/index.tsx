"use client";
import { Container, Typography } from "@mui/material";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";

import { useTranslations } from "next-intl";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useRouter } from "next/navigation";
import {
  RetreatRequest,
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "./types";
import { Retreat } from "@/src/types/retreats";
import { getFilters } from "./getFilters";
import PublicRetreatsCardTable from "./table";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  const response = await handleApiResponse<RetreatRequest>(
    await sendRequestServerVanilla.get("/public/retreats", { params: filters })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  return response.data as RetreatRequest;
};

export default function PublicRetreatsPage() {
  const t = useTranslations();
  const router = useRouter();

  const { filters, updateFilters, activeFiltersCount, resetFilters } =
    useUrlFilters<TableDefaultFilters<RetreatsCardTableFilters>>({
      defaultFilters: {
        page: 1,
        pageLimit: 4,
      },
      excludeFromCount: ["page", "pageLimit"], // Don't count pagination in active filters
    });

  const filtersConfig = getFilters();
  const {
    data: retreatsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const handleView = (retreat: Retreat) => {
    router.push(`public/retreats/${retreat.id}`);
  };

  const handleFiltersChange = (
    newFilters: TableDefaultFilters<RetreatsCardTableFilters>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const handleApplyFilters = (
    newFilters: Partial<TableDefaultFilters<RetreatsCardTableFilters>>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const retreatsDataArray: Retreat[] = Array.isArray(retreatsData?.rows)
    ? retreatsData?.rows
    : ([retreatsData?.rows] as unknown as Retreat[]);

  if (isLoading) return <Typography>Loading retreats...</Typography>;
  if (isError) return <Typography>No data available.</Typography>;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Typography variant="h5">{t("retreats")}</Typography>
        <FilterButton<
          TableDefaultFilters<RetreatsCardTableFilters>,
          RetreatsCardTableDateFilters
        >
          filters={filtersConfig}
          defaultValues={filters}
          onApplyFilters={handleApplyFilters}
          onReset={resetFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        <PublicRetreatsCardTable
          total={retreatsData?.total || 0}
          filters={filters}
          data={retreatsDataArray}
          onView={handleView}
          onFiltersChange={handleFiltersChange}
        />
      </Box>
    </Container>
  );
}
