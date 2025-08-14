"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const RetreatContemplation = dynamic(
  () => import("@/src/components/retreats/RetreatContemplation"),
  {
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RetreatContemplation id={id} />;
}
