"use client";

import getPermission from "@/src/utils/getPermission";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

type AllowEditProps = {
  permission: string;
};

const useAllowEdit = ({ permission }: AllowEditProps) => {
  const user = useSession();
  if (!user.data || !user.data.user) {
    return {
      allowEdit: false,
    };
  }
  const { permissions: userPermissions, role: userRole } = user.data.user;

  const hasPermission = useMemo(
    () => getPermission(userPermissions, permission, userRole),
    [userPermissions, permission, userRole]
  );

  return {
    allowEdit: hasPermission,
  };
};

export default useAllowEdit;
