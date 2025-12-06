"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Skeleton } from "@mui/material";

const ServiceUnassigned = dynamic(
  () =>
    import(
      "@/src/components/retreats/tabs/RetreatContemplation/service/unassigned"
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={160} />,
  }
);

export default function ServiceUnassignedPage() {
  const { id } = useParams<{ id: string }>();
  return <ServiceUnassigned id={id} />;
}
