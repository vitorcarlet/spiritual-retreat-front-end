"use client";
import { Container, Typography } from "@mui/material";
import { useState } from "react";
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

const getRetreats = async (filters: RetreatsCardTableFilters) => {
  const response = await handleApiResponse<Retreat>(
    await sendRequestServerVanilla.get(
      "/retreats", // Replace with your actual API endpoint
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
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    pageSize: 10,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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

  const handleFiltersChange = (newFilters: RetreatsCardTableFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);

    // Count active filters
    const count = Object.entries(newFilters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== "";
    }).length;

    setActiveFiltersCount(count);

    // Fetch data with new filters...
  };

  const handleResetFilters = () => {
    setFilters({});
    setActiveFiltersCount(0);
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
            onReset={handleResetFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </Stack>

        <RetreatsCardTable
          data={retreatsDataArray}
          onEdit={handleEdit}
          onView={handleView}
          onFiltersChange={handleFiltersChange}
          total={retreatsDataArray.length || 0}
        />
      </Box>
    </Container>
  );
}
