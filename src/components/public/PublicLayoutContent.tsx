import dynamic from "next/dynamic";

const SideMenuDrawer = dynamic(
  () => import("@/src/components/public/navigation/SideMenu")
);

const PublicLayoutContent = ({ children }: { children: React.ReactNode }) => (
  <SideMenuDrawer>{children}</SideMenuDrawer>
);

export default PublicLayoutContent;
