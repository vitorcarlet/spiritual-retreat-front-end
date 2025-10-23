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

const ExitChecklistReport = dynamic<{ reportId: string }>(
  () => import("./exitChecklist/ExitChecklistReport"),
  { loading: () => <LoadingScreenCircular /> }
);

const TentReport = dynamic<{ reportId: string }>(
  () => import("./tents/TentReport"),
  { loading: () => <LoadingScreenCircular /> }
);

const RibbonReport = dynamic<{ reportId: string }>(
  () => import("./ribbons/RibbonReport"),
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
    case "exitchecklist":
    case "botafora":
    case "bota-fora":
      return <ExitChecklistReport reportId={reportId} />;
    case "tents":
      return <TentReport reportId={reportId} />;
    case "ribbons":
      return <RibbonReport reportId={reportId} />;
    default:
      return <GenericReportTable reportId={reportId} />;
  }
};

export default ReportViewRouter;
