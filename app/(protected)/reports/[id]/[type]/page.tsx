import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";

import dynamic from "next/dynamic";

const ReportViewPage = dynamic(
  () => import("@/src/components/reports/report"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

type PageParams = {
  params: Promise<{
    id: string;
    type?: string;
  }>;
};

export default async function Page({ params }: PageParams) {
  const { id, type } = await params;
  return <ReportViewPage reportId={id} reportType={type} />;
}
