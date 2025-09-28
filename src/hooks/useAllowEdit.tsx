"use client";

import getPermission from "@/src/utils/getPermission";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

type AllowEditProps = {
  permission: string;
};

const useAllowEdit = ({ permission }: AllowEditProps) => {
  const { data: userData } = useSession();

  const hasPermission = useMemo(() => {
    if (!userData || !userData.user) {
      return false;
    }
    const { permissions: userPermissions, role: userRole } = userData.user;
    return getPermission({
      permissions: userPermissions,
      permission,
      role: userRole,
    });
  }, [userData, permission]);

  return {
    allowEdit: hasPermission,
  };
};

export default useAllowEdit;
