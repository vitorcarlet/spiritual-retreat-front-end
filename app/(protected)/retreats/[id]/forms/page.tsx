"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
const RetreatForm = dynamic(() => import("@/src/components/retreats/forms"), {
  loading: () => <p>Loading...</p>,
});
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RetreatForm id={id} />;
}
