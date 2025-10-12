// import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
// import dynamic from "next/dynamic";
import PublicRetreatForm from "@/src/components/public/retreats/form/PublicRetreatForm";
import React from "react";

// const PublicRetreatForm = dynamic(
//   () => import("@/src/components/public/retreats/PublicRetreatForm"),
//   { loading: () => <LoadingScreenCircular /> }
// );

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicRetreatForm id={id} type="serve" />;
}
