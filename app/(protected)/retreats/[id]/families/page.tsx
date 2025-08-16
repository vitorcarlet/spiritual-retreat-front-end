"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const RetreatFamilies = dynamic(
  () => import("@/src/components/retreats/families/RetreatFamilies"),
  {
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RetreatFamilies id={id} />;
}
