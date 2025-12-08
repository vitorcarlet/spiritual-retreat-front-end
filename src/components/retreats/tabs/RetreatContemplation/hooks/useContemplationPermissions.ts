import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import getPermission from "@/src/utils/getPermission";

export const useContemplationPermissions = () => {
  const session = useSession();
  const [canEditRetreat, setCanEditRetreat] = useState(false);

  useEffect(() => {
    if (session.data?.user) {
      setCanEditRetreat(
        getPermission({
          permissions: session.data.user.permissions,
          permission: "retreats.update",
          role: session.data.user.role,
        })
      );
    }
  }, [session.data]);

  return { canEditRetreat };
};
