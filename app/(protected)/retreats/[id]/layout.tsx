import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";
import dynamic from "next/dynamic";
const RetreatPage = dynamic(() => import("@/src/components/retreats/RetreatsPage"), {
  loading: () => <div>Loading...</div>,
});
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <MenuModeProvider>
      <RetreatPage>{children}</RetreatPage>
    </MenuModeProvider>
  );
}
