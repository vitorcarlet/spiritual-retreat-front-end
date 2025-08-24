import { PublicLayoutContent } from "@/src/components/public";
import { DrawerProvider } from "@/src/contexts/DrawerContext";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Public Routes",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DrawerProvider>
        <PublicLayoutContent>{children}</PublicLayoutContent>
      </DrawerProvider>
    </SessionProvider>
  );
}
