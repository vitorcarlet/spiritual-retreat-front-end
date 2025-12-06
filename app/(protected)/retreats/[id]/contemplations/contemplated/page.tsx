"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Skeleton } from "@mui/material";

const Contemplated = dynamic(
  () =>
    import("@/src/components/retreats/tabs/RetreatContemplation/contemplated"),
  {
    loading: () => <Skeleton variant="rectangular" height={160} />,
  }
);

export default function ContemplatedPage() {
  const { id } = useParams<{ id: string }>();
  return <Contemplated id={id} />;
}
