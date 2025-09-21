import ProtectedLayoutContent from "@/src/components/navigation/protected/ProtectedLayoutContext";
import { DrawerProvider } from "@/src/contexts/DrawerContext";
import { NotificationsProvider } from "@/src/contexts/NotificationsContext";
import SnackbarClientProvider from "@/src/providers/SnackbarProvider";
import NotificationListener from "@/src/components/notifications/NotificationListener";
import TokenErrorMonitor from "@/src/components/auth/TokenErrorMonitor";
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
      <TokenErrorMonitor />
      <DrawerProvider>
        <NotificationsProvider>
          <SnackbarClientProvider>
            <NotificationListener />
            <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
          </SnackbarClientProvider>
        </NotificationsProvider>
      </DrawerProvider>
    </SessionProvider>
  );
}
