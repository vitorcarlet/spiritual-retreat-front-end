import dynamic from "next/dynamic";
const RetreatInfo = dynamic(
  () => import("@/src/components/retreats/RetreatInfo"),
  {
    ssr: false,
  }
);
export default function Page() {
  return <RetreatInfo />;
}
