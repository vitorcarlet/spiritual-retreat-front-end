"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import getPermission from "@/src/utils/getPermission";

export const useServiceSpacesPermissions = () => {
  const session = useSession();

  const hasCreatePermission = useMemo(() => {
    const user = session.data?.user;
    if (!user) return false;

    return getPermission({
      permissions: user.permissions,
      permission: "retreats.update",
      role: user.role,
    });
  }, [session.data?.user]);

  const canEditServiceSpace = useMemo(() => {
    const user = session.data?.user;
    if (!user) return false;

    return getPermission({
      permissions: user.permissions,
      permission: "retreats.update",
      role: user.role,
    });
  }, [session.data?.user]);

  return {
    hasCreatePermission,
    canEditServiceSpace,
  };
};
