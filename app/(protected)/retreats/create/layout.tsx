import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";
import dynamic from "next/dynamic";
const RetreatEditPage = dynamic(
  () => import("@/src/components/retreats/RetreatEditPage")
);
export default function Page() {
  return (
    <MenuModeProvider mode={"edit"}>
      <RetreatEditPage isCreating />
    </MenuModeProvider>
  );
}
