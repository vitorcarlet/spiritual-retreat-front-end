import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "@/src/lib/axiosClientInstance";
import { RetreatFamilyRequest } from "../types";
import {
  RetreatsCardTableDateFilters,
  RetreatsCardTableFilters,
} from "@/src/components/public/retreats/types";

export const useFamiliesQuery = (
  retreatId: string,
  filters: TableDefaultFilters<
    RetreatsCardTableFilters & RetreatsCardTableDateFilters
  >
) => {
  const queryClient = useQueryClient();
  const [familiesVersion, setFamiliesVersion] = useState<number | null>(null);
  const [familiesLocked, setFamiliesLocked] = useState<boolean>(false);

  const getRetreatFamilies = async (): Promise<RetreatFamilyRequest> => {
    const response = await apiClient.get<RetreatFamilyRequest>(
      `/retreats/${retreatId}/families`
    );
    setFamiliesVersion(response.data.version);
    setFamiliesLocked(response.data.familiesLocked);
    return response.data;
  };

  const {
    data: familiesData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["retreat-families", retreatId, filters],
    queryFn: getRetreatFamilies,
    staleTime: 60_000,
  });

  const familiesDataArray = familiesData?.families ?? [];

  const invalidateFamiliesQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ["retreat-families"],
    });
  };

  return {
    familiesData,
    familiesDataArray,
    isLoading,
    isFetching,
    isError,
    familiesVersion,
    familiesLocked,
    invalidateFamiliesQuery,
    queryClient,
  };
};
