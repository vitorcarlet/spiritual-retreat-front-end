import { Metadata } from 'next';

import TokenErrorMonitor from '@/src/components/auth/TokenErrorMonitor';
import ProtectedLayoutContent from '@/src/components/navigation/protected/ProtectedLayoutContext';
// import NotificationListener from '@/src/components/notifications/NotificationListener';
import { DrawerProvider } from '@/src/contexts/DrawerContext';
// import { NotificationsProvider } from '@/src/contexts/NotificationsContext';
import SessionWatcher from '@/src/providers/SessionWatcher';
import SnackbarClientProvider from '@/src/providers/SnackbarProvider';

export const metadata: Metadata = {
  title: 'Protected Routes',
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    //<SessionProvider>
    <SessionWatcher>
      <TokenErrorMonitor />
      <DrawerProvider>
        {/* <NotificationsProvider> */}
        <SnackbarClientProvider>
          {/* <NotificationListener /> */}
          <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
        </SnackbarClientProvider>
        {/* </NotificationsProvider> */}
      </DrawerProvider>
    </SessionWatcher>
    // </SessionProvider>
  );
}
