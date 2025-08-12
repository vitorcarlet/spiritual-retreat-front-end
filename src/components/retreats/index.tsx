"use client";
import { Container, Typography } from "@mui/material";
import RetreatsCardTable from "./CardTable/RetreatsCardTable";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";
import { getFilters } from "./CardTable/getFilters";
import { useTranslations } from "next-intl";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";
import { useRouter } from "next/navigation";

const getRetreats = async (
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  const response = await handleApiResponse<Retreat>(
    await sendRequestServerVanilla.get("/retreats", { params: filters })
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  console.log("Fetched reports:", response);
  return response.data;
};

export default function RetreatsTablePage() {
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
  console.log(filters, "filters");
  const { data: retreatsData, isLoading } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const handleEdit = (retreat: Retreat) => {
    router.push(`/retreats/${retreat.id}`);
  };

  const handleView = (retreat: Retreat) => {
    router.push(`/retreats/${retreat.id}`);
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

  console.log("Retreats data loaded:", retreatsData);
  const retreatsDataArray: Retreat[] = Array.isArray(retreatsData)
    ? retreatsData
    : ([retreatsData] as Retreat[]);

  if (isLoading) return <Typography>Loading retreats...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ p: 3 }}>
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

        <RetreatsCardTable
          filters={filters}
          data={retreatsDataArray}
          onEdit={handleEdit}
          onView={handleView}
          onFiltersChange={handleFiltersChange}
        />
      </Box>
    </Container>
  );
}
