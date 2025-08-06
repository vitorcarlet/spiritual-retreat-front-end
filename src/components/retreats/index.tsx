"use client";
import { Container, Typography } from "@mui/material";
import { useState } from "react";
import RetreatsCardTable from "./RetreatsCardTable";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";

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
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    pageSize: 10,
  });

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

  console.log("Retreats data loaded:", retreatsData);
  const retreatsDataArray: Retreat[] = Array.isArray(retreatsData)
    ? retreatsData
    : ([retreatsData] as Retreat[]);
  if (isLoading) return <Typography>Loading retreats...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <RetreatsCardTable
        data={retreatsDataArray}
        onEdit={handleEdit}
        onView={handleView}
        onFiltersChange={handleFiltersChange}
        total={retreatsDataArray.length || 0}
      />
    </Container>
  );
}
