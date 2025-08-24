// import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
// import dynamic from "next/dynamic";
import PublicRetreatInfo from "@/src/components/public/retreats/PublicRetreatInfo";
import React from "react";

// const PublicRetreatInfo = dynamic(
//   () => import("@/src/components/public/retreats/PublicRetreatInfo"),
//   { loading: () => <LoadingScreenCircular /> }
// );

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicRetreatInfo retreatId={id} />;
}
