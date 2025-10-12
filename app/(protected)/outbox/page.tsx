"use client";
import dynamic from "next/dynamic";
const RetreatOutBox = dynamic(() => import("@/src/components/OutBox"), {
  loading: () => <p>Loading...</p>,
});
export default function Page() {
  return <RetreatOutBox />;
}
