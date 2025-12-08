import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import getPermission from "@/src/utils/getPermission";

export const useFamiliesPermissions = () => {
  const session = useSession();
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [canEditFamily, setCanEditFamily] = useState(false);

  useEffect(() => {
    if (session.data?.user) {
      setHasCreatePermission(
        getPermission({
          permissions: session.data.user.permissions,
          permission: "retreats.create",
          role: session.data.user.role,
        })
      );

      setCanEditFamily(
        getPermission({
          permissions: session.data.user.permissions,
          permission: "retreats.update",
          role: session.data.user.role,
        })
      );
    }
  }, [session.data]);

  return { hasCreatePermission, canEditFamily };
};
