"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const RetreatTents = dynamic(
  () => import("@/src/components/retreats/tabs/tents/RetreatTents"),
  {
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RetreatTents id={id} />;
}
