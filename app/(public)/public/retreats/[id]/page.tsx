// import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
// import dynamic from "next/dynamic";

import PublicRetreatInfo from "@/src/components/public/retreats/PublicRetreatInfo";

// const PublicRetreatInfo = dynamic(
//   () => import("@/src/components/public/retreats/PublicRetreatInfo"),
//   { loading: () => <LoadingScreenCircular /> }
// );

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <PublicRetreatInfo retreatId={id} />;
}
