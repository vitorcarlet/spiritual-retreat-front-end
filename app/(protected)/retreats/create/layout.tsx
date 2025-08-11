import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";
import dynamic from "next/dynamic";
const UserPage = dynamic(() => import("@/src/components/users/UserPage"));
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <MenuModeProvider mode={"edit"}>
      <UserPage isCreating>{children}</UserPage>
    </MenuModeProvider>
  );
}
