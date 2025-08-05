"use client";
import { Container, Typography } from "@mui/material";
import { useState } from "react";
import RetreatsCardTable from "./RetreatsCardTable";
import { handleApiResponse, sendRequestServerVanilla } from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";

const getRetreats = async (filters) => {
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

  const handleEdit = (retreat: any) => {
    console.log("Editar retiro:", retreat);
  };

  const handleView = (retreat: any) => {
    console.log("Ver detalhes do retiro:", retreat);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  console.log("Retreats data loaded:", retreatsData);

  if (isLoading) return <Typography>Loading retreats...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <RetreatsCardTable
        data={retreatsData}
        onEdit={handleEdit}
        onView={handleView}
        onFiltersChange={handleFiltersChange}
      />
    </Container>
  );
}
