import dynamic from "next/dynamic";
const UserPage = dynamic(() => import("@/src/components/users/UserPage"));
export default function Page({ children }: { children: React.ReactNode }) {
  return <UserPage>{children}</UserPage>;
}
