"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Skeleton } from "@mui/material";

const ServiceConfirmed = dynamic(
  () =>
    import(
      "@/src/components/retreats/tabs/RetreatContemplation/service/confirmed"
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={160} />,
  }
);

export default function ServiceConfirmedPage() {
  const { id } = useParams<{ id: string }>();
  return <ServiceConfirmed id={id} />;
}
