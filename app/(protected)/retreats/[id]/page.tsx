import dynamic from "next/dynamic";
const RetreatEditPage = dynamic(
  () => import("@/src/components/retreats/RetreatEditPage/index"),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);
export default function Page() {
  return <RetreatEditPage />;
}
