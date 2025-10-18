"use client";

import dynamic from "next/dynamic";
import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import GenericReportTable from "./GenericReportTable";

const FamilyReportCards = dynamic<{ reportId: string }>(
  () => import("./family/FamilyReportCards"),
  { loading: () => <LoadingScreenCircular /> }
);

const FiveMinutesCardList = dynamic<{ reportId: string }>(
  () => import("./fiveMinutesCard/FiveMinutesCardList"),
  { loading: () => <LoadingScreenCircular /> }
);

type ReportRouterProps = {
  reportId: string;
  reportType?: string;
};

const normalizeType = (value?: string) =>
  (value ?? "").toString().trim().toLowerCase();

const ReportViewRouter = ({ reportId, reportType }: ReportRouterProps) => {
  const type = normalizeType(reportType);

  switch (type) {
    case "family":
    case "families":
      return <FamilyReportCards reportId={reportId} />;
    case "fiveminutescard":
      return <FiveMinutesCardList reportId={reportId} />;
    default:
      return <GenericReportTable reportId={reportId} />;
  }
};

export default ReportViewRouter;
