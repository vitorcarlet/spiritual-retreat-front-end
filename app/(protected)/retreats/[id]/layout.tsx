import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";
import dynamic from "next/dynamic";
const RetreatPage = dynamic(() => import("@/src/components/retreats"));
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <MenuModeProvider>
      <RetreatPage>{children}</RetreatPage>
    </MenuModeProvider>
  );
}
