"use client";
import { Container, Typography } from "@mui/material";
import RetreatsCardTable from "./RetreatsCardTable";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";
import { Box, Stack } from "@mui/material";
import FilterButton from "@/src/components/filters/FilterButton";
import { getFilters } from "./getFilters";
import { useTranslations } from "next-intl";
import { useUrlFilters } from "@/src/hooks/useUrlFilters";

const getRetreats = async (
  filters: TableDefaultFields<RetreatsCardTableFilters>
) => {
  const response = await handleApiResponse<Retreat>(
    await sendRequestServerVanilla.get(
      "/retreats",
      { params: filters }
    )
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  console.log("Fetched reports:", response);
  return response.data;
};

export default function RetreatsPage() {
  const t = useTranslations();
  
  const { 
    filters, 
    updateFilters, 
    activeFiltersCount, 
    resetFilters 
  } = useUrlFilters<TableDefaultFields<RetreatsCardTableFilters>>({
    defaultFilters: {
      page: 1,
      pageLimit: 4,
    },
    excludeFromCount: ['page', 'pageLimit'] // Don't count pagination in active filters
  });

  const filtersConfig = getFilters();

  const { data: retreatsData, isLoading } = useQuery({
    queryKey: ["retreats", filters],
    queryFn: () => getRetreats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });

  const handleEdit = (retreat: Retreat) => {
    console.log("Editar retiro:", retreat);
  };

  const handleView = (retreat: Retreat) => {
    console.log("Ver detalhes do retiro:", retreat);
  };

  const handleFiltersChange = (
    newFilters: TableDefaultFields<RetreatsCardTableFilters>
  ) => {
    updateFilters({ ...filters, ...newFilters });
  };

  const handleApplyFilters = (newFilters: Partial<TableDefaultFields<RetreatsCardTableFilters>>) => {
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
          <FilterButton
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
