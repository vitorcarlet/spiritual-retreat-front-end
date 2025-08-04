"use client";
import { Container, Typography } from "@mui/material";
import { cache } from "react";
import RetreatsCardTable from "./RetreatsCardTable";
import {
  handleApiResponse,
  sendRequestServerVanilla,
} from "@/src/lib/sendRequestServerVanilla";
import { useQuery } from "@tanstack/react-query";

const getRetreats = cache(async () => {
  const response = await handleApiResponse<Retreat>(
    await sendRequestServerVanilla.get(
      "/retreats" // Replace with your actual API endpoint
    )
  );

  if (!response || response.error) {
    throw new Error("Failed to fetch retreats");
  }
  console.log("Fetched reports:", response);
  return response.data;
});

export default function RetreatsPage() {
  //const queryClient = useQueryClient();
  const { data: retreatsData, isLoading } = useQuery({
    queryKey: ["retreats"],
    queryFn: getRetreats,
    staleTime: 5 * 60 * 1000, // 5 minutes,
  });
  const handleEdit = (retreat: any) => {
    console.log("Editar retiro:", retreat);
  };

  const handleView = (retreat: any) => {
    console.log("Ver detalhes do retiro:", retreat);
  };

  console.log("Retreats data loaded:", retreatsData);

  if (isLoading) return <Typography>Loading retreats...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <RetreatsCardTable
        data={retreatsData}
        onEdit={handleEdit}
        onView={handleView}
      />
    </Container>
  );
}
