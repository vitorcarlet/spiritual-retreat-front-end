import dynamic from "next/dynamic";

//ainda nao entendi esse dynamic kkk
const SideMenuDrawer = dynamic(
  () => import("@/src/components/navigation/SideMenu")
);

const ProtectedLayoutContent = ({
  children,
}: {
  children: React.ReactNode;
}) => <SideMenuDrawer>{children}</SideMenuDrawer>;

export default ProtectedLayoutContent;
