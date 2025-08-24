import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import { getPublicRetreat } from "@/src/components/public/retreats/shared";
import dynamic from "next/dynamic";
const PublicRetreatInfo = dynamic(
  () => import("@/src/components/public/retreats/PublicRetreatInfo"),
  {
    loading: () => <LoadingScreenCircular />,
  }
);

export default function Page({ params }: { params: { id: string } }) {
  const retreat = getPublicRetreat(params.id);
  return <PublicRetreatInfo retreat={retreat} />;
}
