import { MenuModeProvider } from "@/src/contexts/users-context/MenuModeContext";

export default function Page({ children }: { children: React.ReactNode }) {
  return <MenuModeProvider mode={"edit"}>{children}</MenuModeProvider>;
}
