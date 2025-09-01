import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";

import dynamic from "next/dynamic";
const ReportIdPage = dynamic(() => import("@/src/components/reports/report"), {
  loading: () => <LoadingScreenCircular />,
});

export default function Page({ params }: { params: { id: string } }) {
  return <ReportIdPage reportId={params.id} />;
}
