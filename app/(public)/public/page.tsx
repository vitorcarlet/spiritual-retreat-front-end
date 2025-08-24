import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import dynamic from "next/dynamic";
const PublicRetreats = dynamic(
  () => import("@/src/components/public/retreats/index"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

export default function Page() {
  return <PublicRetreats />;
}
