"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const RetreatServiceTeam = dynamic(
  () => import("@/src/components/retreats/tabs/serviceTeam/RetreatServiceTeam"),
  {
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RetreatServiceTeam id={id} />;
}
