import ProtectedLayoutContent from "@/src/components/navigation/protected/ProtectedLayoutContext";
import { DrawerProvider } from "@/src/contexts/DrawerContext";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Protected Routes",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DrawerProvider>
        <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
      </DrawerProvider>
    </SessionProvider>
  );
}
