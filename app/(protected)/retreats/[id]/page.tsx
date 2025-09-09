"use client";
import dynamic from "next/dynamic";
const RetreatEditPage = dynamic(
  () => import("@/src/components/retreats/tabs/general"),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  return <RetreatEditPage />;
}
