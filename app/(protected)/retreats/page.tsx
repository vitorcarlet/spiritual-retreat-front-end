import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import dynamic from "next/dynamic";
const RetreatsPage = dynamic(() => import("@/src/components/retreats"), {
  loading: () => <LoadingScreenCircular />,
});
export default function Page() {
  return <RetreatsPage />;
}
