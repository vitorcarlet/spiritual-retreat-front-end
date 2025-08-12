import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import dynamic from "next/dynamic";
const RetreatsTablePage = dynamic(() => import("@/src/components/retreats/index"), {
  loading: () => <LoadingScreenCircular />,
});
export default function Page() {
  return <RetreatsTablePage />;
}
