import dynamic from "next/dynamic";

const SideMenuDrawer = dynamic(
  () => import("@/src/components/navigation/SideMenu")
);

const ProtectedLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => <SideMenuDrawer>{children}</SideMenuDrawer>;

export default ProtectedLayoutContent;
