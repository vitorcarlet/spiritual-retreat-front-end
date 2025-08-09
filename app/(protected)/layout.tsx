import ProtectedLayoutContent from "@/src/components/navigation/protected/ProtectedLayoutContext";
import { DrawerProvider } from "@/src/contexts/DrawerContext";
import SnackbarClientProvider from "@/src/providers/SnackbarProvider";
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
        <SnackbarClientProvider>
          <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
        </SnackbarClientProvider>
      </DrawerProvider>
    </SessionProvider>
  );
}
