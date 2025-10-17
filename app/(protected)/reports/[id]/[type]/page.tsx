import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";

import dynamic from "next/dynamic";

const ReportViewPage = dynamic(
  () => import("@/src/components/reports/report"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

type PageParams = {
  params: {
    id: string;
    type?: string;
  };
};

export default function Page({ params }: PageParams) {
  return <ReportViewPage reportId={params.id} reportType={params.type} />;
}
