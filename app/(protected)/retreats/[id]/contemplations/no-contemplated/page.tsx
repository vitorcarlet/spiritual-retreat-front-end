"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Skeleton } from "@mui/material";

const NonContemplatedTable = dynamic(
  () =>
    import(
      "@/src/components/retreats/tabs/RetreatContemplation/no-contemplated"
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={160} />,
  }
);

export default function NoContemplatedPage() {
  const { id } = useParams<{ id: string }>();
  return <NonContemplatedTable id={id} />;
}
