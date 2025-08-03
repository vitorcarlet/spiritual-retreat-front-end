"use client";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";

import dynamic from "next/dynamic";
const ReportForm = dynamic(
  () => import("@/src/components/reports/ReportForm"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

export default function Page() {
  return <ReportForm />;
}
