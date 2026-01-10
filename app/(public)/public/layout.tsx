import { Metadata } from 'next';

import { PublicLayoutContent } from '@/src/components/public';
import { DrawerProvider } from '@/src/contexts/DrawerContext';

export const metadata: Metadata = {
  title: 'Public Routes',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DrawerProvider>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </DrawerProvider>
  );
}
