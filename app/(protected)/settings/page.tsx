import LoadingScreenCircular from "@/src/components/loading-screen/client/LoadingScreenCircular";
import dynamic from "next/dynamic";
const SettingsPage = dynamic(() => import("@/src/components/settings"), {
  loading: () => <LoadingScreenCircular />,
});
export default function Page() {
  return <SettingsPage />;
}
