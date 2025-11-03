"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/src/lib/axiosClientInstance";
import type {
  RetreatsCardTableFilters,
  RetreatsCardTableDateFilters,
} from "@/src/components/retreats/types";

import { transformApiServiceSpace } from "../shared";
import { useState } from "react";

export const useServiceSpacesQuery = (
  retreatId: string,
  filters: TableDefaultFilters<RetreatsCardTableFilters>
) => {
  const queryClient = useQueryClient();
  const [serviceSpaceVersion, setServiceSpaceVersion] = useState<number | null>(
    null
  );
  const {
    data: serviceSpacesData,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["retreat-service-spaces", retreatId, filters],
    queryFn: () => getServiceSpaces(filters, retreatId),
    staleTime: 60_000,
  });

  const getServiceSpaces = async (
    filters: TableDefaultFilters<
      RetreatsCardTableFilters & RetreatsCardTableDateFilters
    >,
    retreatId: string
  ): Promise<ServiceSpace[]> => {
    const { data } = await apiClient.get<ServiceSpacesApiResponse>(
      `/retreats/${retreatId}/service/registrations/roster`
    );

    const rows = (data.spaces || []).map((apiSpace) =>
      transformApiServiceSpace(apiSpace, retreatId)
    );
    setServiceSpaceVersion(data.version);
    return rows;
  };

  const serviceSpacesArray = Array.isArray(serviceSpacesData)
    ? serviceSpacesData
    : ([] as ServiceSpace[]);

  const invalidateServiceSpacesQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ["retreat-service-spaces", retreatId],
    });
  };

  return {
    serviceSpaceVersion,
    serviceSpacesData,
    serviceSpacesArray,
    isLoading,
    isFetching,
    isError,
    invalidateServiceSpacesQuery,
    queryClient,
  };
};
